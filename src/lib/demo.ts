import {
  courseSkills,
  courses,
  people,
  personSkills,
  prerequisites,
  projectSkills,
  projects,
  roleRequirements,
  roles,
  skills,
  workedOn,
} from "./seed-data";
import type { Course, GraphEdge, GraphNode, GraphResponse, PrerequisitePath, Skill } from "./types";

const skillById = new Map(skills.map((skill) => [skill.id, skill]));

function skillWithLevel(skillId: string, level?: number, extra?: Pick<Skill, "importance" | "minLevel">): Skill {
  const skill = skillById.get(skillId);

  if (!skill) {
    return { id: skillId, name: skillId, category: "Unknown", level, ...extra };
  }

  return { ...skill, level, ...extra };
}

function findPrerequisitePath(personId: string, targetSkillId: string): string[] {
  const knownSkillIds = new Set(personSkills.filter((item) => item.personId === personId).map((item) => item.skillId));
  const queue = [...knownSkillIds].map((skillId) => [skillId]);
  const visited = new Set<string>();

  while (queue.length > 0) {
    const path = queue.shift();

    if (!path) {
      break;
    }

    const current = path[path.length - 1];

    if (current === targetSkillId) {
      return path.map((skillId) => skillById.get(skillId)?.name ?? skillId);
    }

    if (path.length > 4 || visited.has(current)) {
      continue;
    }

    visited.add(current);

    prerequisites
      .filter((edge) => edge.from === current)
      .forEach((edge) => queue.push([...path, edge.to]));
  }

  return [];
}

export function buildDemoGraphResponse(personId = "person-dimas", roleId = "role-ai-product-engineer"): GraphResponse {
  const selectedProfile = people.find((person) => person.id === personId) ?? people[0] ?? null;
  const selectedRole = roles.find((role) => role.id === roleId) ?? roles[0] ?? null;

  if (!selectedProfile || !selectedRole) {
    return {
      connected: false,
      warning: "Demo data is empty.",
      profiles: people,
      roles,
      selectedProfile,
      selectedRole,
      currentSkills: [],
      requiredSkills: [],
      missingSkills: [],
      recommendedCourses: [],
      relevantProjects: [],
      prerequisitePaths: [],
      graph: { nodes: [], edges: [] },
    };
  }

  const currentSkills = personSkills
    .filter((item) => item.personId === selectedProfile.id)
    .map((item) => skillWithLevel(item.skillId, item.level));

  const currentSkillMap = new Map(currentSkills.map((skill) => [skill.id, skill.level ?? 0]));
  const requiredSkills = roleRequirements
    .filter((item) => item.roleId === selectedRole.id)
    .map((item) => skillWithLevel(item.skillId, undefined, { minLevel: item.minLevel, importance: item.importance }));

  const missingSkills = requiredSkills.filter((skill) => (currentSkillMap.get(skill.id) ?? 0) < (skill.minLevel ?? 1));
  const missingSkillIds = new Set(missingSkills.map((skill) => skill.id));
  const currentSkillIds = new Set(currentSkills.map((skill) => skill.id));

  const recommendedCourses = courseSkills
    .filter((item) => missingSkillIds.has(item.skillId))
    .map((item) => {
      const course = courses.find((candidate) => candidate.id === item.courseId);
      const skill = skillById.get(item.skillId);

      return course && skill ? { ...course, teaches: skill.name } : null;
    })
    .filter((course): course is Course => Boolean(course));

  const relevantProjects = projects.filter((project) =>
    projectSkills.some((item) => item.projectId === project.id && missingSkillIds.has(item.skillId)),
  );

  const prerequisitePaths: PrerequisitePath[] = missingSkills
    .map((skill) => ({ targetSkill: skill.name, path: findPrerequisitePath(selectedProfile.id, skill.id) }))
    .filter((item) => item.path.length > 1);

  const nodeMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const addNode = (node: GraphNode) => nodeMap.set(node.id, node);
  const addEdge = (source: string, target: string, label: string) => {
    edges.push({ id: `${source}-${label}-${target}`, source, target, label });
  };

  addNode({ id: selectedProfile.id, label: selectedProfile.name, kind: "person", caption: selectedProfile.title });
  addNode({ id: selectedRole.id, label: selectedRole.name, kind: "role", caption: selectedRole.seniority });
  addEdge(selectedProfile.id, selectedRole.id, "targets");

  currentSkills.forEach((skill) => {
    addNode({ id: skill.id, label: skill.name, kind: "skill", caption: `Level ${skill.level}` });
    addEdge(selectedProfile.id, skill.id, "has skill");
  });

  requiredSkills.forEach((skill) => {
    addNode({ id: skill.id, label: skill.name, kind: "skill", caption: `Required ${skill.minLevel}` });
    addEdge(selectedRole.id, skill.id, "requires");
  });

  recommendedCourses.forEach((course) => {
    const taughtSkill = skills.find((skill) => skill.name === course.teaches);
    addNode({ id: course.id, label: course.title, kind: "course", caption: course.provider });

    if (taughtSkill) {
      addEdge(course.id, taughtSkill.id, "teaches");
    }
  });

  relevantProjects.forEach((project) => {
    addNode({ id: project.id, label: project.name, kind: "project", caption: project.impact });
    workedOn
      .filter((item) => item.projectId === project.id)
      .forEach((item) => addEdge(item.personId, project.id, "worked on"));
    projectSkills
      .filter((item) => item.projectId === project.id && (missingSkillIds.has(item.skillId) || currentSkillIds.has(item.skillId)))
      .forEach((item) => addEdge(project.id, item.skillId, "uses"));
  });

  prerequisites
    .filter((item) => missingSkillIds.has(item.to) || missingSkillIds.has(item.from))
    .forEach((item) => {
      const from = skillById.get(item.from);
      const to = skillById.get(item.to);

      if (from && to) {
        addNode({ id: from.id, label: from.name, kind: "skill", caption: from.category });
        addNode({ id: to.id, label: to.name, kind: "skill", caption: to.category });
        addEdge(from.id, to.id, "prerequisite");
      }
    });

  return {
    connected: false,
    warning: "Using realistic demo data because CognoDB is not connected yet.",
    profiles: people,
    roles,
    selectedProfile,
    selectedRole,
    currentSkills,
    requiredSkills,
    missingSkills,
    recommendedCourses,
    relevantProjects,
    prerequisitePaths,
    graph: { nodes: [...nodeMap.values()], edges },
  };
}
