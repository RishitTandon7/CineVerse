import React, { useState, useEffect } from 'react';
import { Video, Users, Calendar, Clock, Crown, Play, Trash2, Copy, Check } from 'lucide-react';

interface MeetingsPageProps {
  onCreateMeeting: () => void;
  onJoinMeeting: () => void;
  onMovieSelect?: (movie: Movie) => void;
  selectedMovie?: Movie | null;
}

export default function MeetingsPage({ 
  onCreateMeeting, 
  onJoinMeeting, 
  onMovieSelect,
  selectedMovie 
}: MeetingsPageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showMovieSelection, setShowMovieSelection] = useState(false);
  const [userName, setUserName] = useState('');

  // If we have a selected movie, show the create meeting form
  useEffect(() => {
    if (selectedMovie) {
      setShowMovieSelection(true);
    }
  }, [selectedMovie]);

  // Mock meeting data - in a real app, this would come from your backend
  const recentMeetings = [
    {
      id: '1',
      code: 'COSMIC',
      movie: 'Cosmic Journey',
      participants: 4,
      isHost: true,
      scheduledFor: new Date('2024-01-20T19:00:00'),
      status: 'upcoming'
    },
    {
      id: '2',
      code: 'OCEAN9',
      movie: 'Ocean\'s Mystery',
      participants: 2,
      isHost: false,
      scheduledFor: new Date('2024-01-18T20:30:00'),
      status: 'completed'
    },
    {
      id: '3',
      code: 'MOUNT8',
      movie: 'Mountain Echo',
      participants: 6,
      isHost: true,
      scheduledFor: new Date('2024-01-15T21:00:00'),
      status: 'completed'
    }
  ];

  const copyMeetingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Your Movie
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Meetings
            </span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Manage premium watch parties and create unforgettable movie experiences.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Video className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Start New Meeting</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Create an instant premium watch party with 4K streaming and synchronized playback.
            </p>
            <button
              onClick={onCreateMeeting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              <Video className="h-5 w-5" />
              Create Meeting
            </button>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Join Meeting</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Enter a meeting code to join a premium watch party with crystal-clear quality.
            </p>
            <button
              onClick={onJoinMeeting}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              <Users className="h-5 w-5" />
              Join Meeting
            </button>
          </div>
        </div>

        {/* Recent Meetings */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900">Recent Meetings</h2>
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="h-4 w-4" />
              <span className="font-medium text-sm">Last 30 days</span>
            </div>
          </div>

          {recentMeetings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No meetings yet</h3>
              <p className="text-gray-600 mb-6">Create your first premium watch party to get started</p>
              <button
                onClick={onCreateMeeting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Create First Meeting
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="group bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                        meeting.status === 'upcoming' 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                          : 'bg-gradient-to-br from-gray-500 to-gray-600'
                      }`}>
                        {meeting.status === 'upcoming' ? (
                          <Play className="h-6 w-6 text-white" />
                        ) : (
                          <Clock className="h-6 w-6 text-white" />
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900">{meeting.movie}</h3>
                          {meeting.isHost && (
                            <div className="bg-yellow-400/20 text-yellow-700 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                              <Crown className="h-3 w-3" />
                              Host
                            </div>
                          )}
                          <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                            meeting.status === 'upcoming' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {meeting.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{meeting.participants} participants</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(meeting.scheduledFor)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 px-3 py-2 rounded-lg">
                        <span className="font-mono font-semibold text-gray-700">{meeting.code}</span>
                      </div>
                      
                      <button
                        onClick={() => copyMeetingCode(meeting.code)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Copy meeting code"
                      >
                        {copiedCode === meeting.code ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-600" />
                        )}
                      </button>
                      
                      {meeting.status === 'upcoming' ? (
                        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          Start
                        </button>
                      ) : (
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Movie Selection Modal */}
        {showMovieSelection && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20">
              <div className="text-center mb-6">
                {selectedMovie && (
                  <div className="mb-4">
                    <img 
                      src={selectedMovie.thumbnail} 
                      alt={selectedMovie.title}
                      className="w-20 h-28 object-cover rounded-lg mx-auto mb-3"
                    />
                    <h3 className="font-bold text-lg text-gray-900">{selectedMovie.title}</h3>
                    <p className="text-gray-600 text-sm">{selectedMovie.genre} • {selectedMovie.year}</p>
                  </div>
                )}
                <h2 className="text-xl font-black text-gray-900 mb-2">
                  Start Watch Party
                </h2>
                <p className="text-gray-600">Enter your name to create the meeting</p>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && selectedMovie && onMovieSelect) {
                      onMovieSelect(selectedMovie);
                    }
                  }}
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowMovieSelection(false);
                      setUserName('');
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (selectedMovie && onMovieSelect) {
                        onMovieSelect(selectedMovie);
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    Create Meeting
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}