import React, { useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBackgroundMusic } from './useBackgroundMusic';
import { toast } from 'sonner';

export function BackgroundMusicPlayer() {
  const { isPlaying, isMuted, play, pause, toggleMute, playbackError } = useBackgroundMusic();

  // Show error toast when playback fails
  useEffect(() => {
    if (playbackError) {
      toast.error('Music could not start. Please press Play again.');
    }
  }, [playbackError]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause();
    } else {
      try {
        await play();
      } catch (error) {
        // Error already logged and state updated in provider
        // Toast will be shown via useEffect above
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-4 py-2 border border-gray-200 z-50">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePlayPause}
        className="rounded-full hover:bg-blue-100"
        title={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-blue-600" />
        ) : (
          <Play className="w-5 h-5 text-blue-600" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="rounded-full hover:bg-blue-100"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-gray-600" />
        ) : (
          <Volume2 className="w-5 h-5 text-blue-600" />
        )}
      </Button>
    </div>
  );
}
