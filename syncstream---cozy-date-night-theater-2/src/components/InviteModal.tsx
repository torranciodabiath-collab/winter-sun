import React, { useState } from 'react';
import { useRoom } from '../context/RoomContext';
import { COZY_NICKNAMES, CUTE_AVATARS } from '../data/mockData';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAccount: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  onOpenAccount
}) => {
  const { room, setCurrentUser, showToast } = useRoom();

  const [nickname, setNickname] = useState('Cozy_Panda');
  const [selectedAvatarId, setSelectedAvatarId] = useState(CUTE_AVATARS[2].id);
  const [isJoining, setIsJoining] = useState(false);

  if (!isOpen) return null;

  if (!room) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#181a26] border border-[#282b3f] rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
          <h3 className="text-base font-bold text-[#f1eef8] mb-2">No Active Room</h3>
          <p className="text-xs text-[#b9b5cb] mb-4">
            Please create or join a room first to invite your movie partner.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#202334] hover:bg-[#ff79b0] text-[#f1eef8] hover:text-[#4a0425] rounded-full text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleRandomize = () => {
    const random = COZY_NICKNAMES[Math.floor(Math.random() * COZY_NICKNAMES.length)];
    setNickname(random);
  };

  const handleJoin = () => {
    setIsJoining(true);
    const chosenAvatar = CUTE_AVATARS.find((a) => a.id === selectedAvatarId);

    setTimeout(() => {
      const newUser = {
        id: 'guest-' + Date.now().toString(36),
        name: nickname.trim() || 'Cozy_Guest',
        avatarUrl: chosenAvatar?.url || chosenAvatar?.emoji || '🐱',
        isHost: false
      };
      setCurrentUser(newUser);
      setIsJoining(false);
      showToast(`Welcome to the movie date, ${newUser.name}! 🍿💕`);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <main className="w-full max-w-2xl flex flex-col items-center relative my-auto animate-scale-in">
        {/* Top Cozy Room Pill */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#181a26] border border-[#ff79b0]/30 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff79b0] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff79b0]"></span>
            </span>
            <span className="text-xs font-semibold text-[#ff79b0] tracking-wide">
              Winter Sun • {room.name}
            </span>
            <span className="text-xs text-[#b9b5cb]/60">•</span>
            <span className="text-xs text-[#4ee5c5] font-medium">Ready to Watch 💕</span>
          </div>
        </div>

        {/* Main Cozy Modal Card */}
        <div className="w-full relative rounded-3xl bg-[#181a26] p-6 sm:p-8 shadow-2xl border border-white/5 overflow-hidden">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-[#b9b5cb] hover:text-[#f1eef8] p-1.5 rounded-full hover:bg-[#202334] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>

          {/* Soft Pastel Glowing Blobs */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#ff79b0]/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#4ee5c5]/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header Section */}
          <div className="text-center max-w-lg mx-auto mb-6 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff79b0]/15 text-[#ff79b0] border border-[#ff79b0]/30 text-xs font-bold mb-2.5">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              <span>Movie Night Invitation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#f1eef8] tracking-tight mb-2">
              You're invited to Movie Night!
            </h1>
            <p className="text-[#b9b5cb] text-xs sm:text-sm leading-relaxed">
              Grab your favorite blanket and snacks. One click to cuddle up and watch together!
            </p>
          </div>

          {/* Currently Playing Movie Card */}
          <div className="bg-[#202334]/90 border border-[#ff79b0]/20 rounded-2xl p-4 mb-6 relative z-10 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff79b0]/20 to-[#4ee5c5]/20 border border-[#ff79b0]/30 flex items-center justify-center text-[#ff79b0] shrink-0">
                  <span className="material-symbols-outlined text-2xl text-[#ff79b0]">
                    local_movies
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-medium text-[#b9b5cb]">
                      {room.hostName}'s Cozy Theater
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#ff79b0]/20 text-[#ff79b0] border border-[#ff79b0]/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[11px]">volunteer_activism</span>
                      <span>Host</span>
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-[#f1eef8] mt-0.5">
                    {room.video.title}
                  </div>
                </div>
              </div>

              {/* Status Chips */}
              <div className="flex items-center gap-2 bg-[#0d0e16]/80 border border-white/5 rounded-full px-3 py-1.5 self-start sm:self-auto shrink-0">
                <div className="flex items-center gap-1 text-[#ff79b0] text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-sm">play_circle</span>
                  <span>00:42:18</span>
                </div>
                <div className="h-3 w-px bg-[#282b3f]"></div>
                <div className="flex items-center gap-1 text-[#4ee5c5] text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-sm">group</span>
                  <span>{room.members.length} in sync</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Setup (Nickname & Avatars) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 relative z-10">
            {/* Nickname Field */}
            <div>
              <label className="block text-[11px] font-bold text-[#f1eef8] uppercase tracking-wider mb-2">
                Your Nickname
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#ff79b0] text-lg pointer-events-none">
                  sentiment_satisfied
                </span>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="What should we call you?..."
                  className="w-full bg-[#0d0e16] border border-[#282b3f] focus:border-[#ff79b0] focus:ring-1 focus:ring-[#ff79b0]/30 focus:outline-none rounded-full pl-10 pr-10 py-2.5 text-[#f1eef8] text-xs font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={handleRandomize}
                  className="absolute right-2.5 p-1 rounded-full text-[#b9b5cb] hover:text-[#ff79b0] hover:bg-[#202334] transition-colors"
                  title="Surprise cute name!"
                >
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                </button>
              </div>
              <p className="text-[10px] text-[#b9b5cb] mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#4ee5c5]">sparkles</span>
                <span>Shown in reaction bubbles and cozy party chat</span>
              </p>
            </div>

            {/* Cute Avatar Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-[#f1eef8] uppercase tracking-wider">
                  Choose Cute Avatar
                </label>
                <span className="text-[10px] text-[#4ee5c5] font-medium">Pick one ✨</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {CUTE_AVATARS.slice(2).map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatarId(av.id)}
                    className={`relative aspect-square rounded-xl flex items-center justify-center transition-all p-1 cursor-pointer ${
                      selectedAvatarId === av.id
                        ? 'bg-[#202334] border-2 border-[#ff79b0] text-[#ff79b0] shadow-sm'
                        : 'bg-[#202334] border border-[#282b3f] text-[#b9b5cb] hover:border-[#ff79b0]/50'
                    }`}
                    title={av.name}
                  >
                    <span className="material-symbols-outlined text-xl">{av.icon}</span>
                    {selectedAvatarId === av.id && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#ff79b0] text-[#4c0024] rounded-full flex items-center justify-center text-[9px] font-bold shadow">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Big Gradient CTA Button */}
          <div className="flex flex-col items-center gap-2 pt-1 relative z-10">
            <button
              type="button"
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full sm:w-auto min-w-[280px] px-8 py-3.5 rounded-full bg-gradient-to-r from-[#ff79b0] to-[#4ee5c5] hover:brightness-105 text-[#00382d] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#ff79b0]/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>{isJoining ? 'Setting up cozy sync...' : 'Join Movie Date 🍿'}</span>
              <span
                className={`material-symbols-outlined text-lg ${
                  isJoining ? 'animate-spin' : ''
                }`}
              >
                {isJoining ? 'refresh' : 'sparkles'}
              </span>
            </button>

            <div className="text-xs text-[#b9b5cb] flex items-center gap-1.5 mt-1">
              <span>Are you the room host?</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAccount();
                }}
                className="text-[#ff79b0] hover:text-[#4ee5c5] underline font-semibold transition-colors"
              >
                Sign in to manage
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Feature Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mt-4">
          <div className="bg-[#181a26]/80 border border-white/5 rounded-xl p-2.5 flex items-center gap-2 backdrop-blur-sm">
            <div className="w-7 h-7 rounded-full bg-[#ff79b0]/15 flex items-center justify-center text-[#ff79b0] shrink-0">
              <span className="material-symbols-outlined text-base">sync_saved_locally</span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#f1eef8]">Private P2P Sync</div>
              <div className="text-[9px] text-[#b9b5cb]">Frame-locked</div>
            </div>
          </div>

          <div className="bg-[#181a26]/80 border border-white/5 rounded-xl p-2.5 flex items-center gap-2 backdrop-blur-sm">
            <div className="w-7 h-7 rounded-full bg-[#4ee5c5]/15 flex items-center justify-center text-[#4ee5c5] shrink-0">
              <span className="material-symbols-outlined text-base">bolt</span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#f1eef8]">Ultra-low Latency</div>
              <div className="text-[9px] text-[#b9b5cb]">&lt; 15ms reaction</div>
            </div>
          </div>

          <div className="bg-[#181a26]/80 border border-white/5 rounded-xl p-2.5 flex items-center gap-2 backdrop-blur-sm">
            <div className="w-7 h-7 rounded-full bg-[#ff79b0]/15 flex items-center justify-center text-[#ff79b0] shrink-0">
              <span className="material-symbols-outlined text-base">favorite_border</span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#f1eef8]">No Ads or Sign-up</div>
              <div className="text-[9px] text-[#b9b5cb]">Instant entry</div>
            </div>
          </div>

          <div className="bg-[#181a26]/80 border border-white/5 rounded-xl p-2.5 flex items-center gap-2 backdrop-blur-sm">
            <div className="w-7 h-7 rounded-full bg-[#4ee5c5]/15 flex items-center justify-center text-[#4ee5c5] shrink-0">
              <span className="material-symbols-outlined text-base">subtitles</span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#f1eef8]">Custom Subtitles</div>
              <div className="text-[9px] text-[#b9b5cb]">Load local files</div>
            </div>
          </div>
        </div>

        {/* Cozy Presence Footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#b9b5cb] mt-3 px-4 py-1.5 rounded-full bg-[#181a26]/60 border border-white/5">
          <div className="flex -space-x-1.5">
            <div className="w-5 h-5 rounded-full bg-[#ff79b0]/30 border border-[#ff79b0] text-[9px] text-[#ff79b0] flex items-center justify-center font-bold">
              🌸
            </div>
            <div className="w-5 h-5 rounded-full bg-[#4ee5c5]/30 border border-[#4ee5c5] text-[9px] text-[#4ee5c5] flex items-center justify-center font-bold">
              🐱
            </div>
          </div>
          <span>Alex is currently waiting for you in the cozy room ✨</span>
        </div>
      </main>
    </div>
  );
};
