import { NextResponse } from "next/server";

function extractKeywords(text: string) {
  const skills = ["react", "python", "java", "node", "ml", "ai", "sql"];
  return skills.filter(s => text.toLowerCase().includes(s));
}

function pickRandom(arr: string[], count: number) {
  return arr.sort(() => 0.5 - Math.random()).slice(0, count);
}

export async function POST(req: Request) {
  const { resumeText = "", interviewType = "general", difficulty = "medium" } =
    await req.json();

  const skills = extractKeywords(resumeText);

  const introPool = [
    "Tell me about yourself.",
    "Walk me through your resume.",
    "Give a brief introduction about your background."
  ];

  const skillPool = skills.length
    ? [
        `Explain your experience with ${skills[0]}.`,
        `How did you use ${skills[0]} in a real project?`,
        `What challenges did you face while working with ${skills[0]}?`
      ]
    : [
        "Explain one strong technical skill you have.",
        "Which technology are you most confident in?"
      ];

  const projectPool = [
    `Describe a ${interviewType} project you worked on.`,
    "What was your role in that project?",
    "What was the most important feature you implemented?"
  ];

  const difficultyPool =
    difficulty === "hard"
      ? [
          "Describe a complex problem you solved and your approach.",
          "How did you optimize performance in your project?"
        ]
      : [
          "What challenges did you face in your project?",
          "How did you debug issues in your work?"
        ];

  const hrPool = [
    "Why should we hire you?",
    "What motivates you professionally?",
    "Where do you see yourself in 3–5 years?"
  ];

  const questions = [
    ...pickRandom(introPool, 1),
    ...pickRandom(skillPool, 1),
    ...pickRandom(projectPool, 1),
    ...pickRandom(difficultyPool, 1),
    ...pickRandom(hrPool, 1),
  ];

  return NextResponse.json({ questions });
}
