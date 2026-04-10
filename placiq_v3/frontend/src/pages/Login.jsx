import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AGENTS = [
  { icon: '🧠', label: 'Profile Analyzer', desc: 'Strengths & gaps', color: '#5b5ef4' },
  { icon: '📡', label: 'Market Intelligence', desc: 'Real-time trends', color: '#00d4e8' },
  { icon: '🗺️', label: 'Strategy Engine', desc: 'Your roadmap', color: '#a855f7' },
  { icon: '🎯', label: 'Interview Coach', desc: 'Mock interviews', color: '#00e87a' },
  { icon: '📄', label: 'Resume Optimizer', desc: 'ATS scoring', color: '#ffb547' },
];

export default function Login() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', college:'', branch:'', year:'' });
  const { login, register, demoLogin } = useAuth();
  const navigate = useNavigate();
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form);
      toast.success('Welcome to PlaCIQ 2.0!');
      navigate('/');
    } catch (err) { toast.error(err.response?.data?.error || 'Authentication failed'); }
    finally { setLoading(false); }
  };

  const handleDemo = async () => {
    setLoading(true);
    try { await demoLogin(); toast.success('Demo activated!'); navigate('/'); }
    catch { toast.error('Demo login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', overflow:'hidden', position:'relative' }}>
      {/* Background orbs */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-15%', left:'-5%', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(91,94,244,0.1) 0%, transparent 65%)' }} />
        <div style={{ position:'absolute', bottom:'-20%', right:'-8%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 65%)' }} />
        <div style={{ position:'absolute', top:'35%', right:'30%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,212,232,0.05) 0%, transparent 65%)' }} />
        {/* Grid pattern */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize:'48px 48px' }} />
      </div>

      {/* Left Panel */}
      <div style={{ flex:1, padding:'48px 64px', display:'flex', flexDirection:'column', justifyContent:'space-between', position:'relative', zIndex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div className="brand-logo">P</div>
          <div>
            <div style={{ fontFamily:'Outfit', fontSize:20, fontWeight:800, letterSpacing:'-0.03em' }}>PlaCIQ <span style={{ color:'var(--accent2)', fontSize:13, fontWeight:500 }}>2.0</span></div>
            <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:500 }}>AI Placement System</div>
          </div>
        </div>

        <div style={{ maxWidth:540 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--green-dim)', border:'1px solid rgba(0,232,122,0.2)', borderRadius:20, padding:'6px 16px', marginBottom:28 }}>
            <div className="dot-green" style={{ animation:'pulse 2s infinite' }} />
            <span style={{ fontSize:11, color:'var(--green)', fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>5-Agent AI System Online</span>
          </div>

          <h1 style={{ fontFamily:'Outfit', fontSize:54, fontWeight:800, lineHeight:1.05, letterSpacing:'-0.04em', marginBottom:18 }}>
            Overhaul your<br />
            <span className="glow-text">placement engine.</span>
          </h1>
          <p style={{ fontSize:17, color:'var(--text2)', lineHeight:1.75, marginBottom:40, fontWeight:400 }}>
            Multi-agent AI that analyzes your profile, reads the job market, builds your strategy, preps your interviews, and optimizes your resume — autonomously, in real-time.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {AGENTS.map((a, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 18px', background:'rgba(255,255,255,0.025)', border:'1px solid var(--border)', borderRadius:12, animation:`fadeInUp 0.5s ease ${i * 0.07}s both`, transition:'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = a.color + '40'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div style={{ width:38, height:38, borderRadius:9, background:`${a.color}15`, border:`1px solid ${a.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>{a.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{a.label}</div>
                  <div style={{ fontSize:11, color:'var(--text3)' }}>{a.desc}</div>
                </div>
                <div style={{ width:7, height:7, borderRadius:'50%', background:a.color, boxShadow:`0 0 8px ${a.color}`, flexShrink:0 }} />
              </div>
            ))}
          </div>

          {/* Claude badge */}
          <div style={{ marginTop:24, display:'flex', alignItems:'center', gap:10, padding:'10px 16px', background:'rgba(255,255,255,0.025)', border:'1px solid var(--border)', borderRadius:12 }}>
            <span style={{ fontSize:18 }}>✦</span>
            <span style={{ fontSize:12, color:'var(--text3)' }}>Powered by <strong style={{ color:'var(--text2)' }}>Claude AI</strong> (Anthropic) + Gemini — intelligent multi-model orchestration</span>
          </div>
        </div>

        <p style={{ fontSize:12, color:'var(--text4)' }}>© 2025 PlaCIQ. Built for HackAI Season 2 · NIT Jalandhar</p>
      </div>

      {/* Right Panel - Auth */}
      <div style={{ width:460, background:'var(--surface)', borderLeft:'1px solid var(--border)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 40px', position:'relative', zIndex:1, flexShrink:0 }}>
        <div style={{ marginBottom:30 }}>
          <h2 style={{ fontFamily:'Outfit', fontSize:27, fontWeight:700, marginBottom:8, letterSpacing:'-0.03em' }}>
            {mode === 'login' ? 'Welcome back' : 'Get started free'}
          </h2>
          <p style={{ color:'var(--text2)', fontSize:14 }}>
            {mode === 'login' ? "Don't have an account? " : "Already have one? "}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              style={{ background:'none', border:'none', color:'var(--accent2)', cursor:'pointer', fontFamily:'Inter', fontSize:14, fontWeight:600, padding:0 }}>
              {mode === 'login' ? 'Sign up free →' : 'Log in →'}
            </button>
          </p>
        </div>

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {mode === 'register' && (<>
            <div>
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handle} placeholder="Arjun Sharma" required />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div><label>College</label><input name="college" value={form.college} onChange={handle} placeholder="NIT Jalandhar" /></div>
              <div><label>Branch</label><input name="branch" value={form.branch} onChange={handle} placeholder="CSE" /></div>
            </div>
          </>)}

          <div><label>Email Address</label><input name="email" type="email" value={form.email} onChange={handle} placeholder="you@college.edu" required /></div>
          <div><label>Password</label><input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required /></div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:15, marginTop:4 }}>
            {loading ? <><div className="spinner spinner-sm" /> Authenticating...</> : mode === 'login' ? 'Launch PlaCIQ →' : 'Create Account →'}
          </button>

          <div className="divider-text"><span>or</span></div>

          <button type="button" onClick={handleDemo} disabled={loading} className="btn btn-ghost" style={{ width:'100%', justifyContent:'center', padding:'12px' }}>
            <span>⚡</span> Try Demo (No signup required)
          </button>
        </form>

        <div style={{ marginTop:28, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[['🔒','JWT Secure'], ['🤖','Claude AI'], ['📊','Real Data']].map(([icon, label]) => (
            <div key={label} style={{ textAlign:'center', padding:'12px 8px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10 }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
              <div style={{ fontSize:11, color:'var(--text3)', fontWeight:500 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
