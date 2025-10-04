import React, { useState } from 'react';
import { Video, Menu, Settings, HelpCircle, Bell, Search, LogOut, User, Play } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './auth/AuthModal';

interface HeaderProps {
  onNavigate?: (page: 'home' | 'movies' | 'meetings') => void;
  currentPage?: string;
}

export default function Header({ onNavigate, currentPage }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };
  
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <button 
                  onClick={() => onNavigate?.('home')}
                  className="text-xl font-black text-gray-900 hover:text-blue-600 transition-colors"
                >
                  CineVerse
                </button>
                <div className="text-xs text-blue-600 font-bold">PREMIUM</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-sm mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search movies..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
              />
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            <button 
              onClick={() => onNavigate?.('home')}
              className={`relative transition-colors font-semibold group text-sm ${
                currentPage === 'home' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
              <div className={`absolute -bottom-1 left-0 h-0.5 bg-blue-600 rounded-full transition-all duration-300 ${
                currentPage === 'home' ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></div>
            </button>
            <button 
              onClick={() => onNavigate?.('movies')}
              className={`relative transition-colors font-semibold group text-sm ${
                currentPage === 'movies' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Movies
              <div className={`absolute -bottom-1 left-0 h-0.5 bg-blue-600 rounded-full transition-all duration-300 ${
                currentPage === 'movies' ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></div>
            </button>
            <button 
              onClick={() => onNavigate?.('meetings')}
              className={`relative transition-colors font-semibold group text-sm ${
                currentPage === 'meetings' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              My Meetings
              <div className={`absolute -bottom-1 left-0 h-0.5 bg-blue-600 rounded-full transition-all duration-300 ${
                currentPage === 'meetings' ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></div>
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {user && (
              <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
                <Bell className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>
            )}
            
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
              <HelpCircle className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </button>
            
            {user && (
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
                <Settings className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
            )}
            
            <button 
              className="lg:hidden p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.full_name || 'User'} 
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-bold">
                        {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-gray-900 leading-none">
                      {profile?.full_name || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{user.email}</div>
                  </div>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200/60 py-2 z-50 backdrop-blur-xl">
                    <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Profile</span>
                    </button>
                    <button 
                      onClick={() => onNavigate?.('meetings')}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm"
                    >
                      <Play className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">My Meetings</span>
                    </button>
                    <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm">
                      <Settings className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Settings</span>
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button 
                      onClick={handleSignOut}
                      className="w-full px-4 py-2.5 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600 text-sm"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleAuthClick('signin')}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors text-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleAuthClick('signup')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-5 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg text-sm"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200/50 animate-in slide-in-from-top-2 duration-200 bg-white/95 backdrop-blur-sm">
            <div className="flex flex-col gap-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                />
              </div>
              <button 
                onClick={() => {
                  onNavigate?.('home');
                  setIsMenuOpen(false);
                }}
                className="text-gray-700 hover:text-blue-600 transition-colors font-semibold py-2 text-left text-sm"
              >
                Home
              </button>
              <button 
                onClick={() => {
                  onNavigate?.('movies');
                  setIsMenuOpen(false);
                }}
                className="text-gray-700 hover:text-blue-600 transition-colors font-semibold py-2 text-left text-sm"
              >
                Movies
              </button>
              {user && (
                <button 
                  onClick={() => {
                    onNavigate?.('meetings');
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-semibold py-2 text-left text-sm"
                >
                  My Meetings
                </button>
              )}
            </div>
          </div>
        )}
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
}