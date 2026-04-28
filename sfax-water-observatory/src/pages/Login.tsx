import { useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Droplets } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length >= 3 && password.length >= 4) {
      localStorage.setItem('auth_token', 'mock_token');
      navigate('/');
    } else {
      alert('Invalid credentials. Username min 3 chars, Password min 4 chars.');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] z-10" />
      
      {/* Glass Panel */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-20 w-full max-w-md p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <Droplets className="text-emerald-400 w-12 h-12 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-8">Sfax Water Observatory</h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full p-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            Login
          </button>
        </form>
      </motion.div>
    </div>
  );
}

