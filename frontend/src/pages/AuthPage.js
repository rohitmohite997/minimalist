import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Flame, Eye, EyeOff, ArrowRight, Skull } from 'lucide-react';

const AI_AVATAR = "https://static.prod-images.emergentagent.com/jobs/1e633876-7148-4142-8a3d-10cb5ae62c39/images/a80f1ac106d58a9eef96d6d5cb0fa44a447f3c41fe6027801bd85c2e225ab8ee.png";
const LOGIN_BG = "https://static.prod-images.emergentagent.com/jobs/1e633876-7148-4142-8a3d-10cb5ae62c39/images/3c01cdb28f8cc48d37d5f18595bef310b1b44066f62a49fa6164573efdfb5f57.png";

export default function AuthPage() {
  const { user, loading, login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Flame className="w-8 h-8 text-rose-500 animate-pulse" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = isLogin
      ? await login(email, password)
      : await register(email, password, name);

    if (!result.success) {
      setError(result.error);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-black flex" data-testid="auth-page">
      {/* Left: Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={LOGIN_BG} alt="Brutal background" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <div className="flex items-center gap-3 mb-4">
            <img src={AI_AVATAR} alt="AI Avatar" className="w-16 h-16 rounded-none border-2 border-rose-500" />
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Unbounded' }}>
                BRUTAL<span className="text-rose-500">REPLY</span>
              </h1>
            </div>
          </div>
          <p className="text-zinc-400 font-mono text-sm max-w-md">
            The AI that doesn't care about your feelings. Ask anything, get roasted. No mercy, no filter, just pure savage energy.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-rose-500 text-black font-black uppercase text-xs px-3 py-1.5 tracking-widest w-fit">
            <Skull className="w-3 h-3" />
            SAVAGE MODE: ON [LOCKED]
          </div>
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img src={AI_AVATAR} alt="AI Avatar" className="w-12 h-12 rounded-none border-2 border-rose-500" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Unbounded' }}>
              BRUTAL<span className="text-rose-500">REPLY</span>
            </h1>
          </div>

          <div className="border-2 border-zinc-800 bg-black p-8" data-testid="auth-card">
            <div className="flex gap-0 mb-8">
              <button
                data-testid="login-tab"
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest border-2 transition-none ${
                  isLogin
                    ? 'bg-rose-500 text-black border-rose-500'
                    : 'bg-transparent text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                LOGIN
              </button>
              <button
                data-testid="register-tab"
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest border-2 border-l-0 transition-none ${
                  !isLogin
                    ? 'bg-rose-500 text-black border-rose-500'
                    : 'bg-transparent text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                REGISTER
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2 font-bold">Name</label>
                  <Input
                    data-testid="name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name (we'll roast it too)"
                    className="rounded-none border-2 border-zinc-700 focus:border-rose-500 bg-zinc-950 text-white placeholder:text-zinc-600 font-mono h-12"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2 font-bold">Email</label>
                <Input
                  data-testid="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="rounded-none border-2 border-zinc-700 focus:border-rose-500 bg-zinc-950 text-white placeholder:text-zinc-600 font-mono h-12"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2 font-bold">Password</label>
                <div className="relative">
                  <Input
                    data-testid="password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Make it strong (unlike you)"
                    className="rounded-none border-2 border-zinc-700 focus:border-rose-500 bg-zinc-950 text-white placeholder:text-zinc-600 font-mono h-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    data-testid="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-rose-500"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div data-testid="auth-error" className="text-rose-500 text-sm font-mono border-l-4 border-rose-500 pl-3 py-2 bg-rose-500/5">
                  {error}
                </div>
              )}

              <Button
                data-testid="auth-submit-btn"
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-none bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest text-sm border-0 transition-none"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Flame className="w-4 h-4 animate-pulse" />
                    {isLogin ? 'ENTERING...' : 'CREATING...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isLogin ? 'ENTER THE FIRE' : 'JOIN THE ROAST'}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <p className="text-center text-zinc-600 text-xs mt-6 font-mono">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                data-testid="auth-switch-btn"
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-rose-500 hover:text-rose-400 underline uppercase tracking-wider font-bold"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
