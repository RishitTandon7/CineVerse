import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onToggleMode: () => void;
}

export default function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{email?: string; password?: string}>({});

  const { signIn } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors: {email?: string; password?: string} = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});

    const { error: authError } = await signIn(email.trim(), password);

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (authError.message.includes('Email not confirmed')) {
        setError('Please check your email and confirm your account before signing in.');
      } else {
        setError(authError.message);
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-black text-gray-900 mb-3">
          Welcome back!
        </h2>
        <p className="text-gray-600">Sign in to continue your premium movie experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-red-700 text-sm font-medium leading-relaxed">{error}</div>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-3">
            Email address
          </label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validateForm()}
              placeholder="Enter your email"
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-base ${
                fieldErrors.email 
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
                  : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white'
              }`}
              required
            />
            {fieldErrors.email && (
              <div className="mt-2 text-red-600 text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-4 w-4" />
                {fieldErrors.email}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-3">
            Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => validateForm()}
              placeholder="Enter your password"
              className={`w-full pl-10 pr-12 py-3 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-base ${
                fieldErrors.password 
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
                  : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white'
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 p-1 rounded-lg hover:bg-gray-100"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            {fieldErrors.password && (
              <div className="mt-2 text-red-600 text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-4 w-4" />
                {fieldErrors.password}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors"
            />
            <span className="ml-3 text-sm text-gray-700 font-semibold">Remember me</span>
          </label>
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-700 font-bold transition-colors hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:hover:translate-y-0 relative overflow-hidden group"
        >
          {!loading && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          )}
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10"></div>
              Signing in...
            </>
          ) : (
            <>
              <span className="relative z-10">Sign In to CineVerse</span>
              <ArrowRight className="h-5 w-5 relative z-10" />
            </>
          )}
        </button>

        <div className="text-center pt-4 border-t border-gray-100">
          <span className="text-gray-600">Don't have an account? </span>
          <button
            type="button"
            onClick={onToggleMode}
            className="text-blue-600 hover:text-blue-700 font-bold transition-colors hover:underline"
          >
            Create account
          </button>
        </div>
      </form>
    </div>
  );
}