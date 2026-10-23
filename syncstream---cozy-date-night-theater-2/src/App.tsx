import React, { useState, useEffect } from 'react';
import { RoomProvider, useRoom } from './context/RoomContext';
import { Header } from './components/Header';
import { LobbyView } from './components/LobbyView';
import { TheaterView } from './components/TheaterView';
import { MediaHubView } from './components/MediaHubView';
import { RoomSettingsView } from './components/RoomSettingsView';
import { WatchlistView } from './components/WatchlistView';
import { MobileDeviceFrame } from './components/MobileDeviceFrame';
import { InviteModal } from './components/InviteModal';
import { AccountModal } from './components/AccountModal';

function MainApp() {
  const { room, toastMessage, loadMedia, joinRoom, currentUser } = useRoom();

  const [activeTab, setActiveTab] = useState<'theater' | 'media' | 'settings' | 'watchlist'>('theater');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);

  // Detect URL parameter for join link e.g. ?join=DATE-NIGHT-8821
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join') || params.get('room');
    if (joinCode && !room) {
      joinRoom(joinCode, currentUser);
    }
  }, []);

  const handlePlayFromWatchlist = (title: string, url: string) => {
    loadMedia({
      title,
      sourceUrl: url,
      type: 'preset'
    });
    setActiveTab('theater');
  };

  return (
    <div className="min-h-screen bg-[#12131c] text-[#f1eef8] flex flex-col font-sans selection:bg-[#ff79b0]/30 selection:text-[#ff79b0] relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#202334] border border-[#ff79b0]/50 px-5 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-2xl text-xs font-semibold text-[#ff79b0] animate-bounce">
          <span
            className="material-symbols-outlined text-base"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
          <span className="text-[#f1eef8]">{toastMessage}</span>
        </div>
      )}

      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenInvite={() => setIsInviteOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        isMobilePreview={isMobilePreview}
        setIsMobilePreview={setIsMobilePreview}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-12">
        {!room ? (
          /* Lobby Portal: Sign In, Create Room, or Join Room */
          <LobbyView onOpenAccount={() => setIsAccountOpen(true)} />
        ) : isMobilePreview ? (
          /* Mobile View Mode for current room */
          <MobileDeviceFrame />
        ) : (
          /* Inside Room Views */
          <>
            {activeTab === 'theater' && <TheaterView />}
            {activeTab === 'media' && (
              <MediaHubView onStartTheater={() => setActiveTab('theater')} />
            )}
            {activeTab === 'settings' && <RoomSettingsView />}
            {activeTab === 'watchlist' && (
              <WatchlistView onPlayMovie={handlePlayFromWatchlist} />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full bg-[#12131c] border-t border-[#282b3f]/60 py-5 select-none">
        <div className="w-full px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#b9b5cb] max-w-7xl mx-auto">
          <div className="flex items-center gap-1.5">
            <span>Made with 💕 by Winter Sun for cozy couples and friends watching together.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {room ? (
              <>
                <span className="text-[#4ee5c5] font-semibold">Room: {room.id}</span>
                <span>•</span>
                <span>Private P2P Sync</span>
                <span>•</span>
                <span className="text-[#ff79b0] font-semibold">Latency: &lt;15ms</span>
              </>
            ) : (
              <span className="text-[#ff79b0]">Ready to start your movie date ✨</span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <RoomProvider>
      <MainApp />
    </RoomProvider>
  );
}
