const router = require('express').Router();
const authMiddleware = require('../middleware/auth');

router.get('/stats', authMiddleware, async (req, res) => {
  res.json({
    placementScore: 72,
    streak: 7,
    applicationsTracked: 14,
    interviewsScheduled: 3,
    readinessLevel: 'Intermediate',
    weeklyProgress: [45, 52, 61, 68, 72, 70, 72],
    skillRadar: { DSA: 70, SystemDesign: 45, WebDev: 85, Database: 65, Cloud: 40, Communication: 75 },
    upcomingDeadlines: [
      { company: 'Microsoft', role: 'SDE-1', deadline: '2025-08-15', status: 'apply' },
      { company: 'Flipkart', role: 'SDE-1', deadline: '2025-08-20', status: 'apply' },
      { company: 'Google', role: 'SWE', deadline: '2025-09-01', status: 'prepare' }
    ],
    recentActivity: [
      { action: 'Completed Mock Interview', time: '2h ago', icon: 'interview' },
      { action: 'Resume Optimized', time: '1d ago', icon: 'resume' },
      { action: 'Strategy Generated', time: '2d ago', icon: 'strategy' }
    ]
  });
});

module.exports = router;
