import type { QueryResult, Record as Neo4jRecord } from "neo4j-driver";
import { openSession } from "./neo4j";
import type { Course, GraphEdge, GraphNode, GraphResponse, Person, PrerequisitePath, Project, Role, Skill } from "./types";

type NodeShape = {
  properties: Record<string, unknown>;
  labels?: string[];
};

type PathShape = {
  segments: Array<{
    start: NodeShape;
    end: NodeShape;
  }>;
};

function props<T>(value: unknown): T {
  const node = value as Partial<NodeShape>;

  return (node.properties ?? value) as T;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : String(value ?? "");
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function skillFromRecord(record: Neo4jRecord, nodeKey: string, relKey?: string): Skill {
  const skill = props<Skill>(record.get(nodeKey));
  const rel = relKey ? (record.get(relKey)?.properties as Partial<Skill> | undefined) : undefined;

  return {
    ...skill,
    level: typeof rel?.level === "number" ? rel.level : skill.level,
    minLevel: typeof rel?.minLevel === "number" ? rel.minLevel : skill.minLevel,
    importance: typeof rel?.importance === "number" ? rel.importance : skill.importance,
  };
}

function recordsToNodes(records: QueryResult["records"]): GraphNode[] {
  const map = new Map<string, GraphNode>();

  records.forEach((record) => {
    const node = props<GraphNode>(record.get("node"));
    map.set(node.id, node);
  });

  return [...map.values()];
}

function recordsToEdges(records: QueryResult["records"]): GraphEdge[] {
  return records.map((record) => ({
    id: asString(record.get("id")),
    source: asString(record.get("source")),
    target: asString(record.get("target")),
    label: asString(record.get("label")),
  }));
}

export async function getGraphResponse(personId: string, roleId: string): Promise<GraphResponse> {
  const session = openSession();

  try {
    const profilesResult = await session.run("MATCH (p:Person) RETURN p ORDER BY p.name");
    const rolesResult = await session.run("MATCH (r:Role) RETURN r ORDER BY r.name");

    const selectedResult = await session.run(
      `
      MATCH (p:Person {id: $personId})
      MATCH (r:Role {id: $roleId})
      RETURN p, r
      `,
      { personId, roleId },
    );

    const skillsResult = await session.run(
      `
      MATCH (p:Person {id: $personId})-[has:HAS_SKILL]->(skill:Skill)
      RETURN skill, has
      ORDER BY has.level DESC, skill.name
      `,
      { personId },
    );

    const requirementsResult = await session.run(
      `
      MATCH (role:Role {id: $roleId})-[requires:REQUIRES]->(skill:Skill)
      RETURN skill, requires
      ORDER BY requires.importance DESC, skill.name
      `,
      { roleId },
    );

    const gapResult = await session.run(
      `
      MATCH (person:Person {id: $personId})
      MATCH (role:Role {id: $roleId})-[requires:REQUIRES]->(skill:Skill)
      OPTIONAL MATCH (person)-[has:HAS_SKILL]->(skill)
      WITH skill, requires, has
      WHERE has IS NULL OR has.level < requires.minLevel
      RETURN skill, requires
      ORDER BY requires.importance DESC, skill.name
      `,
      { personId, roleId },
    );

    const courseResult = await session.run(
      `
      MATCH (person:Person {id: $personId})
      MATCH (role:Role {id: $roleId})-[requires:REQUIRES]->(missing:Skill)
      OPTIONAL MATCH (person)-[has:HAS_SKILL]->(missing)
      WITH missing, requires, has
      WHERE has IS NULL OR has.level < requires.minLevel
      MATCH (course:Course)-[:TEACHES]->(missing)
      RETURN DISTINCT course, missing.name AS teaches
      ORDER BY course.durationHours ASC, course.title
      LIMIT 6
      `,
      { personId, roleId },
    );

    const projectResult = await session.run(
      `
      MATCH (person:Person {id: $personId})
      MATCH (role:Role {id: $roleId})-[requires:REQUIRES]->(missing:Skill)
      OPTIONAL MATCH (person)-[has:HAS_SKILL]->(missing)
      WITH person, missing, requires, has
      WHERE has IS NULL OR has.level < requires.minLevel
      MATCH (project:Project)-[:USES]->(missing)<-[:HAS_SKILL]-(mentor:Person)
      WHERE mentor.id <> person.id
      RETURN DISTINCT project
      ORDER BY project.name
      LIMIT 4
      `,
      { personId, roleId },
    );

    const pathResult = await session.run(
      `
      MATCH (person:Person {id: $personId})
      MATCH (role:Role {id: $roleId})-[requires:REQUIRES]->(missing:Skill)
      OPTIONAL MATCH (person)-[has:HAS_SKILL]->(missing)
      WITH person, missing, requires, has
      WHERE has IS NULL OR has.level < requires.minLevel
      OPTIONAL MATCH path = (known:Skill)-[:PREREQUISITE_FOR*1..3]->(missing)
      WHERE (person)-[:HAS_SKILL]->(known)
      WITH missing, path
      ORDER BY length(path) ASC
      RETURN missing.name AS targetSkill, collect(path)[0] AS path
      `,
      { personId, roleId },
    );

    const nodeResult = await session.run(
      `
      MATCH (person:Person {id: $personId})
      MATCH (role:Role {id: $roleId})
      MATCH (person)-[:HAS_SKILL|WORKED_ON|TARGETS*0..1]-(nearPerson)
      WITH person, role, collect(DISTINCT nearPerson) AS nearPersonNodes
      MATCH (role)-[:REQUIRES]->(required:Skill)
      OPTIONAL MATCH (course:Course)-[:TEACHES]->(required)
      WITH person, role, nearPersonNodes, collect(DISTINCT required) + collect(DISTINCT course) AS roleNodes
      UNWIND nearPersonNodes + roleNodes + [person, role] AS rawNode
      WITH DISTINCT rawNode
      WHERE rawNode IS NOT NULL
      RETURN {
        id: rawNode.id,
        label: coalesce(rawNode.name, rawNode.title),
        caption: coalesce(rawNode.category, rawNode.seniority, rawNode.provider, rawNode.impact, rawNode.title),
        kind: CASE labels(rawNode)[0]
          WHEN 'Person' THEN 'person'
          WHEN 'Role' THEN 'role'
          WHEN 'Skill' THEN 'skill'
          WHEN 'Course' THEN 'course'
          ELSE 'project'
        END
      } AS node
      `,
      { personId, roleId },
    );

    const edgeResult = await session.run(
      `
      MATCH (source)-[rel:HAS_SKILL|WORKED_ON|TARGETS|REQUIRES|TEACHES|USES|PREREQUISITE_FOR]->(target)
      WHERE source.id IS NOT NULL AND target.id IS NOT NULL
      AND (
        source.id = $personId OR source.id = $roleId OR target.id = $personId OR target.id = $roleId
        OR (source:Course AND target:Skill)
        OR (source:Project AND target:Skill)
        OR (source:Skill AND target:Skill)
      )
      RETURN DISTINCT source.id + '-' + type(rel) + '-' + target.id AS id,
        source.id AS source,
        target.id AS target,
        toLower(replace(type(rel), '_', ' ')) AS label
      LIMIT 80
      `,
      { personId, roleId },
    );

    const selectedRecord = selectedResult.records[0];
    const prerequisitePaths: PrerequisitePath[] = pathResult.records
      .map((record) => {
        const path = record.get("path") as PathShape | null;
        const names = path
          ? [path.segments[0]?.start, ...path.segments.map((segment) => segment.end)]
              .filter(Boolean)
              .map((node) => asString(node.properties.name))
          : [];

        return { targetSkill: asString(record.get("targetSkill")), path: names };
      })
      .filter((item) => item.path.length > 1);

    return {
      connected: true,
      profiles: uniqueById(profilesResult.records.map((record) => props<Person>(record.get("p")))),
      roles: uniqueById(rolesResult.records.map((record) => props<Role>(record.get("r")))),
      selectedProfile: selectedRecord ? props<Person>(selectedRecord.get("p")) : null,
      selectedRole: selectedRecord ? props<Role>(selectedRecord.get("r")) : null,
      currentSkills: uniqueById(skillsResult.records.map((record) => skillFromRecord(record, "skill", "has"))),
      requiredSkills: uniqueById(requirementsResult.records.map((record) => skillFromRecord(record, "skill", "requires"))),
      missingSkills: uniqueById(gapResult.records.map((record) => skillFromRecord(record, "skill", "requires"))),
      recommendedCourses: uniqueById(
        courseResult.records.map((record) => ({
          ...props<Course>(record.get("course")),
          teaches: asString(record.get("teaches")),
        })),
      ),
      relevantProjects: uniqueById(projectResult.records.map((record) => props<Project>(record.get("project")))),
      prerequisitePaths,
      graph: {
        nodes: recordsToNodes(nodeResult.records),
        edges: recordsToEdges(edgeResult.records),
      },
    };
  } finally {
    await session.close();
  }
}
