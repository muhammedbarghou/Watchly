import { useState, useEffect, useRef } from 'react';
import { useAuth } from './use-auth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { debounce } from 'lodash';

interface VideoState {
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
  lastUpdated: string;
  lastUpdatedBy: string;
}

export function useRoomSync(roomId: string, videoRef: React.RefObject<HTMLVideoElement>) {
  const { currentUser } = useAuth();
  const [videoState, setVideoState] = useState<VideoState>({
    currentTime: 0,
    isPlaying: false,
    playbackRate: 1,
    lastUpdated: new Date().toISOString(),
    lastUpdatedBy: ''
  });

  const isUpdatingRef = useRef(false);
  const lastUpdateTimeRef = useRef<number>(0);
  const updateThreshold = 1000; // 1 second threshold

  const updateState = debounce(async (newState: Partial<VideoState>) => {
    if (!currentUser || !roomId) return;

    const now = Date.now();
    if (now - lastUpdateTimeRef.current < updateThreshold) return;

    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        videoState: {
          ...videoState,
          ...newState,
          lastUpdated: new Date().toISOString(),
          lastUpdatedBy: currentUser.uid
        }
      });

      lastUpdateTimeRef.current = now;
    } catch (err) {
      console.error('Error updating video state:', err);
    }
  }, 100);

  const togglePlayPause = async (p0: boolean) => {
    if (!videoRef.current) return;
    
    const newIsPlaying = !videoState.isPlaying;
    updateState({
      isPlaying: newIsPlaying,
      currentTime: videoRef.current.currentTime
    });
  };

  const seekTo = (time: number) => {
    if (!videoRef.current) return;
    updateState({ currentTime: time });
  };

  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      const data = snapshot.data();
      if (!data?.videoState) return;

      isUpdatingRef.current = true;

      if (data.videoState.lastUpdatedBy !== currentUser?.uid) {
        if (videoRef.current) {
          videoRef.current.currentTime = data.videoState.currentTime;
          
          if (data.videoState.isPlaying) {
            videoRef.current.play();
          } else {
            videoRef.current.pause();
          }
        }
      }

      setVideoState(data.videoState);
      isUpdatingRef.current = false;
    });

    return () => unsubscribe();
  }, [roomId, currentUser]);

  // Sync video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!isUpdatingRef.current) {
        updateState({ currentTime: video.currentTime });
      }
    };

    const handlePlay = () => {
      if (!isUpdatingRef.current) {
        updateState({ isPlaying: true });
      }
    };

    const handlePause = () => {
      if (!isUpdatingRef.current) {
        updateState({ isPlaying: false });
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoRef.current]);

  return {
    videoState,
    togglePlayPause,
    seekTo
  };
}
