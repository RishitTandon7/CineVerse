import React, { useState } from 'react';
import { ArrowLeft, Video, VideoOff, Mic, MicOff, Settings, UserCheck, Sparkles, Shield, Zap } from 'lucide-react';

interface JoinMeetingProps {
  onJoin: (code: string) => void;
  onBack: () => void;
}

export default function JoinMeeting({ onJoin, onBack }: JoinMeetingProps) {
  const [meetingCode, setMeetingCode] = useState('');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (meetingCode.trim()) {
      setIsJoining(true);
      onJoin(meetingCode.trim().toUpperCase());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && meetingCode.trim()) {
      handleJoin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="max-w-6xl w-full">
          <button
            onClick={onBack}
            className="flex items-center gap-3 text-gray-600 hover:text-gray-900 mb-8 transition-all duration-200 group hover:-translate-x-1"
          >
            <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-semibold text-lg">Back to home</span>
          </button>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Video Preview */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700">
                <div className="aspect-video bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center relative overflow-hidden">
                  {/* Animated particles */}
                  <div className="absolute inset-0">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 2}s`,
                          animationDuration: `${2 + Math.random() * 2}s`
                        }}
                      />
                    ))}
                  </div>

                  {videoEnabled ? (
                    <div className="text-white text-center z-10 relative">
                      <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                        <UserCheck className="h-16 w-16" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Camera Preview</h3>
                      <p className="text-blue-100 text-lg">You look amazing! Ready to join?</p>
                    </div>
                  ) : (
                    <div className="text-white text-center z-10 relative">
                      <VideoOff className="h-20 w-20 mx-auto mb-6 opacity-60" />
                      <h3 className="text-2xl font-bold mb-2">Camera is off</h3>
                      <p className="text-blue-100">Enable camera to see preview</p>
                    </div>
                  )}
                </div>
                
                {/* Controls */}
                <div className="p-6 bg-gray-800/50 backdrop-blur-sm">
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setVideoEnabled(!videoEnabled)}
                      className={`group relative p-4 rounded-2xl transition-all duration-300 ${
                        videoEnabled 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white shadow-lg' 
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/25'
                      }`}
                    >
                      {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                        {videoEnabled ? 'Turn off camera' : 'Turn on camera'}
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setAudioEnabled(!audioEnabled)}
                      className={`group relative p-4 rounded-2xl transition-all duration-300 ${
                        audioEnabled 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white shadow-lg' 
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/25'
                      }`}
                    >
                      {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                        {audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                      </div>
                    </button>
                    
                    <button className="group relative p-4 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl transition-all duration-300 shadow-lg">
                      <Settings className="h-6 w-6" />
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Settings
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Premium Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-2xl font-bold text-sm shadow-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Premium Quality
              </div>
            </div>

            {/* Join Form */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-10 border border-white/50 shadow-2xl">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Video className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-4">
                  Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">connect?</span>
                </h2>
                <p className="text-xl text-gray-600">Enter your details to join the premium movie experience</p>
              </div>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-3">
                    Meeting code
                  </label>
                  <input
                    type="text"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter 6-digit code"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-2xl tracking-widest text-center transition-all duration-200 bg-white/70 backdrop-blur-sm hover:bg-white/90"
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="mt-10 space-y-6">
                <button
                  onClick={handleJoin}
                  disabled={!meetingCode.trim() || isJoining}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-5 px-8 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:hover:translate-y-0 disabled:shadow-lg relative overflow-hidden group"
                >
                  {!isJoining && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  )}
                  {isJoining ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Joining premium meeting...
                    </>
                  ) : (
                    <>
                      <Video className="h-6 w-6" />
                      Join Premium Meeting
                    </>
                  )}
                </button>
                
                <p className="text-center text-gray-500">
                  Don't have a meeting code? 
                  <button 
                    onClick={onBack}
                    className="text-blue-600 hover:text-blue-700 font-semibold ml-2 transition-colors"
                  >
                    Create a new meeting
                  </button>
                </p>
              </div>

              {/* Device Status */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Device Status
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                    {videoEnabled ? (
                      <Video className="h-5 w-5 text-green-600" />
                    ) : (
                      <VideoOff className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className={`font-semibold ${videoEnabled ? 'text-green-700' : 'text-red-600'}`}>
                        Camera {videoEnabled ? 'Ready' : 'Off'}
                      </div>
                      <div className="text-sm text-gray-600">HD Quality</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                    {audioEnabled ? (
                      <Mic className="h-5 w-5 text-green-600" />
                    ) : (
                      <MicOff className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className={`font-semibold ${audioEnabled ? 'text-green-700' : 'text-red-600'}`}>
                        Audio {audioEnabled ? 'Ready' : 'Muted'}
                      </div>
                      <div className="text-sm text-gray-600">Crystal Clear</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Features */}
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                {[
                  { icon: Zap, label: '4K Quality' },
                  { icon: Shield, label: 'Secure' },
                  { icon: Sparkles, label: 'Premium' }
                ].map((feature, index) => (
                  <div key={index} className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <feature.icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-gray-700">{feature.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}