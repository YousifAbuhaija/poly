import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAppContext();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    const err = await signIn(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      navigate('/results');
    }
  }

  return (
    <div className="min-h-dvh flex flex-col relative">
      <div className="absolute top-20 right-10 w-[450px] h-[450px] bg-gradient-to-br from-[#6096BA]/20 to-[#A3CEF1]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-[#274C77]/15 to-[#6096BA]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <motion.div className="w-full max-w-md"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <motion.div className="bg-white rounded-2xl border border-surface-border p-8 shadow-xl"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Sign in with the email you used during onboarding.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="signin-email" className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                <input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full rounded-lg border border-surface-border bg-white px-4 py-2.5 text-text-primary placeholder-text-muted text-sm outline-none focus:ring-2 focus:ring-brand-violet focus:border-transparent transition shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="signin-password" className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
                <input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full rounded-lg border border-surface-border bg-white px-4 py-2.5 text-text-primary placeholder-text-muted text-sm outline-none focus:ring-2 focus:ring-brand-violet focus:border-transparent transition shadow-sm"
                />
              </div>
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-violet text-white text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50">
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-text-secondary">
                Don't have an account?{' '}
                <button type="button" onClick={() => navigate('/onboarding')} className="text-[#6096BA] hover:text-[#274C77] font-medium underline transition">
                  Get started
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
