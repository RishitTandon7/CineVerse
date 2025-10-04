export interface Movie {
  id: number;
  title: string;
  genre: string;
  year: number;
  rating: number;
  duration: string;
  thumbnail: string;
  description: string;
  videoUrl: string;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isHost: boolean;
  joinedAt: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'system';
}

export interface MeetingState {
  id: string;
  movie?: Movie;
  participants: Participant[];
  isPlaying: boolean;
  currentTime: number;
  host: string;
  createdAt: Date;
}

export interface VideoSyncEvent {
  type: 'play' | 'pause' | 'seek';
  currentTime: number;
  timestamp: Date;
}