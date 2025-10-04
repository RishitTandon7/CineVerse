import React, { useState, useEffect } from 'react';
import {
  Video, VideoOff, Mic, MicOff, Phone, Users, MessageSquare,
  Copy, Check, Crown, ArrowLeft, Sparkles
} from 'lucide-react';
import { useSupabaseMeeting } from '../hooks/useSupabaseMeeting';
import { Movie } from '../types';
import MeetingLoadingTransition from './MeetingLoadingTransition';

interface SupabaseMeetingRoomProps {
  meetingCode: string;
  movie?: Movie;
  onLeave: () => void;
}

export default function SupabaseMeetingRoom({ meetingCode, movie, onLeave }: SupabaseMeetingRoomProps) {
  const {
    meeting,
    participants,
    chatMessages,
    currentParticipant,
    loading,
    error,
    sendMessage,
    updateParticipant,
    leaveMeeting,
  } = useSupabaseMeeting(meetingCode);

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showLoadingTransition, setShowLoadingTransition] = useState(true);
  const [confetti, setConfetti] = useState<Array<{id: number, left: number, delay: number, color: string}>>([]);

  useEffect(() => {
    if (currentParticipant) {
      updateParticipant({
        video_enabled: videoEnabled,
        audio_enabled: audioEnabled,
      });
    }
  }, [videoEnabled, audioEnabled, currentParticipant, updateParticipant]);

  const handleLeave = async () => {
    await leaveMeeting();
    onLeave();
  };

  const copyMeetingCode = () => {
    navigator.clipboard.writeText(meetingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  useEffect(() => {
    if (!loading && meeting && currentParticipant) {
      const timer = setTimeout(() => {
        setShowLoadingTransition(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, meeting, currentParticipant]);

  useEffect(() => {
    if (participants.length > 1 && !showLoadingTransition) {
      const newConfetti = Array.from({ length: 30 }, (_, i) => ({
        id: Date.now() + i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: ['bg-cyan-400', 'bg-pink-400', 'bg-yellow-400', 'bg-green-400', 'bg-orange-400'][Math.floor(Math.random() * 5)]
      }));
      setConfetti(newConfetti);
      setTimeout(() => setConfetti([]), 3000);
    }
  }, [participants.length, showLoadingTransition]);

  if (loading || !meeting || !currentParticipant || showLoadingTransition) {
    return <MeetingLoadingTransition onComplete={() => setShowLoadingTransition(false)} />;
  }

  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={onLeave}
            className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-cyan-600 via-blue-600 to-pink-600 animate-gradient-xy flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-float"
            style={{
              width: `${Math.random() * 60 + 20}px`,
              height: `${Math.random() * 60 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 15}s`
            }}
          />
        ))}
      </div>

      {confetti.map(item => (
        <div
          key={item.id}
          className={`absolute w-3 h-3 ${item.color} rounded-full animate-confetti-fall pointer-events-none`}
          style={{
            left: `${item.left}%`,
            animationDelay: `${item.delay}s`
          }}
        />
      ))}
      {/* Header */}
      <div className="relative z-10 bg-black/30 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-white/20">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLeave}
            className="text-white hover:text-blue-300 transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className="text-white font-bold text-xl">
            {meeting.movie_title || 'Movie Meeting'}
          </h1>

          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-sm px-5 py-2.5 rounded-full border-2 border-yellow-400/30 animate-glow-pulse">
            <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
            <span className="text-yellow-200 text-sm font-bold">Meeting ID:</span>
            <span className="text-white font-mono font-black text-lg tracking-wider">{meetingCode}</span>
            <button
              onClick={copyMeetingCode}
              className="text-yellow-300 hover:text-white transition-all duration-300 ml-2 hover:scale-110 active:scale-95"
            >
              {copied ? <Check className="h-4 w-4 animate-elastic-bounce" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-blue-200 text-sm">{participants.length} participants</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-2 gap-6 h-full">
            {participants.map((participant) => (
              <ParticipantVideo key={participant.id} participant={participant} />
            ))}
          </div>
        </div>

        {/* Chat Sidebar */}
        {chatOpen && (
          <div className="w-80 bg-black/30 backdrop-blur-xl border-l border-white/20 animate-slide-up">
            <ChatSidebar
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
            />
          </div>
        )}

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-64 bg-black/30 backdrop-blur-xl border-l border-white/20 animate-slide-up">
            <ParticipantsSidebar participants={participants} />
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 bg-black/30 backdrop-blur-xl px-8 py-6 border-t border-white/20">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg ${
              audioEnabled
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white animate-pulse-scale'
                : 'bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white'
            }`}
          >
            {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </button>

          <button
            onClick={() => setVideoEnabled(!videoEnabled)}
            className={`p-5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg ${
              videoEnabled
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white animate-pulse-scale'
                : 'bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white'
            }`}
          >
            {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </button>

          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`p-5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg ${
              chatOpen
                ? 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <MessageSquare className="h-6 w-6" />
          </button>

          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`p-5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg ${
              showParticipants
                ? 'bg-gradient-to-br from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Users className="h-6 w-6" />
          </button>

          <button
            onClick={handleLeave}
            className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 p-5 rounded-full text-white transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg shadow-red-500/50"
          >
            <Phone className="h-6 w-6 rotate-[135deg]" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ParticipantVideo({ participant }: { participant: any }) {
  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500 rounded-2xl opacity-75 group-hover:opacity-100 blur-sm group-hover:blur transition-all duration-300"></div>
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden border-2 border-white/10">
        <div className="aspect-video bg-gradient-to-br from-cyan-600 via-blue-600 to-pink-600 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${Math.random() * 5 + 10}s`
                }}
              />
            ))}
          </div>

          {participant.video_enabled ? (
            <div className="text-white text-center z-10 animate-fade-in">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl animate-pulse-scale border-4 border-white/30">
                <span className="text-4xl">👤</span>
              </div>
              <p className="text-base font-bold opacity-90 drop-shadow-lg">Camera active</p>
            </div>
          ) : (
            <div className="text-white text-center z-10 animate-fade-in">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/20">
                <VideoOff className="h-12 w-12 opacity-60" />
              </div>
              <p className="text-base font-bold opacity-75">Camera off</p>
            </div>
          )}

          <div className="absolute top-4 right-4 flex gap-2">
            {participant.audio_enabled ? (
              <div className="bg-green-500 p-2 rounded-full animate-pulse shadow-lg">
                <Mic className="h-4 w-4 text-white" />
              </div>
            ) : (
              <div className="bg-red-600 p-2 rounded-full shadow-lg">
                <MicOff className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="bg-gradient-to-r from-cyan-500/80 to-blue-600/80 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm flex items-center gap-2 border border-white/20 shadow-lg animate-slide-up">
              <span className="font-bold">{participant.user_name}</span>
              {participant.is_host && (
                <Crown className="h-4 w-4 text-yellow-300 animate-bounce-gentle" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatSidebar({
  messages,
  onSendMessage,
  newMessage,
  setNewMessage
}: any) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-white/20 bg-gradient-to-r from-cyan-500/20 to-blue-600/20">
        <h3 className="text-white font-black text-xl flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-cyan-300 animate-bounce-gentle" />
          Chat
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: any, index: number) => (
          <div
            key={message.id}
            className="text-sm animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`font-bold text-sm px-3 py-1 rounded-full ${
                message.message_type === 'system'
                  ? 'bg-yellow-500/20 text-yellow-300'
                  : 'bg-cyan-500/20 text-cyan-300'
              }`}>
                {message.user_name}
              </span>
              <span className="text-gray-400 text-xs">
                {new Date(message.created_at).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <p className="text-white leading-relaxed bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
              {message.message}
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/20">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder-gray-400 backdrop-blur-sm"
          />
          <button
            onClick={onSendMessage}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-6 py-3 rounded-xl text-white font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function ParticipantsSidebar({ participants }: any) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-white/20 bg-gradient-to-r from-orange-500/20 to-pink-600/20">
        <h3 className="text-white font-black text-xl flex items-center gap-2">
          <Users className="h-6 w-6 text-orange-300 animate-bounce-gentle" />
          Participants ({participants.length})
        </h3>
      </div>

      <div className="p-4 space-y-3">
        {participants.map((participant: any, index: number) => (
          <div
            key={participant.id}
            className="flex items-center gap-4 p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 animate-slide-up backdrop-blur-sm"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg animate-pulse-scale">
              <span className="text-white text-lg">👤</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">{participant.user_name}</span>
                {participant.is_host && (
                  <Crown className="h-4 w-4 text-yellow-300 animate-bounce-gentle" />
                )}
              </div>
              <div className="flex gap-2 mt-1">
                {participant.video_enabled ? (
                  <div className="flex items-center gap-1 text-xs text-green-400 font-medium">
                    <Video className="h-3 w-3" />
                    Video
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-red-400 font-medium">
                    <VideoOff className="h-3 w-3" />
                    No video
                  </div>
                )}
                {participant.audio_enabled ? (
                  <div className="flex items-center gap-1 text-xs text-green-400 font-medium">
                    <Mic className="h-3 w-3" />
                    Audio
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-red-400 font-medium">
                    <MicOff className="h-3 w-3" />
                    Muted
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
