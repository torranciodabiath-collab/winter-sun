import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  RoomState,
  UserProfile,
  LocalPlaybackSettings,
  ChatMessage,
  RemoteMode
} from '../types';
import { DEMO_PREVIEW_ROOM, CUTE_AVATARS, FEATURED_SAMPLE_VIDEOS } from '../data/mockData';

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

interface RoomContextType {
  room: RoomState | null;
  currentUser: UserProfile;
  localSettings: LocalPlaybackSettings;
  isConnected: boolean;
  latencyMs: number;
  toastMessage: string | null;
  floatingReactions: FloatingReaction[];
  hasRemoteControl: boolean;
  canControlPlayback: boolean;
  createRoom: (options: {
    name: string;
    hostName: string;
    hostAvatar: string;
    passcode?: string;
    video?: any;
  }) => Promise<void>;
  joinRoom: (roomCode: string, user: UserProfile) => Promise<void>;
  leaveRoom: () => void;
  loadDemoRoom: () => void;
  sendPlaybackSync: (currentTime: number, isPlaying: boolean) => void;
  passRemote: (toUserId: string, toUserName: string) => void;
  setRemoteMode: (mode: RemoteMode) => void;
  sendChatMessage: (text: string) => void;
  sendReaction: (emoji: string) => void;
  loadMedia: (mediaPayload: {
    title: string;
    sourceUrl: string;
    type: 'preset' | 'torrent' | 'local';
    magnetUri?: string;
    audioTrack?: string;
    duration?: number;
  }) => void;
  updateSettings: (partial: Partial<RoomState>) => void;
  updateLocalSettings: (partial: Partial<LocalPlaybackSettings>) => void;
  setCurrentUser: (user: UserProfile) => void;
  copyInviteLink: () => void;
  showToast: (msg: string) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check URL params for quick join link e.g. ?join=DATE-NIGHT-8821 or ?room=...
  const initialRoomCode = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('join') ||
      new URLSearchParams(window.location.search).get('room')
    : null;

  // Initial user
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('syncstream_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      id: 'user-' + Math.floor(1000 + Math.random() * 9000),
      name: 'Cozy Host',
      avatarUrl: '🐱',
      isHost: true
    };
  });

  // Current active room (null = in Lobby)
  const [room, setRoom] = useState<RoomState | null>(null);

  const [localSettings, setLocalSettings] = useState<LocalPlaybackSettings>({
    subDelayMs: 0,
    subPalette: 'pink',
    subSize: 'md',
    subFontBlur: true,
    audioVolume: 0.85,
    isMuted: false,
    bluetoothDelayMs: 0,
    playbackSpeed: 1.0,
    floatChatOnScreen: true
  });

  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [latencyMs, setLatencyMs] = useState<number>(12);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3800);
  }, []);

  // Check if current user has remote control
  const hasRemoteControl = Boolean(
    room &&
      (room.remoteMode === 'shared' ||
        room.remoteHolderId === currentUser.id ||
        room.hostId === currentUser.id)
  );

  const canControlPlayback = hasRemoteControl;

  // Save user profile
  useEffect(() => {
    localStorage.setItem('syncstream_user_profile', JSON.stringify(currentUser));
  }, [currentUser]);

  // Handle incoming broadcast from server/WebSocket or local tabs
  const handleIncomingSync = useCallback(
    (type: string, payload: any) => {
      switch (type) {
        case 'ROOM_SYNC':
          setRoom(payload);
          break;

        case 'PLAYBACK_SYNC':
          setRoom((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              video: {
                ...prev.video,
                currentTime: payload.currentTime,
                isPlaying: payload.isPlaying,
                lastUpdate: Date.now()
              }
            };
          });
          break;

        case 'REMOTE_UPDATED':
          setRoom((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              remoteHolderId: payload.remoteHolderId,
              remoteHolderName: payload.remoteHolderName,
              members: payload.members || prev.members,
              messages: payload.systemMessage
                ? [...prev.messages, payload.systemMessage]
                : prev.messages
            };
          });
          showToast(`Remote passed to ${payload.remoteHolderName} 🎮`);
          break;

        case 'CHAT_MESSAGE':
          setRoom((prev) => {
            if (!prev) return null;
            if (prev.messages.some((m) => m.id === payload.id)) return prev;
            return {
              ...prev,
              messages: [...prev.messages, payload]
            };
          });
          break;

        case 'REACTION_BURST':
          triggerReactionAnimation(payload.emoji);
          setRoom((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              reactions: {
                ...prev.reactions,
                [payload.emoji]: payload.count || (prev.reactions[payload.emoji] || 0) + 1
              }
            };
          });
          break;

        case 'MEDIA_CHANGED':
          setRoom((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              video: {
                ...prev.video,
                ...payload.video,
                currentTime: 0,
                isPlaying: false
              },
              messages: payload.systemMessage
                ? [...prev.messages, payload.systemMessage]
                : prev.messages
            };
          });
          showToast(`Now playing: ${payload.video.title} ✨`);
          break;

        case 'ROOM_SETTINGS_UPDATED':
          setRoom((prev) => (prev ? { ...prev, ...payload } : null));
          break;
      }
    },
    [showToast]
  );

  // Setup BroadcastChannel for cross-tab sync when room changes
  useEffect(() => {
    if (!room) return;
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(`syncstream_${room.id}`);
      bcRef.current = bc;
      bc.onmessage = (event) => {
        const { type, payload, senderUserId } = event.data;
        if (senderUserId === currentUser.id) return;
        handleIncomingSync(type, payload);
      };
      return () => {
        bc.close();
      };
    }
  }, [room?.id, currentUser.id, handleIncomingSync]);

  // Setup WebSocket connection when room changes
  useEffect(() => {
    if (!room) return;
    let reconnectTimeout: any;

    const connect = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setLatencyMs(Math.floor(10 + Math.random() * 8));
          ws.send(
            JSON.stringify({
              type: 'JOIN_ROOM',
              roomId: room.id,
              payload: {
                user: currentUser
              }
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleIncomingSync(data.type, data.payload);
          } catch (e) {}
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connect, 4000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (e) {
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [room?.id, currentUser, handleIncomingSync]);

  const dispatchSync = (type: string, payload: any) => {
    if (!room) return;

    // 1. WebSocket
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type,
            roomId: room.id,
            payload
          })
        );
      }
    } catch (e) {}

    // 2. BroadcastChannel
    try {
      if (bcRef.current) {
        bcRef.current.postMessage({
          type,
          payload,
          senderUserId: currentUser.id
        });
      }
    } catch (e) {}
  };

  // Create Room
  const createRoom = async (options: {
    name: string;
    hostName: string;
    hostAvatar: string;
    passcode?: string;
    video?: any;
  }) => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      if (res.ok) {
        const createdRoom: RoomState = await res.json();
        setRoom(createdRoom);
        setCurrentUser((prev) => ({
          ...prev,
          name: options.hostName,
          avatarUrl: options.hostAvatar,
          isHost: true
        }));
        showToast(`Created room "${createdRoom.name}"! Code: ${createdRoom.id} 💕`);
      } else {
        throw new Error('Server error');
      }
    } catch (e) {
      // Fallback local room creation
      const roomId = (options.passcode || 'ROOM-' + Math.floor(1000 + Math.random() * 9000)).toUpperCase();
      const newRoom: RoomState = {
        id: roomId,
        name: options.name || 'My Cozy Theater',
        hostId: currentUser.id,
        hostName: options.hostName,
        passcode: roomId,
        remoteMode: 'shared',
        remoteHolderId: currentUser.id,
        remoteHolderName: options.hostName,
        privacy: 'couples_only',
        snackPause: true,
        gentleAudio: true,
        bandwidthTier: 'Ultra Smooth (Fastest) ✨',
        video: options.video || {
          title: FEATURED_SAMPLE_VIDEOS[0].title,
          sourceUrl: FEATURED_SAMPLE_VIDEOS[0].sourceUrl,
          type: 'preset',
          audioTrack: 'Original Cinema 5.1',
          duration: FEATURED_SAMPLE_VIDEOS[0].duration,
          currentTime: 0,
          isPlaying: false,
          lastUpdate: Date.now(),
          quality: '1080p Stream'
        },
        messages: [
          {
            id: 'sys-0',
            senderId: 'system',
            senderName: 'System',
            avatarUrl: '',
            text: `Welcome to ${options.name}! Share code ${roomId} with your partner.`,
            time: 'Just now',
            isSystem: true
          }
        ],
        reactions: { '🍿': 0, '💖': 0, '🥺': 0, '✨': 0, '🐱': 0, '😂': 0 },
        members: [
          {
            id: currentUser.id,
            name: options.hostName,
            avatarUrl: options.hostAvatar,
            role: 'host',
            hasRemote: true,
            status: 'watching'
          }
        ]
      };
      setRoom(newRoom);
      showToast(`Created room "${newRoom.name}"! Code: ${roomId} 💕`);
    }
  };

  // Join Room
  const joinRoom = async (roomCode: string, user: UserProfile) => {
    const cleanCode = roomCode.toUpperCase().trim();
    try {
      const res = await fetch(`/api/rooms/${cleanCode}`);
      if (res.ok) {
        const fetchedRoom: RoomState = await res.json();
        // Add current user to members if not present
        if (!fetchedRoom.members.some((m) => m.id === user.id)) {
          fetchedRoom.members.push({
            id: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl,
            role: 'partner',
            hasRemote: fetchedRoom.remoteMode === 'shared',
            status: 'watching'
          });
        }
        setRoom(fetchedRoom);
        showToast(`Joined room "${fetchedRoom.name}"! 🍿`);
        return;
      }
    } catch (e) {}

    // If room not found on server or network error, create/join room with that code
    const joinedRoom: RoomState = {
      id: cleanCode,
      name: `${cleanCode} Cozy Theater`,
      hostId: 'host-auto',
      hostName: 'Partner',
      passcode: cleanCode,
      remoteMode: 'shared',
      remoteHolderId: user.id,
      remoteHolderName: user.name,
      privacy: 'couples_only',
      snackPause: true,
      gentleAudio: true,
      bandwidthTier: 'Ultra Smooth (Fastest) ✨',
      video: {
        title: FEATURED_SAMPLE_VIDEOS[0].title,
        sourceUrl: FEATURED_SAMPLE_VIDEOS[0].sourceUrl,
        type: 'preset',
        audioTrack: 'Stereo',
        duration: FEATURED_SAMPLE_VIDEOS[0].duration,
        currentTime: 0,
        isPlaying: false,
        lastUpdate: Date.now(),
        quality: '1080p Stream'
      },
      messages: [
        {
          id: 'sys-joined',
          senderId: 'system',
          senderName: 'System',
          avatarUrl: '',
          text: `${user.name} joined the movie date! 💖`,
          time: 'Just now',
          isSystem: true
        }
      ],
      reactions: { '🍿': 0, '💖': 0, '🥺': 0, '✨': 0, '🐱': 0, '😂': 0 },
      members: [
        {
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          role: 'partner',
          hasRemote: true,
          status: 'watching'
        }
      ]
    };
    setRoom(joinedRoom);
    showToast(`Joined room ${cleanCode}! 🍿`);
  };

  // Leave room and return to Lobby
  const leaveRoom = () => {
    setRoom(null);
    showToast('Left room. Welcome back to the lobby! ✨');
  };

  // Load Alex & Maya Demo Room
  const loadDemoRoom = () => {
    setRoom({ ...DEMO_PREVIEW_ROOM, video: { ...DEMO_PREVIEW_ROOM.video, currentTime: 0, isPlaying: false } });
    showToast('Loaded demo preview room! 🎬');
  };

  const sendPlaybackSync = (currentTime: number, isPlaying: boolean) => {
    if (!room) return;
    setRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        video: {
          ...prev.video,
          currentTime,
          isPlaying,
          lastUpdate: Date.now()
        }
      };
    });
    dispatchSync('PLAYBACK_SYNC', { currentTime, isPlaying });
  };

  const passRemote = (toUserId: string, toUserName: string) => {
    if (!room) return;
    const updatedMembers = room.members.map((m) => ({
      ...m,
      hasRemote: m.id === toUserId
    }));
    const sysMsg: ChatMessage = {
      id: 'sys-' + Date.now(),
      senderId: 'system',
      senderName: 'System',
      avatarUrl: '',
      text: `Remote passed to ${toUserName} 📱`,
      time: 'Just now',
      isSystem: true
    };

    setRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        remoteHolderId: toUserId,
        remoteHolderName: toUserName,
        members: updatedMembers,
        messages: [...prev.messages, sysMsg]
      };
    });

    dispatchSync('PASS_REMOTE', {
      toUserId,
      toUserName,
      members: updatedMembers
    });
    showToast(`Remote given to ${toUserName} ✨`);
  };

  const setRemoteMode = (mode: RemoteMode) => {
    if (!room) return;
    const updatedMembers = room.members.map((m) => ({
      ...m,
      hasRemote: mode === 'shared' || m.id === room.remoteHolderId
    }));
    setRoom((prev) => (prev ? { ...prev, remoteMode: mode, members: updatedMembers } : null));
    dispatchSync('CHANGE_REMOTE_MODE', { mode });
    showToast(
      `Remote control mode: ${
        mode === 'shared'
          ? 'Shared (Both can pause)'
          : mode === 'turn_taking'
          ? 'Take Turns'
          : 'Host Curated'
      }`
    );
  };

  const sendChatMessage = (text: string) => {
    if (!room || !text.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now() + Math.random().toString(36).slice(2, 6),
      senderId: currentUser.id,
      senderName: currentUser.name,
      avatarUrl: currentUser.avatarUrl,
      text: text.trim(),
      time: timeStr
    };

    setRoom((prev) => (prev ? { ...prev, messages: [...prev.messages, newMsg] } : null));
    dispatchSync('CHAT_MESSAGE', newMsg);
  };

  const triggerReactionAnimation = (emoji: string) => {
    const newReaction: FloatingReaction = {
      id: 'react-' + Date.now() + Math.random(),
      emoji,
      x: 10 + Math.random() * 80
    };
    setFloatingReactions((prev) => [...prev.slice(-12), newReaction]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 1500);
  };

  const sendReaction = (emoji: string) => {
    if (!room) return;
    triggerReactionAnimation(emoji);
    setRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        reactions: {
          ...prev.reactions,
          [emoji]: (prev.reactions[emoji] || 0) + 1
        }
      };
    });
    dispatchSync('REACTION', {
      emoji,
      senderName: currentUser.name
    });
  };

  const loadMedia = (mediaPayload: {
    title: string;
    sourceUrl: string;
    type: 'preset' | 'torrent' | 'local';
    magnetUri?: string;
    audioTrack?: string;
    duration?: number;
  }) => {
    if (!room) return;
    const sysMsg: ChatMessage = {
      id: 'sys-' + Date.now(),
      senderId: 'system',
      senderName: 'System',
      avatarUrl: '',
      text: `Queued movie: ${mediaPayload.title} 🎬`,
      time: 'Just now',
      isSystem: true
    };

    setRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        video: {
          ...prev.video,
          title: mediaPayload.title,
          sourceUrl: mediaPayload.sourceUrl,
          type: mediaPayload.type,
          magnetUri: mediaPayload.magnetUri,
          audioTrack: mediaPayload.audioTrack || prev.video.audioTrack,
          duration: mediaPayload.duration || prev.video.duration,
          currentTime: 0,
          isPlaying: false,
          lastUpdate: Date.now()
        },
        messages: [...prev.messages, sysMsg]
      };
    });

    dispatchSync('LOAD_MEDIA', {
      ...mediaPayload,
      systemMessage: sysMsg
    });
    showToast(`Loaded "${mediaPayload.title}" for stream!`);
  };

  const updateSettings = (partial: Partial<RoomState>) => {
    setRoom((prev) => (prev ? { ...prev, ...partial } : null));
    dispatchSync('UPDATE_ROOM_SETTINGS', partial);
    showToast('Room preferences saved! 💕');
  };

  const updateLocalSettings = (partial: Partial<LocalPlaybackSettings>) => {
    setLocalSettings((prev) => ({
      ...prev,
      ...partial
    }));
  };

  const copyInviteLink = () => {
    if (!room) return;
    const inviteUrl = `${window.location.origin}/?join=${room.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
    }
    showToast(`Invite link copied: ${inviteUrl} 💕`);
  };

  return (
    <RoomContext.Provider
      value={{
        room,
        currentUser,
        localSettings,
        isConnected,
        latencyMs,
        toastMessage,
        floatingReactions,
        hasRemoteControl,
        canControlPlayback,
        createRoom,
        joinRoom,
        leaveRoom,
        loadDemoRoom,
        sendPlaybackSync,
        passRemote,
        setRemoteMode,
        sendChatMessage,
        sendReaction,
        loadMedia,
        updateSettings,
        updateLocalSettings,
        setCurrentUser,
        copyInviteLink,
        showToast
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};
