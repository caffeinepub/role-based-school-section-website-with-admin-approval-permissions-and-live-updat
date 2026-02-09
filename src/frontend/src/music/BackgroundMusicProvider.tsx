import React, { createContext, useState, useRef, useEffect } from 'react';
import { RELAXING_INSTRUMENTAL_PATH } from './audioSources';
import { loadMusicPreferences, saveMusicPreferences } from './musicPreferences';

interface BackgroundMusicContextType {
  isPlaying: boolean;
  isMuted: boolean;
  play: () => Promise<void>;
  pause: () => void;
  toggleMute: () => void;
  playbackError: string | null;
}

export const BackgroundMusicContext = createContext<BackgroundMusicContextType | null>(null);

export function BackgroundMusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio(RELAXING_INSTRUMENTAL_PATH);
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    // Load saved preferences
    const prefs = loadMusicPreferences();
    setIsMuted(prefs.muted);
    audio.muted = prefs.muted;

    // Track real playback state via events
    const handlePlay = () => {
      setIsPlaying(true);
      setPlaybackError(null);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleError = (e: ErrorEvent) => {
      console.error('Audio playback error:', e);
      setIsPlaying(false);
      setPlaybackError('Audio failed to load or play');
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as any);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as any);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const play = async () => {
    if (!audioRef.current) return;
    
    try {
      // Attempt to play immediately as part of user interaction
      await audioRef.current.play();
      saveMusicPreferences({ enabled: true, muted: isMuted });
    } catch (error: any) {
      console.error('Failed to start playback:', error);
      setIsPlaying(false);
      setPlaybackError('Could not start playback');
      throw error;
    }
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    saveMusicPreferences({ enabled: false, muted: isMuted });
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioRef.current.muted = newMuted;
    saveMusicPreferences({ enabled: isPlaying, muted: newMuted });
  };

  return (
    <BackgroundMusicContext.Provider
      value={{
        isPlaying,
        isMuted,
        play,
        pause,
        toggleMute,
        playbackError,
      }}
    >
      {children}
    </BackgroundMusicContext.Provider>
  );
}
