import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '/api';

const STATS_CONFIG = [
  { key:'placementScore', label:'Placement Score', icon:'📊', color:'var(--accent)', format: v => v || 0 },
  { key:'streak', label:'Day Streak', icon:'🔥', color:'var(--amber)', format: v => `${v || 0}` },
  { key:'applicationsTracked', label:'Applications', icon:'📋', color:'var(--cyan)', format: v => v || 0 },
  { key:'mockInterviews', label:'Mock Interviews', icon:'🎯', color:'var(--green)', format: v => v || 0 },
];

const MOCK = {
  placementScore: 72, streak: 7, applicationsTracked: 14, mockInterviews: 3,
  readinessLevel: 'Intermediate',
  weeklyProgress: [45, 52, 61, 68, 72, 70, 72],
  skillRadar: { DSA: 70, SystemDesign: 45, WebDev: 85, Database: 65, Cloud: 40, Communication: 75 },
  upcomingDeadlines: [
    { company:'Microsoft', role:'SDE-1', deadline:'Aug 15', status:'apply', color:'var(--accent)' },
    { company:'Flipkart',  role:'SDE-1', deadline:'Aug 20', status:'apply', color:'var(--cyan)' },
    { company:'Google',    role:'SWE',   deadline:'Sep 01', status:'prepare', color:'var(--green)' },
    { company:'Razorpay',  role:'Backend', deadline:'Sep 10', status:'watch', color:'var(--amber)' },
  ],
  recentActivity: [
    { action:'Mock Interview', detail:'System Design — Score: 78/100', time:'2h ago', color:'var(--accent)' },
    { action:'Resume Optimized', detail:'ATS Score: 68 → 84', time:'1d ago', color:'var(--green)' },
    { action:'Strategy Generated', detail:'12-week roadmap ready', time:'2d ago', color:'var(--cyan)' },
    { action:'Profile Analyzed', detail:'All 5 agents completed', time:'3d ago', color:'var(--purple)' },
  ]
};

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className="card" style={{ position:'relative', overflow:'hidden', cursor:'default' }}
      onMouseEnter={e => e.currentTarget.style.borderColor='var(--border2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
      <div style={{ position:'absolute', top:0, right:0, width:100, height:100, borderRadius:'0 18px 0 100px', background:`${color}08`, pointerEvents:'none' }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div style={{ width:42, height:42, borderRadius:11, background:`${color}15`, border:`1px solid ${color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19 }}>{icon}</div>
        <div style={{ width:7, height:7, borderRadius:'50%', background:color, opacity:0.6 }} />
      </div>
      <div style={{ fontSize:34, fontWeight:800, fontFamily:'Outfit', color, lineHeight:1, marginBottom:4 }}>{value}</div>
      <div style={{ fontSize:13, color:'var(--text2)', fontWeight:450 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:'var(--text3)', marginTop:3 }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ label, value }) {
  const color = value >= 75 ? 'var(--green)' : value >= 55 ? 'var(--amber)' : 'var(--red)';
  return (
    <div style={{ marginBottom:11 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
        <span style={{ fontSize:12.5, color:'var(--text2)' }}>{label}</span>
        <span style={{ fontSize:12.5, fontWeight:600, color, fontFamily:'JetBrains Mono' }}>{value}%</span>
      </div>
      <div className="progress-bar"><div style={{ height:'100%', background:color, borderRadius:2, width:`${value}%`, transition:'width 1s ease' }} /></div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats] = useState(MOCK);
  const days = ['M','T','W','T','F','S','S'];
  const maxScore = Math.max(...stats.weeklyProgress);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ padding:'28px 32px', maxWidth:1280 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <span className="status-online"><span className="dot-green" style={{ animation:'pulse 2s infinite' }} />All 5 Agents Active</span>
            <span style={{ fontSize:12, color:'var(--text3)' }}>· Powered by Claude AI</span>
          </div>
          <h1 style={{ fontFamily:'Outfit', fontSize:30, fontWeight:800, letterSpacing:'-0.04em' }}>
            {greeting}, <span className="glow-text">{(user?.name || 'Student').split(' ')[0]}</span> 👋
          </h1>
          <p style={{ color:'var(--text2)', marginTop:5, fontSize:14 }}>
            {user?.profile?.branch || 'CS'} @ {user?.profile?.college || 'Engineering College'} · {user?.profile?.year || '3rd Year'}
          </p>
        </div>
        <button onClick={() => navigate('/agents')} className="btn btn-primary" style={{ padding:'12px 24px', fontSize:14 }}>
          ▶ Run Full Analysis
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {STATS_CONFIG.map(c => (
          <StatCard key={c.key} label={c.label} value={c.format(stats[c.key])} icon={c.icon} color={c.color}
            sub={c.key === 'placementScore' ? '↑ 12 pts this week' : c.key === 'streak' ? 'Keep it going!' : c.key === 'applicationsTracked' ? '3 in review' : 'Next: Tomorrow'} />
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* Weekly Progress */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div>
              <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700 }}>Weekly Progress</div>
              <div style={{ fontSize:12, color:'var(--text3)' }}>Placement score trajectory</div>
            </div>
            <span className="badge badge-green">+{stats.weeklyProgress[6] - stats.weeklyProgress[0]} pts</span>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:120 }}>
            {stats.weeklyProgress.map((v, i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                <div style={{ width:'100%', borderRadius:'4px 4px 0 0', transition:'height 1s ease',
                  background: i === 6 ? 'var(--accent)' : `linear-gradient(180deg, var(--accent)60, var(--accent)20)`,
                  height:`${(v/maxScore)*100}%`, minHeight:4,
                  boxShadow: i === 6 ? '0 0 12px var(--accent-glow)' : 'none' }} />
                <span style={{ fontSize:10, color: i === 6 ? 'var(--text2)' : 'var(--text3)' }}>{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Radar */}
        <div className="card">
          <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700, marginBottom:16 }}>Skill Readiness</div>
          {Object.entries(stats.skillRadar).map(([skill, value]) => (
            <MiniBar key={skill} label={skill} value={value} />
          ))}
        </div>
      </div>

      {/* Bottom grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Deadlines */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700 }}>Upcoming Deadlines</div>
            <span className="badge badge-amber">⏰ {stats.upcomingDeadlines.length} upcoming</span>
          </div>
          {stats.upcomingDeadlines.map((d, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom: i < stats.upcomingDeadlines.length-1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:`${d.color}15`, border:`1px solid ${d.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🏢</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{d.company} <span style={{ fontWeight:400, color:'var(--text3)' }}>· {d.role}</span></div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>Deadline: {d.deadline}</div>
              </div>
              <span className="badge" style={{ background:`${d.color}15`, color:d.color, border:`1px solid ${d.color}25`, flexShrink:0 }}>{d.status}</span>
            </div>
          ))}
        </div>

        {/* Activity */}
        <div className="card">
          <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700, marginBottom:18 }}>Recent Activity</div>
          {stats.recentActivity.map((a, i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'11px 0', borderBottom: i < stats.recentActivity.length-1 ? '1px solid var(--border)' : 'none', alignItems:'flex-start' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:a.color, marginTop:5, flexShrink:0, boxShadow:`0 0 8px ${a.color}60` }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500 }}>{a.action}</div>
                <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{a.detail}</div>
              </div>
              <span style={{ fontSize:11, color:'var(--text3)', flexShrink:0, marginTop:1 }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{ marginTop:20, padding:'24px 28px', background:'linear-gradient(135deg, var(--accent-dim), rgba(168,85,247,0.08))', border:'1px solid var(--accent)25', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <div>
          <div style={{ fontFamily:'Outfit', fontSize:17, fontWeight:700, marginBottom:4 }}>🚀 Ready for your next level?</div>
          <div style={{ fontSize:13, color:'var(--text2)' }}>Run the full 5-agent analysis to get your personalized placement blueprint powered by Claude AI.</div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => navigate('/resume')} className="btn btn-ghost" style={{ fontSize:13 }}>📄 Analyze Resume</button>
          <button onClick={() => navigate('/agents')} className="btn btn-primary" style={{ fontSize:13 }}>▶ Full Analysis →</button>
        </div>
      </div>
    </div>
  );
}
