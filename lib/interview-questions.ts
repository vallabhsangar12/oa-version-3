export interface InterviewQuestion {
  id: string
  category: 'technical' | 'behavioral' | 'situational'
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  timeLimit: number // seconds
  tips: string[]
}

const TECHNICAL_QUESTIONS = {
  easy: [
    {
      id: 'tech_easy_1',
      category: 'technical' as const,
      difficulty: 'easy' as const,
      question: 'Explain the difference between let, const, and var in JavaScript.',
      timeLimit: 120,
      tips: [
        'Explain variable hoisting',
        'Discuss scope differences',
        'Mention immutability with const',
        'Provide code examples',
      ],
    },
    {
      id: 'tech_easy_2',
      category: 'technical' as const,
      difficulty: 'easy' as const,
      question: 'What is the purpose of the useEffect hook in React?',
      timeLimit: 120,
      tips: [
        'Mention side effects',
        'Explain dependency array',
        'Discuss cleanup functions',
        'Provide real-world examples',
      ],
    },
    {
      id: 'tech_easy_3',
      category: 'technical' as const,
      difficulty: 'easy' as const,
      question: 'What is REST and why is it important in API design?',
      timeLimit: 120,
      tips: [
        'Explain REST principles',
        'Mention HTTP methods',
        'Discuss statelessness',
        'Give examples of RESTful APIs',
      ],
    },
  ],
  medium: [
    {
      id: 'tech_med_1',
      category: 'technical' as const,
      difficulty: 'medium' as const,
      question: 'How would you optimize a React component that renders a large list?',
      timeLimit: 180,
      tips: [
        'Mention virtualization',
        'Discuss memoization',
        'Explain code splitting',
        'Talk about performance monitoring',
      ],
    },
    {
      id: 'tech_med_2',
      category: 'technical' as const,
      difficulty: 'medium' as const,
      question: 'Explain the concept of closure in JavaScript with an example.',
      timeLimit: 180,
      tips: [
        'Define closure clearly',
        'Provide code example',
        'Explain use cases',
        'Discuss memory implications',
      ],
    },
    {
      id: 'tech_med_3',
      category: 'technical' as const,
      difficulty: 'medium' as const,
      question: 'How does async/await work and when would you use it over promises?',
      timeLimit: 180,
      tips: [
        'Explain async/await syntax',
        'Compare with promises',
        'Discuss error handling',
        'Provide practical examples',
      ],
    },
  ],
  hard: [
    {
      id: 'tech_hard_1',
      category: 'technical' as const,
      difficulty: 'hard' as const,
      question: 'Design a caching strategy for a large-scale web application.',
      timeLimit: 300,
      tips: [
        'Discuss cache invalidation',
        'Mention TTL strategies',
        'Explain distributed caching',
        'Consider memory management',
      ],
    },
    {
      id: 'tech_hard_2',
      category: 'technical' as const,
      difficulty: 'hard' as const,
      question: 'How would you implement a real-time notification system?',
      timeLimit: 300,
      tips: [
        'Mention WebSockets',
        'Discuss scalability',
        'Explain fallback mechanisms',
        'Talk about message queuing',
      ],
    },
    {
      id: 'tech_hard_3',
      category: 'technical' as const,
      difficulty: 'hard' as const,
      question: 'Explain database indexing and when to use different index types.',
      timeLimit: 300,
      tips: [
        'Discuss query optimization',
        'Explain B-tree indexes',
        'Mention composite indexes',
        'Talk about performance trade-offs',
      ],
    },
  ],
}

const BEHAVIORAL_QUESTIONS = {
  easy: [
    {
      id: 'behav_easy_1',
      category: 'behavioral' as const,
      difficulty: 'easy' as const,
      question: 'Tell me about yourself and your professional background.',
      timeLimit: 120,
      tips: [
        'Keep it concise (1-2 minutes)',
        'Highlight relevant experience',
        'Show enthusiasm',
        'End with why you\'re interested in the role',
      ],
    },
    {
      id: 'behav_easy_2',
      category: 'behavioral' as const,
      difficulty: 'easy' as const,
      question: 'Why are you interested in this position?',
      timeLimit: 120,
      tips: [
        'Research the company',
        'Mention specific reasons',
        'Align with your goals',
        'Show genuine interest',
      ],
    },
  ],
  medium: [
    {
      id: 'behav_med_1',
      category: 'behavioral' as const,
      difficulty: 'medium' as const,
      question: 'Describe a challenging project you worked on and how you overcame difficulties.',
      timeLimit: 180,
      tips: [
        'Use STAR method',
        'Be specific with details',
        'Emphasize your role',
        'Show problem-solving skills',
      ],
    },
    {
      id: 'behav_med_2',
      category: 'behavioral' as const,
      difficulty: 'medium' as const,
      question: 'Tell me about a time you worked in a team. What was your role?',
      timeLimit: 180,
      tips: [
        'Highlight collaboration',
        'Show leadership qualities',
        'Discuss communication',
        'Mention conflict resolution',
      ],
    },
  ],
  hard: [
    {
      id: 'behav_hard_1',
      category: 'behavioral' as const,
      difficulty: 'hard' as const,
      question: 'Describe a failure you experienced and what you learned from it.',
      timeLimit: 300,
      tips: [
        'Be honest and humble',
        'Focus on learning',
        'Show growth mindset',
        'Avoid making excuses',
      ],
    },
    {
      id: 'behav_hard_2',
      category: 'behavioral' as const,
      difficulty: 'hard' as const,
      question: 'How do you handle conflicts with colleagues or managers?',
      timeLimit: 300,
      tips: [
        'Show maturity',
        'Emphasize communication',
        'Discuss resolution strategies',
        'Show respect for others',
      ],
    },
  ],
}

export function getQuestions(
  type: 'technical' | 'behavioral',
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 3
): InterviewQuestion[] {
  const questionBank = type === 'technical' ? TECHNICAL_QUESTIONS : BEHAVIORAL_QUESTIONS
  const questionsAtLevel = questionBank[difficulty]
  
  // Shuffle and return requested count
  return questionsAtLevel
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
}

export function getRandomQuestion(
  difficulty: 'easy' | 'medium' | 'hard'
): InterviewQuestion {
  const allQuestions = [
    ...TECHNICAL_QUESTIONS[difficulty],
    ...BEHAVIORAL_QUESTIONS[difficulty],
  ]
  return allQuestions[Math.floor(Math.random() * allQuestions.length)]
}
