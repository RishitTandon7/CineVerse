import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabaseMeetingService, MeetingData, ParticipantData, ChatMessageData } from '../utils/supabaseMeetingService';
import { Movie } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useSupabaseMeeting = (meetingCode?: string) => {
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<MeetingData | null>(null);
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessageData[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState<ParticipantData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadMeetingData = useCallback(async (code: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const meetingData = await supabaseMeetingService.getMeeting(code);

      if (!meetingData) {
        setError('Meeting not found or expired');
        setLoading(false);
        return;
      }

      setMeeting(meetingData);

      const participantsData = await supabaseMeetingService.getMeetingParticipants(meetingData.id);
      setParticipants(participantsData);

      const currentP = participantsData.find(p => p.user_id === user.id);
      setCurrentParticipant(currentP || null);

      const messages = await supabaseMeetingService.getChatMessages(meetingData.id);
      setChatMessages(messages);

      setError(null);
    } catch (err) {
      console.error('Error loading meeting:', err);
      setError('Failed to load meeting');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (meetingCode && user) {
      loadMeetingData(meetingCode);
    }
  }, [meetingCode, user, loadMeetingData]);

  useEffect(() => {
    if (!meeting || !user) return;

    let meetingChannel: RealtimeChannel;
    let participantsChannel: RealtimeChannel;
    let chatChannel: RealtimeChannel;

    meetingChannel = supabaseMeetingService.subscribeToMeetingChanges(
      meeting.id,
      (updatedMeeting) => {
        setMeeting(updatedMeeting);
      }
    );

    participantsChannel = supabaseMeetingService.subscribeToParticipants(
      meeting.id,
      (newParticipant) => {
        setParticipants(prev => {
          if (prev.find(p => p.id === newParticipant.id)) {
            return prev;
          }
          return [...prev, newParticipant];
        });
      },
      (updatedParticipant) => {
        setParticipants(prev =>
          prev.map(p => (p.id === updatedParticipant.id ? updatedParticipant : p))
        );
        if (updatedParticipant.user_id === user.id) {
          setCurrentParticipant(updatedParticipant);
        }
      },
      (deletedParticipant) => {
        setParticipants(prev => prev.filter(p => p.id !== deletedParticipant.id));
      }
    );

    chatChannel = supabaseMeetingService.subscribeToChat(meeting.id, (newMessage) => {
      setChatMessages(prev => {
        if (prev.find(m => m.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    });

    return () => {
      meetingChannel?.unsubscribe();
      participantsChannel?.unsubscribe();
      chatChannel?.unsubscribe();
    };
  }, [meeting, user]);

  const createMeeting = useCallback(async (movie?: Movie): Promise<string | null> => {
    console.log('🎬 CREATE MEETING CALLED', { user: user?.id, movie });

    if (!user) {
      const errorMsg = 'You must be logged in to create a meeting';
      console.error('❌ No user found');
      setError(errorMsg);
      alert(errorMsg);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📞 Calling supabaseMeetingService.createMeeting...');
      const code = await supabaseMeetingService.createMeeting(user.id, movie);
      console.log('✅ Meeting created with code:', code);

      if (!code) {
        const errorMsg = 'Failed to create meeting - no code returned';
        console.error('❌', errorMsg);
        setError(errorMsg);
        alert(errorMsg);
        return null;
      }

      console.log('📥 Loading meeting data for code:', code);
      await loadMeetingData(code);
      console.log('✅ Meeting data loaded successfully');
      return code;
    } catch (err) {
      console.error('❌ Error creating meeting:', err);
      const errorMsg = `Failed to create meeting: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMsg);
      alert(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, loadMeetingData]);

  const joinMeeting = useCallback(async (code: string): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in to join a meeting');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const meetingData = await supabaseMeetingService.joinMeeting(code, user.id);

      if (!meetingData) {
        setError('Meeting not found or expired');
        return false;
      }

      await loadMeetingData(code);
      return true;
    } catch (err) {
      console.error('Error joining meeting:', err);
      setError('Failed to join meeting');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, loadMeetingData]);

  const leaveMeeting = useCallback(async () => {
    if (!meeting || !user) return;

    try {
      await supabaseMeetingService.leaveMeeting(meeting.id, user.id);
      setMeeting(null);
      setParticipants([]);
      setChatMessages([]);
      setCurrentParticipant(null);
    } catch (err) {
      console.error('Error leaving meeting:', err);
      setError('Failed to leave meeting');
    }
  }, [meeting, user]);

  const sendMessage = useCallback(async (message: string): Promise<boolean> => {
    if (!meeting || !user) return false;

    try {
      return await supabaseMeetingService.sendMessage(meeting.id, user.id, message);
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  }, [meeting, user]);

  const updateParticipant = useCallback(async (updates: { video_enabled?: boolean; audio_enabled?: boolean }) => {
    if (!currentParticipant) return;

    try {
      await supabaseMeetingService.updateParticipant(currentParticipant.id, updates);
    } catch (err) {
      console.error('Error updating participant:', err);
    }
  }, [currentParticipant]);

  const syncVideo = useCallback(async (isPlaying: boolean, videoTime: number) => {
    if (!meeting || !currentParticipant?.is_host) return;

    try {
      await supabaseMeetingService.updateMeetingPlayback(meeting.id, isPlaying, videoTime);
    } catch (err) {
      console.error('Error syncing video:', err);
    }
  }, [meeting, currentParticipant]);

  return {
    meeting,
    participants,
    chatMessages,
    currentParticipant,
    error,
    loading,
    createMeeting,
    joinMeeting,
    leaveMeeting,
    sendMessage,
    updateParticipant,
    syncVideo,
  };
};
