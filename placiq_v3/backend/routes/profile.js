const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
let User; try { User = require('../models/User'); } catch(e) { User = null; }

router.get('/', authMiddleware, async (req, res) => {
  if (!User || req.user.id === 'demo123') return res.json({ skills: ['Python', 'React', 'Node.js'], targetRole: 'SWE', cgpa: 8.2 });
  try {
    const user = await User.findById(req.user.id);
    res.json(user?.profile || {});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/', authMiddleware, async (req, res) => {
  if (!User || req.user.id === 'demo123') return res.json({ ...req.body, message: 'Demo mode - changes not saved' });
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { $set: { profile: req.body } }, { new: true });
    res.json(user.profile);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
