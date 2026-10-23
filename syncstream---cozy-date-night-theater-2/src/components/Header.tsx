import React, { useState } from 'react';
import { useRoom } from '../context/RoomContext';

interface HeaderProps {
  activeTab: 'theater' | 'media' | 'settings' | 'watchlist';
  setActiveTab: (tab: 'theater' | 'media' | 'settings' | 'watchlist') => void;
  onOpenInvite: () => void;
  onOpenAccount: () => void;
  isMobilePreview: boolean;
  setIsMobilePreview: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenInvite,
  onOpenAccount,
  isMobilePreview,
  setIsMobilePreview
}) => {
  const {
    room,
    currentUser,
    leaveRoom,
    loadDemoRoom,
    localSettings,
    updateLocalSettings,
    latencyMs,
    copyInviteLink
  } = useRoom();

  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 left-0 right-0 z-40 h-16 bg-[#12131c]/90 backdrop-blur-xl border-b border-[#282b3f]/60 px-4 sm:px-6 select-none">
      <div className="w-full h-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo Zone */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div
            onClick={() => {
              if (room) setActiveTab('theater');
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#ff79b0] to-[#4ee5c5] flex items-center justify-center shadow-lg shadow-[#ff79b0]/25 group-hover:scale-105 transition-transform">
              <span
                className="material-symbols-outlined text-surface text-base"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold text-[#f1eef8] tracking-tight flex items-center gap-1.5">
                Winter Sun <span className="text-[#ff79b0] text-xs">♥</span>
              </span>
              <span className="block text-[9px] sm:text-[10px] text-[#ff79b0] font-semibold tracking-wider uppercase">
                COZY PRIVATE CINEMA
              </span>
            </div>
          </div>

          {/* Room Pill or Lobby Status */}
          {room ? (
            <div className="hidden md:flex items-center gap-2 bg-[#181a26] border border-[#282b3f] px-3 py-1 rounded-full text-xs">
              <span className="w-2 h-2 rounded-full bg-[#4ee5c5] animate-pulse shadow-sm shadow-[#4ee5c5]"></span>
              <span className="text-[#b9b5cb] text-[11px] font-mono font-bold text-[#ff79b0]">
                {room.id}
              </span>
              <span className="text-[#6d6984]">•</span>
              <span className="font-semibold text-[#4ee5c5] text-[11px]">
                {latencyMs}ms Sync
              </span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 bg-[#181a26] border border-[#282b3f] px-3 py-1 rounded-full text-xs text-[#b9b5cb]">
              <span className="text-[#ff79b0]">✨</span>
              <span>Lobby Portal</span>
            </div>
          )}
        </div>

        {/* Center Navigation Tabs (Only visible when inside a room) */}
        {room && (
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#181a26]/80 p-1 rounded-full border border-[#282b3f]/70">
            <button
              type="button"
              onClick={() => setActiveTab('theater')}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'theater'
                  ? 'bg-[#202334] text-[#ff79b0] border border-[#ff79b0]/30 shadow-sm'
                  : 'text-[#b9b5cb] hover:text-[#f1eef8]'
              }`}
            >
              <span
                className="material-symbols-outlined text-sm"
                style={activeTab === 'theater' ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                weekend
              </span>
              <span>Watch Room</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'media'
                  ? 'bg-[#202334] text-[#ff79b0] border border-[#ff79b0]/30 shadow-sm'
                  : 'text-[#b9b5cb] hover:text-[#f1eef8]'
              }`}
            >
              <span
                className="material-symbols-outlined text-sm"
                style={activeTab === 'media' ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                movie
              </span>
              <span>Media Hub</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#202334] text-[#ff79b0] border border-[#ff79b0]/30 shadow-sm'
                  : 'text-[#b9b5cb] hover:text-[#f1eef8]'
              }`}
            >
              <span
                className="material-symbols-outlined text-sm"
                style={activeTab === 'settings' ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                tune
              </span>
              <span>Room Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('watchlist')}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'watchlist'
                  ? 'bg-[#202334] text-[#ff79b0] border border-[#ff79b0]/30 shadow-sm'
                  : 'text-[#b9b5cb] hover:text-[#f1eef8]'
              }`}
            >
              <span
                className="material-symbols-outlined text-sm"
                style={activeTab === 'watchlist' ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                video_library
              </span>
              <span>Watchlist</span>
            </button>
          </nav>
        )}

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Leave Room Button when in room */}
          {room ? (
            <button
              type="button"
              onClick={leaveRoom}
              className="flex items-center gap-1 bg-[#181a26] hover:bg-[#202334] text-[#b9b5cb] hover:text-[#ffb4ab] border border-[#282b3f] px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
              title="Leave Room and return to Lobby"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="hidden sm:inline">Leave Room</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={loadDemoRoom}
              className="hidden sm:flex items-center gap-1 bg-[#202334] hover:bg-[#282b3f] text-[#ff79b0] border border-[#ff79b0]/30 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
            >
              <span>Demo Preview</span>
            </button>
          )}

          {/* Mobile Viewport Toggle */}
          <button
            type="button"
            onClick={() => setIsMobilePreview(!isMobilePreview)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
              isMobilePreview
                ? 'bg-[#ff79b0]/20 text-[#ff79b0] border-[#ff79b0]/40'
                : 'bg-[#181a26] text-[#b9b5cb] border-[#282b3f] hover:text-[#f1eef8]'
            }`}
            title="Toggle between Desktop & 390px Mobile view"
          >
            <span className="material-symbols-outlined text-sm">
              {isMobilePreview ? 'stay_current_portrait' : 'devices'}
            </span>
            <span className="hidden sm:inline">
              {isMobilePreview ? 'Mobile Mode' : 'Mobile View'}
            </span>
          </button>

          {/* Invite Partner button if in room */}
          {room && (
            <button
              type="button"
              onClick={copyInviteLink}
              className="flex items-center gap-1.5 bg-[#202334] hover:bg-[#282b3f] text-[#f1eef8] border border-[#ff79b0]/30 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-[#ff79b0] text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              <span className="hidden sm:inline">Share Link</span>
              <span className="sm:hidden">Share</span>
            </button>
          )}

          {/* User Profile Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => onOpenAccount()}
              className="flex items-center gap-2 bg-[#181a26] hover:bg-[#202334] border border-[#282b3f] p-1 pr-2.5 rounded-full transition-all text-left cursor-pointer"
              title="Manage your profile & avatar"
            >
              <div className="w-7 h-7 rounded-full bg-[#ff79b0]/20 flex items-center justify-center text-sm font-bold text-[#ff79b0] ring-2 ring-[#ff79b0]">
                {currentUser?.avatarUrl || '🐱'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#f1eef8] leading-tight truncate max-w-[80px]">
                  {currentUser?.name || 'My Account'}
                </span>
                <span className="text-[9px] text-[#4ee5c5] font-semibold leading-none">
                  {room ? (room.hostId === currentUser?.id ? 'Host 👑' : 'Partner 💕') : 'Account'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
