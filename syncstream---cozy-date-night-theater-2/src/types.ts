export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatarUrl: string;
  text: string;
  time: string;
  isSystem?: boolean;
}

export interface RoomMember {
  id: string;
  name: string;
  avatarUrl: string;
  avatar?: string;
  role: 'host' | 'partner' | 'friend';
  hasRemote: boolean;
  status: 'watching' | 'idle';
  isLocal?: boolean;
}

export interface VideoState {
  title: string;
  type: 'preset' | 'torrent' | 'local';
  sourceUrl: string;
  localFile?: File | null;
  magnetUri?: string;
  subtitlesUrl?: string;
  audioTrack: string;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  lastUpdate: number;
  quality: string;
  poster?: string;
}

export interface LocalPlaybackSettings {
  subDelayMs: number; // local offset in ms (-1000 to +1000)
  subPalette: 'pink' | 'mint' | 'white';
  subSize: 'sm' | 'md' | 'lg';
  subFontBlur: boolean;
  audioVolume: number;
  isMuted: boolean;
  bluetoothDelayMs: number;
  playbackSpeed: number;
  floatChatOnScreen: boolean;
}

export type RemoteMode = 'shared' | 'turn_taking' | 'host_only';

export interface RoomState {
  id: string;
  code?: string;
  name: string;
  hostId: string;
  hostName: string;
  passcode: string;
  remoteMode: RemoteMode;
  remoteHolderId: string;
  remoteHolderName: string;
  privacy: 'couples_only' | 'friends';
  snackPause: boolean;
  gentleAudio: boolean;
  bandwidthTier: string;
  video: VideoState;
  messages: ChatMessage[];
  reactions: Record<string, number>;
  members: RoomMember[];
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatarUrl: string;
  avatar?: string;
  isHost: boolean;
}
