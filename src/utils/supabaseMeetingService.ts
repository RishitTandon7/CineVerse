import { supabase } from '../lib/supabase';
import { Movie } from '../types';

export interface MeetingData {
  id: string;
  meeting_code: string;
  host_id: string;
  movie_id: string | null;
  movie_title: string | null;
  movie_thumbnail: string | null;
  is_playing: boolean;
  video_time: number;
  created_at: string;
  expires_at: string;
}

export interface ParticipantData {
  id: string;
  meeting_id: string;
  user_id: string;
  user_name: string;
  is_host: boolean;
  video_enabled: boolean;
  audio_enabled: boolean;
  joined_at: string;
  last_seen_at: string;
}

export interface ChatMessageData {
  id: string;
  meeting_id: string;
  user_id: string;
  user_name: string;
  message: string;
  message_type: 'message' | 'system';
  created_at: string;
}

class SupabaseMeetingService {
  generateMeetingCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createMeeting(userId: string, movie?: Movie): Promise<string | null> {
    try {
      console.log('🎲 Generating meeting code...');
      const meetingCode = this.generateMeetingCode();
      console.log('✅ Meeting code generated:', meetingCode);

      console.log('💾 Inserting meeting into database...', { userId, meetingCode, movie });
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          meeting_code: meetingCode,
          host_id: userId,
          movie_id: movie?.id || null,
          movie_title: movie?.title || null,
          movie_thumbnail: movie?.thumbnail || null,
          is_playing: false,
          video_time: 0,
        })
        .select()
        .single();

      if (meetingError) {
        console.error('❌ Error creating meeting:', meetingError);
        return null;
      }

      console.log('✅ Meeting created in database:', meeting);

      console.log('👤 Fetching user profile...');
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      const userName = profile?.full_name || 'Host';
      console.log('✅ User profile fetched:', userName);

      console.log('👥 Adding host as participant...');
      const { error: participantError } = await supabase
        .from('meeting_participants')
        .insert({
          meeting_id: meeting.id,
          user_id: userId,
          user_name: userName,
          is_host: true,
          video_enabled: true,
          audio_enabled: true,
        });

      if (participantError) {
        console.error('❌ Error adding host as participant:', participantError);
        await supabase.from('meetings').delete().eq('id', meeting.id);
        return null;
      }

      console.log('✅ Host added as participant');
      console.log('🎉 MEETING CREATED SUCCESSFULLY:', meetingCode);
      return meetingCode;
    } catch (error) {
      console.error('❌ Exception in createMeeting:', error);
      return null;
    }
  }

  async joinMeeting(meetingCode: string, userId: string): Promise<MeetingData | null> {
    try {
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('meeting_code', meetingCode.toUpperCase())
        .gt('expires_at', new Date().toISOString())
        .single();

      if (meetingError || !meeting) {
        console.error('Meeting not found:', meetingError);
        return null;
      }

      const { data: existingParticipant } = await supabase
        .from('meeting_participants')
        .select('id')
        .eq('meeting_id', meeting.id)
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingParticipant) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .single();

        const userName = profile?.full_name || 'User';

        const { error: participantError } = await supabase
          .from('meeting_participants')
          .insert({
            meeting_id: meeting.id,
            user_id: userId,
            user_name: userName,
            is_host: false,
            video_enabled: true,
            audio_enabled: true,
          });

        if (participantError) {
          console.error('Error joining meeting:', participantError);
          return null;
        }

        await this.addSystemMessage(meeting.id, `${userName} joined the meeting`);
      }

      return meeting;
    } catch (error) {
      console.error('Error joining meeting:', error);
      return null;
    }
  }

  async getMeeting(meetingCode: string): Promise<MeetingData | null> {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('meeting_code', meetingCode.toUpperCase())
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) {
        console.error('Error getting meeting:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting meeting:', error);
      return null;
    }
  }

  async getMeetingParticipants(meetingId: string): Promise<ParticipantData[]> {
    try {
      const { data, error } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('Error getting participants:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting participants:', error);
      return [];
    }
  }

  async getChatMessages(meetingId: string): Promise<ChatMessageData[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error getting messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  async sendMessage(meetingId: string, userId: string, message: string): Promise<boolean> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      const userName = profile?.full_name || 'User';

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          meeting_id: meetingId,
          user_id: userId,
          user_name: userName,
          message,
          message_type: 'message',
        });

      if (error) {
        console.error('Error sending message:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  async addSystemMessage(meetingId: string, message: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          meeting_id: meetingId,
          user_id: '00000000-0000-0000-0000-000000000000',
          user_name: 'System',
          message,
          message_type: 'system',
        });

      if (error) {
        console.error('Error adding system message:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error adding system message:', error);
      return false;
    }
  }

  async updateParticipant(
    participantId: string,
    updates: Partial<Pick<ParticipantData, 'video_enabled' | 'audio_enabled'>>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('meeting_participants')
        .update(updates)
        .eq('id', participantId);

      if (error) {
        console.error('Error updating participant:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating participant:', error);
      return false;
    }
  }

  async updateMeetingPlayback(
    meetingId: string,
    isPlaying: boolean,
    videoTime: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('meetings')
        .update({
          is_playing: isPlaying,
          video_time: videoTime,
        })
        .eq('id', meetingId);

      if (error) {
        console.error('Error updating meeting playback:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating meeting playback:', error);
      return false;
    }
  }

  async leaveMeeting(meetingId: string, userId: string): Promise<boolean> {
    try {
      const { data: participant } = await supabase
        .from('meeting_participants')
        .select('user_name')
        .eq('meeting_id', meetingId)
        .eq('user_id', userId)
        .maybeSingle();

      if (participant) {
        await this.addSystemMessage(meetingId, `${participant.user_name} left the meeting`);
      }

      const { error } = await supabase
        .from('meeting_participants')
        .delete()
        .eq('meeting_id', meetingId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error leaving meeting:', error);
        return false;
      }

      const { data: remainingParticipants } = await supabase
        .from('meeting_participants')
        .select('id')
        .eq('meeting_id', meetingId);

      if (!remainingParticipants || remainingParticipants.length === 0) {
        await supabase.from('meetings').delete().eq('id', meetingId);
      }

      return true;
    } catch (error) {
      console.error('Error leaving meeting:', error);
      return false;
    }
  }

  subscribeToMeetingChanges(
    meetingId: string,
    onUpdate: (meeting: MeetingData) => void
  ) {
    return supabase
      .channel(`meeting:${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'meetings',
          filter: `id=eq.${meetingId}`,
        },
        (payload) => {
          onUpdate(payload.new as MeetingData);
        }
      )
      .subscribe();
  }

  subscribeToParticipants(
    meetingId: string,
    onInsert: (participant: ParticipantData) => void,
    onUpdate: (participant: ParticipantData) => void,
    onDelete: (participant: ParticipantData) => void
  ) {
    return supabase
      .channel(`participants:${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meeting_participants',
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload) => {
          onInsert(payload.new as ParticipantData);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'meeting_participants',
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload) => {
          onUpdate(payload.new as ParticipantData);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'meeting_participants',
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload) => {
          onDelete(payload.old as ParticipantData);
        }
      )
      .subscribe();
  }

  subscribeToChat(
    meetingId: string,
    onMessage: (message: ChatMessageData) => void
  ) {
    return supabase
      .channel(`chat:${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload) => {
          onMessage(payload.new as ChatMessageData);
        }
      )
      .subscribe();
  }
}

export const supabaseMeetingService = new SupabaseMeetingService();
