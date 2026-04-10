import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '/api';
const SKILLS_LIST = ['Python','JavaScript','React','Node.js','Java','C++','SQL','MongoDB','AWS','Docker','Kubernetes','System Design','DSA','Machine Learning','Git','REST APIs','GraphQL','TypeScript','Go','Redis','Spring Boot','FastAPI','PostgreSQL','Linux','Data Structures'];
const YEARS = ['1st Year','2nd Year','3rd Year','4th Year','Final Year'];
const BRANCHES = ['CSE','IT','ECE','EE','ME','Civil','Chemical','Biotechnology'];

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', college: user?.profile?.college || '',
    branch: user?.profile?.branch || '', year: user?.profile?.year || '',
    cgpa: user?.profile?.cgpa || '', targetRole: user?.profile?.targetRole || '',
    linkedinUrl: user?.profile?.linkedinUrl || '', githubUrl: user?.profile?.githubUrl || '',
    skills: user?.profile?.skills || [], targetCompanies: user?.profile?.targetCompanies || [],
    experience: user?.profile?.experience || '',
  });
  const [saving, setSaving] = useState(false);
  const [companyInput, setCompanyInput] = useState('');
  const [tab, setTab] = useState('profile');

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const toggleSkill = s => setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s] }));
  const addCompany = e => {
    if (e.key === 'Enter' && companyInput.trim()) {
      setForm(f => ({ ...f, targetCompanies: [...new Set([...f.targetCompanies, companyInput.trim()])] }));
      setCompanyInput('');
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/profile`, form);
      setUser(u => ({ ...u, name: form.name, profile: { ...u?.profile, ...form } }));
      toast.success('Profile saved!');
    } catch (e) { toast.error(e.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
  const score = user?.placementScore || 0;
  const completionFields = [form.name, form.college, form.branch, form.cgpa, form.targetRole, form.skills.length > 0, form.targetCompanies.length > 0];
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  return (
    <div style={{ padding:'28px 32px', maxWidth:900 }}>
      {/* Header */}
      <div style={{ display:'flex', gap:20, marginBottom:24, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ position:'relative' }}>
          <div style={{ width:78, height:78, borderRadius:'50%', background:'var(--gradient)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, fontWeight:800, color:'#fff', fontFamily:'Outfit', boxShadow:'0 0 0 3px var(--bg), 0 0 0 5px var(--accent)40' }}>{initials}</div>
          <div style={{ position:'absolute', bottom:2, right:2, width:16, height:16, borderRadius:'50%', background:'var(--green)', border:'2px solid var(--bg)' }} />
        </div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontFamily:'Outfit', fontSize:26, fontWeight:800, letterSpacing:'-0.03em', marginBottom:4 }}>{user?.name || 'Student'}</h1>
          <p style={{ color:'var(--text2)', fontSize:14 }}>{user?.profile?.branch || 'Engineering'} @ {user?.profile?.college || 'College'} · {user?.profile?.year}</p>
          <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
            {score > 0 && <span className="badge badge-accent">Score: {score}</span>}
            <span className={`badge badge-${completion >= 80 ? 'green' : completion >= 50 ? 'amber' : 'red'}`}>Profile {completion}% complete</span>
            {user?.streak > 0 && <span className="badge badge-amber">🔥 {user.streak} day streak</span>}
          </div>
        </div>
        <button onClick={save} disabled={saving} className="btn btn-primary" style={{ alignSelf:'flex-start' }}>
          {saving ? <><div className="spinner" />Saving...</> : '💾 Save Profile'}
        </button>
      </div>

      {/* Completion bar */}
      <div className="card" style={{ marginBottom:20, padding:'16px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontSize:13, fontWeight:500 }}>Profile Completion</span>
          <span style={{ fontSize:13, fontFamily:'JetBrains Mono', color: completion >= 80 ? 'var(--green)' : 'var(--amber)' }}>{completion}%</span>
        </div>
        <div className="progress-bar" style={{ height:6 }}>
          <div className="progress-fill" style={{ width:`${completion}%`, background: completion >= 80 ? 'var(--green)' : completion >= 50 ? 'var(--amber)' : 'var(--red)', height:'100%' }} />
        </div>
        {completion < 100 && <div style={{ fontSize:12, color:'var(--text3)', marginTop:6 }}>Complete your profile for better AI agent results</div>}
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom:20 }}>
        {['profile','skills','targets'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform:'capitalize' }}>
            {t === 'profile' ? '👤 Basic Info' : t === 'skills' ? '⚡ Skills' : '🎯 Targets'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card" style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div><label>Full Name</label><input name="name" value={form.name} onChange={handle} placeholder="Your full name" /></div>
            <div><label>College / University</label><input name="college" value={form.college} onChange={handle} placeholder="NIT Jalandhar" /></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
            <div>
              <label>Branch</label>
              <select name="branch" value={form.branch} onChange={handle}>
                <option value="">Select branch</option>
                {BRANCHES.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label>Year</label>
              <select name="year" value={form.year} onChange={handle}>
                <option value="">Select year</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div><label>CGPA</label><input name="cgpa" type="number" step="0.1" min="0" max="10" value={form.cgpa} onChange={handle} placeholder="8.5" /></div>
          </div>
          <div><label>Target Role</label><input name="targetRole" value={form.targetRole} onChange={handle} placeholder="Software Engineer, Data Analyst, etc." /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div><label>LinkedIn URL</label><input name="linkedinUrl" value={form.linkedinUrl} onChange={handle} placeholder="https://linkedin.com/in/..." /></div>
            <div><label>GitHub URL</label><input name="githubUrl" value={form.githubUrl} onChange={handle} placeholder="https://github.com/..." /></div>
          </div>
          <div>
            <label>Experience / Projects Summary</label>
            <textarea name="experience" value={form.experience} onChange={handle} placeholder="Brief description of your projects, internships, or relevant experience..." style={{ height:100, resize:'vertical' }} />
          </div>
        </div>
      )}

      {tab === 'skills' && (
        <div className="card">
          <div style={{ marginBottom:16 }}>
            <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700, marginBottom:4 }}>Select Your Skills</div>
            <div style={{ fontSize:13, color:'var(--text3)' }}>{form.skills.length} skills selected · Click to toggle</div>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {SKILLS_LIST.map(s => {
              const sel = form.skills.includes(s);
              return (
                <button key={s} onClick={() => toggleSkill(s)} style={{
                  padding:'8px 16px', borderRadius:10, border:`1px solid ${sel ? 'var(--accent)' : 'var(--border2)'}`,
                  background: sel ? 'var(--accent-dim)' : 'transparent', color: sel ? 'var(--accent2)' : 'var(--text2)',
                  cursor:'pointer', fontFamily:'Inter', fontSize:13, fontWeight: sel ? 600 : 400, transition:'all 0.15s'
                }}>{sel ? '✓ ' : ''}{s}</button>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'targets' && (
        <div className="card" style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label>Target Companies (press Enter to add)</label>
            <input value={companyInput} onChange={e => setCompanyInput(e.target.value)} onKeyDown={addCompany} placeholder="Type company name and press Enter..." />
          </div>
          {form.targetCompanies.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {form.targetCompanies.map((c, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 14px', background:'var(--accent-dim)', border:'1px solid var(--accent)30', borderRadius:10 }}>
                  <span style={{ fontSize:13, color:'var(--accent2)', fontWeight:500 }}>🏢 {c}</span>
                  <button onClick={() => setForm(f => ({ ...f, targetCompanies: f.targetCompanies.filter(x => x !== c) }))}
                    style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:14, lineHeight:1, padding:0 }}>×</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ padding:'14px 16px', background:'var(--bg2)', borderRadius:12, border:'1px solid var(--border)' }}>
            <div style={{ fontSize:12, color:'var(--text3)', marginBottom:8 }}>Quick Add Popular Companies</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {['Google','Microsoft','Amazon','Flipkart','Zomato','Swiggy','Razorpay','Atlassian','Adobe','Uber'].map(c => (
                !form.targetCompanies.includes(c) && (
                  <button key={c} onClick={() => setForm(f => ({ ...f, targetCompanies: [...new Set([...f.targetCompanies, c])] }))}
                    style={{ padding:'5px 12px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:8, color:'var(--text3)', cursor:'pointer', fontSize:12, fontFamily:'Inter', transition:'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.color='var(--text3)'; }}>
                    + {c}
                  </button>
                )
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
