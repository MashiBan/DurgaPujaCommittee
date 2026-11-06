
import React, { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Language } from '../types';

interface StickySpotifyPlayerProps {
  language: Language;
}

export const StickySpotifyPlayer: React.FC<StickySpotifyPlayerProps> = ({
  language,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      setPlaybackError(false);
      try {
        await audio.play();
      } catch (error) {
        console.error('Unable to play the local Dhak audio:', error);
        setPlaybackError(true);
      }
    } else {
      audio.pause();
    }
  };

  return (
    <div
      className="fixed z-40 w-auto max-w-[94vw] pointer-events-auto transition-all duration-500 ease-in-out right-3 md:right-4 bottom-[7rem] md:bottom-20"
    >
      <audio
        ref={audioRef}
        src="/audio/dhak-sound.mp3"
        preload="none"
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setPlaybackError(true);
        }}
      />
      <div className="flex justify-end">
        {playbackError && (
          <span
            role="alert"
            className="absolute right-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-white/95 px-3 py-2 text-xs font-medium text-red-700 shadow-lg"
          >
            {language === 'bn'
              ? 'অডিও চালানো যায়নি'
              : language === 'hi'
              ? 'ऑडियो नहीं चल सका'
              : 'Audio could not be played'}
          </span>
        )}
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={
            isPlaying
              ? language === 'bn'
                ? 'ঢাকের শব্দ বন্ধ করুন'
                : language === 'hi'
                ? 'ढाक की ध्वनि रोकें'
                : 'Pause Dhak sound'
              : language === 'bn'
              ? 'ঢাকের শব্দ চালান'
              : language === 'hi'
              ? 'ढाक की ध्वनि चलाएँ'
              : 'Play Dhak sound'
          }
          aria-pressed={isPlaying}
          title={isPlaying ? 'Pause Dhak sound' : 'Play Dhak sound'}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#1C1917] shadow-lg border border-[#E2DDD3] hover:bg-white active:scale-95 transition-all"
        >
          <span className="w-7 h-7 rounded-full bg-[#1DB954] text-white flex items-center justify-center">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </span>
        </button>
      </div>
    </div>
  );
};

export default StickySpotifyPlayer;
