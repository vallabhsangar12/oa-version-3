export function analyzeResume(text: string) {
  const lower = text.toLowerCase();

  let role = "general";
  if (lower.includes("react") || lower.includes("frontend")) role = "frontend";
  if (lower.includes("node") || lower.includes("backend")) role = "backend";
  if (lower.includes("machine learning")) role = "ml";

  const skills = [];
  if (lower.includes("react")) skills.push("React");
  if (lower.includes("node")) skills.push("Node.js");
  if (lower.includes("python")) skills.push("Python");

  return {
    role,
    skills,
    difficulty: skills.length > 3 ? "medium" : "easy",
  };
}