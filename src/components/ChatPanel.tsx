import React, { useState } from 'react';
import { Send, Users, Smile } from 'lucide-react';

interface Participant {
  id: number;
  name: string;
  avatar: string;
}

interface Message {
  id: number;
  user: string;
  message: string;
  timestamp: string;
  avatar: string;
}

interface ChatPanelProps {
  participants: Participant[];
}

export default function ChatPanel({ participants }: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      user: 'Alex',
      message: 'Hey everyone! Ready for movie night? 🍿',
      timestamp: '8:30 PM',
      avatar: '🍿'
    },
    {
      id: 2,
      user: 'Sarah',
      message: 'So excited! This movie looks amazing',
      timestamp: '8:31 PM',
      avatar: '⭐'
    },
    {
      id: 3,
      user: 'You',
      message: 'Let\'s do this! Hit play in 3... 2... 1...',
      timestamp: '8:32 PM',
      avatar: '🎬'
    }
  ]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        user: 'You',
        message: message.trim(),
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit' 
        }),
        avatar: '🎬'
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-red-400" />
          <h3 className="font-semibold">Watch Party</h3>
          <span className="text-sm text-gray-400">({participants.length})</span>
        </div>
        
        <div className="flex gap-1">
          {participants.map((participant) => (
            <div key={participant.id} className="text-center">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm">
                {participant.avatar}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm flex-shrink-0">
              {msg.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{msg.user}</span>
                <span className="text-xs text-gray-400">{msg.timestamp}</span>
              </div>
              <p className="text-sm text-gray-300">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-red-500 transition-colors"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-600 rounded transition-colors">
              <Smile className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <button
            onClick={sendMessage}
            className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}