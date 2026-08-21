export type NodeKind = "person" | "role" | "skill" | "course" | "project";

export type GraphNode = {
  id: string;
  label: string;
  kind: NodeKind;
  caption?: string;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
};

export type Person = {
  id: string;
  name: string;
  title: string;
  location: string;
  summary: string;
};

export type Role = {
  id: string;
  name: string;
  seniority: string;
  mission: string;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  level?: number;
  minLevel?: number;
  importance?: number;
};

export type Course = {
  id: string;
  title: string;
  provider: string;
  url: string;
  durationHours: number;
  teaches: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  impact: string;
};

export type PrerequisitePath = {
  targetSkill: string;
  path: string[];
};

export type GraphResponse = {
  connected: boolean;
  warning?: string;
  profiles: Person[];
  roles: Role[];
  selectedProfile: Person | null;
  selectedRole: Role | null;
  currentSkills: Skill[];
  requiredSkills: Skill[];
  missingSkills: Skill[];
  recommendedCourses: Course[];
  relevantProjects: Project[];
  prerequisitePaths: PrerequisitePath[];
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
};
