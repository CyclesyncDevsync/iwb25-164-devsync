'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MicrophoneIcon,
  StopIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

interface VoiceRecorderProps {
  onVoiceMessage: (audioBlob: Blob, duration: number) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onVoiceMessage,
  isRecording,
  setIsRecording
}) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access denied. Please enable microphone permissions.');
    }
  }, [setIsRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording, setIsRecording]);

  const playRecording = useCallback(() => {
    if (recordedUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [recordedUrl, isPlaying]);

  const sendRecording = useCallback(() => {
    if (recordedBlob) {
      onVoiceMessage(recordedBlob, recordingTime);
      
      // Reset state
      setRecordedBlob(null);
      setRecordedUrl(null);
      setRecordingTime(0);
      setIsPlaying(false);
      
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    }
  }, [recordedBlob, recordingTime, onVoiceMessage, recordedUrl]);

  const cancelRecording = useCallback(() => {
    setRecordedBlob(null);
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }
    setRecordingTime(0);
    setIsPlaying(false);
  }, [recordedUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show recording preview if there's a recorded message
  if (recordedBlob && recordedUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2"
      >
        <audio
          ref={audioRef}
          src={recordedUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
        
        <button
          onClick={playRecording}
          className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          {isPlaying ? (
            <PauseIcon className="w-4 h-4" />
          ) : (
            <PlayIcon className="w-4 h-4" />
          )}
        </button>
        
        <div className="text-sm text-blue-700 dark:text-blue-300">
          {formatTime(recordingTime)}
        </div>
        
        <button
          onClick={sendRecording}
          className="text-sm bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
        >
          Send
        </button>
        
        <button
          onClick={cancelRecording}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancel
        </button>
      </motion.div>
    );
  }

  // Show recording interface
  if (isRecording) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2"
      >
        <motion.button
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          onClick={stopRecording}
          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
        >
          <StopIcon className="w-4 h-4" />
        </motion.button>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-red-700 dark:text-red-300 font-mono">
            {formatTime(recordingTime)}
          </span>
        </div>
        
        <span className="text-xs text-red-600 dark:text-red-400">
          Recording...
        </span>
      </motion.div>
    );
  }

  // Show record button
  return (
    <button
      onClick={startRecording}
      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
      title="Record voice message"
    >
      <MicrophoneIcon className="w-5 h-5" />
    </button>
  );
};

export default VoiceRecorder;
