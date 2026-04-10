const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  profile: {
    college: String,
    branch: String,
    year: String,
    cgpa: Number,
    skills: [String],
    targetCompanies: [String],
    targetRole: String,
    experience: String,
    linkedinUrl: String,
    githubUrl: String,
    resumeText: String,
  },
  agentHistory: [{
    agentType: String,
    query: String,
    response: String,
    timestamp: { type: Date, default: Date.now }
  }],
  placementScore: { type: Number, default: 0 },
  readinessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'ready'], default: 'beginner' },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
