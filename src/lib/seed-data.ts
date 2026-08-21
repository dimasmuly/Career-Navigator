import type { Course, Person, Project, Role } from "./types";

export const people: Person[] = [
  {
    id: "person-dimas",
    name: "Dimas Mulya",
    title: "Frontend Engineer",
    location: "Jakarta, Indonesia",
    summary: "Product-minded engineer who wants to move into AI-enabled full-stack roles.",
  },
  {
    id: "person-maya",
    name: "Maya Putri",
    title: "Data Analyst",
    location: "Bandung, Indonesia",
    summary: "Analyst with strong SQL and dashboarding experience exploring analytics engineering.",
  },
  {
    id: "person-raka",
    name: "Raka Pratama",
    title: "Backend Engineer",
    location: "Surabaya, Indonesia",
    summary: "Backend engineer focused on APIs, systems design, and distributed services.",
  },
];

export const roles: Role[] = [
  {
    id: "role-ai-product-engineer",
    name: "AI Product Engineer",
    seniority: "Mid-level",
    mission: "Ship user-facing AI features that combine product UX, APIs, retrieval, and evaluation.",
  },
  {
    id: "role-analytics-engineer",
    name: "Analytics Engineer",
    seniority: "Mid-level",
    mission: "Transform raw data into trusted models, metrics, and self-serve analytics workflows.",
  },
  {
    id: "role-platform-engineer",
    name: "Platform Engineer",
    seniority: "Senior",
    mission: "Build reliable developer platforms for deployment, observability, and operations.",
  },
];

export const skills = [
  { id: "skill-typescript", name: "TypeScript", category: "Programming" },
  { id: "skill-react", name: "React", category: "Frontend" },
  { id: "skill-nextjs", name: "Next.js", category: "Frontend" },
  { id: "skill-api-design", name: "API Design", category: "Backend" },
  { id: "skill-python", name: "Python", category: "Programming" },
  { id: "skill-sql", name: "SQL", category: "Data" },
  { id: "skill-graph-modeling", name: "Graph Modeling", category: "Data" },
  { id: "skill-vector-search", name: "Vector Search", category: "AI" },
  { id: "skill-rag", name: "Retrieval-Augmented Generation", category: "AI" },
  { id: "skill-llm-evals", name: "LLM Evaluation", category: "AI" },
  { id: "skill-dbt", name: "dbt", category: "Data" },
  { id: "skill-data-modeling", name: "Data Modeling", category: "Data" },
  { id: "skill-docker", name: "Docker", category: "Platform" },
  { id: "skill-kubernetes", name: "Kubernetes", category: "Platform" },
  { id: "skill-observability", name: "Observability", category: "Platform" },
];

export const courses: Course[] = [
  {
    id: "course-graph-thinking",
    title: "Graph Data Modeling for Product Engineers",
    provider: "GraphAcademy",
    url: "https://graphacademy.neo4j.com/",
    durationHours: 5,
    teaches: "Graph Modeling",
  },
  {
    id: "course-rag-basics",
    title: "Building Reliable RAG Applications",
    provider: "DeepLearning.AI",
    url: "https://www.deeplearning.ai/",
    durationHours: 8,
    teaches: "Retrieval-Augmented Generation",
  },
  {
    id: "course-llm-evals",
    title: "Practical LLM Evaluation",
    provider: "Weights & Biases",
    url: "https://wandb.ai/site/courses/",
    durationHours: 4,
    teaches: "LLM Evaluation",
  },
  {
    id: "course-dbt",
    title: "Analytics Engineering with dbt",
    provider: "dbt Labs",
    url: "https://learn.getdbt.com/",
    durationHours: 7,
    teaches: "dbt",
  },
  {
    id: "course-kubernetes",
    title: "Kubernetes for Application Developers",
    provider: "CNCF",
    url: "https://training.linuxfoundation.org/",
    durationHours: 10,
    teaches: "Kubernetes",
  },
  {
    id: "course-observability",
    title: "Observability Fundamentals",
    provider: "Grafana Labs",
    url: "https://grafana.com/tutorials/",
    durationHours: 3,
    teaches: "Observability",
  },
];

export const projects: Project[] = [
  {
    id: "project-checkout-redesign",
    name: "Checkout Redesign",
    description: "Rebuilt a checkout funnel with server-rendered product pages and API integrations.",
    impact: "Reduced drop-off by 14% in realistic seed data.",
  },
  {
    id: "project-support-copilot",
    name: "Support Copilot",
    description: "Prototype assistant that retrieves policy snippets and drafts support responses.",
    impact: "Cut first-response drafting time by 35% in pilot workflow.",
  },
  {
    id: "project-metric-mart",
    name: "Metric Mart",
    description: "Modeled trusted business metrics from warehouse tables for stakeholder dashboards.",
    impact: "Resolved duplicated metric definitions across three teams.",
  },
  {
    id: "project-deploy-platform",
    name: "Deploy Platform",
    description: "Internal deployment workflow with containers, health checks, and alerts.",
    impact: "Improved release confidence and incident response visibility.",
  },
];

export const personSkills = [
  { personId: "person-dimas", skillId: "skill-typescript", level: 4, evidence: "Built production UI features" },
  { personId: "person-dimas", skillId: "skill-react", level: 4, evidence: "Led checkout frontend redesign" },
  { personId: "person-dimas", skillId: "skill-nextjs", level: 3, evidence: "Built SSR product pages" },
  { personId: "person-dimas", skillId: "skill-api-design", level: 2, evidence: "Integrated payment and order APIs" },
  { personId: "person-maya", skillId: "skill-sql", level: 4, evidence: "Owned BI reporting datasets" },
  { personId: "person-maya", skillId: "skill-data-modeling", level: 3, evidence: "Modeled KPI marts" },
  { personId: "person-maya", skillId: "skill-python", level: 2, evidence: "Automated weekly reports" },
  { personId: "person-raka", skillId: "skill-api-design", level: 4, evidence: "Designed internal service APIs" },
  { personId: "person-raka", skillId: "skill-docker", level: 4, evidence: "Containerized production services" },
  { personId: "person-raka", skillId: "skill-observability", level: 3, evidence: "Added dashboards and alerts" },
];

export const roleRequirements = [
  { roleId: "role-ai-product-engineer", skillId: "skill-typescript", minLevel: 3, importance: 4 },
  { roleId: "role-ai-product-engineer", skillId: "skill-react", minLevel: 3, importance: 4 },
  { roleId: "role-ai-product-engineer", skillId: "skill-api-design", minLevel: 3, importance: 4 },
  { roleId: "role-ai-product-engineer", skillId: "skill-graph-modeling", minLevel: 2, importance: 3 },
  { roleId: "role-ai-product-engineer", skillId: "skill-vector-search", minLevel: 2, importance: 4 },
  { roleId: "role-ai-product-engineer", skillId: "skill-rag", minLevel: 3, importance: 5 },
  { roleId: "role-ai-product-engineer", skillId: "skill-llm-evals", minLevel: 2, importance: 4 },
  { roleId: "role-analytics-engineer", skillId: "skill-sql", minLevel: 4, importance: 5 },
  { roleId: "role-analytics-engineer", skillId: "skill-data-modeling", minLevel: 4, importance: 5 },
  { roleId: "role-analytics-engineer", skillId: "skill-dbt", minLevel: 3, importance: 4 },
  { roleId: "role-analytics-engineer", skillId: "skill-python", minLevel: 2, importance: 3 },
  { roleId: "role-platform-engineer", skillId: "skill-api-design", minLevel: 3, importance: 3 },
  { roleId: "role-platform-engineer", skillId: "skill-docker", minLevel: 4, importance: 5 },
  { roleId: "role-platform-engineer", skillId: "skill-kubernetes", minLevel: 3, importance: 5 },
  { roleId: "role-platform-engineer", skillId: "skill-observability", minLevel: 4, importance: 4 },
];

export const courseSkills = [
  { courseId: "course-graph-thinking", skillId: "skill-graph-modeling", level: 2 },
  { courseId: "course-rag-basics", skillId: "skill-rag", level: 3 },
  { courseId: "course-rag-basics", skillId: "skill-vector-search", level: 2 },
  { courseId: "course-llm-evals", skillId: "skill-llm-evals", level: 2 },
  { courseId: "course-dbt", skillId: "skill-dbt", level: 3 },
  { courseId: "course-kubernetes", skillId: "skill-kubernetes", level: 3 },
  { courseId: "course-observability", skillId: "skill-observability", level: 3 },
];

export const projectSkills = [
  { projectId: "project-checkout-redesign", skillId: "skill-typescript", weight: 4 },
  { projectId: "project-checkout-redesign", skillId: "skill-react", weight: 5 },
  { projectId: "project-checkout-redesign", skillId: "skill-nextjs", weight: 4 },
  { projectId: "project-checkout-redesign", skillId: "skill-api-design", weight: 2 },
  { projectId: "project-support-copilot", skillId: "skill-python", weight: 3 },
  { projectId: "project-support-copilot", skillId: "skill-vector-search", weight: 4 },
  { projectId: "project-support-copilot", skillId: "skill-rag", weight: 5 },
  { projectId: "project-support-copilot", skillId: "skill-llm-evals", weight: 3 },
  { projectId: "project-metric-mart", skillId: "skill-sql", weight: 5 },
  { projectId: "project-metric-mart", skillId: "skill-data-modeling", weight: 5 },
  { projectId: "project-metric-mart", skillId: "skill-dbt", weight: 4 },
  { projectId: "project-deploy-platform", skillId: "skill-docker", weight: 4 },
  { projectId: "project-deploy-platform", skillId: "skill-kubernetes", weight: 4 },
  { projectId: "project-deploy-platform", skillId: "skill-observability", weight: 5 },
];

export const workedOn = [
  { personId: "person-dimas", projectId: "project-checkout-redesign", role: "Frontend lead", year: 2025 },
  { personId: "person-dimas", projectId: "project-support-copilot", role: "Prototype engineer", year: 2026 },
  { personId: "person-maya", projectId: "project-metric-mart", role: "Analytics owner", year: 2025 },
  { personId: "person-raka", projectId: "project-deploy-platform", role: "Backend/platform engineer", year: 2025 },
];

export const prerequisites = [
  { from: "skill-typescript", to: "skill-nextjs", reason: "Next.js production work assumes TypeScript fluency" },
  { from: "skill-react", to: "skill-nextjs", reason: "Next.js builds on React component architecture" },
  { from: "skill-api-design", to: "skill-rag", reason: "RAG apps need reliable application interfaces" },
  { from: "skill-python", to: "skill-vector-search", reason: "Most vector search tutorials use Python tooling" },
  { from: "skill-vector-search", to: "skill-rag", reason: "Retrieval is the core context layer for RAG" },
  { from: "skill-rag", to: "skill-llm-evals", reason: "Evaluation depends on the RAG behavior being measured" },
  { from: "skill-sql", to: "skill-data-modeling", reason: "Warehouse modeling starts with SQL fluency" },
  { from: "skill-data-modeling", to: "skill-dbt", reason: "dbt operationalizes data models" },
  { from: "skill-docker", to: "skill-kubernetes", reason: "Kubernetes schedules containers" },
  { from: "skill-kubernetes", to: "skill-observability", reason: "Platform operators need visibility into clusters" },
];

export const roleAdjacency = [
  { from: "role-ai-product-engineer", to: "role-analytics-engineer", transitionDifficulty: 3 },
  { from: "role-ai-product-engineer", to: "role-platform-engineer", transitionDifficulty: 4 },
  { from: "role-platform-engineer", to: "role-ai-product-engineer", transitionDifficulty: 4 },
];
