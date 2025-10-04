import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SignupFormProps {
  onToggleMode: () => void;
}

export default function SignupForm({ onToggleMode }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string; 
    password?: string; 
    confirmPassword?: string; 
    fullName?: string;
  }>({});

  const { signUp } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const hasLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    return { hasLength, hasNumber, hasLetter, isValid: hasLength && hasNumber && hasLetter };
  };

  const validateForm = () => {
    const errors: {email?: string; password?: string; confirmPassword?: string; fullName?: string} = {};
    
    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters';
    }
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    
    const passwordValidation = validatePassword(password);
    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (!passwordValidation.isValid) {
      if (!passwordValidation.hasLength) {
        errors.password = 'Password must be at least 6 characters';
      } else if (!passwordValidation.hasNumber || !passwordValidation.hasLetter) {
        errors.password = 'Password must contain both letters and numbers';
      }
    }
    
    if (!confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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

    const { error: authError } = await signUp(email.trim(), password, fullName.trim());

    if (authError) {
      if (authError.message.includes('User already registered')) {
        setError('An account with this email already exists. Please try signing in instead.');
      } else if (authError.message.includes('Password should be')) {
        setError('Password does not meet security requirements. Please choose a stronger password.');
      } else {
        setError(authError.message);
      }
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
          <Check className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-6">
          Welcome to CineVerse!
        </h2>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-4" />
          <p className="text-green-800 font-semibold text-lg mb-2">Account Created Successfully!</p>
          <p className="text-green-700">
            Please check your email to verify your account and complete the registration.
          </p>
        </div>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Once verified, you'll have access to premium 4K movie streaming, 
          synchronized watch parties, and exclusive features.
        </p>
        <button
          onClick={onToggleMode}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-black text-gray-900 mb-3">
          Join CineVerse
        </h2>
        <p className="text-gray-600">Create your premium movie streaming account</p>
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
            Full name
          </label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => validateForm()}
              placeholder="Enter your full name"
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-base ${
                fieldErrors.fullName 
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
                  : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:bg-white'
              }`}
              required
            />
            {fieldErrors.fullName && (
              <div className="mt-2 text-red-600 text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-4 w-4" />
                {fieldErrors.fullName}
              </div>
            )}
          </div>
        </div>

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
                  : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:bg-white'
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
              placeholder="Create a strong password"
              className={`w-full pl-10 pr-12 py-3 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-base ${
                fieldErrors.password 
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
                  : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:bg-white'
              }`}
              required
              minLength={6}
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

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-3">
            Confirm password
          </label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => validateForm()}
              placeholder="Confirm your password"
              className={`w-full pl-10 pr-12 py-3 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-base ${
                fieldErrors.confirmPassword 
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
                  : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:bg-white'
              }`}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 p-1 rounded-lg hover:bg-gray-100"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            {fieldErrors.confirmPassword && (
              <div className="mt-2 text-red-600 text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-4 w-4" />
                {fieldErrors.confirmPassword}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start pt-2">
          <input
            type="checkbox"
            id="terms"
            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 transition-colors mt-1"
            required
          />
          <label htmlFor="terms" className="ml-3 text-sm text-gray-700 leading-relaxed">
            I agree to the{' '}
            <a href="#" className="text-purple-600 hover:text-purple-700 font-bold hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-purple-600 hover:text-purple-700 font-bold hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:hover:translate-y-0 relative overflow-hidden group"
        >
          {!loading && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          )}
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10"></div>
              Creating account...
            </>
          ) : (
            <>
              <span className="relative z-10">Create Premium Account</span>
              <ArrowRight className="h-5 w-5 relative z-10" />
            </>
          )}
        </button>

        <div className="text-center pt-4 border-t border-gray-100">
          <span className="text-gray-600">Already have an account? </span>
          <button
            type="button"
            onClick={onToggleMode}
            className="text-purple-600 hover:text-purple-700 font-bold transition-colors hover:underline"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
}