import React, { useState, useEffect } from 'react';
import { Video, Users, Mic, Play, Star, Clock, Sparkles, Zap, Shield, ArrowRight, CheckCircle, Globe } from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Header from './components/Header';
import MoviesPage from './components/MoviesPage';
import MeetingsPage from './components/MeetingsPage';
import SupabaseMeetingRoom from './components/SupabaseMeetingRoom';
import JoinMeeting from './components/JoinMeeting';
import ProtectedRoute from './components/ProtectedRoute';
import { useSupabaseMeeting } from './hooks/useSupabaseMeeting';
import { Movie } from './types';

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const [currentView, setCurrentView] = useState<'home' | 'movies' | 'meetings' | 'join' | 'meeting'>('home');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [meetingCode, setMeetingCode] = useState('');
  const [pendingAction, setPendingAction] = useState<'create' | 'join' | null>(null);

  const { user } = useAuth();
  const { createMeeting, joinMeeting, error } = useSupabaseMeeting();

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setCurrentView('meetings');
  };

  const handleJoinMeeting = (code: string) => {
    joinMeeting(code.toUpperCase()).then(success => {
      if (success) {
        setMeetingCode(code.toUpperCase());
        setCurrentView('meeting');
      }
    });
  };

  const handleCreateMeetingWithMovie = async (movie: Movie) => {
    setSelectedMovie(movie);
    const code = await createMeeting(movie);
    if (code) {
      setMeetingCode(code.toUpperCase());
      setCurrentView('meeting');
    }
  };

  const handleCreateMeeting = async () => {
    console.log('🚀 START MEETING CLICKED', { user: user?.id });

    if (!user) {
      console.log('⚠️ No user, redirecting to meetings page for auth');
      setPendingAction('create');
      setCurrentView('meetings');
      return;
    }

    console.log('👤 User authenticated, creating meeting...');
    setPendingAction(null);
    const code = await createMeeting();

    console.log('📋 Meeting creation result:', { code });

    if (code) {
      console.log('✅ Setting meeting code and navigating to meeting room');
      setMeetingCode(code);
      setCurrentView('meeting');
    } else {
      console.error('❌ Failed to create meeting - no code returned');
    }
  };

  useEffect(() => {
    if (user && pendingAction === 'create') {
      const executePendingAction = async () => {
        setPendingAction(null);
        const code = await createMeeting();
        if (code) {
          setMeetingCode(code);
          setCurrentView('meeting');
        }
      };
      executePendingAction();
    }
  }, [user, pendingAction, createMeeting]);

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedMovie(null);
    setMeetingCode('');
  };

  const handleNavigation = (page: 'home' | 'movies' | 'meetings') => {
    setCurrentView(page);
    if (page !== 'meeting') {
      setSelectedMovie(null);
      setMeetingCode('');
    }
  };
  console.log('🎨 RENDER - Current State:', { currentView, meetingCode, hasUser: !!user, hasSelectedMovie: !!selectedMovie });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/50 relative">
      {/* Debug info - remove later */}
      <div className="fixed top-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg text-xs z-50 font-mono">
        View: {currentView} | Code: {meetingCode || 'none'} | User: {user ? '✓' : '✗'}
      </div>

      {currentView === 'home' && (
        <>
          <Header onNavigate={handleNavigation} currentPage="home" />
          <main className="pt-16">
            <HeroSection 
              onJoinMeeting={() => setCurrentView('join')}
              onCreateMeeting={handleCreateMeeting}
            />
            <FeaturesSection />
            <TestimonialsSection />
          </main>
        </>
      )}

      {currentView === 'movies' && (
        <>
          <Header onNavigate={handleNavigation} currentPage="movies" />
          <MoviesPage onMovieSelect={handleMovieSelect} />
        </>
      )}

      {currentView === 'meetings' && (
        <ProtectedRoute>
          <Header onNavigate={handleNavigation} currentPage="meetings" />
          <MeetingsPage 
            onCreateMeeting={() => handleCreateMeeting()}
            onJoinMeeting={() => setCurrentView('join')}
            onMovieSelect={handleCreateMeetingWithMovie}
            selectedMovie={selectedMovie}
          />
        </ProtectedRoute>
      )}

      {currentView === 'join' && (
        <ProtectedRoute>
          <JoinMeeting 
            onJoin={handleJoinMeeting}
            onBack={handleBackToHome}
          />
        </ProtectedRoute>
      )}

      {currentView === 'meeting' && meetingCode && (
        <ProtectedRoute>
          <SupabaseMeetingRoom
            movie={selectedMovie || undefined}
            meetingCode={meetingCode}
            onLeave={handleBackToHome}
          />
        </ProtectedRoute>
      )}

      {currentView === 'meeting' && !meetingCode && (
        <div className="h-screen bg-gradient-to-br from-cyan-600 via-blue-600 to-pink-600 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-bold mb-2">Waiting for meeting code...</h3>
            <p className="text-blue-200">currentView: {currentView}, meetingCode: {meetingCode || 'empty'}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl border border-red-400/30 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-300 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-white rounded-full mt-2 animate-pulse flex-shrink-0"></div>
              <span className="text-sm font-medium leading-relaxed">{error}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HeroSection({ onJoinMeeting, onCreateMeeting }: { 
  onJoinMeeting: () => void;
  onCreateMeeting: () => void;
}) {
  const [quickJoinCode, setQuickJoinCode] = useState('');

  const handleQuickJoin = () => {
    if (quickJoinCode.trim()) {
      onJoinMeeting();
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32">
        <div className="text-center mb-16">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-1000">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-white font-semibold text-sm">Premium Movie Experience</span>
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </div>

          <h1 className="text-6xl lg:text-8xl font-black text-white mb-8 leading-tight animate-in fade-in-0 slide-in-from-top-8 duration-1000 delay-200">
            Watch Movies
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 animate-gradient-x">
              Together
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto mb-12 leading-relaxed animate-in fade-in-0 slide-in-from-top-12 duration-1000 delay-400">
            Transform your movie nights with premium watch parties. Experience 4K streaming, 
            synchronized playback, and seamless social interaction with friends around the world.
          </p>
          
          <div className="flex flex-col lg:flex-row gap-6 justify-center items-center max-w-2xl mx-auto mb-16 animate-in fade-in-0 slide-in-from-bottom-8 duration-1000 delay-600">
            <button
              type="button"
              onClick={onCreateMeeting}
              className="group relative w-full lg:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center justify-center gap-4 shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Video className="h-6 w-6 relative z-10" />
              <span className="relative z-10">Start Premium Meeting</span>
            </button>
            
            <div className="flex w-full lg:w-auto bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 shadow-2xl hover:shadow-white/10 transition-all duration-300">
              <input
                type="text"
                value={quickJoinCode}
                onChange={(e) => setQuickJoinCode(e.target.value.toUpperCase())}
                placeholder="Meeting code"
                className="flex-1 px-6 py-5 bg-transparent text-white placeholder-white/60 focus:outline-none font-mono text-lg tracking-wider"
              />
              <button
                onClick={handleQuickJoin}
                className="px-8 py-5 bg-white/20 hover:bg-white/30 text-white font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Join
              </button>
            </div>
          </div>

          {/* Premium Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto animate-in fade-in-0 slide-in-from-bottom-12 duration-1000 delay-800">
            {[
              { number: "4K", label: "Ultra HD Quality", icon: Zap, desc: "Crystal clear streaming" },
              { number: "100+", label: "Participants", icon: Users, desc: "Watch with friends" },
              { number: "99.9%", label: "Uptime", icon: Shield, desc: "Always available" },
              { number: "<1s", label: "Sync Delay", icon: Sparkles, desc: "Perfect synchronization" }
            ].map((stat, index) => (
              <div key={index} className="group text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                <stat.icon className="h-8 w-8 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-4xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">{stat.number}</div>
                <div className="text-blue-200 font-medium">{stat.label}</div>
                <div className="text-blue-300/70 text-sm mt-1">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Video,
      title: "4K Ultra HD Streaming",
      description: "Experience movies in stunning 4K resolution with HDR support and adaptive bitrate streaming.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Unlimited Participants",
      description: "Host watch parties with up to 100 friends with crystal-clear audio and video quality.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-500"
    },
    {
      icon: Mic,
      title: "Crystal Clear Audio",
      description: "Spatial audio technology with noise cancellation for immersive conversations.",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-500"
    },
    {
      icon: Play,
      title: "Perfect Synchronization",
      description: "Advanced sync technology ensures everyone watches at exactly the same moment worldwide.",
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-50",
      iconBg: "bg-gradient-to-br from-red-500 to-orange-500"
    },
    {
      icon: Star,
      title: "Premium Content Library",
      description: "Access thousands of movies across all genres, from blockbusters to classics.",
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-yellow-50",
      iconBg: "bg-gradient-to-br from-yellow-500 to-amber-500"
    },
    {
      icon: Clock,
      title: "Smart Scheduling",
      description: "AI-powered scheduling with timezone coordination and calendar integration.",
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50",
      iconBg: "bg-gradient-to-br from-indigo-500 to-purple-500"
    }
  ];

  return (
    <div className="py-24 lg:py-32 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-3 mb-8">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-blue-800 font-bold text-sm">Premium Features</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Everything You Need for
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Perfect Movie Nights
            </span>
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Professional-grade technology meets intuitive design for the ultimate shared viewing experience.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className={`group relative p-8 rounded-3xl ${feature.bgColor} border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Movie Enthusiast",
      avatar: "SC",
      avatarBg: "from-pink-500 to-red-500",
      content: "The sync is perfect and video quality is incredible. Movie nights with friends have never been this good!",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Film Student",
      avatar: "MJ",
      avatarBg: "from-blue-500 to-purple-500",
      content: "The technical excellence is outstanding. 4K streaming and perfect audio sync make this feel like a premium cinema.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Remote Team Lead",
      avatar: "ER",
      avatarBg: "from-green-500 to-teal-500",
      content: "Perfect for team movie nights. The interface is intuitive and it's brought our remote team closer together.",
      rating: 5
    }
  ];

  return (
    <div className="py-24 lg:py-32 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%239C92AC%22%20fill-opacity=%220.03%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/20">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-white font-bold text-sm">Loved by Thousands</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-black text-white mb-6">
            What Our Users Say
          </h2>
          <p className="text-xl lg:text-2xl text-blue-200 max-w-3xl mx-auto">
            Join thousands of happy users who've transformed their movie nights
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
              
              <div className="relative z-10">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-white leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.avatarBg} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-blue-200 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;