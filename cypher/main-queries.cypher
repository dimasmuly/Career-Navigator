// Skill gap for a candidate and target role.
// Parameters: $personId, $roleId
MATCH (person:Person {id: $personId})
MATCH (role:Role {id: $roleId})-[requires:REQUIRES]->(skill:Skill)
OPTIONAL MATCH (person)-[has:HAS_SKILL]->(skill)
WITH skill, requires, has
WHERE has IS NULL OR has.level < requires.minLevel
RETURN skill, requires
ORDER BY requires.importance DESC, skill.name;

// Course recommendations for missing skills.
// Parameters: $personId, $roleId
MATCH (person:Person {id: $personId})
MATCH (role:Role {id: $roleId})-[requires:REQUIRES]->(missing:Skill)
OPTIONAL MATCH (person)-[has:HAS_SKILL]->(missing)
WITH missing, requires, has
WHERE has IS NULL OR has.level < requires.minLevel
MATCH (course:Course)-[:TEACHES]->(missing)
RETURN DISTINCT course, missing.name AS teaches
ORDER BY course.durationHours ASC, course.title;

// Multi-hop prerequisite traversal. This is the intentionally graph-shaped query.
// Parameters: $personId, $roleId
MATCH (person:Person {id: $personId})
MATCH (role:Role {id: $roleId})-[requires:REQUIRES]->(missing:Skill)
OPTIONAL MATCH (person)-[has:HAS_SKILL]->(missing)
WITH person, missing, requires, has
WHERE has IS NULL OR has.level < requires.minLevel
OPTIONAL MATCH path = (known:Skill)-[:PREREQUISITE_FOR*1..3]->(missing)
WHERE (person)-[:HAS_SKILL]->(known)
WITH missing, path
ORDER BY length(path) ASC
RETURN missing.name AS targetSkill, collect(path)[0] AS shortestKnownPath;

// Collaboration/project discovery through people -> missing skills -> projects.
// Parameters: $personId, $roleId
MATCH (person:Person {id: $personId})
MATCH (role:Role {id: $roleId})-[requires:REQUIRES]->(missing:Skill)
OPTIONAL MATCH (person)-[has:HAS_SKILL]->(missing)
WITH person, missing, requires, has
WHERE has IS NULL OR has.level < requires.minLevel
MATCH (project:Project)-[:USES]->(missing)<-[:HAS_SKILL]-(mentor:Person)
WHERE mentor.id <> person.id
RETURN DISTINCT mentor, project, missing
ORDER BY mentor.name, project.name;
