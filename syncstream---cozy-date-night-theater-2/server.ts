import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const url = request.url || '';
  if (url.startsWith('/ws')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
  // Allow other upgrade listeners (e.g. Vite HMR) to proceed
});

app.use(express.json());

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatarUrl: string;
  text: string;
  time: string;
  isSystem?: boolean;
}

interface RoomMember {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'host' | 'partner' | 'friend';
  hasRemote: boolean;
  status: 'watching' | 'idle';
  isLocal?: boolean;
}

interface RoomState {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  passcode: string;
  remoteMode: 'shared' | 'turn_taking' | 'host_only';
  remoteHolderId: string;
  remoteHolderName: string;
  privacy: 'couples_only' | 'friends';
  snackPause: boolean;
  gentleAudio: boolean;
  bandwidthTier: string;
  video: {
    title: string;
    type: 'preset' | 'torrent' | 'local';
    sourceUrl: string;
    magnetUri?: string;
    subtitlesUrl?: string;
    audioTrack: string;
    duration: number;
    currentTime: number;
    isPlaying: boolean;
    lastUpdate: number;
    quality: string;
  };
  messages: ChatMessage[];
  reactions: Record<string, number>;
  members: RoomMember[];
}

// In-memory store for rooms
const rooms = new Map<string, RoomState>();

// Prepopulate default cozy room from the design: DATE-NIGHT-8821
const defaultRoom: RoomState = {
  id: 'DATE-NIGHT-8821',
  name: 'Our Friday Movie Marathon 🍿',
  hostId: 'alex-01',
  hostName: 'Alex',
  passcode: 'ALEX-MAYA-COZY',
  remoteMode: 'shared',
  remoteHolderId: 'alex-01',
  remoteHolderName: 'Alex',
  privacy: 'couples_only',
  snackPause: true,
  gentleAudio: true,
  bandwidthTier: 'Ultra Smooth (Fastest) ✨',
  video: {
    title: 'Oceans (Cinematic Nature Film)',
    type: 'preset',
    sourceUrl: '/videos/sample-cinema.mp4',
    magnetUri: 'magnet:?xt=urn:btih:e5832a888c39d49488e0e5a87b7a544f885e3d7a&dn=Oceans+2024+1080p+BluRay',
    audioTrack: 'Original Stereo Master',
    duration: 46,
    currentTime: 0,
    isPlaying: false,
    lastUpdate: Date.now(),
    quality: '1080p BluRay'
  },
  messages: [
    {
      id: 'msg-0',
      senderId: 'alex-01',
      senderName: 'Alex',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXTpOXIlSeFVEicVyDElYFsWIwXg1XsWvBPNR035bjC8Ash8MYlFNa_iNyJER8fpRQLO8f2CQWWWcEKUFPpOFVNX3muGZSUzJm775WFyN4dgxho8J2uQC6wS0NhKpb0YXIVxsVwOIv9H7SGO41Z1nDofNYZnkoGV5VaQqkfvvdNR7oxoK96metMpmtkbB6oJcaBqyWELHBPzAPAKu4j3KfBhU8MQrVk_OE1VnkReizFJVrTNR1VwMJ',
      text: 'Alex synced movie to 00:42:15',
      time: '42:15',
      isSystem: true
    },
    {
      id: 'msg-1',
      senderId: 'maya-02',
      senderName: 'Maya',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO9sSPNmd__nmLAp8mAOHivcoOOF6q2XUMFDqbbPKoQvifG_6VIdpvelBoJnggwm2a0WPNwzYbAjpTyvUb3eNxgg6QL9Zv0eMsQtxwZ2n7esd9B7OWFXUib3txHcczwTLI3liT2Gzc5tQelFiWg5cTtpNJrqkgYPByKGOug18OnOv-IYtL1FxFR6w7kPnSwFzN9aIKmsWIbLmUZDnMRpLyxumx0GxSz1K-aubbqWbuSdrKT1lM7uW6',
      text: 'Grabbed the popcorn! 🍿 Ready for the cute hillside bike ride scene!',
      time: '42:01'
    },
    {
      id: 'msg-2',
      senderId: 'alex-01',
      senderName: 'Alex',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXTpOXIlSeFVEicVyDElYFsWIwXg1XsWvBPNR035bjC8Ash8MYlFNa_iNyJER8fpRQLO8f2CQWWWcEKUFPpOFVNX3muGZSUzJm775WFyN4dgxho8J2uQC6wS0NhKpb0YXIVxsVwOIv9H7SGO41Z1nDofNYZnkoGV5VaQqkfvvdNR7oxoK96metMpmtkbB6oJcaBqyWELHBPzAPAKu4j3KfBhU8MQrVk_OE1VnkReizFJVrTNR1VwMJ',
      text: 'Yay! And I dimmed the room lights too. Look at the twilight colors here! 🌅',
      time: '42:08'
    },
    {
      id: 'msg-3',
      senderId: 'maya-02',
      senderName: 'Maya',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO9sSPNmd__nmLAp8mAOHivcoOOF6q2XUMFDqbbPKoQvifG_6VIdpvelBoJnggwm2a0WPNwzYbAjpTyvUb3eNxgg6QL9Zv0eMsQtxwZ2n7esd9B7OWFXUib3txHcczwTLI3liT2Gzc5tQelFiWg5cTtpNJrqkgYPByKGOug18OnOv-IYtL1FxFR6w7kPnSwFzN9aIKmsWIbLmUZDnMRpLyxumx0GxSz1K-aubbqWbuSdrKT1lM7uW6',
      text: 'Aww this soundtrack is so pretty ✨ That acoustic guitar melody gets me every time 🥺',
      time: '42:15'
    },
    {
      id: 'msg-4',
      senderId: 'maya-02',
      senderName: 'Maya',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO9sSPNmd__nmLAp8mAOHivcoOOF6q2XUMFDqbbPKoQvifG_6VIdpvelBoJnggwm2a0WPNwzYbAjpTyvUb3eNxgg6QL9Zv0eMsQtxwZ2n7esd9B7OWFXUib3txHcczwTLI3liT2Gzc5tQelFiWg5cTtpNJrqkgYPByKGOug18OnOv-IYtL1FxFR6w7kPnSwFzN9aIKmsWIbLmUZDnMRpLyxumx0GxSz1K-aubbqWbuSdrKT1lM7uW6',
      text: "Wait pause 1 sec grabbing a blanket! It's chilly over here 🐈",
      time: 'Just now'
    }
  ],
  reactions: {
    '🍿': 12,
    '💖': 24,
    '🥺': 7,
    '✨': 19,
    '🐱': 6,
    '😂': 8
  },
  members: [
    {
      id: 'alex-01',
      name: 'Alex (Him)',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXTpOXIlSeFVEicVyDElYFsWIwXg1XsWvBPNR035bjC8Ash8MYlFNa_iNyJER8fpRQLO8f2CQWWWcEKUFPpOFVNX3muGZSUzJm775WFyN4dgxho8J2uQC6wS0NhKpb0YXIVxsVwOIv9H7SGO41Z1nDofNYZnkoGV5VaQqkfvvdNR7oxoK96metMpmtkbB6oJcaBqyWELHBPzAPAKu4j3KfBhU8MQrVk_OE1VnkReizFJVrTNR1VwMJ',
      role: 'host',
      hasRemote: true,
      status: 'watching'
    },
    {
      id: 'maya-02',
      name: 'Maya (Her)',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO9sSPNmd__nmLAp8mAOHivcoOOF6q2XUMFDqbbPKoQvifG_6VIdpvelBoJnggwm2a0WPNwzYbAjpTyvUb3eNxgg6QL9Zv0eMsQtxwZ2n7esd9B7OWFXUib3txHcczwTLI3liT2Gzc5tQelFiWg5cTtpNJrqkgYPByKGOug18OnOv-IYtL1FxFR6w7kPnSwFzN9aIKmsWIbLmUZDnMRpLyxumx0GxSz1K-aubbqWbuSdrKT1lM7uW6',
      role: 'partner',
      hasRemote: false,
      status: 'watching'
    }
  ]
};

rooms.set(defaultRoom.id, defaultRoom);

// REST API Endpoints
app.get('/api/rooms/:id', (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room);
});

app.post('/api/rooms', (req, res) => {
  const { name, hostName, hostAvatar, passcode, video, hostId: clientHostId } = req.body;
  const id = (passcode || 'ROOM-' + Math.floor(1000 + Math.random() * 9000)).toUpperCase().trim();
  const hostId = clientHostId || 'user-' + Date.now();
  
  const initialVideo = video || {
    title: 'Oceans (Cinematic Nature Film)',
    type: 'preset',
    sourceUrl: '/videos/sample-cinema.mp4',
    audioTrack: 'Original Stereo Master',
    duration: 46,
    currentTime: 0,
    isPlaying: false,
    lastUpdate: Date.now(),
    quality: '1080p Stream'
  };

  const newRoom: RoomState = {
    id,
    name: name || `${hostName || 'My'}'s Cozy Theater`,
    hostId,
    hostName: hostName || 'Host',
    passcode: id,
    remoteMode: 'shared',
    remoteHolderId: hostId,
    remoteHolderName: hostName || 'Host',
    privacy: 'couples_only',
    snackPause: true,
    gentleAudio: true,
    bandwidthTier: 'Ultra Smooth (Fastest) ✨',
    video: {
      ...initialVideo,
      currentTime: 0,
      isPlaying: false,
      lastUpdate: Date.now()
    },
    messages: [
      {
        id: 'msg-' + Date.now(),
        senderId: 'system',
        senderName: 'System',
        avatarUrl: '',
        text: `Welcome to ${name || 'the cozy theater'}! Invite your partner or friend with code: ${id} 🍿`,
        time: 'Just now',
        isSystem: true
      }
    ],
    reactions: {
      '🍿': 0,
      '💖': 0,
      '🥺': 0,
      '✨': 0,
      '🐱': 0,
      '😂': 0
    },
    members: [
      {
        id: hostId,
        name: hostName || 'Host',
        avatarUrl: hostAvatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXTpOXIlSeFVEicVyDElYFsWIwXg1XsWvBPNR035bjC8Ash8MYlFNa_iNyJER8fpRQLO8f2CQWWWcEKUFPpOFVNX3muGZSUzJm775WFyN4dgxho8J2uQC6wS0NhKpb0YXIVxsVwOIv9H7SGO41Z1nDofNYZnkoGV5VaQqkfvvdNR7oxoK96metMpmtkbB6oJcaBqyWELHBPzAPAKu4j3KfBhU8MQrVk_OE1VnkReizFJVrTNR1VwMJ',
        role: 'host',
        hasRemote: true,
        status: 'watching'
      }
    ]
  };

  rooms.set(id, newRoom);
  res.status(201).json(newRoom);
});

// WebSocket Connection Management
interface ExtendedWebSocket extends WebSocket {
  roomId?: string;
  userId?: string;
}

const broadcastToRoom = (roomId: string, message: any, excludeWs?: WebSocket) => {
  const serialized = JSON.stringify(message);
  wss.clients.forEach((client) => {
    const extClient = client as ExtendedWebSocket;
    if (extClient.roomId === roomId && extClient.readyState === WebSocket.OPEN && extClient !== excludeWs) {
      extClient.send(serialized);
    }
  });
};

wss.on('connection', (ws: ExtendedWebSocket) => {
  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      const { type, roomId, payload } = data;
      if (!roomId) return;

      let room = rooms.get(roomId);
      if (!room && roomId === defaultRoom.id) {
        room = { ...defaultRoom };
        rooms.set(roomId, room);
      }

      switch (type) {
        case 'JOIN_ROOM': {
          ws.roomId = roomId;
          ws.userId = payload.user.id;

          if (room) {
            // Check if member already exists
            const existingIdx = room.members.findIndex((m) => m.id === payload.user.id);
            if (existingIdx >= 0) {
              room.members[existingIdx].status = 'watching';
            } else {
              room.members.push({
                id: payload.user.id,
                name: payload.user.name,
                avatarUrl: payload.user.avatarUrl,
                role: payload.user.role || 'partner',
                hasRemote: room.remoteMode === 'shared',
                status: 'watching'
              });
            }

            // Send initial room snapshot
            ws.send(JSON.stringify({ type: 'ROOM_SYNC', payload: room }));

            // Broadcast member joined
            broadcastToRoom(roomId, {
              type: 'MEMBER_JOINED',
              payload: {
                member: payload.user,
                members: room.members
              }
            }, ws);
          }
          break;
        }

        case 'PLAYBACK_SYNC': {
          if (room) {
            room.video.currentTime = payload.currentTime;
            room.video.isPlaying = payload.isPlaying;
            room.video.lastUpdate = Date.now();

            broadcastToRoom(roomId, {
              type: 'PLAYBACK_SYNC',
              payload: {
                ...payload,
                serverTime: Date.now()
              }
            }, ws);
          }
          break;
        }

        case 'PASS_REMOTE': {
          if (room) {
            room.remoteHolderId = payload.toUserId;
            room.remoteHolderName = payload.toUserName;
            room.members = room.members.map((m) => ({
              ...m,
              hasRemote: room!.remoteMode === 'shared' ? true : m.id === payload.toUserId
            }));

            // Add system announcement
            const sysMsg: ChatMessage = {
              id: 'sys-' + Date.now(),
              senderId: 'system',
              senderName: 'System',
              avatarUrl: '',
              text: `Remote passed to ${payload.toUserName} 📱`,
              time: 'Just now',
              isSystem: true
            };
            room.messages.push(sysMsg);

            broadcastToRoom(roomId, {
              type: 'REMOTE_UPDATED',
              payload: {
                remoteHolderId: room.remoteHolderId,
                remoteHolderName: room.remoteHolderName,
                members: room.members,
                systemMessage: sysMsg
              }
            });
          }
          break;
        }

        case 'CHANGE_REMOTE_MODE': {
          if (room) {
            room.remoteMode = payload.mode;
            room.members = room.members.map((m) => ({
              ...m,
              hasRemote: payload.mode === 'shared' || m.id === room!.remoteHolderId
            }));

            broadcastToRoom(roomId, {
              type: 'ROOM_SETTINGS_UPDATED',
              payload: {
                remoteMode: room.remoteMode,
                members: room.members
              }
            });
          }
          break;
        }

        case 'CHAT_MESSAGE': {
          if (room) {
            const newMsg: ChatMessage = {
              id: 'msg-' + Date.now() + Math.random().toString(36).slice(2, 6),
              senderId: payload.senderId,
              senderName: payload.senderName,
              avatarUrl: payload.avatarUrl,
              text: payload.text,
              time: 'Just now'
            };
            room.messages.push(newMsg);
            broadcastToRoom(roomId, {
              type: 'CHAT_MESSAGE',
              payload: newMsg
            });
          }
          break;
        }

        case 'REACTION': {
          if (room) {
            const emoji = payload.emoji;
            room.reactions[emoji] = (room.reactions[emoji] || 0) + 1;
            broadcastToRoom(roomId, {
              type: 'REACTION_BURST',
              payload: {
                emoji,
                count: room.reactions[emoji],
                senderName: payload.senderName
              }
            });
          }
          break;
        }

        case 'LOAD_MEDIA': {
          if (room) {
            room.video = {
              ...room.video,
              title: payload.title || room.video.title,
              sourceUrl: payload.sourceUrl || room.video.sourceUrl,
              type: payload.type || room.video.type,
              magnetUri: payload.magnetUri || room.video.magnetUri,
              currentTime: 0,
              isPlaying: false,
              lastUpdate: Date.now()
            };

            const mediaSysMsg: ChatMessage = {
              id: 'sys-' + Date.now(),
              senderId: 'system',
              senderName: 'System',
              avatarUrl: '',
              text: `Queued: ${room.video.title} 🎬`,
              time: 'Just now',
              isSystem: true
            };
            room.messages.push(mediaSysMsg);

            broadcastToRoom(roomId, {
              type: 'MEDIA_CHANGED',
              payload: {
                video: room.video,
                systemMessage: mediaSysMsg
              }
            });
          }
          break;
        }

        case 'UPDATE_ROOM_SETTINGS': {
          if (room) {
            Object.assign(room, payload);
            broadcastToRoom(roomId, {
              type: 'ROOM_SETTINGS_UPDATED',
              payload: room
            });
          }
          break;
        }
      }
    } catch (e) {
      console.error('WebSocket message parsing error:', e);
    }
  });

  ws.on('close', () => {
    // Client disconnected
  });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
