"use client";

import { startTransition, useEffect, useState } from "react";
import type { GraphNode, GraphResponse, Skill } from "@/lib/types";

const kindClass: Record<GraphNode["kind"], string> = {
  person: "nodePerson",
  role: "nodeRole",
  skill: "nodeSkill",
  course: "nodeCourse",
  project: "nodeProject",
};

function scoreCoverage(currentSkills: Skill[], requiredSkills: Skill[]) {
  if (requiredSkills.length === 0) {
    return 0;
  }

  const current = new Map(currentSkills.map((skill) => [skill.id, skill.level ?? 0]));
  const met = requiredSkills.filter((skill) => (current.get(skill.id) ?? 0) >= (skill.minLevel ?? 1));

  return Math.round((met.length / requiredSkills.length) * 100);
}

function GraphCanvas({ data }: { data: GraphResponse }) {
  const currentSkillIds = new Set(data.currentSkills.map((skill) => skill.id));
  const missingSkillIds = new Set(data.missingSkills.map((skill) => skill.id));
  const requiredSkillIds = new Set(data.requiredSkills.map((skill) => skill.id));
  const nodeById = new Map(data.graph.nodes.map((node) => [node.id, node]));
  const personNodes = data.graph.nodes.filter((node) => node.kind === "person");
  const roleNodes = data.graph.nodes.filter((node) => node.kind === "role");
  const currentSkills = data.currentSkills.map((skill) => nodeById.get(skill.id)).filter((node): node is GraphNode => Boolean(node));
  const missingSkills = data.missingSkills.map((skill) => nodeById.get(skill.id)).filter((node): node is GraphNode => Boolean(node));
  const requiredMetSkills = data.graph.nodes.filter(
    (node) => node.kind === "skill" && requiredSkillIds.has(node.id) && currentSkillIds.has(node.id) && !missingSkillIds.has(node.id),
  );
  const resourceNodes = data.graph.nodes.filter((node) => node.kind === "course" || node.kind === "project");

  const distribute = (index: number, total: number, min: number, max: number) => {
    if (total <= 1) {
      return (min + max) / 2;
    }

    return min + (index * (max - min)) / (total - 1);
  };

  const positions = new Map<string, { x: number; y: number }>(
    data.graph.nodes.map((node, index) => {
      if (node.kind === "person") {
        return [node.id, { x: 10, y: distribute(personNodes.findIndex((person) => person.id === node.id), personNodes.length, 44, 56) }];
      }

      if (node.kind === "role") {
        return [node.id, { x: 50, y: distribute(roleNodes.findIndex((role) => role.id === node.id), roleNodes.length, 44, 56) }];
      }

      if (currentSkillIds.has(node.id)) {
        return [node.id, { x: 28, y: distribute(currentSkills.findIndex((skill) => skill.id === node.id), currentSkills.length, 18, 82) }];
      }

      if (missingSkillIds.has(node.id)) {
        return [node.id, { x: 70, y: distribute(missingSkills.findIndex((skill) => skill.id === node.id), missingSkills.length, 12, 88) }];
      }

      if (node.kind === "course" || node.kind === "project") {
        return [node.id, { x: 90, y: distribute(resourceNodes.findIndex((resource) => resource.id === node.id), resourceNodes.length, 16, 84) }];
      }

      return [node.id, { x: 42, y: distribute(index, data.graph.nodes.length, 18, 82) }];
    }),
  );

  if (data.graph.nodes.length === 0) {
    return <div className="emptyState">No graph nodes found for this selection.</div>;
  }

  const displayNodeIds = new Set([
    ...personNodes.map((node) => node.id),
    ...currentSkills.map((node) => node.id),
    ...roleNodes.map((node) => node.id),
    ...missingSkills.map((node) => node.id),
    ...resourceNodes.map((node) => node.id),
  ]);
  const semanticEdges = [
    ...personNodes.flatMap((person) => currentSkills.map((skill) => ({ source: person.id, target: skill.id, label: "has skill", kind: "primary" }))),
    ...requiredMetSkills.flatMap((skill) => roleNodes.map((role) => ({ source: skill.id, target: role.id, label: "matches", kind: "success" }))),
    ...roleNodes.flatMap((role) => missingSkills.map((skill) => ({ source: role.id, target: skill.id, label: "requires", kind: "primary" }))),
    ...data.graph.edges
      .filter(
        (edge) =>
          resourceNodes.some((node) => node.id === edge.source) &&
          missingSkillIds.has(edge.target) &&
          (edge.label === "teaches" || edge.label === "uses"),
      )
      .map((edge) => ({ source: edge.target, target: edge.source, label: edge.label, kind: "resource" })),
    ...data.graph.edges
      .filter((edge) => currentSkillIds.has(edge.source) && missingSkillIds.has(edge.target) && edge.label === "prerequisite for")
      .map((edge) => ({ source: edge.source, target: edge.target, label: edge.label, kind: "path" })),
  ];
  const dedupedEdges = [...new Map(semanticEdges.map((edge) => [`${edge.source}-${edge.label}-${edge.target}`, edge])).values()];

  return (
    <div className="graphShell" aria-label="Career graph visualization">
      <div className="graphLane lanePerson">Candidate</div>
      <div className="graphLane laneCurrent">Current Skills</div>
      <div className="graphLane laneRole">Target Role</div>
      <div className="graphLane laneGap">Skill Gap</div>
      <div className="graphLane laneAction">Actions</div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img">
        <title>SkillGraph relationship map</title>
        {dedupedEdges.map((edge) => {
          const source = positions.get(edge.source);
          const target = positions.get(edge.target);

          if (!source || !target) {
            return null;
          }

          return (
            <path
              className={`edge edge-${edge.kind}`}
              d={`M ${source.x} ${source.y} C ${(source.x + target.x) / 2} ${source.y}, ${(source.x + target.x) / 2} ${target.y}, ${target.x} ${target.y}`}
              key={`${edge.source}-${edge.label}-${edge.target}`}
              vectorEffect="non-scaling-stroke"
            >
              <title>{edge.label}</title>
            </path>
          );
        })}
      </svg>
      {data.graph.nodes.filter((node) => displayNodeIds.has(node.id)).map((node) => {
        const position = positions.get(node.id);

        if (!position) {
          return null;
        }

        return (
          <div
            className={`graphNode ${kindClass[node.kind]}`}
            key={node.id}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            title={node.caption}
          >
            <strong>{node.label}</strong>
            <span>{node.kind}</span>
          </div>
        );
      })}
    </div>
  );
}

function SkillPill({ skill, muted = false }: { skill: Skill; muted?: boolean }) {
  return (
    <div className={muted ? "skillPill muted" : "skillPill"}>
      <span>{skill.name}</span>
      <small>{skill.level ? `Level ${skill.level}` : `Need ${skill.minLevel ?? 1}`}</small>
    </div>
  );
}

export function SkillGraphApp() {
  const [personId, setPersonId] = useState("person-dimas");
  const [roleId, setRoleId] = useState("role-ai-product-engineer");
  const [data, setData] = useState<GraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadGraph() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/graph?personId=${personId}&roleId=${roleId}`, { signal: controller.signal });

        if (!response.ok) {
          throw new Error("The graph API returned an unexpected response.");
        }

        setData(await response.json());
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }

        setError(requestError instanceof Error ? requestError.message : "Unable to load graph data.");
      } finally {
        setLoading(false);
      }
    }

    loadGraph();

    return () => controller.abort();
  }, [personId, roleId]);

  const coverage = data ? scoreCoverage(data.currentSkills, data.requiredSkills) : 0;

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">CognoDB graph career navigator</p>
          <h1>Find the shortest credible path from today&apos;s skills to tomorrow&apos;s role.</h1>
          <p className="heroCopy">
            SkillGraph connects people, roles, skills, courses, projects, and prerequisites so career planning becomes a relationship
            problem instead of a spreadsheet checklist.
          </p>
        </div>
        <div className="heroCard">
          <span>Role coverage</span>
          <strong>{loading ? "..." : `${coverage}%`}</strong>
          <small>{data?.connected ? "Connected to CognoDB" : "Demo fallback active"}</small>
        </div>
      </section>

      <section className="controls" aria-label="Graph controls">
        <label>
          Candidate
          <select
            disabled={!data || loading}
            value={personId}
            onChange={(event) => startTransition(() => setPersonId(event.target.value))}
          >
            {(data?.profiles ?? []).map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name} - {profile.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Target role
          <select disabled={!data || loading} value={roleId} onChange={(event) => startTransition(() => setRoleId(event.target.value))}>
            {(data?.roles ?? []).map((role) => (
              <option key={role.id} value={role.id}>
                {role.name} - {role.seniority}
              </option>
            ))}
          </select>
        </label>
      </section>

      {data?.warning ? <div className="banner">{data.warning}</div> : null}
      {error ? <div className="banner error">{error}</div> : null}

      {loading ? (
        <section className="loadingGrid">
          <div />
          <div />
          <div />
        </section>
      ) : data ? (
        <>
          <section className="dashboard">
            <article className="profileCard">
              <span className="cardLabel">Candidate</span>
              <h2>{data.selectedProfile?.name ?? "No candidate"}</h2>
              <p>{data.selectedProfile?.summary ?? "Select a profile to explore."}</p>
            </article>
            <article className="profileCard accent">
              <span className="cardLabel">Target</span>
              <h2>{data.selectedRole?.name ?? "No role"}</h2>
              <p>{data.selectedRole?.mission ?? "Select a target role."}</p>
            </article>
            <article className="metricCard">
              <span className="cardLabel">Gap size</span>
              <strong>{data.missingSkills.length}</strong>
              <p>skills need focused development for this transition.</p>
            </article>
          </section>

          <section className="contentGrid">
            <article className="panel wide">
              <div className="panelHeader">
                <div>
                  <span className="cardLabel">Relationship map</span>
                  <h2>Graph exploration</h2>
                </div>
                <span className="legend">Person Role Skill Course Project</span>
              </div>
              <GraphCanvas data={data} />
            </article>

            <article className="panel">
              <span className="cardLabel">Current skills</span>
              <h2>What they already have</h2>
              <div className="pillStack">
                {data.currentSkills.length > 0
                  ? data.currentSkills.map((skill, index) => <SkillPill key={`${skill.id}-${index}`} skill={skill} />)
                  : null}
                {data.currentSkills.length === 0 ? <div className="emptyState">No current skills were found.</div> : null}
              </div>
            </article>

            <article className="panel">
              <span className="cardLabel">Skill gaps</span>
              <h2>What the role requires</h2>
              <div className="pillStack">
                {data.missingSkills.length > 0
                  ? data.missingSkills.map((skill, index) => <SkillPill key={`${skill.id}-${index}`} muted skill={skill} />)
                  : null}
                {data.missingSkills.length === 0 ? <div className="emptyState">This candidate meets the role requirements.</div> : null}
              </div>
            </article>

            <article className="panel">
              <span className="cardLabel">Learning plan</span>
              <h2>Recommended courses</h2>
              <div className="itemStack">
                {data.recommendedCourses.map((course) => (
                  <a className="resourceItem" href={course.url} key={course.id} rel="noreferrer" target="_blank">
                    <strong>{course.title}</strong>
                    <span>
                      {course.provider} - {course.durationHours}h - teaches {course.teaches}
                    </span>
                  </a>
                ))}
                {data.recommendedCourses.length === 0 ? <div className="emptyState">No courses needed for this role match.</div> : null}
              </div>
            </article>

            <article className="panel">
              <span className="cardLabel">Awkward in SQL</span>
              <h2>Prerequisite paths</h2>
              <div className="itemStack">
                {data.prerequisitePaths.map((path) => (
                  <div className="pathItem" key={`${path.targetSkill}-${path.path.join("-")}`}>
                    <strong>{path.targetSkill}</strong>
                    <span>{path.path.join(" -> ")}</span>
                  </div>
                ))}
                {data.prerequisitePaths.length === 0 ? <div className="emptyState">No multi-hop prerequisite path found.</div> : null}
              </div>
            </article>
          </section>
        </>
      ) : null}
    </main>
  );
}
