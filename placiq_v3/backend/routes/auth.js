const router = require('express').Router();
const jwt = require('jsonwebtoken');
let User;
try { User = require('../models/User'); } catch(e) { User = null; }
const authMiddleware = require('../middleware/auth');
const JWT_SECRET = process.env.JWT_SECRET || 'placiq-super-secret-key-2024';
const sign = (user) => jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    if (!User) return res.status(503).json({ error: 'Database not connected. Use demo login.' });
    const { name, email, password, college, branch, year } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, password required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    const user = await User.create({ name, email, password, profile: { college, branch, year } });
    res.status(201).json({ token: sign(user), user });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    if (!User) return res.status(503).json({ error: 'Database not connected. Use demo login.' });
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ error: 'Invalid credentials' });
    user.lastActive = new Date(); await user.save();
    res.json({ token: sign(user), user });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/demo', (req, res) => {
  const demoUser = { _id: 'demo123', name: 'Arjun Sharma', email: 'arjun@placiq.ai', role: 'student', placementScore: 72, readinessLevel: 'intermediate', streak: 7, profile: { college: 'NIT Jalandhar', branch: 'Computer Science', year: '3rd Year', cgpa: 8.2, skills: ['Python', 'React', 'Node.js', 'SQL', 'DSA'], targetRole: 'Software Engineer', targetCompanies: ['Google', 'Microsoft', 'Amazon', 'Flipkart'] } };
  const token = jwt.sign({ id: 'demo123', email: 'arjun@placiq.ai', role: 'student' }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: demoUser });
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    if (req.user.id === 'demo123') return res.json({ _id: 'demo123', name: 'Arjun Sharma', email: 'arjun@placiq.ai' });
    if (!User) return res.status(503).json({ error: 'No database' });
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
