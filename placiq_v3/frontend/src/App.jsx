import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import MockInterview from './pages/MockInterview';
import Profile from './pages/Profile';
import Strategy from './pages/Strategy';
import Resume from './pages/Resume';
import Layout from './components/Layout';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)', flexDirection:'column', gap:16 }}>
      <div style={{ width:48, height:48, border:'3px solid var(--accent-dim)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
      <p style={{ color:'var(--text3)', fontFamily:'Outfit', fontSize:14, letterSpacing:'0.05em' }}>Initializing PlaCIQ 2.0...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background:'var(--surface2)', color:'var(--text)', border:'1px solid var(--border2)', fontFamily:'Inter', fontSize:13, borderRadius:12 },
          success: { iconTheme: { primary:'var(--green)', secondary:'var(--bg)' } },
          error: { iconTheme: { primary:'var(--red)', secondary:'var(--bg)' } },
          duration: 3500,
        }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protected><Layout /></Protected>}>
            <Route index element={<Dashboard />} />
            <Route path="agents" element={<Agents />} />
            <Route path="resume" element={<Resume />} />
            <Route path="interview" element={<MockInterview />} />
            <Route path="strategy" element={<Strategy />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
