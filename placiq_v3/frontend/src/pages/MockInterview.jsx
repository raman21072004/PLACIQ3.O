import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '/api';
const ROLES = ['Software Engineer','Full Stack Developer','Backend Engineer','Data Engineer','ML Engineer','DevOps Engineer'];
const ROUNDS = ['DSA','System Design','Behavioral','Technical','HR'];
const DIFF_COLOR = { Easy:'var(--green)', Medium:'var(--amber)', Hard:'var(--red)' };

function TimerDisplay({ seconds }) {
  const m = Math.floor(seconds / 60), s = seconds % 60;
  const isWarning = seconds > 600;
  return (
    <div style={{ fontFamily:'JetBrains Mono', fontSize:20, fontWeight:600, color: isWarning ? 'var(--red)' : 'var(--text)', letterSpacing:'0.05em' }}>
      {String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
    </div>
  );
}

export default function MockInterview() {
  const [step, setStep] = useState('setup');
  const [role, setRole] = useState('Software Engineer');
  const [round, setRound] = useState('DSA');
  const [questions, setQuestions] = useState([]);
  const [roundOverview, setRoundOverview] = useState('');
  const [tips, setTips] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState([]);
  const [timer, setTimer] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef();

  useEffect(() => { return () => clearInterval(timerRef.current); }, []);

  const startTimer = () => {
    setTimer(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
  };

  const startInterview = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/agent/mock-interview`, { role, round });
      const q = data.data?.questions || [];
      if (!q.length) return toast.error('No questions generated');
      setQuestions(q); setRoundOverview(data.data?.roundOverview || ''); setTips(data.data?.tips || []);
      setCurrent(0); setScores([]); setFeedback(null); setAnswer(''); setShowHint(false);
      setStep('interview'); startTimer();
      toast.success('Interview started! Good luck 🎯');
    } catch (e) { toast.error('Failed to generate questions. Check API key.'); }
    finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return toast.error('Write your answer first');
    clearInterval(timerRef.current);
    setLoading(true);
    try {
      const q = questions[current];
      const { data } = await axios.post(`${API}/agent/mock-interview`, { role, round, question: q?.q || q, previousAnswer: answer });
      const fb = data.data;
      setFeedback(fb);
      setScores(s => [...s, fb.score || fb.Score || 7]);
    } catch (e) { toast.error('Evaluation failed'); }
    finally { setLoading(false); }
  };

  const nextQuestion = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1); setAnswer(''); setFeedback(null); setShowHint(false); startTimer();
    } else {
      setStep('results');
      clearInterval(timerRef.current);
    }
  };

  const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*10) : 0;
  const scoreColor = avg >= 75 ? 'var(--green)' : avg >= 55 ? 'var(--amber)' : 'var(--red)';

  if (step === 'setup') return (
    <div style={{ padding:'28px 32px', maxWidth:760 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mock Interview</h1>
          <p className="page-subtitle">AI-powered interview simulation with real-time feedback from Claude AI.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700, marginBottom:16 }}>Interview Configuration</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
          <div>
            <label>Target Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label>Interview Round</label>
            <select value={round} onChange={e => setRound(e.target.value)}>
              {ROUNDS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div style={{ padding:'14px 16px', background:'var(--bg2)', borderRadius:12, border:'1px solid var(--border)', marginBottom:20 }}>
          <div style={{ fontSize:12, color:'var(--text3)', marginBottom:6, fontWeight:500 }}>What to expect</div>
          <div style={{ fontSize:13, color:'var(--text2)' }}>5 questions · {round} focus · Real-time AI feedback · Scored 1–10 per answer</div>
        </div>

        <button onClick={startInterview} disabled={loading} className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:15 }}>
          {loading ? <><div className="spinner" /> Generating Questions...</> : '🎯 Start Interview'}
        </button>
      </div>

      {/* Round tips */}
      <div className="card">
        <div style={{ fontFamily:'Outfit', fontSize:15, fontWeight:700, marginBottom:14 }}>💡 Pro Tips for {round}</div>
        {round === 'DSA' && ['Think out loud — explain your approach before coding', 'Start with brute force, then optimize step-by-step', 'Always discuss time & space complexity', 'Ask clarifying questions about edge cases'].map((t,i) => <div key={i} className="result-item">{t}</div>)}
        {round === 'System Design' && ['Clarify requirements and scale before designing', 'Draw diagrams — mention components clearly', 'Discuss trade-offs for every major decision', 'Cover reliability, availability, and scaling strategies'].map((t,i) => <div key={i} className="result-item">{t}</div>)}
        {round === 'Behavioral' && ['Use STAR format: Situation, Task, Action, Result', 'Have 3-5 strong stories ready to adapt', 'Be specific — numbers and outcomes matter', 'Show ownership and learning from failures'].map((t,i) => <div key={i} className="result-item">{t}</div>)}
        {!['DSA','System Design','Behavioral'].includes(round) && ['Be honest about your knowledge boundaries', 'Connect your experience to the role', 'Show enthusiasm for the company and role', 'Ask thoughtful questions at the end'].map((t,i) => <div key={i} className="result-item">{t}</div>)}
      </div>
    </div>
  );

  if (step === 'results') {
    return (
      <div style={{ padding:'28px 32px', maxWidth:760 }}>
        <div className="page-header"><h1 className="page-title">Interview Complete!</h1></div>
        <div className="card" style={{ textAlign:'center', padding:'40px', marginBottom:20 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>{avg >= 75 ? '🏆' : avg >= 55 ? '👍' : '💪'}</div>
          <div style={{ fontFamily:'Outfit', fontSize:60, fontWeight:800, color:scoreColor, lineHeight:1 }}>{avg}</div>
          <div style={{ fontSize:15, color:'var(--text2)', marginTop:6 }}>Average Score / 100</div>
          <div style={{ display:'flex', justifyContent:'center', gap:12, marginTop:20, flexWrap:'wrap' }}>
            {scores.map((s, i) => (
              <div key={i} style={{ padding:'8px 16px', background:`${DIFF_COLOR[questions[i]?.difficulty]||'var(--accent)'}15`, borderRadius:10, border:`1px solid ${DIFF_COLOR[questions[i]?.difficulty]||'var(--accent)'}30` }}>
                <div style={{ fontSize:10, color:'var(--text3)', marginBottom:2 }}>Q{i+1}</div>
                <div style={{ fontSize:18, fontWeight:700, fontFamily:'Outfit', color:DIFF_COLOR[questions[i]?.difficulty]||'var(--accent)' }}>{s*10}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={() => { setStep('setup'); setScores([]); }} className="btn btn-ghost" style={{ flex:1, justifyContent:'center', padding:'13px' }}>↩ New Interview</button>
          <button onClick={() => { setStep('interview'); startTimer(); setCurrent(0); setAnswer(''); setFeedback(null); setScores([]); }} className="btn btn-primary" style={{ flex:1, justifyContent:'center', padding:'13px' }}>🔄 Retry Same Round</button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div style={{ padding:'28px 32px', maxWidth:860 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="page-title" style={{ fontSize:22 }}>Mock Interview — {role}</h1>
          <div style={{ fontSize:13, color:'var(--text2)' }}>{round} Round · Question {current+1} of {questions.length}</div>
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <div style={{ padding:'10px 16px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:13, color:'var(--text3)' }}>⏱</span>
            <TimerDisplay seconds={timer} />
          </div>
          {scores.length > 0 && (
            <div style={{ padding:'10px 16px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, textAlign:'center' }}>
              <div style={{ fontSize:10, color:'var(--text3)' }}>Avg Score</div>
              <div style={{ fontSize:16, fontWeight:700, fontFamily:'Outfit', color:scoreColor }}>{Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*10)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div style={{ display:'flex', gap:4, marginBottom:20 }}>
        {questions.map((_, i) => (
          <div key={i} style={{ flex:1, height:4, borderRadius:2, background: i < current ? 'var(--green)' : i === current ? 'var(--accent)' : 'var(--surface2)', transition:'background 0.3s' }} />
        ))}
      </div>

      {/* Question */}
      <div className="card" style={{ marginBottom:16, border:`1px solid ${DIFF_COLOR[q?.difficulty]||'var(--border)'}20` }}>
        <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
          <span className="badge badge-accent">{q?.topic}</span>
          <span className="badge" style={{ background:`${DIFF_COLOR[q?.difficulty]}15`, color:DIFF_COLOR[q?.difficulty], border:`1px solid ${DIFF_COLOR[q?.difficulty]}30` }}>{q?.difficulty}</span>
          <span style={{ fontSize:12, color:'var(--text3)', marginLeft:'auto' }}>⏱ {q?.timeLimit} min suggested</span>
        </div>
        <p style={{ fontSize:16, lineHeight:1.7, fontWeight:500 }}>{q?.q}</p>
        {q?.hint && (
          <div style={{ marginTop:12 }}>
            <button onClick={() => setShowHint(!showHint)} style={{ background:'none', border:'none', color:'var(--accent2)', cursor:'pointer', fontFamily:'Inter', fontSize:12, fontWeight:500, padding:0 }}>
              {showHint ? '🙈 Hide hint' : '💡 Show hint'}
            </button>
            {showHint && <div style={{ marginTop:8, padding:'10px 14px', background:'var(--amber-dim)', borderRadius:9, border:'1px solid rgba(255,181,71,0.2)', fontSize:13, color:'var(--amber)' }}>{q.hint}</div>}
          </div>
        )}
      </div>

      {/* Answer */}
      {!feedback ? (
        <div>
          <textarea value={answer} onChange={e => setAnswer(e.target.value)}
            placeholder={round === 'DSA' ? "Explain your approach, write pseudocode or actual code, discuss complexity..." : round === 'System Design' ? "Describe your architecture, components, data flow, trade-offs..." : "Use STAR format: Situation → Task → Action → Result..."}
            style={{ height:180, resize:'vertical', fontFamily:'JetBrains Mono', fontSize:13, lineHeight:1.7, marginBottom:14 }} />
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={() => { nextQuestion(); }} className="btn btn-ghost">Skip →</button>
            <button onClick={submitAnswer} disabled={loading || !answer.trim()} className="btn btn-primary" style={{ flex:1, justifyContent:'center', padding:'13px' }}>
              {loading ? <><div className="spinner" /> Claude AI Evaluating...</> : '📤 Submit Answer'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ animation:'fadeInUp 0.4s ease' }}>
          {/* Score */}
          <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap' }}>
            <div style={{ padding:'20px 24px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, textAlign:'center', minWidth:120 }}>
              <div style={{ fontSize:11, color:'var(--text3)', marginBottom:4 }}>Score</div>
              <div style={{ fontSize:40, fontWeight:800, fontFamily:'Outfit', color: feedback.score >= 8 ? 'var(--green)' : feedback.score >= 6 ? 'var(--amber)' : 'var(--red)', lineHeight:1 }}>{(feedback.score||7)*10}</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{feedback.verdict}</div>
            </div>
            <div style={{ flex:1, minWidth:240 }}>
              {feedback.strengths?.length > 0 && (
                <div style={{ padding:'12px 16px', background:'var(--green-dim)', borderRadius:10, border:'1px solid rgba(0,232,122,0.2)', marginBottom:8 }}>
                  <div style={{ fontSize:11, color:'var(--green)', fontWeight:600, marginBottom:6 }}>✓ STRENGTHS</div>
                  {feedback.strengths.map((s,i) => <div key={i} style={{ fontSize:13, color:'var(--text2)' }}>· {s}</div>)}
                </div>
              )}
              {feedback.improvements?.length > 0 && (
                <div style={{ padding:'12px 16px', background:'var(--amber-dim)', borderRadius:10, border:'1px solid rgba(255,181,71,0.2)' }}>
                  <div style={{ fontSize:11, color:'var(--amber)', fontWeight:600, marginBottom:6 }}>⚡ IMPROVE</div>
                  {feedback.improvements.map((s,i) => <div key={i} style={{ fontSize:13, color:'var(--text2)' }}>· {s}</div>)}
                </div>
              )}
            </div>
          </div>
          {feedback.modelAnswer && (
            <div style={{ padding:'14px 16px', background:'var(--bg2)', borderRadius:12, border:'1px solid var(--border)', marginBottom:14 }}>
              <div style={{ fontSize:11, color:'var(--accent2)', fontWeight:600, marginBottom:6 }}>✦ MODEL ANSWER (Claude AI)</div>
              <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7 }}>{feedback.modelAnswer}</p>
            </div>
          )}
          {feedback.followUp && (
            <div style={{ padding:'12px 16px', background:'var(--cyan-dim)', borderRadius:10, border:'1px solid rgba(0,212,232,0.2)', marginBottom:14 }}>
              <span style={{ fontSize:11, color:'var(--cyan)', fontWeight:600 }}>FOLLOW-UP: </span>
              <span style={{ fontSize:13, color:'var(--text2)' }}>{feedback.followUp}</span>
            </div>
          )}
          <button onClick={nextQuestion} className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:14 }}>
            {current < questions.length - 1 ? `Next Question (${current+2}/${questions.length}) →` : '🏁 See Final Results →'}
          </button>
        </div>
      )}
    </div>
  );
}
