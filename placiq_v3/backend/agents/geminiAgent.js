const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function callGemini(prompt, systemContext = '') {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return getMockResponse(prompt);
    }
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const fullPrompt = systemContext ? `${systemContext}\n\n${prompt}` : prompt;
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (e) {
    console.error('Gemini error:', e.message);
    return getMockResponse(prompt);
  }
}

function getMockResponse(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes('profile') || lower.includes('analyze')) {
    return JSON.stringify({
      strengths: ['Strong DSA fundamentals', 'Good web development skills', 'Problem-solving aptitude'],
      weaknesses: ['System design knowledge gaps', 'Limited project experience', 'Low-level C++ proficiency'],
      readinessScore: 72,
      readinessLevel: 'Intermediate',
      summary: 'You have solid foundational skills. Focus on system design and building 2-3 production-grade projects to reach interview readiness for top-tier companies.'
    });
  }
  if (lower.includes('roadmap') || lower.includes('strategy')) {
    return JSON.stringify({
      timeline: '12 weeks',
      phases: [
        { week: '1-4', focus: 'DSA Mastery', tasks: ['LeetCode 150', 'Trees & Graphs', 'DP patterns'], resources: ['NeetCode', 'AlgoExpert'] },
        { week: '5-8', focus: 'System Design', tasks: ['HLD concepts', 'LLD patterns', 'Mock design rounds'], resources: ['Grokking System Design', 'ByteByteGo'] },
        { week: '9-12', focus: 'Projects & Applications', tasks: ['Build 2 full-stack projects', 'Deploy on cloud', 'Apply to target companies'], resources: ['GitHub portfolio', 'LinkedIn optimization'] }
      ],
      dailyTarget: '4-5 hours',
      weeklyGoal: 'Complete 1 phase milestone',
      topTip: 'Consistency beats intensity. Track progress daily using PlaCIQ streak.'
    });
  }
  if (lower.includes('interview') || lower.includes('question')) {
    return JSON.stringify({
      questions: [
        { q: 'Explain the concept of closure in JavaScript.', difficulty: 'Medium', topic: 'JavaScript', hint: 'Think about function scope and lexical environment' },
        { q: 'Design a URL shortener like bit.ly.', difficulty: 'Hard', topic: 'System Design', hint: 'Consider hashing, DB schema, and scalability' },
        { q: 'Implement LRU Cache in O(1) time.', difficulty: 'Hard', topic: 'DSA', hint: 'Combine HashMap + Doubly LinkedList' },
        { q: 'What is the difference between SQL and NoSQL databases?', difficulty: 'Easy', topic: 'Databases', hint: 'Focus on ACID, scalability, and use cases' },
        { q: 'Explain REST vs GraphQL.', difficulty: 'Medium', topic: 'API Design', hint: 'Think about over-fetching and under-fetching' }
      ],
      mockFeedback: 'Focus on thinking out loud during interviews. Communicate your approach before coding.',
      nextSteps: ['Practice 2 system design problems daily', 'Record yourself answering behavioral questions', 'Do 3 mock interviews this week']
    });
  }
  if (lower.includes('resume') || lower.includes('ats')) {
    return JSON.stringify({
      atsScore: 68,
      improvements: [
        { issue: 'Missing quantified achievements', fix: 'Add metrics like "Improved API response time by 40%"', priority: 'high' },
        { issue: 'Skills section not optimized', fix: 'Include keywords: React.js, Node.js, REST APIs, MongoDB, Docker', priority: 'high' },
        { issue: 'Project descriptions too vague', fix: 'Use STAR format: Situation, Task, Action, Result', priority: 'medium' },
        { issue: 'No summary/objective', fix: 'Add 2-3 line professional summary targeting SWE roles', priority: 'medium' }
      ],
      optimizedSummary: 'Final-year CS student with 2+ years of hands-on experience in full-stack development (React, Node.js, MongoDB). Built scalable web applications serving 1000+ users. Passionate about solving complex engineering problems.',
      keywordsToAdd: ['Agile/Scrum', 'CI/CD', 'System Design', 'Microservices', 'AWS/GCP']
    });
  }
  if (lower.includes('market') || lower.includes('trend') || lower.includes('company')) {
    return JSON.stringify({
      topRoles: ['Software Engineer', 'Full Stack Developer', 'Data Engineer', 'ML Engineer', 'DevOps Engineer'],
      hotSkills: [{ skill: 'AI/ML Integration', demand: 94 }, { skill: 'React/Next.js', demand: 89 }, { skill: 'Cloud (AWS/GCP)', demand: 85 }, { skill: 'System Design', demand: 82 }, { skill: 'Python', demand: 78 }],
      topHiringCompanies: ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Zomato', 'Swiggy', 'Atlassian', 'Razorpay'],
      averageSalary: { entry: '12-18 LPA', mid: '20-35 LPA', senior: '40-80 LPA' },
      trend: 'AI-integrated products are dominating hiring. Companies want engineers who can build + ship AI features.',
      campusSeasonPeak: 'August-November 2025'
    });
  }
  return JSON.stringify({ message: 'Analysis complete. Configure GEMINI_API_KEY for AI-powered responses.', data: {} });
}

module.exports = { callGemini };
