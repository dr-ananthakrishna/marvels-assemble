import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Lock, User } from 'lucide-react';
import logoSvg from '../../imports/logo.svg';

export default function Login() {
  const navigate = useNavigate();
  const [proxyId, setProxyId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="p-6">
        <button
          onClick={() => navigate('/welcome')}
          className="flex items-center gap-2 text-[#959A9B] hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          Back
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="max-w-md w-full">
          <div className="mb-8">
            <img src={logoSvg} alt="Marrow" className="h-8 mb-6" />
            <h1 className="text-3xl font-semibold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm">Marrow registered email ID</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                <input
                  type="text"
                  value={proxyId}
                  onChange={(e) => setProxyId(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-[#62C8DF] focus:outline-none transition-colors"
                  placeholder="Enter your registered email ID"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-[#62C8DF] focus:outline-none transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="button"
              className="text-[#4a69a2] text-sm font-medium hover:underline"
            >
              Forgot password?
            </button>

            <button
              type="submit"
              className="w-full h-12 rounded-[4px] relative"
            >
              <div aria-hidden className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]" />
              <span className="relative z-10 font-bold text-sm text-white tracking-[0.5px]">
                LOGIN WITH MARROW
              </span>
              <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
