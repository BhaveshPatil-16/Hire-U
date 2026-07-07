import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../firebase';
import { Sparkles, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Logo from './Logo';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      if (isLogin) {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess();
      } else {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Trigger background welcome email dispatch
        fetch('/api/auth/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        }).catch(err => console.error("Failed to send welcome email:", err));

        onAuthSuccess();
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      const code = err?.code || '';

      if (isLogin) {
        // Specific error matching for Login
        if (
          code === 'auth/wrong-password' || 
          code === 'auth/user-not-found' || 
          code === 'auth/invalid-credential' ||
          code === 'auth/invalid-email'
        ) {
          setErrorMsg('Email or password is incorrect.');
        } else {
          setErrorMsg(err.message || 'An unexpected authentication error occurred.');
        }
      } else {
        // Specific error matching for Signup
        if (code === 'auth/email-already-in-use') {
          setErrorMsg('User already exists. Please sign in.');
        } else if (code === 'auth/weak-password') {
          setErrorMsg('Password must be at least 6 characters.');
        } else if (code === 'auth/invalid-email') {
          setErrorMsg('Please enter a valid email address.');
        } else {
          setErrorMsg(err.message || 'An unexpected registration error occurred.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pastel-mesh flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[460px] bg-white border border-slate-100/80 shadow-2xl rounded-3xl p-6 sm:p-8 relative z-10 overflow-hidden"
      >
        {/* Decorative Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-pink-500 to-amber-300" />

        {/* Header Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo className="justify-center mb-4" size={48} textSize="2xl" />
          <p className="mt-2 text-sm text-slate-500 max-w-[280px] mx-auto">
            {isLogin 
              ? 'Access our secure and intelligent talent matching ecosystem' 
              : 'Create your account to unlock full corporate and candidate services'
            }
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200/50">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              isLogin 
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/20' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              !isLogin 
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/20' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Feedback */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 bg-rose-50/80 border border-rose-100 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-rose-700"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm transition-all text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm transition-all text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-6 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-xl shadow-md hover:shadow-indigo-100 transition-all cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-5 border-t border-slate-100 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Secured with Cloud-Native Federated Auth</span>
        </div>
      </motion.div>
    </div>
  );
}
