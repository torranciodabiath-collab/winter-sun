import React, { useState, useRef } from 'react';
import { useRoom } from '../context/RoomContext';
import { CUTE_AVATARS, COZY_NICKNAMES, FEATURED_SAMPLE_VIDEOS } from '../data/mockData';
import { UserProfile } from '../types';

interface LobbyViewProps {
  onOpenAccount: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ onOpenAccount }) => {
  const { currentUser, setCurrentUser, createRoom, joinRoom, loadDemoRoom, showToast } = useRoom();

  // Create Room State
  const [roomName, setRoomName] = useState(`${currentUser?.name || 'Cozy'}'s Movie Date`);
  const [roomPasscode, setRoomPasscode] = useState('DATE-' + Math.floor(1000 + Math.random() * 9000));
  const [selectedMovieType, setSelectedMovieType] = useState<'local' | 'torrent' | 'preset'>('preset');
  const [magnetOrUrl, setMagnetOrUrl] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(FEATURED_SAMPLE_VIDEOS[0]);
  const [localVideoFile, setLocalVideoFile] = useState<File | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Join Room State
  const [joinCode, setJoinCode] = useState('');
  const [joinNickname, setJoinNickname] = useState(currentUser?.name || 'Cozy_Guest');
  const [joinAvatar, setJoinAvatar] = useState(currentUser?.avatarUrl || '🐱');
  const [isJoining, setIsJoining] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRandomizeNick = () => {
    const pick = COZY_NICKNAMES[Math.floor(Math.random() * COZY_NICKNAMES.length)];
    setJoinNickname(pick);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLocalVideoFile(file);
      const url = URL.createObjectURL(file);
      setLocalVideoUrl(url);
      showToast(`Selected local file: ${file.name} 🎬`);
    }
  };

  const handleCreateRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    const user: UserProfile = currentUser || {
      id: 'host-' + Date.now().toString(36),
      name: 'Host',
      avatarUrl: '🍿',
      isHost: true
    };

    let videoPayload: {
      title: string;
      sourceUrl: string;
      magnetUri?: string;
      type: 'preset' | 'local' | 'torrent';
      quality: string;
      duration: number;
      currentTime: number;
      isPlaying: boolean;
    } = {
      title: selectedPreset.title,
      sourceUrl: selectedPreset.sourceUrl,
      type: 'preset',
      quality: selectedPreset.quality,
      duration: selectedPreset.duration,
      currentTime: 0,
      isPlaying: false
    };

    if (selectedMovieType === 'local' && localVideoFile && localVideoUrl) {
      videoPayload = {
        title: localVideoFile.name.replace(/\.[^/.]+$/, ''),
        sourceUrl: localVideoUrl,
        type: 'local',
        quality: 'Original Local Master',
        duration: 0,
        currentTime: 0,
        isPlaying: false
      };
    } else if (selectedMovieType === 'torrent' && magnetOrUrl.trim()) {
      const cleanMagnet = magnetOrUrl.trim();
      let extractedTitle = 'Torrent Stream Movie';
      if (cleanMagnet.includes('dn=')) {
        try {
          extractedTitle = decodeURIComponent(cleanMagnet.split('dn=')[1].split('&')[0]).replace(/\+/g, ' ');
        } catch (e) {}
      } else if (cleanMagnet.startsWith('http')) {
        const urlPart = cleanMagnet.split('/').pop()?.split('?')[0] || '';
        if (urlPart) {
          try {
            extractedTitle = decodeURIComponent(urlPart).replace(/\.[^/.]+$/, '');
          } catch (e) {
            extractedTitle = urlPart.replace(/\.[^/.]+$/, '');
          }
        }
      }

      videoPayload = {
        title: extractedTitle,
        sourceUrl: cleanMagnet.startsWith('http') ? cleanMagnet : '',
        magnetUri: cleanMagnet,
        type: 'torrent',
        quality: 'P2P Torrent Swarm',
        duration: 0,
        currentTime: 0,
        isPlaying: false
      };
    }

    createRoom({
      name: roomName.trim() || 'My Movie Date',
      hostName: user.name,
      hostAvatar: user.avatarUrl,
      passcode: roomPasscode.trim(),
      video: videoPayload
    });

    setIsCreating(false);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      showToast('Please enter a room code or invite link!');
      return;
    }

    setIsJoining(true);
    const code = joinCode.includes('join=')
      ? joinCode.split('join=')[1].split('&')[0]
      : joinCode.trim();

    const user: UserProfile = {
      id: 'guest-' + Date.now().toString(36),
      name: joinNickname.trim() || 'Cozy_Guest',
      avatarUrl: joinAvatar,
      isHost: false
    };

    setCurrentUser(user);
    joinRoom(code, user);
    setIsJoining(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      {/* Hero Welcome Banner */}
      <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#181a26] border border-[#ff79b0]/30 shadow-md mb-4">
          <span className="w-2 h-2 rounded-full bg-[#ff79b0] animate-pulse"></span>
          <span className="text-xs font-bold text-[#ff79b0] tracking-wide uppercase">
            SyncStream • Private Cinema
          </span>
          <span className="text-[#817b96]">•</span>
          <span className="text-xs font-semibold text-[#4ee5c5]">Lossless &amp; Zero Lag</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#f1eef8] tracking-tight leading-tight">
          Watch Movies Together, <br />
          <span className="bg-gradient-to-r from-[#ff79b0] via-[#ffa8cc] to-[#4ee5c5] bg-clip-text text-transparent">
            Perfect in Sync.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[#b9b5cb] mt-3 leading-relaxed">
          Create a private room to stream torrents, direct links, or your own local files with your partner or friends. Share the playback remote and cuddle up with sweet real-time chat.
        </p>

        {/* Current User Quick Bar */}
        <div className="mt-5 inline-flex items-center gap-3 bg-[#181a26] border border-[#282b3f] px-4 py-2 rounded-full text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">{currentUser?.avatarUrl || '🐱'}</span>
            <span className="text-[#f1eef8] font-bold">
              {currentUser?.name || 'Guest User'}
            </span>
          </div>
          <span className="text-[#282b3f]">•</span>
          <button
            type="button"
            onClick={onOpenAccount}
            className="text-[#ff79b0] hover:underline font-semibold flex items-center gap-1"
          >
            <span>{currentUser ? 'Edit Profile' : 'Sign In / Account'}</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* ================= CARD 1: CREATE ROOM (HOST) ================= */}
        <div className="bg-[#181a26] border border-[#ff79b0]/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#ff79b0]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between pb-3 border-b border-[#282b3f]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#ff79b0]/20 flex items-center justify-center text-[#ff79b0]">
                  <span className="material-symbols-outlined text-xl">add_to_queue</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#f1eef8]">Create a New Room</h2>
                  <span className="text-[11px] text-[#ff79b0] font-semibold">
                    Host your private theater 👑
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-[#ff79b0]/15 text-[#ff79b0] border border-[#ff79b0]/30 px-2.5 py-0.5 rounded-full font-bold">
                Host Mode
              </span>
            </div>

            <form onSubmit={handleCreateRoomSubmit} className="flex flex-col gap-3.5 pt-1">
              {/* Room Name */}
              <div>
                <label className="block text-[11px] font-bold text-[#b9b5cb] uppercase tracking-wider mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Jess &amp; Sam's Movie Night 🍿"
                  className="w-full bg-[#0d0e16] border border-[#282b3f] focus:border-[#ff79b0] rounded-xl px-3.5 py-2.5 text-xs text-[#f1eef8] focus:outline-none"
                  required
                />
              </div>

              {/* Room Code */}
              <div>
                <label className="block text-[11px] font-bold text-[#b9b5cb] uppercase tracking-wider mb-1">
                  Passcode / Code (Share with friends)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={roomPasscode}
                    onChange={(e) => setRoomPasscode(e.target.value)}
                    placeholder="e.g. DATE-8821"
                    className="w-full bg-[#0d0e16] border border-[#282b3f] focus:border-[#ff79b0] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#ff79b0] uppercase focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setRoomPasscode('COZY-' + Math.floor(1000 + Math.random() * 9000))}
                    className="px-3 py-2.5 rounded-xl bg-[#202334] hover:bg-[#282b3f] text-[#b9b5cb] text-xs font-semibold shrink-0"
                    title="Generate code"
                  >
                    🎲
                  </button>
                </div>
              </div>

              {/* Movie Source Selection */}
              <div>
                <label className="block text-[11px] font-bold text-[#b9b5cb] uppercase tracking-wider mb-1.5">
                  Choose Starting Movie
                </label>

                {/* Media Type Tabs */}
                <div className="grid grid-cols-3 gap-1.5 bg-[#202334] p-1 rounded-xl text-[11px] font-semibold mb-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMovieType('preset')}
                    className={`py-1.5 rounded-lg transition-all ${
                      selectedMovieType === 'preset'
                        ? 'bg-[#ff79b0] text-[#4a0425] font-bold shadow'
                        : 'text-[#b9b5cb] hover:text-[#f1eef8]'
                    }`}
                  >
                    Featured Film
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMovieType('local')}
                    className={`py-1.5 rounded-lg transition-all ${
                      selectedMovieType === 'local'
                        ? 'bg-[#ff79b0] text-[#4a0425] font-bold shadow'
                        : 'text-[#b9b5cb] hover:text-[#f1eef8]'
                    }`}
                  >
                    Local File 💻
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMovieType('torrent')}
                    className={`py-1.5 rounded-lg transition-all ${
                      selectedMovieType === 'torrent'
                        ? 'bg-[#ff79b0] text-[#4a0425] font-bold shadow'
                        : 'text-[#b9b5cb] hover:text-[#f1eef8]'
                    }`}
                  >
                    Torrent / Link 🔗
                  </button>
                </div>

                {/* Sub-panel based on source */}
                {selectedMovieType === 'preset' && (
                  <div className="flex flex-col gap-1.5">
                    {FEATURED_SAMPLE_VIDEOS.map((film) => (
                      <div
                        key={film.id}
                        onClick={() => setSelectedPreset(film)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedPreset.id === film.id
                            ? 'bg-[#202334] border-[#ff79b0] text-[#f1eef8]'
                            : 'bg-[#0d0e16] border-[#282b3f] text-[#b9b5cb] hover:border-[#ff79b0]/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="material-symbols-outlined text-sm text-[#ff79b0]">
                            {selectedPreset.id === film.id ? 'check_circle' : 'movie'}
                          </span>
                          <span className="text-xs font-bold truncate">{film.title}</span>
                        </div>
                        <span className="text-[10px] text-[#4ee5c5] shrink-0">{film.quality}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedMovieType === 'local' && (
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#0d0e16] border-2 border-dashed border-[#ff79b0]/40 hover:border-[#ff79b0] rounded-xl p-4 text-center cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[#ff79b0] text-2xl mb-1">
                        upload_file
                      </span>
                      <div className="text-xs font-bold text-[#f1eef8]">
                        {localVideoFile ? localVideoFile.name : 'Click to pick movie from your computer'}
                      </div>
                      <div className="text-[10px] text-[#b9b5cb] mt-0.5">
                        .mp4, .mkv, .webm, .mov (Streams in lossless quality)
                      </div>
                    </div>
                  </div>
                )}

                {selectedMovieType === 'torrent' && (
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      value={magnetOrUrl}
                      onChange={(e) => setMagnetOrUrl(e.target.value)}
                      placeholder="Paste magnet:?xt=... or direct video URL"
                      className="w-full bg-[#0d0e16] border border-[#282b3f] focus:border-[#ff79b0] rounded-xl px-3 py-2 text-xs text-[#f1eef8] focus:outline-none"
                    />
                    <span className="text-[10px] text-[#b9b5cb]">
                      Supports torrent magnet links, WebTorrent streams, or MP4/WebM video URLs.
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#ff79b0] via-[#ffa8cc] to-[#4ee5c5] hover:brightness-105 text-[#00382d] font-bold text-xs shadow-lg shadow-[#ff79b0]/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">weekend</span>
                  <span>Create &amp; Enter Room 💕</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ================= CARD 2: JOIN EXISTING ROOM (GUEST) ================= */}
        <div className="bg-[#181a26] border border-[#4ee5c5]/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#4ee5c5]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between pb-3 border-b border-[#282b3f]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#4ee5c5]/20 flex items-center justify-center text-[#4ee5c5]">
                  <span className="material-symbols-outlined text-xl">login</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#f1eef8]">Join a Room</h2>
                  <span className="text-[11px] text-[#4ee5c5] font-semibold">
                    Enter code or paste invite link ✨
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-[#4ee5c5]/15 text-[#4ee5c5] border border-[#4ee5c5]/30 px-2.5 py-0.5 rounded-full font-bold">
                Guest Entry
              </span>
            </div>

            <form onSubmit={handleJoinSubmit} className="flex flex-col gap-3.5 pt-1">
              {/* Room Code or Link */}
              <div>
                <label className="block text-[11px] font-bold text-[#b9b5cb] uppercase tracking-wider mb-1">
                  Room Code or Invite Link
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="e.g. DATE-NIGHT-8821 or paste link..."
                    className="w-full bg-[#0d0e16] border border-[#282b3f] focus:border-[#4ee5c5] rounded-xl px-3.5 py-2.5 text-xs text-[#f1eef8] focus:outline-none"
                    required
                  />
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-[#b9b5cb] text-base pointer-events-none">
                    link
                  </span>
                </div>
              </div>

              {/* Nickname */}
              <div>
                <label className="block text-[11px] font-bold text-[#b9b5cb] uppercase tracking-wider mb-1">
                  Your Nickname
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={joinNickname}
                    onChange={(e) => setJoinNickname(e.target.value)}
                    placeholder="What should we call you?..."
                    className="w-full bg-[#0d0e16] border border-[#282b3f] focus:border-[#4ee5c5] rounded-xl pl-3.5 pr-9 py-2.5 text-xs text-[#f1eef8] focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleRandomizeNick}
                    className="absolute right-2.5 p-1 text-[#b9b5cb] hover:text-[#4ee5c5]"
                    title="Random cute nickname"
                  >
                    🎲
                  </button>
                </div>
              </div>

              {/* Cute Avatar Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-[#b9b5cb] uppercase tracking-wider">
                    Pick Cute Avatar
                  </label>
                  <span className="text-[10px] text-[#4ee5c5]">Choose one</span>
                </div>
                <div className="grid grid-cols-8 gap-1.5">
                  {CUTE_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setJoinAvatar(av.emoji || '🐱')}
                      className={`aspect-square rounded-xl flex items-center justify-center text-lg border transition-all cursor-pointer ${
                        joinAvatar === av.emoji
                          ? 'bg-[#202334] border-2 border-[#4ee5c5] scale-105'
                          : 'bg-[#0d0e16] border-[#282b3f] hover:border-white/20'
                      }`}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isJoining}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#4ee5c5] to-[#7dfade] hover:brightness-105 text-[#00382d] font-bold text-xs shadow-lg shadow-[#4ee5c5]/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">favorite</span>
                  <span>Join Movie Date 🍿</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Demo Example Theater Card */}
      <div className="bg-[#181a26]/70 border border-[#282b3f] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#ff79b0]/15 flex items-center justify-center text-[#ff79b0] shrink-0">
            <span className="material-symbols-outlined text-xl">auto_stories</span>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#f1eef8]">
              Want to see how the synchronized theater looks first?
            </h3>
            <p className="text-[11px] text-[#b9b5cb] mt-0.5">
              Launch the demo preview room showing the sample couple chat, remote controls, and subtitle delay settings.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadDemoRoom}
          className="px-5 py-2.5 rounded-full bg-[#202334] hover:bg-[#282b3f] text-[#ff79b0] border border-[#ff79b0]/40 text-xs font-bold shrink-0 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <span>Launch Demo Preview 🎬</span>
        </button>
      </div>
    </div>
  );
};
