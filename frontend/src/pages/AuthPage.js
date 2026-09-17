import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Flame, Eye, EyeOff, ArrowRight, ShieldCheck, Clipboard, Check } from 'lucide-react';

const AI_AVATAR = "https://static.prod-images.emergentagent.com/jobs/1e633876-7148-4142-8a3d-10cb5ae62c39/images/a80f1ac106d58a9eef96d6d5cb0fa44a447f3c41fe6027801bd85c2e225ab8ee.png";
const SAVED_LOGIN_KEY = 'mini_malist_saved_login';

export default function AuthPage() {
  const { user, loading, login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [pasteStatus, setPasteStatus] = useState('');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_LOGIN_KEY) || 'null');
      if (saved && saved.email) {
        setEmail(saved.email || '');
        setPassword(saved.password || '');
        setRememberMe(Boolean(saved.remember));
      }
    } catch {
      // Ignore invalid saved data.
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Flame className="w-8 h-8 text-sky-600 animate-pulse" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const persistLogin = (save) => {
    if (!save || !email.trim() || !password) {
      localStorage.removeItem(SAVED_LOGIN_KEY);
      return;
    }

    localStorage.setItem(
      SAVED_LOGIN_KEY,
      JSON.stringify({ email: email.trim(), password, remember: true })
    );
  };

  const handlePasteFromClipboard = async (field) => {
    try {
      const value = await navigator.clipboard.readText();
      if (!value) return;
      if (field === 'email') {
        setEmail(value.trim());
      } else {
        setPassword(value);
      }
      setPasteStatus(field === 'email' ? 'Email pasted' : 'Password pasted');
      setTimeout(() => setPasteStatus(''), 1500);
    } catch {
      setError('Clipboard access was blocked. You can still paste using Ctrl/Cmd + V.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = isLogin
      ? await login(email, password)
      : await register(email, password, name);

    if (!result.success) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    persistLogin(rememberMe);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100" data-testid="auth-page">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/60 shadow-[0_30px_100px_rgba(2,6,23,0.8)] backdrop-blur-2xl ring-1 ring-white/5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden lg:flex lg:flex-col lg:justify-between bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.22),_transparent_28%),linear-gradient(135deg,_rgba(15,23,42,0.9),_rgba(30,41,59,0.96),_rgba(30,64,175,0.9))] p-12 text-white">
            <div className="flex items-center gap-3">
              <img src={AI_AVATAR} alt="AI Avatar" className="h-14 w-14 rounded-2xl border border-white/15 bg-white/10 object-cover shadow-lg shadow-blue-500/20" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-blue-200">Premium AI</p>
                <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Manrope' }}>
                  mini <span className="text-blue-300">malist</span>
                </h1>
              </div>
            </div>

            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-blue-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Smart workspace
              </div>
              <p className="max-w-md text-lg leading-relaxed text-slate-200">
                A focused AI workspace designed for fast conversations, thoughtful answers, and daily productivity.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <div className="mb-2 flex items-center gap-2 text-blue-200">
                <ShieldCheck className="h-4 w-4" />
                Secure by default
              </div>
              <p className="text-slate-300">Private sessions, smooth access, and a lightweight login experience that saves time.</p>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
                <img src={AI_AVATAR} alt="AI Avatar" className="h-12 w-12 rounded-2xl border border-blue-400/40 bg-blue-500/10 object-cover" />
                <h1 className="text-2xl font-black tracking-tight text-slate-100" style={{ fontFamily: 'Manrope' }}>
                  mini <span className="text-blue-400">malist</span>
                </h1>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-[0_12px_40px_rgba(2,6,23,0.5)] backdrop-blur-xl sm:p-8" data-testid="auth-card">
                <div className="mb-8 flex overflow-hidden rounded-2xl border border-white/10 bg-slate-800/80 p-1">
                  <button
                    data-testid="login-tab"
                    onClick={() => { setIsLogin(true); setError(''); }}
                    className={`flex-1 rounded-xl py-3 text-sm font-bold uppercase tracking-[0.2em] transition-all duration-200 ${
                      isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    data-testid="register-tab"
                    onClick={() => { setIsLogin(false); setError(''); }}
                    className={`flex-1 rounded-xl py-3 text-sm font-bold uppercase tracking-[0.2em] transition-all duration-200 ${
                      !isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Register
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Name</label>
                      <Input
                        data-testid="name-input"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="h-12 rounded-2xl border border-white/10 bg-slate-800 text-slate-50 placeholder:text-slate-400 focus:border-blue-400"
                        required={!isLogin}
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Email</label>
                    <div className="relative">
                      <Input
                        data-testid="email-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="h-12 rounded-2xl border border-white/10 bg-slate-800 pr-11 text-slate-50 placeholder:text-slate-400 focus:border-blue-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handlePasteFromClipboard('email')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-300"
                        aria-label="Paste email"
                      >
                        <Clipboard className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Password</label>
                    <div className="relative">
                      <Input
                        data-testid="password-input"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-12 rounded-2xl border border-white/10 bg-slate-800 pr-20 text-slate-50 placeholder:text-slate-400 focus:border-blue-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handlePasteFromClipboard('password')}
                        className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-300"
                        aria-label="Paste password"
                      >
                        <Clipboard className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        data-testid="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-300"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500"
                    />
                    Save login for next time
                  </label>

                  {pasteStatus && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                      <Check className="h-4 w-4" />
                      {pasteStatus}
                    </div>
                  )}

                  {error && (
                    <div data-testid="auth-error" className="border-l-4 border-rose-400 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                      {error}
                    </div>
                  )}

                  <Button
                    data-testid="auth-submit-btn"
                    type="submit"
                    disabled={submitting}
                    className="h-12 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/30 transition-all duration-200 hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-0.5"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Flame className="h-4 w-4 animate-pulse" />
                        {isLogin ? 'Signing in...' : 'Creating account...'}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {isLogin ? 'Continue' : 'Create account'}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-300">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                  <button
                    data-testid="auth-switch-btn"
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    className="font-semibold text-blue-300 underline-offset-2 hover:underline"
                  >
                    {isLogin ? 'Register' : 'Login'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
