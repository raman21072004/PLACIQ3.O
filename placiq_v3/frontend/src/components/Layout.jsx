import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { path:'/', icon:'📊', label:'Dashboard', exact:true },
  { path:'/agents', icon:'🤖', label:'AI Agents' },
  { path:'/resume', icon:'📄', label:'Resume AI' },
  { path:'/interview', icon:'🎯', label:'Mock Interview' },
  { path:'/strategy', icon:'🗺️', label:'Strategy' },
  { path:'/profile', icon:'👤', label:'My Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const score = user?.placementScore || 0;
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 68 : 240,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
        zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding:'18px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10, minHeight:68 }}>
          <div className="brand-logo" style={{ flexShrink:0 }}>P</div>
          {!collapsed && (
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:'Outfit', fontWeight:800, fontSize:16, letterSpacing:'-0.03em' }}>PlaCIQ</div>
              <div style={{ fontSize:10, color:'var(--text3)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.08em' }}>AI Placement</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:14, padding:4, borderRadius:6, transition:'all 0.15s', flexShrink:0 }}
            onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
            onMouseLeave={e => e.currentTarget.style.background='none'}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto' }}>
          {NAV.map(({ path, icon, label, exact }) => (
            <NavLink key={path} to={path} end={exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
              title={collapsed ? label : undefined}>
              <div className="nav-icon" style={{ flexShrink:0 }}>{icon}</div>
              {!collapsed && <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Score widget */}
        {!collapsed && (
          <div style={{ margin:'0 10px 10px', padding:'14px', background:'var(--bg2)', borderRadius:12, border:'1px solid var(--border)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>Placement Score</span>
              <span style={{ fontSize:18, fontWeight:700, fontFamily:'Outfit', color: score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : score > 0 ? 'var(--red)' : 'var(--text3)' }}>{score || '—'}</span>
            </div>
            {score > 0 && <div className="progress-bar"><div className="progress-fill" style={{ width:`${score}%`, background: score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--red)' }} /></div>}
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:7 }}>
              {score >= 80 ? '✅ Ready to Apply' : score >= 60 ? '🟡 Getting There' : score > 0 ? '⚠️ Needs Work' : '💡 Run Full Analysis'}
            </div>
          </div>
        )}

        {/* User */}
        <div style={{ padding:'10px', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--gradient)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>{initials}</div>
          {!collapsed && (<>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name || 'Demo User'}</div>
              <div style={{ fontSize:11, color:'var(--text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.profile?.branch || 'Student'}</div>
            </div>
            <button onClick={handleLogout} title="Logout" style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:14, padding:4, borderRadius:6, transition:'all 0.15s', flexShrink:0 }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--red-dim)'; e.currentTarget.style.color='var(--red)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--text3)'; }}>⏻</button>
          </>)}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex:1, minWidth:0, overflowX:'hidden', overflowY:'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
