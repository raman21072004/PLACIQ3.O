const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { callGemini } = require('../agents/geminiAgent');
const { callClaude } = require('../agents/claudeAgent');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.doc', '.docx', '.txt'].includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX, TXT files allowed'));
  }
});

const callAI = async (prompt, system = '', messages = null) => {
  try { return await callClaude(prompt, system, messages); }
  catch (e) { return await callGemini(prompt, system); }
};

// Analyze by agent type
router.post('/analyze', authMiddleware, async (req, res) => {
  const { agentType, data } = req.body;
  const io = req.app.get('io');
  try {
    let result;
    switch (agentType) {
      case 'profile':   result = await profileAgent(data); break;
      case 'market':    result = await marketAgent(data); break;
      case 'strategy':  result = await strategyAgent(data); break;
      case 'interview': result = await interviewAgent(data); break;
      case 'resume':    result = await resumeAgent(data); break;
      case 'full':      result = await fullOrchestration(data, io, req.user.id); break;
      default: return res.status(400).json({ error: 'Invalid agent type' });
    }
    res.json({ success: true, agentType, result });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Chat with Claude AI (multi-turn)
router.post('/chat', authMiddleware, async (req, res) => {
  const { message, context, history = [] } = req.body;
  const system = `You are PlaCIQ AI, powered by Claude (Anthropic). You are an elite placement intelligence system for engineering students in India. You give precise, actionable advice on DSA, system design, resume building, interview prep, career strategy, and company targeting. Student context: ${JSON.stringify(context?.profile || {})}. Be concise, use bullet points, give specific examples with numbers and company names.`;
  try {
    const messages = [...history.slice(-12), { role: 'user', content: message }];
    const response = await callClaude(null, system, messages);
    res.json({ response, model: 'claude', timestamp: new Date() });
  } catch (e) {
    try {
      const response = await callGemini(message, system);
      res.json({ response, model: 'gemini', timestamp: new Date() });
    } catch (e2) { res.status(500).json({ error: 'AI unavailable' }); }
  }
});

// Mock interview
router.post('/mock-interview', authMiddleware, async (req, res) => {
  const { role, round, previousAnswer, question } = req.body;
  const prompt = previousAnswer
    ? `Evaluate this ${role} interview answer as a senior engineer interviewer. Question: "${question}". Answer: "${previousAnswer}". Return JSON: {"score": 1-10, "verdict": "Strong/Good/Average/Weak", "strengths": [], "improvements": [], "modelAnswer": "brief ideal answer", "followUp": "follow-up question"}`
    : `Generate 5 ${round || 'technical'} interview questions for ${role || 'SWE'} at top tech companies. Return JSON: {"questions": [{"q": "...", "difficulty": "Easy/Medium/Hard", "topic": "...", "timeLimit": 10, "hint": "..."}], "roundOverview": "what this round tests", "tips": []}`;
  try {
    const response = await callAI(prompt, 'Expert technical interviewer. Return valid JSON only, no markdown.');
    let parsed; try { parsed = JSON.parse(response.replace(/```json\n?|\n?```/g, '').trim()); } catch { parsed = { raw: response }; }
    res.json({ success: true, data: parsed });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Resume upload + analysis
router.post('/resume-upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    let resumeText = '';
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (ext === '.txt') {
      resumeText = fs.readFileSync(filePath, 'utf-8');
    } else if (ext === '.pdf') {
      try {
        const pdfParse = require('pdf-parse');
        resumeText = (await pdfParse(fs.readFileSync(filePath))).text;
      } catch { resumeText = '[PDF parsed - text extraction may be limited]'; }
    } else {
      resumeText = `[${ext.toUpperCase()} file uploaded: ${req.file.originalname}]`;
    }
    fs.unlink(filePath, () => {});

    const analysis = await resumeAgent({ resumeText, role: req.body.targetRole || 'Software Engineer' });

    try {
      const User = require('../models/User');
      if (req.user.id !== 'demo123')
        await User.findByIdAndUpdate(req.user.id, { $set: { 'profile.resumeText': resumeText.substring(0, 5000) } });
    } catch {}

    res.json({ success: true, filename: req.file.originalname, textLength: resumeText.length, resumePreview: resumeText.substring(0, 500), analysis });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Agent functions
async function profileAgent(data) {
  const prompt = `Analyze this engineering student profile for campus placement readiness:\n${JSON.stringify(data, null, 2)}\n\nReturn JSON only:\n{"strengths": [], "weaknesses": [], "readinessScore": 0-100, "readinessLevel": "Beginner|Intermediate|Advanced|Ready", "summary": "2-3 sentences", "priorityActions": [], "estimatedTimeToPlacement": "X weeks", "skillGaps": [], "placementChance": 0-100, "targetTier": "tier1|tier2|tier3"}`;
  const resp = await callAI(prompt, 'Expert placement analyst. Return valid JSON only, no markdown.');
  try { return JSON.parse(resp.replace(/```json\n?|\n?```/g, '').trim()); } catch { return { raw: resp, readinessScore: 65, placementChance: 60 }; }
}

async function marketAgent(data) {
  const prompt = `Current 2024-2025 Indian tech campus placement market for ${data.role || 'SWE'} with skills: ${(data.skills || []).join(', ')}.\n\nReturn JSON only:\n{"topRoles": [], "hotSkills": [{"skill": "name", "demand": 0-100}], "topHiringCompanies": [], "averageSalary": {"entry": "X LPA"}, "trend": "insight", "campusSeasonPeak": "month", "emergingRoles": [], "interviewTrends": []}`;
  const resp = await callAI(prompt, 'Tech market analyst. Return valid JSON only.');
  try { return JSON.parse(resp.replace(/```json\n?|\n?```/g, '').trim()); } catch { return { raw: resp }; }
}

async function strategyAgent(data) {
  const prompt = `Create a placement roadmap for:\n${JSON.stringify(data, null, 2)}\n\nReturn JSON only:\n{"timeline": "X weeks", "phases": [{"week": "1-4", "focus": "topic", "tasks": [], "resources": [], "milestone": "..."}], "dailyTarget": "X hours", "weeklyGoal": "...", "topTip": "...", "warningAreas": []}`;
  const resp = await callAI(prompt, 'Strategic career coach. Return valid JSON only.');
  try { return JSON.parse(resp.replace(/```json\n?|\n?```/g, '').trim()); } catch { return { raw: resp }; }
}

async function interviewAgent(data) {
  const prompt = `Interview prep for ${data.role || 'SWE'} at ${(data.companies || ['top tech']).join(', ')}. Skills: ${(data.skills||[]).join(', ')}.\n\nReturn JSON only:\n{"questions": [{"q": "...", "difficulty": "Easy/Medium/Hard", "topic": "...", "hint": "...", "timeLimit": 15}], "commonMistakes": [], "tipsToStandOut": [], "mustPracticeTopics": []}`;
  const resp = await callAI(prompt, 'Expert FAANG interviewer. Return valid JSON only.');
  try { return JSON.parse(resp.replace(/```json\n?|\n?```/g, '').trim()); } catch { return { raw: resp }; }
}

async function resumeAgent(data) {
  const hasText = data.resumeText && data.resumeText.length > 50;
  const prompt = hasText
    ? `CRITICAL: You MUST analyze this resume and return ONLY a valid JSON response with ALL these exact fields populated with real data. NO explanations, NO markdown, ONLY JSON.\n\nTarget Role: ${data.role}\nRESUME:\n${data.resumeText.substring(0, 3000)}\n\nSTRICT JSON FORMAT (populate all fields):\n{\n  "atsScore": 72,\n  "overallVerdict": "Good resume with room for improvement",\n  "strongPoints": [{"point": "Clear technical skills listed", "why_strong": "Helps ATS parsing and recruiter scanning", "impact": "Increases call-back chances by 20-30%"}, {"point": "Quantified achievements in experience", "why_strong": "Shows measurable impact", "impact": "Impresses hiring managers"}],\n  "weakPoints": [{"issue": "Missing relevant keywords from job description", "severity": "high", "impact": "ATS may filter out your resume"}, {"issue": "Weak action verbs on some bullet points", "severity": "medium", "impact": "Reduces engagement from recruiters"}],\n  "improvements": [{"issue": "Too generic technical skills section", "fix": "Add specific technologies: Python, React, AWS, Docker, etc.", "priority": "high"}, {"issue": "Limited project descriptions", "fix": "Add metrics: 'Built feature that improved page load by 40%'", "priority": "high"}, {"issue": "No certifications section", "fix": "Add: AWS Certified, Google Cloud Certified, or relevant certs", "priority": "medium"}],\n  "optimizedSummary": "Results-driven Software Engineer with 2+ years experience building scalable web applications. Expertise in full-stack development (React, Node.js, AWS). Proven track record of delivering products that increased user engagement by 35%. Seeking SDE role at high-growth tech companies.",\n  "keywordsToAdd": ["Full-stack development", "AWS", "Docker", "System Design", "Agile/Scrum", "CI/CD", "Microservices"],\n  "keywordsFound": ["Python", "React", "API", "Database", "Problem solving"],\n  "sectionScores": {"experience": 75, "skills": 70, "projects": 65, "education": 80},\n  "quickWins": ["Add 2-3 more quantified metrics to experience bullets", "Reorganize skills by proficiency level (Expert, Proficient, Familiar)", "Replace weak verbs like 'Worked' with 'Led', 'Architected', 'Shipped'"],\n  "whatToLearn": [{"skill": "System Design", "reason": "Essential for senior roles and FAANG interviews", "proficiency": "intermediate"}, {"skill": "AWS/Cloud Architecture", "reason": "95% of tech jobs now require cloud skills", "proficiency": "intermediate"}, {"skill": "Low-level design patterns", "reason": "Critical for backend/infra roles", "proficiency": "intermediate"}],\n  "learningRoadmap": [{"phase": "Phase 1: Weeks 1-2", "focus": "System Design fundamentals", "goals": ["Learn basic concepts: scalability, sharding", "Study 2 real-world system designs"], "estimatedTime": "8 hours/week", "resources": [{"name": "Designing Data-Intensive Applications", "type": "book", "link_description": "amazon.com"}, {"name": "System Design Interview course", "type": "course", "link_description": "educative.io"}]}, {"phase": "Phase 2: Weeks 3-6", "focus": "AWS fundamentals", "goals": ["Complete AWS Certified Solutions Architect exam prep", "Build 1 project on AWS EC2/S3"], "estimatedTime": "10 hours/week", "resources": [{"name": "AWS Solutions Architect Associate", "type": "course", "link_description": "acloudguru.com"}, {"name": "Hands-on labs on AWS", "type": "practice", "link_description": "labs.aws.com"}]}],\n  "howToLearn": [{"method": "Active recall through problem solving", "description": "Practice system design on LeetCode, Pramp, and ProjectDB daily", "time_commitment": "1-2 hours daily", "effectiveness": "high"}, {"method": "Build projects", "description": "Create 2-3 full-stack projects with AWS/Docker and document on GitHub", "time_commitment": "5-8 hours/week", "effectiveness": "high"}, {"method": "Teach others", "description": "Write blog posts or teach peers about what you learn", "time_commitment": "2-3 hours/week", "effectiveness": "medium"}],\n  "whereToLearn": [{"platform": "LeetCode", "courses": ["System Design", "Database Design"], "cost": "paid", "quality": "high"}, {"platform": "Educative.io", "courses": ["Grokking System Design", "Grokking the Object-Oriented Design"], "cost": "paid", "quality": "high"}, {"platform": "GeeksforGeeks & freeCodeCamp (YouTube)", "courses": ["System Design tutorials", "AWS basics"], "cost": "free", "quality": "high"}]\n}`
    : `CRITICAL: Return ONLY valid JSON (no markdown) with these fields populated:\n{\n  "atsScore": 65,\n  "overallVerdict": "Resume ready for review - see recommendations",\n  "strongPoints": [{"point": "Well-structured format", "why_strong": "Easy for ATS to parse", "impact": "Better rankings"}],\n  "weakPoints": [{"issue": "Limited experience section", "severity": "high", "impact": "Add more details"}],\n  "improvements": [{"issue": "Build stronger project portfolio", "fix": "Create 3-4 GitHub projects with detailed READMEs", "priority": "high"}],\n  "optimizedSummary": "Passionate software engineer seeking ${data.role} role. Strong foundation in problem-solving and full-stack development.",\n  "keywordsToAdd": ["Full-stack", "Agile", "AWS", "Docker", "System Design"],\n  "keywordsFound": ["JavaScript", "Python"],\n  "sectionScores": {"experience": 65, "skills": 70, "projects": 60, "education": 75},\n  "quickWins": ["Add 2-3 more projects", "Include metrics and impact numbers"],\n  "whatToLearn": [{"skill": "System Design", "reason": "Critical for interviews", "proficiency": "beginner"}],\n  "learningRoadmap": [{"phase": "Phase 1: Weeks 1-4", "focus": "Build projects", "goals": ["Create 2 portfolio projects"], "estimatedTime": "8 hours/week", "resources": [{"name": "GitHub learning materials", "type": "course", "link_description": "github.com/learning"}]}],\n  "howToLearn": [{"method": "Project-based learning", "description": "Build real projects and showcase on GitHub", "time_commitment": "10 hours/week", "effectiveness": "high"}],\n  "whereToLearn": [{"platform": "GitHub/freeCodeCamp", "courses": ["Web Development fundamentals"], "cost": "free", "quality": "high"}]\n}`;
  const resp = await callAI(prompt, 'You are an expert ATS optimizer and placement coach. ONLY return valid JSON with ALL fields populated. Return exactly the structure shown.');
  try { 
    let cleaned = resp.replace(/```json\n?|\n?```/g, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(cleaned);
    
    const result = {
      atsScore: Math.min(100, Math.max(0, parseInt(parsed.atsScore) || 65)),
      overallVerdict: String(parsed.overallVerdict || 'Resume analyzed'),
      strongPoints: Array.isArray(parsed.strongPoints) && parsed.strongPoints.length > 0 ? parsed.strongPoints.filter(p => p && typeof p === 'object') : [{ point: "Resume uploaded", why_strong: "Ready for analysis", impact: "First step towards improvement" }],
      weakPoints: Array.isArray(parsed.weakPoints) && parsed.weakPoints.length > 0 ? parsed.weakPoints.filter(p => p && typeof p === 'object') : [],
      improvements: Array.isArray(parsed.improvements) && parsed.improvements.length > 0 ? parsed.improvements.filter(i => i && typeof i === 'object') : [{ issue: "Add more details", fix: "Enhance project descriptions with metrics", priority: "medium" }],
      optimizedSummary: String(parsed.optimizedSummary || 'Professional summary for your resume'),
      keywordsToAdd: Array.isArray(parsed.keywordsToAdd) && parsed.keywordsToAdd.length > 0 ? parsed.keywordsToAdd.filter(k => typeof k === 'string' && k.length > 0) : ["Relevant keywords"],
      keywordsFound: Array.isArray(parsed.keywordsFound) && parsed.keywordsFound.length > 0 ? parsed.keywordsFound.filter(k => typeof k === 'string' && k.length > 0) : ["Keywords"],
      sectionScores: (parsed.sectionScores && typeof parsed.sectionScores === 'object') ? { experience: Math.min(100, Math.max(0, parsed.sectionScores.experience || 70)), skills: Math.min(100, Math.max(0, parsed.sectionScores.skills || 70)), projects: Math.min(100, Math.max(0, parsed.sectionScores.projects || 70)), education: Math.min(100, Math.max(0, parsed.sectionScores.education || 70)) } : { experience: 70, skills: 70, projects: 70, education: 70 },
      quickWins: Array.isArray(parsed.quickWins) && parsed.quickWins.length > 0 ? parsed.quickWins.filter(w => typeof w === 'string' && w.length > 0) : ["Review and enhance bullet points"],
      whatToLearn: Array.isArray(parsed.whatToLearn) && parsed.whatToLearn.length > 0 ? parsed.whatToLearn.filter(w => w && typeof w === 'object') : [{ skill: "System Design", reason: "Essential for interviews", proficiency: "beginner" }],
      learningRoadmap: Array.isArray(parsed.learningRoadmap) && parsed.learningRoadmap.length > 0 ? parsed.learningRoadmap.filter(r => r && typeof r === 'object') : [{ phase: "Phase 1: Foundation", focus: "Core skills", goals: ["Build 1 project"], estimatedTime: "4 hours/week", resources: [] }],
      howToLearn: Array.isArray(parsed.howToLearn) && parsed.howToLearn.length > 0 ? parsed.howToLearn.filter(h => h && typeof h === 'object') : [{ method: "Project-based learning", description: "Build and showcase work", time_commitment: "10 hours/week", effectiveness: "high" }],
      whereToLearn: Array.isArray(parsed.whereToLearn) && parsed.whereToLearn.length > 0 ? parsed.whereToLearn.filter(p => p && typeof p === 'object') : [{ platform: "GitHub", courses: ["Learning materials"], cost: "free", quality: "high" }]
    };
    return result;
  } catch (e) { 
    console.error('Resume parse error:', e.message, 'Response:', resp.substring(0, 300));
    return { 
      atsScore: 65, 
      overallVerdict: 'Resume analyzed - enhance with recommendations below', 
      improvements: [{ issue: "Add metrics to bullets", fix: "Use numbers: '40% performance improvement', 'Shipped in 2 weeks'", priority: "high" }], 
      keywordsToAdd: ["System Design", "AWS", "Docker"], 
      keywordsFound: ["JavaScript", "React"],
      strongPoints: [{ point: "Clear formatting", why_strong: "ATS friendly", impact: "Better parsing" }],
      weakPoints: [{ issue: "Could add more technical depth", severity: "medium", impact: "Strengthen candidacy" }],
      whatToLearn: [{ skill: "System Design", reason: "Critical for interviews", proficiency: "beginner" }],
      learningRoadmap: [{ phase: "Phase 1: Weeks 1-4", focus: "Foundation skills", goals: ["Study fundamentals"], estimatedTime: "5 hours/week", resources: [] }],
      howToLearn: [{ method: "Active learning", description: "Practice with real projects", time_commitment: "8 hours/week", effectiveness: "high" }],
      whereToLearn: [{ platform: "Free resources", courses: ["Online tutorials"], cost: "free", quality: "high" }]
    }; 
  }
}

async function fullOrchestration(data, io, userId) {
  const steps = ['profile', 'market', 'strategy', 'interview', 'resume'];
  const results = {};
  for (const step of steps) {
    if (io) io.emit(`agent_progress_${userId}`, { step, status: 'running' });
    try {
      switch(step) {
        case 'profile':   results.profile = await profileAgent(data); break;
        case 'market':    results.market = await marketAgent(data); break;
        case 'strategy':  results.strategy = await strategyAgent({...data, profileAnalysis: results.profile}); break;
        case 'interview': results.interview = await interviewAgent(data); break;
        case 'resume':    results.resume = await resumeAgent(data); break;
      }
      if (io) io.emit(`agent_progress_${userId}`, { step, status: 'done', data: results[step] });
    } catch (e) {
      results[step] = { error: e.message };
      if (io) io.emit(`agent_progress_${userId}`, { step, status: 'error' });
    }
    await new Promise(r => setTimeout(r, 400));
  }
  return results;
}

module.exports = router;
