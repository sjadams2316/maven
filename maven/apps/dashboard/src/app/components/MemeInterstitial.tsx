'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MemeInterstitialProps {
  destination: string;
  trigger: 'cta' | 'signup' | 'onboarding-complete' | 'random';
  onClose?: () => void;
}

// Meme collections by trigger type
const MEMES = {
  cta: [
    { url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif', caption: "LET'S GOOO 🚀" },
    { url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', caption: 'Hold my beer...' },
    { url: 'https://media.giphy.com/media/3oKIPjzfv0sI2p7fDW/giphy.gif', caption: 'Time to get rich 💰' },
    { url: 'https://media.giphy.com/media/mi6DsSSNKDbUY/giphy.gif', caption: 'Money printer go brrr' },
  ],
  signup: [
    { url: 'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif', caption: 'Welcome to the club 🎉' },
    { url: 'https://media.giphy.com/media/3oz8xAFtqoOUUrsh7W/giphy.gif', caption: 'Big brain moves only' },
  ],
  'onboarding-complete': [
    { url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', caption: "You're officially a Maven 🧙‍♂️" },
    { url: 'https://media.giphy.com/media/l3V0j3ytFyGHqiV7W/giphy.gif', caption: 'Portfolio optimization activated' },
    { url: 'https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif', caption: 'Tax alpha unlocked 💸' },
  ],
  random: [
    { url: 'https://media.giphy.com/media/YnkMcHgNIMW4Yfmjxr/giphy.gif', caption: 'Stonks 📈' },
    { url: 'https://media.giphy.com/media/67ThRZlYBvibtdF9JH/giphy.gif', caption: 'Trust the process' },
  ],
};

export default function MemeInterstitial({ destination, trigger, onClose }: MemeInterstitialProps) {
  const router = useRouter();
  const [show, setShow] = useState(true);
  const [meme, setMeme] = useState<{ url: string; caption: string } | null>(null);

  useEffect(() => {
    // Pick a random meme from the trigger category
    const memeList = MEMES[trigger] || MEMES.random;
    const randomMeme = memeList[Math.floor(Math.random() * memeList.length)];
    setMeme(randomMeme);

    // Auto-redirect after 2.5 seconds
    const timer = setTimeout(() => {
      setShow(false);
      router.push(destination);
      onClose?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [destination, trigger, router, onClose]);

  if (!show || !meme) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center cursor-pointer"
      onClick={() => {
        setShow(false);
        router.push(destination);
        onClose?.();
      }}
    >
      <div className="max-w-md mx-auto text-center px-4">
        <img 
          src={meme.url} 
          alt="meme" 
          className="rounded-2xl shadow-2xl mb-6 max-h-[50vh] mx-auto"
        />
        <p className="text-2xl sm:text-3xl font-bold text-white mb-4">{meme.caption}</p>
        <p className="text-gray-500 text-sm">Click anywhere or wait...</p>
      </div>
    </div>
  );
}

// Hook to trigger meme interstitial
export function useMemeRedirect() {
  const [memeState, setMemeState] = useState<{
    show: boolean;
    destination: string;
    trigger: 'cta' | 'signup' | 'onboarding-complete' | 'random';
  } | null>(null);

  const triggerMeme = (destination: string, trigger: 'cta' | 'signup' | 'onboarding-complete' | 'random' = 'random') => {
    setMemeState({ show: true, destination, trigger });
  };

  const MemeComponent = memeState?.show ? (
    <MemeInterstitial 
      destination={memeState.destination} 
      trigger={memeState.trigger}
      onClose={() => setMemeState(null)}
    />
  ) : null;

  return { triggerMeme, MemeComponent };
}
