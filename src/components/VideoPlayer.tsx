import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward, Users, Loader } from 'lucide-react';
import { Movie, VideoSyncEvent } from '../types';

interface VideoPlayerProps {
  movie: Movie;
  onBack: () => void;
  isHost: boolean;
  onVideoSync?: (type: 'play' | 'pause' | 'seek', currentTime: number) => void;
  syncState?: {
    isPlaying: boolean;
    currentTime: number;
  };
  participantCount?: number;
}

export default function VideoPlayer({ 
  movie, 
  onBack, 
  isHost, 
  onVideoSync, 
  syncState,
  participantCount = 1 
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  // Sync with meeting state for non-hosts
  useEffect(() => {
    if (syncState && videoRef.current && !isHost) {
      const video = videoRef.current;
      const timeDiff = Math.abs(video.currentTime - syncState.currentTime);
      
      // Only sync if the difference is significant (more than 2 seconds)
      if (timeDiff > 2) {
        video.currentTime = syncState.currentTime;
        setCurrentTime(syncState.currentTime);
      }
      
      // Sync play/pause state
      if (syncState.isPlaying && video.paused) {
        video.play().catch(console.error);
        setIsPlaying(true);
      } else if (!syncState.isPlaying && !video.paused) {
        video.pause();
        setIsPlaying(false);
      }
    }
  }, [syncState, isHost]);

  const handleVideoAction = useCallback((action: 'play' | 'pause' | 'seek', time?: number) => {
    if (!isHost) return;
    
    const currentVideoTime = time !== undefined ? time : currentTime;
    onVideoSync?.(action, currentVideoTime);
    setLastSyncTime(Date.now());
  }, [isHost, onVideoSync, currentTime]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isHost) {
      if (isPlaying) {
        videoRef.current.pause();
        handleVideoAction('pause');
      } else {
        videoRef.current.play().catch(console.error);
        handleVideoAction('play');
      }
    }
  }, [isHost, isPlaying, handleVideoAction]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      
      // Sync with other participants if host (throttle to every 5 seconds)
      if (isHost && Date.now() - lastSyncTime > 5000) {
        handleVideoAction(isPlaying ? 'play' : 'pause', time);
      }
    }
  }, [isHost, isPlaying, handleVideoAction, lastSyncTime]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setIsBuffering(false);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleWaiting = useCallback(() => {
    setIsBuffering(true);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsBuffering(false);
    setIsLoading(false);
  }, []);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current && isHost) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      handleVideoAction('seek', time);
    }
  }, [isHost, handleVideoAction]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    if (videoRef.current && isHost) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      handleSeek(newTime);
    }
  }, [isHost, duration, currentTime, handleSeek]);

  const changePlaybackRate = useCallback((rate: number) => {
    if (videoRef.current && isHost) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  }, [isHost]);

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target !== document.body) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          skip(-10);
          break;
        case 'ArrowRight':
          skip(10);
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyM':
          toggleMute();
          break;
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyPress);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [togglePlay, skip, toggleFullscreen, toggleMute]);

  return (
    <div 
      ref={containerRef}
      className="relative h-full bg-black group"
      onMouseMove={showControlsTemporarily}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        poster={movie.thumbnail}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onLoadStart={() => setIsLoading(true)}
        onClick={togglePlay}
        preload="metadata"
        playsInline
      >
        <source src={movie.videoUrl} type="video/mp4" />
        <p className="text-white text-center">Your browser doesn't support video playback.</p>
      </video>

      {/* Loading/Buffering Spinner */}
      {(isLoading || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center text-white">
            <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold">
              {isLoading ? 'Loading video...' : 'Buffering...'}
            </p>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-3 text-white hover:text-blue-400 transition-colors bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Back to Meeting</span>
            </button>
            
            <div className="text-right">
              <h3 className="font-bold text-xl text-white">{movie.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span>{movie.genre} • {movie.year}</span>
                <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Users className="h-4 w-4" />
                  <span>{participantCount} watching</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Play Button */}
        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              disabled={!isHost}
              className={`w-24 h-24 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                !isHost ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Play className="h-12 w-12 text-white ml-2" />
            </button>
          </div>
        )}

        {/* Host Controls Indicator */}
        {!isHost && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-yellow-500/20 backdrop-blur-sm text-yellow-300 px-6 py-3 rounded-xl text-center border border-yellow-500/30">
              <p className="font-semibold">Host controls playback</p>
              <p className="text-sm opacity-75">Enjoy the synchronized experience</p>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div 
              className="w-full h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer group/progress"
              onClick={(e) => {
                if (!isHost) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                const newTime = percent * duration;
                handleSeek(newTime);
              }}
            >
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-200 relative"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg"></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                disabled={!isHost}
                className={`p-3 hover:bg-white/20 rounded-full transition-colors ${
                  !isHost ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white" />
                )}
              </button>

              {/* Skip Controls */}
              <button
                onClick={() => skip(-10)}
                disabled={!isHost}
                className={`p-2 hover:bg-white/20 rounded-full transition-colors ${
                  !isHost ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <SkipBack className="h-5 w-5 text-white" />
              </button>

              <button
                onClick={() => skip(10)}
                disabled={!isHost}
                className={`p-2 hover:bg-white/20 rounded-full transition-colors ${
                  !isHost ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <SkipForward className="h-5 w-5 text-white" />
              </button>
              
              {/* Volume Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 text-white" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-white" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                />
              </div>
              
              {/* Time Display */}
              <span className="text-sm text-white font-mono bg-black/30 px-3 py-1 rounded-full">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Playback Rate (Host only) */}
              {isHost && (
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <Settings className="h-5 w-5 text-white" />
                  </button>
                  
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-xl p-3 min-w-[120px]">
                      <p className="text-white text-sm font-semibold mb-2">Speed</p>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`block w-full text-left px-2 py-1 text-sm rounded transition-colors ${
                            playbackRate === rate 
                              ? 'bg-blue-600 text-white' 
                              : 'text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <Maximize className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}