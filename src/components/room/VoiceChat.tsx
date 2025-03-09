

import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  onSnapshot, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp, 
  Timestamp, 
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Mic, 
  MicOff, 
  PhoneCall, 
  PhoneOff, 
  Settings,
  Volume2,
  VolumeX 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

// Import simple-peer
import Peer from 'simple-peer';

// Interfaces
interface RoomUser {
  id: string;
  displayName: string;
  photoURL?: string;
  isHost: boolean;
  joinedAt: Timestamp | null;
  isInVoiceChat?: boolean;
  isMuted?: boolean;
}

interface PeerConnection {
  peerId: string;
  peer: any; // Peer instance from simple-peer
  audioStream?: MediaStream;
}

interface PeerSignal {
  id: string;
  userId: string;
  targetUserId: string;
  signal: any;
  type: 'offer' | 'answer' | 'ice-candidate';
  createdAt: Timestamp | null;
}

interface VoiceChatProps {
  roomId: string;
  documentId: string;
  currentUserId: string;
  currentUserDisplayName: string;
  participants: RoomUser[];
  isHost: boolean;
}

const VoiceChat: React.FC<VoiceChatProps> = ({
  roomId,
  documentId,
  currentUserId,
  currentUserDisplayName,
  participants,
  isHost
}) => {
  // State
  const [voiceChatEnabled, setVoiceChatEnabled] = useState<boolean>(false);
  const [isJoiningVoiceChat, setIsJoiningVoiceChat] = useState<boolean>(false);
  const [isInVoiceChat, setIsInVoiceChat] = useState<boolean>(false);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [peerConnections, setPeerConnections] = useState<PeerConnection[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [signals, setSignals] = useState<PeerSignal[]>([]);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState<string>('');
  const [speakerVolume, setSpeakerVolume] = useState<number>(100);
  const [activeParticipants, setActiveParticipants] = useState<RoomUser[]>([]);
  
  // Refs
  const peersRef = useRef<{[key: string]: any}>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const mediaElementsRef = useRef<{[key: string]: HTMLAudioElement}>({});

  // Check if voice chat is enabled in the room
  useEffect(() => {
    if (!documentId) return;
    
    const roomRef = doc(db, 'rooms', documentId);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.data();
        setVoiceChatEnabled(roomData.voiceChatEnabled === true);
      }
    });
    
    return () => unsubscribe();
  }, [documentId]);

  // Listen for signals
  useEffect(() => {
    if (!documentId || !currentUserId) return;
    
    const signalsRef = collection(db, 'rooms', documentId, 'signals');
    const q = query(signalsRef, where('targetUserId', '==', currentUserId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newSignals: PeerSignal[] = [];
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const signalData = change.doc.data() as PeerSignal;
          signalData.id = change.doc.id;
          newSignals.push(signalData);
        }
      });
      
      if (newSignals.length > 0) {
        setSignals(prev => [...prev, ...newSignals]);
      }
    });
    
    return () => unsubscribe();
  }, [documentId, currentUserId]);

  // Track voice chat participants
  useEffect(() => {
    const voiceChatUsers = participants.filter(p => p.isInVoiceChat);
    setActiveParticipants(voiceChatUsers);
  }, [participants]);

  // Process incoming signals
  useEffect(() => {
    const processSignals = async () => {
      if (!isInVoiceChat || !localStream || signals.length === 0) return;
      
      // Process one signal at a time
      const signal = signals[0];
      
      try {
        if (signal.type === 'offer') {
          // Someone is calling us
          console.log('Received offer from:', signal.userId);
          
          // Check if we already have a connection to this peer
          if (!peersRef.current[signal.userId]) {
            const peer = new Peer({
              initiator: false,
              trickle: false,
              stream: localStream
            });
            
            peer.on('signal', async (data: any) => {
              // Send answer back
              await addDoc(collection(db, 'rooms', documentId, 'signals'), {
                userId: currentUserId,
                targetUserId: signal.userId,
                signal: data,
                type: 'answer',
                createdAt: serverTimestamp()
              });
            });
            
            peer.on('stream', (remoteStream: MediaStream) => {
              // Create or get audio element for this peer
              createAudioElement(signal.userId, remoteStream);
            });
            
            peer.on('error', (err: any) => {
              console.error('Peer error:', err);
              cleanupPeer(signal.userId);
            });
            
            peer.on('close', () => {
              cleanupPeer(signal.userId);
            });
            
            // Signal the peer with the offer
            peer.signal(signal.signal);
            
            // Save the peer
            peersRef.current[signal.userId] = peer;
            setPeerConnections(prev => [...prev, { peerId: signal.userId, peer }]);
          }
        } else if (signal.type === 'answer') {
          // We received an answer to our offer
          console.log('Received answer from:', signal.userId);
          
          const peer = peersRef.current[signal.userId];
          if (peer) {
            peer.signal(signal.signal);
          }
        }
        
        // Delete the processed signal
        await deleteDoc(doc(db, 'rooms', documentId, 'signals', signal.id));
        
        // Remove from state
        setSignals(prev => prev.filter(s => s.id !== signal.id));
      } catch (error) {
        console.error('Error processing signal:', error);
        // Remove the problematic signal
        setSignals(prev => prev.filter(s => s.id !== signal.id));
      }
    };
    
    processSignals();
  }, [signals, isInVoiceChat, localStream, documentId, currentUserId]);

  // Function to create audio element for remote stream
  const createAudioElement = (peerId: string, stream: MediaStream) => {
    // Check if we already have an audio element for this peer
    if (mediaElementsRef.current[peerId]) {
      mediaElementsRef.current[peerId].srcObject = stream;
      return;
    }
    
    // Create new audio element
    const audio = new Audio();
    audio.autoplay = true;
    audio.muted = false;
    audio.srcObject = stream;
    
    // Add to refs
    mediaElementsRef.current[peerId] = audio;
    
    // Set volume
    audio.volume = speakerVolume / 100;
    
    // Start playing
    audio.play().catch(err => console.error('Error playing audio:', err));
  };

  // Cleanup peer connection
  const cleanupPeer = (peerId: string) => {
    if (peersRef.current[peerId]) {
      peersRef.current[peerId].destroy();
      delete peersRef.current[peerId];
    }
    
    if (mediaElementsRef.current[peerId]) {
      mediaElementsRef.current[peerId].pause();
      mediaElementsRef.current[peerId].srcObject = null;
      delete mediaElementsRef.current[peerId];
    }
    
    setPeerConnections(prev => prev.filter(p => p.peerId !== peerId));
  };

  // Toggle voice chat (host only)
  const toggleVoiceChat = async () => {
    if (!documentId || !isHost) return;

    try {
      const newVoiceChatStatus = !voiceChatEnabled;
      setVoiceChatEnabled(newVoiceChatStatus);
      
      // Update room document
      await updateDoc(doc(db, 'rooms', documentId), {
        voiceChatEnabled: newVoiceChatStatus,
        updatedAt: serverTimestamp(),
      });
      
      // Add system message
      await addDoc(collection(db, 'rooms', documentId, 'messages'), {
        text: `Voice chat has been ${newVoiceChatStatus ? 'enabled' : 'disabled'} by the host`,
        sender: 'system',
        senderDisplayName: 'System',
        timestamp: serverTimestamp(),
      });
      
      toast.success(`Voice chat ${newVoiceChatStatus ? 'enabled' : 'disabled'}`);
      
      // If disabling voice chat, disconnect all peers
      if (!newVoiceChatStatus && isInVoiceChat) {
        leaveVoiceChat();
      }
    } catch (error) {
      console.error('Error toggling voice chat:', error);
      toast.error('Failed to toggle voice chat');
    }
  };

  // Join voice chat
  const joinVoiceChat = async () => {
    if (!voiceChatEnabled || isInVoiceChat || !currentUserId || !documentId) return;
    
    setIsJoiningVoiceChat(true);
    
    try {
      // Request microphone access with the selected device or default
      const constraints: MediaStreamConstraints = {
        audio: selectedInputDevice 
          ? { deviceId: { exact: selectedInputDevice } } 
          : true,
        video: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      localStreamRef.current = stream;
      
      // Update user's voice chat status in Firestore
      await updateDoc(doc(db, 'rooms', documentId, 'users', currentUserId), {
        isInVoiceChat: true,
        isMuted: false,
      });
      
      // Add system message
      await addDoc(collection(db, 'rooms', documentId, 'messages'), {
        text: `${currentUserDisplayName} joined voice chat`,
        sender: 'system',
        senderDisplayName: 'System',
        timestamp: serverTimestamp(),
      });
      
      setIsInVoiceChat(true);
      setIsMicMuted(false);
      
      // Create WebRTC connections with existing users in voice chat
      for (const user of participants) {
        if (user.id !== currentUserId && user.isInVoiceChat) {
          createPeer(user.id, stream);
        }
      }
      
      toast.success('Joined voice chat');
    } catch (error) {
      console.error('Error joining voice chat:', error);
      toast.error('Failed to access microphone. Please check your permissions.');
    } finally {
      setIsJoiningVoiceChat(false);
    }
  };

  // Leave voice chat
  const leaveVoiceChat = async () => {
    if (!isInVoiceChat || !currentUserId || !documentId) return;
    
    try {
      // Clean up all peer connections
      Object.keys(peersRef.current).forEach(peerId => {
        cleanupPeer(peerId);
      });
      
      // Stop local media stream
      if (localStream) {
        localStream.getTracks().forEach(track => {
          track.stop();
        });
      }
      
      // Update user's voice chat status in Firestore
      await updateDoc(doc(db, 'rooms', documentId, 'users', currentUserId), {
        isInVoiceChat: false,
        isMuted: false,
      });
      
      // Add system message
      await addDoc(collection(db, 'rooms', documentId, 'messages'), {
        text: `${currentUserDisplayName} left voice chat`,
        sender: 'system',
        senderDisplayName: 'System',
        timestamp: serverTimestamp(),
      });
      
      setPeerConnections([]);
      peersRef.current = {};
      setLocalStream(null);
      localStreamRef.current = null;
      setIsInVoiceChat(false);
      
      toast.success('Left voice chat');
    } catch (error) {
      console.error('Error leaving voice chat:', error);
      toast.error('Failed to leave voice chat');
    }
  };

  // Toggle microphone mute
  const toggleMic = async () => {
    if (!isInVoiceChat || !currentUserId || !documentId || !localStream) return;
    
    try {
      const newMuteState = !isMicMuted;
      
      // Mute/unmute local stream tracks
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !newMuteState;
      });
      
      // Update user's mute status in Firestore
      await updateDoc(doc(db, 'rooms', documentId, 'users', currentUserId), {
        isMuted: newMuteState,
      });
      
      setIsMicMuted(newMuteState);
      toast.success(`Microphone ${newMuteState ? 'muted' : 'unmuted'}`);
    } catch (error) {
      console.error('Error toggling microphone:', error);
      toast.error('Failed to toggle microphone');
    }
  };

  // Create a new peer connection
  const createPeer = (targetUserId: string, stream: MediaStream) => {
    try {
      console.log('Creating peer connection to:', targetUserId);
      
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream
      });
      
      peer.on('signal', async (signal: any) => {
        // Send the signal to the other peer
        await addDoc(collection(db, 'rooms', documentId, 'signals'), {
          userId: currentUserId,
          targetUserId: targetUserId,
          signal: signal,
          type: 'offer',
          createdAt: serverTimestamp()
        });
      });
      
      peer.on('stream', (remoteStream: MediaStream) => {
        // Create audio element for the remote stream
        createAudioElement(targetUserId, remoteStream);
      });
      
      peer.on('error', (err: any) => {
        console.error('Peer error:', err);
        cleanupPeer(targetUserId);
      });
      
      peer.on('close', () => {
        cleanupPeer(targetUserId);
      });
      
      peersRef.current[targetUserId] = peer;
      setPeerConnections(prev => [...prev, { peerId: targetUserId, peer }]);
      
      return peer;
    } catch (error) {
      console.error('Error creating peer:', error);
      toast.error('Error establishing voice connection');
      return null;
    }
  };

  // Load audio devices
  const loadAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      setInputDevices(audioInputs);
      
      // If there's a selected device that's not in the list, reset it
      if (selectedInputDevice && !audioInputs.some(d => d.deviceId === selectedInputDevice)) {
        setSelectedInputDevice('');
      }
      
      // If there's no selected device, select the default one
      if (!selectedInputDevice && audioInputs.length > 0) {
        setSelectedInputDevice(audioInputs[0].deviceId);
      }
    } catch (error) {
      console.error('Error loading audio devices:', error);
      toast.error('Could not load audio devices');
    }
  };

  // Change audio device
  const changeAudioDevice = async (deviceId: string) => {
    if (!isInVoiceChat) {
      setSelectedInputDevice(deviceId);
      return;
    }
    
    try {
      // Stop current stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      // Get new stream with selected device
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
        video: false
      });
      
      // Update local stream
      setLocalStream(stream);
      localStreamRef.current = stream;
      
      // Apply mute state
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isMicMuted;
      });
      
      // Replace stream in all peer connections
      Object.values(peersRef.current).forEach(peer => {
        peer.replaceTrack(
          peer.streams[0].getAudioTracks()[0],
          stream.getAudioTracks()[0],
          peer.streams[0]
        );
      });
      
      setSelectedInputDevice(deviceId);
      toast.success('Audio device changed');
    } catch (error) {
      console.error('Error changing audio device:', error);
      toast.error('Failed to change audio device');
    }
  };

  // Change speaker volume
  const changeSpeakerVolume = (value: number[]) => {
    const volume = value[0];
    setSpeakerVolume(volume);
    
    // Apply to all audio elements
    Object.values(mediaElementsRef.current).forEach(audio => {
      audio.volume = volume / 100;
    });
  };

  // Monitor participant changes to create/destroy peer connections
  useEffect(() => {
    if (!isInVoiceChat || !localStream) return;
    
    // Find participants who joined voice chat
    const newVoiceChatUsers = participants.filter(
      p => p.id !== currentUserId && 
      p.isInVoiceChat && 
      !Object.keys(peersRef.current).includes(p.id)
    );
    
    // Create new peer connections for new voice chat users
    newVoiceChatUsers.forEach(user => {
      createPeer(user.id, localStream);
    });
    
    // Find participants who left voice chat
    const leftVoiceChatUsers = Object.keys(peersRef.current).filter(
      peerId => !participants.some(p => p.id === peerId && p.isInVoiceChat)
    );
    
    // Clean up peer connections for users who left
    leftVoiceChatUsers.forEach(peerId => {
      cleanupPeer(peerId);
    });
  }, [participants, isInVoiceChat, localStream, currentUserId]);

  // Settings dialog
  const renderSettings = () => (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Voice Chat Settings</DialogTitle>
          <DialogDescription>
            Configure your microphone and speaker settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Microphone</h4>
            {inputDevices.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {inputDevices.find(d => d.deviceId === selectedInputDevice)?.label || 'Default Microphone'}
                    <Settings className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[250px]">
                  {inputDevices.map(device => (
                    <DropdownMenuItem 
                      key={device.deviceId}
                      onClick={() => changeAudioDevice(device.deviceId)}
                      className="flex justify-between"
                    >
                      <span className="truncate">{device.label}</span>
                      {device.deviceId === selectedInputDevice && (
                        <Check className="h-4 w-4 ml-2" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={loadAudioDevices}
              >
                Load Audio Devices
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Speaker Volume</h4>
            <div className="flex items-center gap-2">
              <VolumeX className="h-4 w-4" />
              <Slider
                value={[speakerVolume]}
                min={0}
                max={100}
                step={1}
                onValueChange={changeSpeakerVolume}
                className="flex-1"
              />
              <Volume2 className="h-4 w-4" />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => setSettingsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-4">
      {/* Voice chat controls */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <PhoneCall className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Voice Chat</h3>
        </div>
        
        {isHost && (
          <Toggle
            pressed={voiceChatEnabled}
            onPressedChange={toggleVoiceChat}
            aria-label="Toggle voice chat"
          >
            {voiceChatEnabled ? 'Enabled' : 'Disabled'}
          </Toggle>
        )}
      </div>
      
      {voiceChatEnabled ? (
        <>
          {/* Voice chat controls */}
          <div className="flex items-center gap-2">
            {isInVoiceChat ? (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isMicMuted ? "outline" : "default"}
                        size="sm"
                        onClick={toggleMic}
                        className="h-8"
                      >
                        {isMicMuted ? (
                          <MicOff className="h-4 w-4 mr-1" />
                        ) : (
                          <Mic className="h-4 w-4 mr-1" />
                        )}
                        {isMicMuted ? 'Unmute' : 'Mute'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isMicMuted ? 'Unmute microphone' : 'Mute microphone'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSettingsOpen(true)}
                        className="h-8 w-8"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Voice chat settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={leaveVoiceChat}
                        className="h-8 ml-auto"
                      >
                        <PhoneOff className="h-4 w-4 mr-1" />
                        Leave
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Leave voice chat</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={joinVoiceChat}
                disabled={isJoiningVoiceChat}
                className="w-full h-8"
              >
                {isJoiningVoiceChat ? (
                  <>Joining...</>
                ) : (
                  <>
                    <PhoneCall className="h-4 w-4 mr-1" />
                    Join Voice Chat
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Voice chat participants */}
          {activeParticipants.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">
                  Participants ({activeParticipants.length})
                </h4>
                
                <ScrollArea className="max-h-[120px]">
                  <div className="space-y-1">
                    {activeParticipants.map(participant => (
                      <div 
                        key={participant.id} 
                        className="flex items-center justify-between p-1.5 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            {participant.photoURL ? (
                              <AvatarImage src={participant.photoURL} alt={participant.displayName} />
                            ) : (
                              <AvatarFallback>
                                {participant.displayName.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className="text-sm font-medium truncate max-w-[100px]">
                            {participant.displayName}
                            {participant.id === currentUserId && ' (You)'}
                          </span>
                        </div>
                        {participant.id !== currentUserId && (
                          <Badge variant={participant.isMuted ? "outline" : "secondary"} className="text-xs">
                            {participant.isMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-2">
          {isHost ? 'Click to enable voice chat' : 'Voice chat is disabled by the host'}
        </div>
      )}
      
      {renderSettings()}
    </div>
  );
};

// Check icon component
const Check = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default VoiceChat;