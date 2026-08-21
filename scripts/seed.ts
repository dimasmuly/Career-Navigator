import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  courseSkills,
  courses,
  people,
  personSkills,
  prerequisites,
  projectSkills,
  projects,
  roleAdjacency,
  roleRequirements,
  roles,
  skills,
  workedOn,
} from "../src/lib/seed-data";
import { closeDriver, openSession } from "../src/lib/neo4j";

function loadEnvFile(fileName: string) {
  const path = join(process.cwd(), fileName);

  if (!existsSync(path)) {
    return;
  }

  readFileSync(path, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .forEach((line) => {
      const index = line.indexOf("=");

      if (index === -1) {
        return;
      }

      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim().replace(/^['\"]|['\"]$/g, "");

      process.env[key] = process.env[key] ?? value;
    });
}

async function seed() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const session = openSession();
  const courseRows = courses.map(({ id, title, provider, url, durationHours }) => ({ id, title, provider, url, durationHours }));

  try {
    await session.executeWrite(async (tx) => {
      await tx.run("MATCH (node:Person) DETACH DELETE node");
      await tx.run("MATCH (node:Role) DETACH DELETE node");
      await tx.run("MATCH (node:Skill) DETACH DELETE node");
      await tx.run("MATCH (node:Course) DETACH DELETE node");
      await tx.run("MATCH (node:Project) DETACH DELETE node");

      await tx.run(
        `
        UNWIND $rows AS row
        MERGE (node:Person {id: row.id})
        SET node += row
        `,
        { rows: people },
      );
      await tx.run(
        `
        UNWIND $rows AS row
        MERGE (node:Role {id: row.id})
        SET node += row
        `,
        { rows: roles },
      );
      await tx.run(
        `
        UNWIND $rows AS row
        MERGE (node:Skill {id: row.id})
        SET node += row
        `,
        { rows: skills },
      );
      await tx.run(
        `
        UNWIND $rows AS row
        MERGE (node:Course {id: row.id})
        SET node += row
        `,
        { rows: courseRows },
      );
      await tx.run(
        `
        UNWIND $rows AS row
        MERGE (node:Project {id: row.id})
        SET node += row
        `,
        { rows: projects },
      );

      await tx.run(
        `
        UNWIND $rows AS row
        MATCH (person:Person {id: row.personId})
        MATCH (skill:Skill {id: row.skillId})
        MERGE (person)-[rel:HAS_SKILL]->(skill)
        SET rel.level = row.level, rel.evidence = row.evidence
        `,
        { rows: personSkills },
      );
      await tx.run(
        `
        UNWIND $rows AS row
        MATCH (role:Role {id: row.roleId})
        MATCH (skill:Skill {id: row.skillId})
        MERGE (role)-[rel:REQUIRES]->(skill)
        SET rel.minLevel = row.minLevel, rel.importance = row.importance
        `,
        { rows: roleRequirements },
      );
      await tx.run(
        `
        UNWIND $rows AS row
        MATCH (course:Course {id: row.courseId})
        MATCH (skill:Skill {id: row.skillId})
        MERGE (course)-[rel:TEACHES]->(skill)
        SET rel.level = row.level
        `,
        { rows: courseSkills },
      );
      await tx.run(
        `
        UNWIND $rows AS row
        MATCH (project:Project {id: row.projectId})
        MATCH (skill:Skill {id: row.skillId})
        MERGE (project)-[rel:USES]->(skill)
        SET rel.weight = row.weight
        `,
        { rows: projectSkills },
      );
      await tx.run(
        `
        UNWIND $rows AS row
        MATCH (person:Person {id: row.personId})
        MATCH (project:Project {id: row.projectId})
        MERGE (person)-[rel:WORKED_ON]->(project)
        SET rel.role = row.role, rel.year = row.year
        `,
        { rows: workedOn },
      );
      await tx.run(
        `
        UNWIND $rows AS row
        MATCH (from:Skill {id: row.from})
        MATCH (to:Skill {id: row.to})
        MERGE (from)-[rel:PREREQUISITE_FOR]->(to)
        SET rel.reason = row.reason
        `,
        { rows: prerequisites },
      );
      await tx.run(
        `
        UNWIND $rows AS row
        MATCH (from:Role {id: row.from})
        MATCH (to:Role {id: row.to})
        MERGE (from)-[rel:ADJACENT_TO]->(to)
        SET rel.transitionDifficulty = row.transitionDifficulty
        `,
        { rows: roleAdjacency },
      );
      await tx.run(
        `
        UNWIND $rows AS row
        MATCH (person:Person {id: row.personId})
        MATCH (role:Role {id: row.roleId})
        MERGE (person)-[:TARGETS]->(role)
        `,
        {
          rows: [
            { personId: "person-dimas", roleId: "role-ai-product-engineer" },
            { personId: "person-maya", roleId: "role-analytics-engineer" },
            { personId: "person-raka", roleId: "role-platform-engineer" },
          ],
        },
      );
    });

    console.log("Seeded SkillGraph data into CognoDB.");
  } finally {
    await session.close();
    await closeDriver();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
