import { supabase } from './supabase';
import { CryingSessionData, EmotionType } from '@/contexts/CryingContext';

export interface CryEntry {
  id?: string;
  user_id: string;
  cried_at: string; // ISO string format for database
  emotions: EmotionType;
  feeling_intensity: number;
  thoughts: string;
  recent_smile_thing: string;
  created_at: string;
  updated_at?: string;
}

export class CryingService {
  static async saveCryingSession(
    userId: string,
    sessionData: CryingSessionData
  ): Promise<{ success: boolean; data?: CryEntry; error?: string }> {
    try {
      // Validate session data
      if (!sessionData.criedAt || !sessionData.emotions ||
          sessionData.feelingIntensity === null ||
          !sessionData.recentSmileThing.trim()) {
        return {
          success: false,
          error: 'Incomplete session data'
        };
      }

      // Prepare data for database
      const cryData: Omit<CryEntry, 'id'> = {
        user_id: userId,
        cried_at: sessionData.criedAt.toISOString(),
        emotions: sessionData.emotions,
        feeling_intensity: sessionData.feelingIntensity,
        thoughts: sessionData.thoughts.trim(),
        recent_smile_thing: sessionData.recentSmileThing.trim(),
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('cries')
        .insert(cryData)
        .select()
        .single();

      if (error) {
        console.error('Error saving crying session:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data as CryEntry
      };

    } catch (error) {
      console.error('Unexpected error saving crying session:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  static async getUserCryingSessions(
    userId: string,
    limit: number = 50
  ): Promise<{ success: boolean; data?: CryEntry[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('cries')
        .select('*')
        .eq('user_id', userId)
        .order('cried_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching crying sessions:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data as CryEntry[]
      };

    } catch (error) {
      console.error('Unexpected error fetching crying sessions:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }
}
