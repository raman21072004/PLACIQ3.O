import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '/api';

function ScoreGauge({ score }) {
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--red)';
  const r = 54; const circ = 2 * Math.PI * r; const offset = circ - (score / 100) * circ;
  return (
    <div style={{ position:'relative', width:130, height:130, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform:'rotate(-90deg)', position:'absolute' }}>
        <circle cx="65" cy="65" r={r} fill="none" stroke="var(--surface3)" strokeWidth="10" />
        <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} style={{ transition:'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
        <div style={{ fontSize:32, fontWeight:800, fontFamily:'Outfit', color, lineHeight:1 }}>{score}</div>
        <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>ATS Score</div>
      </div>
    </div>
  );
}

export default function Resume() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [targetRole, setTargetRole] = useState(user?.profile?.targetRole || 'Software Engineer');
  const [pasteText, setPasteText] = useState('');
  const [tab, setTab] = useState('upload');
  const fileRef = useRef();

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const analyze = async () => {
    if (tab === 'upload' && !file) return toast.error('Please upload a resume file');
    if (tab === 'paste' && !pasteText.trim()) return toast.error('Please paste your resume text');
    setLoading(true);
    try {
      let res;
      if (tab === 'upload') {
        const fd = new FormData();
        fd.append('resume', file);
        fd.append('targetRole', targetRole);
        res = await axios.post(`${API}/agent/resume-upload`, fd, { headers: { 'Content-Type':'multipart/form-data' } });
        const analysis = res.data.analysis || {};
        console.log('Resume analysis:', analysis);
        setResult(analysis);
        const score = analysis.atsScore || 0;
        toast.success(`Resume analyzed! ATS: ${score}/100`);
      } else {
        const { data } = await axios.post(`${API}/agent/analyze`, {
          agentType: 'resume', data: { resumeText: pasteText, role: targetRole }
        });
        const result = data.result || {};
        console.log('Resume analysis:', result);
        setResult(result);
        const score = result.atsScore || 0;
        toast.success(`Resume analyzed! ATS: ${score}/100`);
      }
    } catch (e) {
      console.error('Analysis error:', e);
      toast.error(e.response?.data?.error || 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  const priorityColor = p => p === 'high' ? 'var(--red)' : p === 'medium' ? 'var(--amber)' : 'var(--cyan)';
  const hasData = (arr) => Array.isArray(arr) && arr.length > 0;
  const hasContent = (text) => text && typeof text === 'string' && text.trim().length > 0;

  return (
    <div style={{ padding:'28px 32px', maxWidth:1000 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Resume AI Analyzer</h1>
          <p className="page-subtitle">Upload your resume — Claude AI scores ATS compatibility, finds gaps, and rewrites your bullets.</p>
        </div>
        {result && <span className="badge badge-green" style={{ alignSelf:'flex-start' }}>✓ Analysis Complete</span>}
      </div>

      {/* Upload Section */}
      <div style={{ marginBottom:24 }}>
        <div style={{ marginBottom:16 }}>
          <div className="tab-bar">
            {['upload', 'paste'].map(t => (
              <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform:'capitalize' }}>
                {t === 'upload' ? '📎 Upload File' : '📝 Paste Text'}
              </button>
            ))}
          </div>
        </div>

        {tab === 'upload' ? (
          <div className={`upload-zone ${dragging ? 'drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display:'none' }} onChange={e => setFile(e.target.files[0])} />
            {file ? (
              <div>
                <div style={{ fontSize:32, marginBottom:8 }}>📄</div>
                <div style={{ fontWeight:600, marginBottom:4 }}>{file.name}</div>
                <div style={{ fontSize:13, color:'var(--text3)' }}>{(file.size / 1024).toFixed(1)} KB · Click to change</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize:40, marginBottom:12 }}>📤</div>
                <div style={{ fontFamily:'Outfit', fontSize:17, fontWeight:600, marginBottom:6 }}>Drop your resume here</div>
                <div style={{ fontSize:13, color:'var(--text3)', marginBottom:4 }}>PDF, DOC, DOCX, or TXT · Max 5MB</div>
                <div style={{ fontSize:12, color:'var(--accent2)' }}>or click to browse</div>
              </div>
            )}
          </div>
        ) : (
          <textarea value={pasteText} onChange={e => setPasteText(e.target.value)}
            placeholder="Paste your resume text here... Include your experience, skills, education, and projects."
            style={{ height:200, resize:'vertical', fontFamily:'JetBrains Mono', fontSize:12, lineHeight:1.6, borderRadius:14 }} />
        )}

        <div style={{ display:'flex', gap:12, marginTop:14, alignItems:'flex-end' }}>
          <div style={{ flex:1 }}>
            <label>Target Role</label>
            <input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Software Engineer, Data Analyst" />
          </div>
          <button onClick={analyze} disabled={loading} className="btn btn-primary" style={{ padding:'13px 28px', fontSize:14 }}>
            {loading ? <><div className="spinner" /> Analyzing with Claude AI...</> : '🔍 Analyze Resume'}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div style={{ animation:'fadeInUp 0.4s ease' }}>
          {/* Score header */}
          <div style={{ display:'flex', gap:20, padding:'24px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:18, marginBottom:20, flexWrap:'wrap' }}>
            <ScoreGauge score={result.atsScore || 0} />
            <div style={{ flex:1, minWidth:240 }}>
              <div style={{ fontFamily:'Outfit', fontSize:20, fontWeight:700, marginBottom:6 }}>{result.overallVerdict || 'Analysis Complete'}</div>
              {result.optimizedSummary && (
                <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7, padding:'12px 16px', background:'var(--bg2)', borderRadius:10, border:'1px solid var(--border)', marginBottom:12 }}>
                  <span style={{ fontSize:11, color:'var(--accent2)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:6 }}>✨ AI-Optimized Summary</span>
                  {result.optimizedSummary}
                </div>
              )}
              {/* Section scores */}
              {result.sectionScores && (
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {Object.entries(result.sectionScores).map(([k, v]) => (
                    <div key={k} style={{ padding:'6px 12px', background:'var(--bg3)', borderRadius:8, border:'1px solid var(--border)' }}>
                      <div style={{ fontSize:10, color:'var(--text3)', textTransform:'capitalize', marginBottom:3 }}>{k}</div>
                      <div style={{ fontSize:16, fontWeight:700, fontFamily:'Outfit', color: v>=75?'var(--green)':v>=55?'var(--amber)':'var(--red)' }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Strong Points */}
          {hasData(result.strongPoints) && (
            <div style={{ padding:'20px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <span style={{ fontSize:16 }}>💪</span>
                <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700 }}>Strong Points</div>
              </div>
              <div style={{ display:'grid', gap:10 }}>
                {result.strongPoints.map((point, i) => (
                  <div key={i} style={{ padding:'12px', background:'var(--bg2)', borderRadius:10, border:'1px solid var(--green)20', borderLeft:`3px solid var(--green)` }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--green)', marginBottom:4 }}>✓ {point.point}</div>
                    <div style={{ fontSize:12, color:'var(--text2)', marginBottom:3 }}>{point.why_strong}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', fontStyle:'italic' }}>→ Impact: {point.impact}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weak Points */}
          {hasData(result.weakPoints) && (
            <div style={{ padding:'20px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <span style={{ fontSize:16 }}>⚠️</span>
                <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700 }}>Weak Points</div>
              </div>
              <div style={{ display:'grid', gap:10 }}>
                {result.weakPoints.map((weak, i) => (
                  <div key={i} style={{ padding:'12px', background:'var(--bg2)', borderRadius:10, border:`1px solid ${priorityColor(weak.severity)}20`, borderLeft:`3px solid ${priorityColor(weak.severity)}` }}>
                    <div style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:4 }}>
                      <span className="badge" style={{ background:`${priorityColor(weak.severity)}15`, color:priorityColor(weak.severity), border:`1px solid ${priorityColor(weak.severity)}30`, flexShrink:0, padding:'3px 8px', fontSize:11 }}>{weak.severity}</span>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{weak.issue}</div>
                    </div>
                    <div style={{ fontSize:12, color:'var(--text2)' }}>💡 {weak.impact}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            {/* Improvements */}
            {hasData(result.improvements) && (
              <div style={{ padding:'20px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                  <span style={{ fontSize:16 }}>🔧</span>
                  <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700 }}>Improvements</div>
                </div>
                {result.improvements.map((imp, i) => (
                  <div key={i} style={{ padding:'12px', background:'var(--bg2)', borderRadius:10, border:`1px solid ${priorityColor(imp.priority)}20`, marginBottom:8 }}>
                    <div style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:6 }}>
                      <span className="badge" style={{ background:`${priorityColor(imp.priority)}15`, color:priorityColor(imp.priority), border:`1px solid ${priorityColor(imp.priority)}30`, flexShrink:0 }}>{imp.priority}</span>
                      <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{imp.issue}</div>
                    </div>
                    <div style={{ fontSize:12, color:'var(--text2)', paddingLeft:4 }}>→ {imp.fix}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Keywords */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {hasData(result.keywordsToAdd) && (
                <div style={{ padding:'20px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                    <span style={{ fontSize:16 }}>🏷️</span>
                    <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700 }}>Keywords to Add</div>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {result.keywordsToAdd.map((kw, i) => (
                      <span key={i} style={{ padding:'5px 12px', background:'var(--red-dim)', border:'1px solid var(--red)30', borderRadius:20, fontSize:12, color:'var(--red)', fontWeight:500 }}>+ {kw}</span>
                    ))}
                  </div>
                </div>
              )}
              {hasData(result.keywordsFound) && (
                <div style={{ padding:'20px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                    <span style={{ fontSize:16 }}>✅</span>
                    <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700 }}>Keywords Found</div>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {result.keywordsFound.map((kw, i) => (
                      <span key={i} style={{ padding:'5px 12px', background:'var(--green-dim)', border:'1px solid var(--green)30', borderRadius:20, fontSize:12, color:'var(--green)', fontWeight:500 }}>✓ {kw}</span>
                    ))}
                  </div>
                </div>
              )}
              {hasData(result.quickWins) && (
                <div style={{ padding:'20px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                    <span style={{ fontSize:16 }}>⚡</span>
                    <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700 }}>Quick Wins</div>
                  </div>
                  {result.quickWins.map((w, i) => (
                    <div key={i} className="result-item">{w}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* What to Learn */}
          {hasData(result.whatToLearn) && (
            <div style={{ padding:'20px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <span style={{ fontSize:16 }}>📚</span>
                <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700 }}>What to Learn</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:12 }}>
                {result.whatToLearn.map((item, i) => (
                  <div key={i} style={{ padding:'12px', background:'var(--bg2)', borderRadius:10, border:'1px solid var(--border)' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--accent)', marginBottom:4 }}>📖 {item.skill}</div>
                    <div style={{ fontSize:12, color:'var(--text2)', marginBottom:6 }}>{item.reason}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', display:'flex', gap:6, alignItems:'center' }}>
                      <span style={{ width:4, height:4, borderRadius:'50%', background:'var(--text3)' }}></span>
                      Level: <strong>{item.proficiency}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How to Learn */}
          {hasData(result.howToLearn) && (
            <div style={{ padding:'20px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <span style={{ fontSize:16 }}>🎯</span>
                <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700 }}>How to Learn</div>
              </div>
              <div style={{ display:'grid', gap:12 }}>
                {result.howToLearn.map((method, i) => (
                  <div key={i} style={{ padding:'12px', background:'var(--bg2)', borderRadius:10, border:'1px solid var(--border)' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--accent)', marginBottom:4 }}>{method.method}</div>
                    <div style={{ fontSize:12, color:'var(--text2)', marginBottom:6 }}>{method.description}</div>
                    <div style={{ display:'flex', gap:12, fontSize:11, color:'var(--text3)' }}>
                      <span>⏱️ {method.time_commitment}</span>
                      <span>🎯 {method.effectiveness} effectiveness</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Where to Learn */}
          {hasData(result.whereToLearn) && (
            <div style={{ padding:'20px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <span style={{ fontSize:16 }}>🌐</span>
                <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700 }}>Where to Learn</div>
              </div>
              <div style={{ display:'grid', gap:12 }}>
                {result.whereToLearn.map((platform, i) => (
                  <div key={i} style={{ padding:'12px', background:'var(--bg2)', borderRadius:10, border:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--accent)' }}>{platform.platform}</div>
                      <span className="badge" style={{ background:`${platform.cost==='free'?'var(--green)':'var(--amber)'}15`, color:platform.cost==='free'?'var(--green)':'var(--amber)', border:`1px solid ${platform.cost==='free'?'var(--green)':'var(--amber)'}30`, fontSize:11 }}>{platform.cost}</span>
                      <span className="badge" style={{ background:'var(--accent)15', color:'var(--accent)', border:'1px solid var(--accent)30', fontSize:11 }}>⭐ {platform.quality}</span>
                    </div>
                    {hasData(platform.courses) && (
                      <div style={{ fontSize:12, color:'var(--text2)' }}>
                        {platform.courses.map((course, j) => (
                          <div key={j}>• {course}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Roadmap */}
          {hasData(result.learningRoadmap) && (
            <div style={{ padding:'20px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <span style={{ fontSize:16 }}>🗺️</span>
                <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700 }}>Learning Roadmap</div>
              </div>
              <div style={{ display:'grid', gap:12 }}>
                {result.learningRoadmap.map((phase, i) => (
                  <div key={i} style={{ padding:'14px', background:'var(--bg2)', borderRadius:10, border:`1px solid ${'var(--accent)'}20`, borderLeft:`3px solid var(--accent)` }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--accent)', marginBottom:8 }}>{phase.phase}</div>
                    <div style={{ fontSize:12, color:'var(--text2)', marginBottom:8 }}>
                      <strong>Focus:</strong> {phase.focus}
                    </div>
                    {hasData(phase.goals) && (
                      <div style={{ fontSize:12, color:'var(--text2)', marginBottom:8 }}>
                        <strong>Goals:</strong>
                        {phase.goals.map((goal, j) => (
                          <div key={j} style={{ marginLeft:12 }}>• {goal}</div>
                        ))}
                      </div>
                    )}
                    <div style={{ fontSize:11, color:'var(--text3)', display:'flex', gap:12 }}>
                      <span>⏱️ {phase.estimatedTime}</span>
                      {hasData(phase.resources) && (
                        <span>📚 {phase.resources.length} resources</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!result && !loading && (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text3)' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📋</div>
          <div style={{ fontFamily:'Outfit', fontSize:18, fontWeight:600, marginBottom:8, color:'var(--text2)' }}>Upload your resume to get started</div>
          <div style={{ fontSize:14 }}>Claude AI will score your resume, find ATS keyword gaps, and suggest rewritten bullet points.</div>
        </div>
      )}
    </div>
  );
}
