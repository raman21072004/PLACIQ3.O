import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '/api';

const AGENTS = [
  { id:'profile',   icon:'🧠', label:'Profile Analyzer',    desc:'Analyzes resume, skills, goals. Outputs readiness score, strengths & gaps.',        color:'#5b5ef4', bg:'rgba(91,94,244,0.1)' },
  { id:'market',    icon:'📡', label:'Market Intelligence', desc:'Real-time job market trends, top companies hiring, salary benchmarks 2025.',         color:'#00d4e8', bg:'rgba(0,212,232,0.1)' },
  { id:'strategy',  icon:'🗺️', label:'Strategy Engine',     desc:'Personalized week-by-week roadmap with milestones tailored to your profile.',        color:'#a855f7', bg:'rgba(168,85,247,0.1)' },
  { id:'interview', icon:'🎯', label:'Interview Coach',     desc:'Company-specific questions, mock scenarios, behavioral prep and feedback.',            color:'#00e87a', bg:'rgba(0,232,122,0.1)' },
  { id:'resume',    icon:'📄', label:'Resume Optimizer',    desc:'ATS scoring, keyword gaps, bullet rewrites. Upload resume for deep analysis.',        color:'#ffb547', bg:'rgba(255,181,71,0.1)' },
];

const S = { idle:'idle', running:'running', done:'done', error:'error' };

function ScoreRing({ score, size=80, color='var(--accent)' }) {
  const r = (size - 12) / 2; const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="score-ring-container" style={{ width:size, height:size }}>
      <svg className="score-ring-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className="score-ring-track" cx={size/2} cy={size/2} r={r} />
        <circle className="score-ring-fill" cx={size/2} cy={size/2} r={r} stroke={color}
          style={{ strokeDasharray: circ, strokeDashoffset: offset }} />
      </svg>
      <div className="score-ring-text">
        <div style={{ fontSize: size > 60 ? 18 : 13, fontWeight:700, fontFamily:'Outfit', color }}>{score}</div>
        <div style={{ fontSize:9, color:'var(--text3)' }}>/ 100</div>
      </div>
    </div>
  );
}

function ResultPanel({ agent, result }) {
  if (!result) return null;
  const d = typeof result === 'string' ? { raw: result } : result;
  const renderList = (arr, color) => Array.isArray(arr) ? arr.map((item, i) => (
    <div key={i} className="result-item">{typeof item === 'object' ? JSON.stringify(item) : String(item)}</div>
  )) : <span style={{ fontSize:13, color:'var(--text2)' }}>{String(arr)}</span>;

  return (
    <div style={{ marginTop:20, padding:'24px', background:'var(--surface)', border:`1px solid ${agent.color}20`, borderRadius:18, animation:'fadeInUp 0.4s ease' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ width:36, height:36, borderRadius:9, background:agent.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{agent.icon}</div>
        <div>
          <div style={{ fontFamily:'Outfit', fontSize:17, fontWeight:700 }}>{agent.label} — Results</div>
          <div style={{ fontSize:12, color:'var(--text3)' }}>Powered by Claude AI</div>
        </div>
        <span className="badge badge-green" style={{ marginLeft:'auto' }}>✓ Analysis Complete</span>
      </div>

      {/* Score displays */}
      {(d.readinessScore !== undefined || d.atsScore !== undefined || d.placementChance !== undefined) && (
        <div style={{ display:'flex', gap:14, marginBottom:20, flexWrap:'wrap' }}>
          {d.readinessScore !== undefined && (
            <div style={{ display:'flex', gap:16, padding:'16px 20px', background:'var(--bg2)', borderRadius:12, border:'1px solid var(--border)', alignItems:'center', flex:1 }}>
              <ScoreRing score={d.readinessScore} color={d.readinessScore>=70?'var(--green)':'var(--amber)'} />
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--accent2)', marginBottom:4 }}>{d.readinessLevel || 'Intermediate'}</div>
                <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6, maxWidth:320 }}>{d.summary || ''}</p>
              </div>
            </div>
          )}
          {d.atsScore !== undefined && (
            <div style={{ padding:'16px 20px', background:'var(--bg2)', borderRadius:12, border:'1px solid var(--border)', display:'flex', gap:16, alignItems:'center', flex:1 }}>
              <ScoreRing score={d.atsScore} color={d.atsScore>=75?'var(--green)':'var(--amber)'} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>ATS Score</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>{d.overallVerdict || ''}</div>
              </div>
            </div>
          )}
          {d.placementChance !== undefined && (
            <div style={{ padding:'16px 20px', background:'var(--bg2)', borderRadius:12, border:'1px solid var(--border)', display:'flex', gap:16, alignItems:'center', minWidth:140 }}>
              <ScoreRing score={d.placementChance} color='var(--cyan)' />
              <div><div style={{ fontSize:14, fontWeight:600 }}>Placement Chance</div></div>
            </div>
          )}
        </div>
      )}

      {/* Hotskills */}
      {d.hotSkills && (
        <div className="result-section">
          <div className="result-label">🔥 Hot Skills 2025</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {d.hotSkills.map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:8 }}>
                <span style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{typeof s === 'object' ? s.skill : s}</span>
                {typeof s === 'object' && s.demand && <span style={{ fontSize:11, color:'var(--cyan)', fontFamily:'JetBrains Mono' }}>{s.demand}%</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phases */}
      {d.phases && (
        <div className="result-section">
          <div className="result-label">📅 Preparation Phases</div>
          {d.phases.map((p, i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom: i < d.phases.length-1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width:52, height:52, borderRadius:10, background:`hsl(${i*60+220},70%,55%)20`, border:`1px solid hsl(${i*60+220},70%,55%)30`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <div style={{ fontFamily:'Outfit', fontWeight:800, fontSize:13, color:`hsl(${i*60+220},80%,65%)` }}>{p.week}</div>
                <div style={{ fontSize:9, color:'var(--text3)' }}>wk</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>{p.focus}</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>{p.tasks?.slice(0,3).join(' · ')}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generic key-value sections */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:12 }}>
        {Object.entries(d).filter(([k]) => !['readinessScore','readinessLevel','summary','atsScore','overallVerdict','raw','placementChance','hotSkills','phases'].includes(k)).map(([key, val]) => (
          <div key={key} className="result-section" style={{ marginBottom:0 }}>
            <div className="result-label">{key.replace(/([A-Z])/g,' $1').trim()}</div>
            {Array.isArray(val) ? renderList(val) : typeof val === 'object' && val !== null ? (
              <div style={{ fontSize:12, color:'var(--text2)', fontFamily:'JetBrains Mono', whiteSpace:'pre-wrap' }}>{JSON.stringify(val, null, 2)}</div>
            ) : <span style={{ fontSize:13, color:'var(--text)' }}>{String(val)}</span>}
          </div>
        ))}
        {d.raw && <div className="result-section" style={{ marginBottom:0 }}><p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7, whiteSpace:'pre-wrap', fontFamily:'JetBrains Mono' }}>{d.raw}</p></div>}
      </div>
    </div>
  );
}

export default function Agents() {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState({});
  const [results, setResults] = useState({});
  const [selected, setSelected] = useState(null);
  const [running, setRunning] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([{ role:'assistant', content:'👋 Hi! I\'m PlaCIQ AI, powered by Claude (Anthropic). Ask me anything about placements, DSA, system design, resume tips, or career strategy. I give personalized, actionable advice.' }]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const profile = {
    skills: user?.profile?.skills || ['Python', 'React', 'Node.js', 'SQL'],
    role: user?.profile?.targetRole || 'Software Engineer',
    companies: user?.profile?.targetCompanies || ['Google', 'Microsoft', 'Flipkart'],
    cgpa: user?.profile?.cgpa || 8.0,
    branch: user?.profile?.branch || 'CSE',
    year: user?.profile?.year || '3rd Year',
    college: user?.profile?.college || 'Engineering College',
    resumeText: user?.profile?.resumeText || '',
  };

  const runAgent = async agentId => {
    setStatuses(s => ({ ...s, [agentId]: S.running }));
    setSelected(agentId);
    try {
      const { data } = await axios.post(`${API}/agent/analyze`, { agentType: agentId, data: profile });
      setResults(r => ({ ...r, [agentId]: data.result }));
      setStatuses(s => ({ ...s, [agentId]: S.done }));
      toast.success(`${AGENTS.find(a => a.id === agentId)?.label} complete!`);
    } catch (e) {
      setStatuses(s => ({ ...s, [agentId]: S.error }));
      toast.error(`Agent failed: ${e.response?.data?.error || e.message}`);
    }
  };

  const runAll = async () => {
    setRunning(true);
    for (const a of AGENTS) { await runAgent(a.id); await new Promise(r => setTimeout(r, 600)); }
    setRunning(false);
    toast.success('🎉 All 5 agents complete! Your placement blueprint is ready.');
  };

  const sendChat = async e => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput; setChatInput('');
    const newMessages = [...messages, { role:'user', content:msg }];
    setMessages(newMessages); setChatLoading(true);
    try {
      const history = newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
      const { data } = await axios.post(`${API}/agent/chat`, { message: msg, context: { profile }, history });
      setMessages(m => [...m, { role:'assistant', content: data.response, model: data.model }]);
    } catch (e) {
      setMessages(m => [...m, { role:'assistant', content:'Sorry, AI is temporarily unavailable. Please check API key configuration.' }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior:'smooth' }), 100);
    }
  };

  const allDone = AGENTS.every(a => statuses[a.id] === S.done);

  const QUICK_PROMPTS = ['How do I crack Google interviews?', 'Review my DSA prep strategy', 'What companies should I target?', 'How to improve my resume?'];

  return (
    <div style={{ padding:'28px 32px', maxWidth:1200 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <span className="status-online"><span className="dot-green" style={{ animation:'pulse 2s infinite' }} />Claude AI Active</span>
          </div>
          <h1 className="page-title">AI Agent Orchestrator</h1>
          <p className="page-subtitle">5 specialized agents. One unified placement intelligence system.</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => setChatOpen(!chatOpen)} className={`btn ${chatOpen ? 'btn-primary' : 'btn-ghost'}`}>
            💬 {chatOpen ? 'Hide Chat' : 'Ask Claude AI'}
          </button>
          <button onClick={runAll} disabled={running} className="btn btn-primary">
            {running ? <><div className="spinner" /> Running agents...</> : '▶ Run All 5 Agents'}
          </button>
        </div>
      </div>

      {/* Pipeline Visualizer */}
      <div style={{ display:'flex', alignItems:'center', gap:0, padding:'18px 24px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, marginBottom:24, overflowX:'auto' }}>
        {AGENTS.map((a, i) => {
          const st = statuses[a.id];
          return (
            <React.Fragment key={a.id}>
              <div className="agent-node" onClick={() => runAgent(a.id)} style={{ opacity: running && st !== S.running ? 0.5 : 1 }}>
                <div className="agent-circle" style={{
                  background: st === S.done ? a.color : st === S.running ? `${a.color}30` : 'var(--surface2)',
                  borderColor: st ? a.color : 'var(--border2)',
                  boxShadow: st === S.running ? `0 0 16px ${a.color}60` : st === S.done ? `0 0 12px ${a.color}40` : 'none',
                }}>
                  {st === S.running ? <div className="spinner" style={{ borderTopColor: a.color, borderColor: `${a.color}40` }} />
                    : <span style={{ color: st === S.done ? '#fff' : a.color, fontSize:18 }}>{a.icon}</span>}
                </div>
                <span style={{ fontSize:10, color: st === S.done ? a.color : 'var(--text3)', fontWeight:500, textAlign:'center', whiteSpace:'nowrap', maxWidth:60 }}>{a.label.split(' ')[0]}</span>
              </div>
              {i < AGENTS.length - 1 && (
                <div style={{ flex:1, height:2, background: (statuses[AGENTS[i+1].id]) ? `linear-gradient(90deg, ${a.color}, ${AGENTS[i+1].color})` : 'var(--border2)', minWidth:28, transition:'background 0.5s' }}>
                  <div style={{ float:'right', width:0, height:0, borderLeft:`7px solid ${statuses[AGENTS[i+1].id] ? AGENTS[i+1].color : 'var(--border2)'}`, borderTop:'4px solid transparent', borderBottom:'4px solid transparent', marginTop:-3 }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
        {allDone && (
          <div style={{ marginLeft:16, flexShrink:0, display:'flex', alignItems:'center', gap:8, background:'var(--green-dim)', padding:'7px 14px', borderRadius:10, border:'1px solid rgba(0,232,122,0.25)' }}>
            <span className="dot-green" />
            <span style={{ color:'var(--green)', fontSize:12, fontWeight:600, whiteSpace:'nowrap' }}>Blueprint Ready</span>
          </div>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns: chatOpen ? '1fr 380px' : '1fr', gap:20 }}>
        {/* Agent Cards */}
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:14, marginBottom:14 }}>
            {AGENTS.map(agent => {
              const st = statuses[agent.id] || S.idle;
              const isDone = st === S.done; const isRunning = st === S.running;
              return (
                <div key={agent.id} onClick={() => { if (!running) { setSelected(agent.id === selected ? null : agent.id); if (!results[agent.id]) runAgent(agent.id); } }}
                  style={{
                    background: selected === agent.id ? agent.bg : 'var(--surface)',
                    border: `1px solid ${selected === agent.id ? agent.color + '35' : isDone ? agent.color + '20' : 'var(--border)'}`,
                    borderRadius:16, padding:'20px', cursor:'pointer', transition:'all 0.2s', position:'relative', overflow:'hidden',
                    boxShadow: isRunning ? `0 0 0 2px ${agent.color}50` : isDone ? `0 4px 20px ${agent.color}10` : 'none',
                  }}
                  onMouseEnter={e => { if (selected !== agent.id) e.currentTarget.style.borderColor = agent.color + '30'; }}
                  onMouseLeave={e => { if (selected !== agent.id) e.currentTarget.style.borderColor = isDone ? agent.color+'20' : 'var(--border)'; }}>
                  {isRunning && <div style={{ position:'absolute', inset:0, background:`${agent.color}05`, animation:'pulse 2s infinite', pointerEvents:'none' }} />}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                    <div style={{ width:44, height:44, borderRadius:11, background:agent.bg, border:`1px solid ${agent.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:21, flexShrink:0, boxShadow: isRunning ? `0 0 16px ${agent.color}50` : 'none' }}>
                      {isRunning ? <div className="spinner" style={{ borderTopColor:agent.color, borderColor:`${agent.color}40` }} /> : agent.icon}
                    </div>
                    <div>
                      {isDone && <span className="badge badge-green">✓ Done</span>}
                      {isRunning && <span className="badge badge-cyan" style={{ animation:'pulse 1.5s infinite' }}>⟳ Running</span>}
                      {st === S.error && <span className="badge badge-red">Error</span>}
                      {st === S.idle && <span style={{ fontSize:11, color:'var(--text3)' }}>Click to run</span>}
                    </div>
                  </div>
                  <h3 style={{ fontSize:15, fontWeight:700, fontFamily:'Outfit', marginBottom:6, color: selected === agent.id ? agent.color : 'var(--text)' }}>{agent.label}</h3>
                  <p style={{ fontSize:12, color:'var(--text3)', lineHeight:1.6 }}>{agent.desc}</p>
                  {isDone && results[agent.id]?.readinessScore !== undefined && (
                    <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:8 }}>
                      <div className="progress-bar" style={{ flex:1 }}><div style={{ height:'100%', background:agent.color, width:`${results[agent.id].readinessScore}%`, borderRadius:2, transition:'width 1s' }} /></div>
                      <span style={{ fontSize:12, fontWeight:700, color:agent.color, fontFamily:'JetBrains Mono' }}>{results[agent.id].readinessScore}</span>
                    </div>
                  )}
                  {isDone && results[agent.id]?.atsScore !== undefined && (
                    <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:8 }}>
                      <div className="progress-bar" style={{ flex:1 }}><div style={{ height:'100%', background:agent.color, width:`${results[agent.id].atsScore}%`, borderRadius:2 }} /></div>
                      <span style={{ fontSize:12, fontWeight:700, color:agent.color, fontFamily:'JetBrains Mono' }}>ATS {results[agent.id].atsScore}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selected && results[selected] && <ResultPanel agent={AGENTS.find(a => a.id === selected)} result={results[selected]} />}
        </div>

        {/* Claude AI Chat */}
        {chatOpen && (
          <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 160px)', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:18, overflow:'hidden', position:'sticky', top:20 }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--gradient)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>✦</div>
              <div>
                <div style={{ fontFamily:'Outfit', fontWeight:700, fontSize:15, lineHeight:1 }}>PlaCIQ AI</div>
                <div style={{ fontSize:10, color:'var(--text3)' }}>Powered by Claude (Anthropic)</div>
              </div>
              <span className="status-online" style={{ marginLeft:'auto' }}><span className="dot-green" style={{ animation:'pulse 2s infinite' }} />Online</span>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:12 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display:'flex', flexDirection: m.role==='user' ? 'row-reverse' : 'row', gap:8, animation:'fadeInUp 0.3s ease' }}>
                  {m.role === 'assistant' && (
                    <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--gradient)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, flexShrink:0, fontWeight:700 }}>AI</div>
                  )}
                  <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'} style={{ whiteSpace:'pre-wrap' }}>
                    {m.content}
                    {m.model && <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:4, textAlign:'right' }}>via {m.model}</div>}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--gradient)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>AI</div>
                  <div className="chat-bubble-ai" style={{ display:'flex', gap:4, alignItems:'center' }}>
                    {[0,0.2,0.4].map((d,i) => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--text3)', animation:`typing 1s ease-in-out ${d}s infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding:'12px 14px', borderTop:'1px solid var(--border)', background:'var(--bg2)' }}>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                {QUICK_PROMPTS.map(q => (
                  <button key={q} onClick={() => setChatInput(q)} style={{ fontSize:10, padding:'4px 10px', background:'var(--surface3)', border:'1px solid var(--border2)', borderRadius:20, color:'var(--text3)', cursor:'pointer', fontFamily:'Inter', transition:'all 0.15s', whiteSpace:'nowrap' }}
                    onMouseEnter={e => { e.currentTarget.style.background='var(--accent-dim)'; e.currentTarget.style.color='var(--accent2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='var(--surface3)'; e.currentTarget.style.color='var(--text3)'; }}>
                    {q}
                  </button>
                ))}
              </div>
              <form onSubmit={sendChat} style={{ display:'flex', gap:8 }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask PlaCIQ AI anything..." style={{ flex:1, fontSize:13, padding:'10px 14px', borderRadius:12 }} />
                <button type="submit" disabled={chatLoading || !chatInput.trim()} className="btn btn-primary btn-icon" style={{ borderRadius:12, padding:'10px 16px' }}>↑</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
