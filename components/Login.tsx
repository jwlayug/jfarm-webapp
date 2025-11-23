import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Sprout, Loader2, Lock, Mail, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      let msg = "An error occurred.";
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = "Invalid email or password.";
      } else if (err.code === 'auth/email-already-in-use') {
        msg = "Email is already registered.";
      } else if (err.code === 'auth/weak-password') {
        msg = "Password should be at least 6 characters.";
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sage-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-sage-100">
        
        {/* Header Area */}
        <div className="bg-sage-600 p-8 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-sage-600 shadow-lg mx-auto mb-4">
            <Sprout size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white">JFarm</h1>
          <p className="text-sage-200 text-sm tracking-wide uppercase mt-1">Management System</p>
        </div>

        {/* Form Area */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-sage-800 mb-6 text-center">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-sage-500 uppercase mb-1 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-sage-50 border-transparent focus:bg-white border focus:border-sage-400 rounded-xl text-sage-800 outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-sage-500 uppercase mb-1 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-sage-50 border-transparent focus:bg-white border focus:border-sage-400 rounded-xl text-sage-800 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-sage-600 hover:bg-sage-700 text-white font-bold py-3 rounded-xl shadow-md shadow-sage-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-sage-500">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                className="ml-2 font-bold text-sage-700 hover:text-sage-900 hover:underline transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;