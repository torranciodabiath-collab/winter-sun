import { RoomState, UserProfile } from '../types';

export interface CuteAvatar {
  id: string;
  name: string;
  icon: string;
  emoji: string;
  url?: string;
}

export const CUTE_AVATARS: CuteAvatar[] = [
  {
    id: 'cat',
    name: 'Cute Cat',
    icon: 'pets',
    emoji: '🐱'
  },
  {
    id: 'bunny',
    name: 'Cute Bunny',
    icon: 'cruelty_free',
    emoji: '🐰'
  },
  {
    id: 'popcorn',
    name: 'Popcorn Snack',
    icon: 'bakery_dining',
    emoji: '🍿'
  },
  {
    id: 'headphones',
    name: 'Headphones',
    icon: 'headphones',
    emoji: '🎧'
  },
  {
    id: 'robot',
    name: 'Cute Robot',
    icon: 'smart_toy',
    emoji: '🤖'
  },
  {
    id: 'panda',
    name: 'Cozy Panda',
    icon: 'favorite',
    emoji: '🐼'
  },
  {
    id: 'fox',
    name: 'Cozy Fox',
    icon: 'cruelty_free',
    emoji: '🦊'
  },
  {
    id: 'bear',
    name: 'Teddy Bear',
    icon: 'pets',
    emoji: '🧸'
  }
];

export const COZY_NICKNAMES = [
  'Cozy_Panda',
  'BerryBliss',
  'LittleStar',
  'MochiBao',
  'HoneyBun',
  'SweetBoba',
  'SleepyKoala',
  'CaramelCorn',
  'PeachPip',
  'CuddleBug',
  'MatchaCookie',
  'CloudyPaws'
];

export const FEATURED_SAMPLE_VIDEOS = [
  {
    id: 'sample-oceans',
    title: 'Oceans (Cinematic Nature Film)',
    sourceUrl: '/videos/sample-cinema.mp4',
    quality: '1080p Cinema Master',
    audioTrack: 'Original Stereo Master (English)',
    duration: 46,
    poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_CK8PjJv7rEIH4RS0_42SSeKnT_yBd0Up4uxxzyKGsl2GtLeicw2YnllWJ1FqlBbn5gFswtrl180OzNNESn93aGrJVH8iNmQsykTuwkVkzE-RSgHXp3cqFkG0zgZ-Wlm-Oi3VvnurN7TwfGyEFUOtBGDUk1bHp6M4nylBkfTkM7RvkI5xNWCLHa9hOozkEHOupA1iZpfLUKZ9ok8MHM1rkOwXA2_giRQXHxpgvCu3etmqCJ_EqNIg'
  },
  {
    id: 'sample-sintel',
    title: 'Sintel (Fantasy Romance & Journey)',
    sourceUrl: '/videos/sintel-trailer.mp4',
    quality: '1080p HD',
    audioTrack: 'Original Cinema 5.1 (Surround)',
    duration: 52,
    poster: 'https://lh3.googleusercontent.com/aida/AEtjO1WQ5prJZ0JIqQcUW1Xpkkd9tDhRWU8BrZN0raeoMyFC44xcv-zZe9X0f4OqTpvt-AY4H6Hi0ZHTPogdHdbjOQHuc2xCLQf6L-UCPdLpuVQOQGipqibN6hCgAgnOtNJTquSHKFMbWiSf4aMDU3Par1YtP9HdTpSYvkMW0oQUg3_A2qBrWsu602_RsvVhfSd2pstcywPksuZbuhD4Vz9n_vvByR4vo8MOfUHkUGfwOVdsKWlBxBvWgQ0lDw'
  },
  {
    id: 'sample-bunny',
    title: 'Big Buck Bunny (Animation Classic)',
    sourceUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    quality: '1080p 60fps',
    audioTrack: 'Stereo Master (Lossless)',
    duration: 46,
    poster: 'https://lh3.googleusercontent.com/aida/AEtjO1WQ5prJZ0JIqQcUW1Xpkkd9tDhRWU8BrZN0raeoMyFC44xcv-zZe9X0f4OqTpvt-AY4H6Hi0ZHTPogdHdbjOQHuc2xCLQf6L-UCPdLpuVQOQGipqibN6hCgAgnOtNJTquSHKFMbWiSf4aMDU3Par1YtP9HdTpSYvkMW0oQUg3_A2qBrWsu602_RsvVhfSd2pstcywPksuZbuhD4Vz9n_vvByR4vo8MOfUHkUGfwOVdsKWlBxBvWgQ0lDw'
  }
];

export const SAMPLE_SUBTITLES: Array<{ time: number; text: string }> = [];

export const DEMO_PREVIEW_ROOM: RoomState = {
  id: 'DEMO-PREVIEW',
  name: 'Our Friday Movie Marathon (Demo Preview) 🍿',
  hostId: 'alex-01',
  hostName: 'Alex',
  passcode: 'DEMO-PREVIEW',
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
      id: 'demo-msg-0',
      senderId: 'alex-01',
      senderName: 'Alex',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXTpOXIlSeFVEicVyDElYFsWIwXg1XsWvBPNR035bjC8Ash8MYlFNa_iNyJER8fpRQLO8f2CQWWWcEKUFPpOFVNX3muGZSUzJm775WFyN4dgxho8J2uQC6wS0NhKpb0YXIVxsVwOIv9H7SGO41Z1nDofNYZnkoGV5VaQqkfvvdNR7oxoK96metMpmtkbB6oJcaBqyWELHBPzAPAKu4j3KfBhU8MQrVk_OE1VnkReizFJVrTNR1VwMJ',
      text: 'Alex synced movie to 00:00:30',
      time: '00:30',
      isSystem: true
    },
    {
      id: 'demo-msg-1',
      senderId: 'maya-02',
      senderName: 'Maya',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO9sSPNmd__nmLAp8mAOHivcoOOF6q2XUMFDqbbPKoQvifG_6VIdpvelBoJnggwm2a0WPNwzYbAjpTyvUb3eNxgg6QL9Zv0eMsQtxwZ2n7esd9B7OWFXUib3txHcczwTLI3liT2Gzc5tQelFiWg5cTtpNJrqkgYPByKGOug18OnOv-IYtL1FxFR6w7kPnSwFzN9aIKmsWIbLmUZDnMRpLyxumx0GxSz1K-aubbqWbuSdrKT1lM7uW6',
      text: 'Grabbed the popcorn! 🍿 Ready for the cute scene!',
      time: '00:32'
    },
    {
      id: 'demo-msg-2',
      senderId: 'alex-01',
      senderName: 'Alex',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXTpOXIlSeFVEicVyDElYFsWIwXg1XsWvBPNR035bjC8Ash8MYlFNa_iNyJER8fpRQLO8f2CQWWWcEKUFPpOFVNX3muGZSUzJm775WFyN4dgxho8J2uQC6wS0NhKpb0YXIVxsVwOIv9H7SGO41Z1nDofNYZnkoGV5VaQqkfvvdNR7oxoK96metMpmtkbB6oJcaBqyWELHBPzAPAKu4j3KfBhU8MQrVk_OE1VnkReizFJVrTNR1VwMJ',
      text: 'Yay! And I dimmed the room lights too. Look at the colors here! 🌅',
      time: '00:34'
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
