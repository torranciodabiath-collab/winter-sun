import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRoom } from '../context/RoomContext';
import { SAMPLE_SUBTITLES } from '../data/mockData';

interface MobileDeviceFrameContentProps {
  room: NonNullable<ReturnType<typeof useRoom>['room']>;
}

const MobileDeviceFrameContent: React.FC<MobileDeviceFrameContentProps> = ({ room }) => {
  const {
    currentUser,
    localSettings,
    updateLocalSettings,
    canControlPlayback,
    sendPlaybackSync,
    passRemote,
    sendChatMessage,
    sendReaction,
    showToast,
    latencyMs
  } = useRoom();

  const [mobileTab, setMobileTab] = useState<'chat' | 'audio'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [isPlaying, setIsPlaying] = useState(room.video.isPlaying);
  const [currentTime, setCurrentTime] = useState(room.video.currentTime || 0);
  const [duration, setDuration] = useState(room.video.duration || 600);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync with remote video events
  useEffect(() => {
    if (room.video.isPlaying !== isPlaying) {
      setIsPlaying(room.video.isPlaying);
      if (videoRef.current) {
        if (room.video.isPlaying) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      }
    }
    if (room.video.currentTime !== undefined && Math.abs(currentTime - room.video.currentTime) > 1.5) {
      setCurrentTime(room.video.currentTime);
      if (videoRef.current) {
        videoRef.current.currentTime = room.video.currentTime;
      }
    }
  }, [room.video.isPlaying, room.video.currentTime]);

  const togglePlay = () => {
    if (!canControlPlayback) {
      showToast(`${room.remoteHolderName} has the remote control.`);
      return;
    }
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (videoRef.current) {
      if (nextState) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
    sendPlaybackSync(currentTime, nextState);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
      videoRef.current.currentTime = room.video.currentTime || 0;
      if (room.video.isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput('');
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handlePassRemoteToggle = () => {
    const otherUser = room.members.find((m) => m.id !== room.remoteHolderId) || room.members[0];
    passRemote(otherUser.id, otherUser.name);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const currentSubtitle = useMemo(() => {
    if (room.id !== 'DEMO-PREVIEW') return null;
    const effectiveTime = currentTime + localSettings.subDelayMs / 1000;
    const match = SAMPLE_SUBTITLES.slice().reverse().find((s) => effectiveTime >= s.time);
    return match ? match.text : null;
  }, [currentTime, localSettings.subDelayMs, room.id]);

  return (
    <div className="w-full flex justify-center py-4 px-2">
      {/* 390px Mobile Viewport Container */}
      <div className="w-full max-w-[390px] min-h-[820px] bg-[#0d0e16] rounded-[2.5rem] flex flex-col relative shadow-2xl border-4 border-[#25273a] overflow-hidden pb-24">
        {/* Mobile Header Bar */}
        <header className="sticky top-0 z-40 bg-[#12131c]/95 backdrop-blur-xl border-b border-[#25273a]/60 px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff79b0] to-[#4ee5c5] flex items-center justify-center shadow-md shadow-[#ff79b0]/25">
              <span
                className="material-symbols-outlined text-[#0d0e16] text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#f1eef8] tracking-tight truncate max-w-[120px]">
                  {room.name}
                </span>
                <span className="text-[#ff79b0] text-xs">♥</span>
              </div>
              <span className="text-[9px] text-[#4ee5c5] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ee5c5] animate-pulse"></span>
                Synced {latencyMs}ms
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#25273a]/80 px-2 py-0.5 rounded-full border border-[#ff79b0]/20">
              <span className="text-[10px] text-[#f1eef8] font-semibold tracking-wider">
                #{room.code || room.id}
              </span>
            </div>

            {/* Remote holder button */}
            <button
              type="button"
              onClick={handlePassRemoteToggle}
              className="flex items-center gap-1.5 bg-[#1c1e2d] px-2 py-1 rounded-full border border-[#4ee5c5]/30 active:scale-95 transition-transform cursor-pointer"
              title="Tap to pass remote"
            >
              <div className="flex -space-x-1.5 items-center">
                {room.members.slice(0, 2).map((member, idx) => (
                  <div
                    key={member.id}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-[#25273a] ring-1.5 ${
                      idx === 0 ? 'ring-[#ff79b0]' : 'ring-[#4ee5c5]'
                    }`}
                  >
                    {member.avatarUrl?.startsWith('http') ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{member.avatarUrl || '🐱'}</span>
                    )}
                  </div>
                ))}
              </div>
              <span className="material-symbols-outlined text-[13px] text-[#4ee5c5]">
                sports_esports
              </span>
            </button>
          </div>
        </header>

        {/* Sticky 16:9 Mobile Video Player */}
        <div className="sticky top-[51px] z-30 w-full aspect-video bg-black relative select-none shadow-xl overflow-hidden border-b border-[#25273a]">
          <video
            ref={videoRef}
            src={room.video.sourceUrl}
            poster={room.video.poster}
            className="w-full h-full object-cover cursor-pointer"
            playsInline
            loop
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => {
              if (videoRef.current && room.video.sourceUrl !== '/videos/sample-cinema.mp4') {
                videoRef.current.src = '/videos/sample-cinema.mp4';
                videoRef.current.load();
              }
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#10111a]/95 via-black/20 to-[#10111a]/70 pointer-events-none"></div>

          {/* Top Overlay: Telemetry & Quality Badges */}
          <div className="absolute top-2 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-none">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] font-bold text-[#ffd9e4] bg-[#0d0e16]/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-[#ff79b0]/30 shadow-sm">
                1080p Stream
              </span>
              <span className="text-[9px] font-bold text-[#4ee5c5] bg-[#0d0e16]/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-[#4ee5c5]/30 flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ee5c5] animate-pulse"></span>
                0.0s Sync
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[9px] font-semibold text-[#c5c3d8] bg-[#0d0e16]/85 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/10">
                Stereo
              </span>
            </div>
          </div>

          {/* Subtitle Cue Banner */}
          {currentSubtitle && (
            <div className="absolute bottom-10 left-2 right-2 flex justify-center pointer-events-none z-20">
              <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-center shadow-lg max-w-[95%]">
                <p className="text-[11px] font-semibold text-white drop-shadow leading-snug">
                  {currentSubtitle}{' '}
                  <span className="text-[#ff79b0]">♡</span>
                </p>
              </div>
            </div>
          )}

          {/* Scrubber & Primary Controls */}
          <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-1.5 pt-4 bg-gradient-to-t from-[#10111a]/95 to-transparent flex flex-col gap-1 z-20">
            {/* Scrubber line */}
            <div
              className="relative w-full h-3 flex items-center cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                const seekTo = Math.max(0, Math.min(duration, pos * duration));
                setCurrentTime(seekTo);
                if (videoRef.current) videoRef.current.currentTime = seekTo;
                if (canControlPlayback) sendPlaybackSync(seekTo, isPlaying);
              }}
            >
              <div className="w-full h-1 bg-[#31344c] rounded-full relative overflow-visible">
                <div
                  className="absolute top-0 left-0 bottom-0 bg-[#ff79b0] rounded-full"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 bg-[#4ee5c5] rounded-full shadow-md ring-2 ring-white/90"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-7 h-7 rounded-full bg-[#ff79b0]/20 text-[#ff79b0] flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                >
                  <span
                    className="material-symbols-outlined text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <span className="text-[10px] text-[#c5c3d8] font-medium">
                  <strong className="text-[#f1eff9]">{formatTime(currentTime)}</strong> / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const newTime = Math.max(0, currentTime - 10);
                    setCurrentTime(newTime);
                    if (videoRef.current) videoRef.current.currentTime = newTime;
                    if (canControlPlayback) sendPlaybackSync(newTime, isPlaying);
                  }}
                  className="w-7 h-7 flex items-center justify-center text-[#f1eff9] hover:text-[#ff79b0] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">replay_10</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newTime = Math.min(duration, currentTime + 10);
                    setCurrentTime(newTime);
                    if (videoRef.current) videoRef.current.currentTime = newTime;
                    if (canControlPlayback) sendPlaybackSync(newTime, isPlaying);
                  }}
                  className="w-7 h-7 flex items-center justify-center text-[#f1eff9] hover:text-[#ff79b0] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">forward_10</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Segmented Navigation Tabs */}
        <div className="px-3 pt-2.5 pb-1 bg-[#0d0e16]">
          <div className="bg-[#1c1e2d] p-1 rounded-2xl flex items-center gap-1 border border-[#25273a]">
            <button
              type="button"
              onClick={() => setMobileTab('chat')}
              className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                mobileTab === 'chat'
                  ? 'bg-[#25273a] text-[#ff79b0] border border-[#ff79b0]/25'
                  : 'text-[#c5c3d8] hover:text-white'
              }`}
            >
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              <span>Cozy Chat</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff79b0] animate-ping"></span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab('audio')}
              className={`flex-1 py-1.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                mobileTab === 'audio'
                  ? 'bg-[#25273a] text-[#4ee5c5] border border-[#4ee5c5]/25'
                  : 'text-[#c5c3d8] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              <span>Audio &amp; Sync</span>
            </button>
          </div>
        </div>

        {/* Quick Precision Sync Ribbon */}
        <div className="px-3 py-1.5">
          <div className="bg-[#1c1e2d]/70 rounded-xl p-2 border border-[#25273a] flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1 text-[#c5c3d8]">
              <span className="material-symbols-outlined text-xs text-[#4ee5c5]">graphic_eq</span>
              <span>Sub Delay:</span>
              <span className="text-[#ff79b0] font-bold bg-[#ff79b0]/15 px-1.5 rounded border border-[#ff79b0]/25">
                {localSettings.subDelayMs >= 0 ? `+${localSettings.subDelayMs}` : localSettings.subDelayMs}ms
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  updateLocalSettings({ subDelayMs: localSettings.subDelayMs - 100 })
                }
                className="px-2 py-0.5 rounded-full bg-[#25273a] hover:bg-[#31344c] text-white font-semibold active:scale-95 cursor-pointer"
              >
                -100ms
              </button>
              <button
                type="button"
                onClick={() =>
                  updateLocalSettings({ subDelayMs: localSettings.subDelayMs + 100 })
                }
                className="px-2 py-0.5 rounded-full bg-[#25273a] hover:bg-[#31344c] text-white font-semibold active:scale-95 cursor-pointer"
              >
                +100ms
              </button>
              <button
                type="button"
                onClick={() => updateLocalSettings({ subDelayMs: 0 })}
                className="px-2 py-0.5 rounded-full bg-[#4ee5c5]/15 text-[#4ee5c5] border border-[#4ee5c5]/30 font-semibold active:scale-95 cursor-pointer"
              >
                0ms
              </button>
            </div>
          </div>
        </div>

        {/* Pass Remote Quick Action Banner */}
        <div className="px-3 py-1">
          <div className="bg-gradient-to-r from-[#ff79b0]/15 via-[#1c1e2d] to-[#4ee5c5]/15 rounded-xl px-3 py-2 border border-[#ff79b0]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#ff79b0]/20 text-[#ff79b0] flex items-center justify-center">
                <span className="material-symbols-outlined text-xs">sports_esports</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#f1eff9]">
                  {room.remoteHolderName} has the remote
                </span>
                <span className="text-[9px] text-[#c5c3d8]">Tap to pass control</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePassRemoteToggle}
              className="px-2.5 py-1 rounded-full bg-[#4ee5c5] text-[#00382e] text-[11px] font-bold flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs">sync_alt</span>
              <span>Pass 📱</span>
            </button>
          </div>
        </div>

        {/* Chat Stream Messages (Scrollable) */}
        <div className="flex-1 px-3 py-2 flex flex-col gap-2.5 overflow-y-auto">
          {room.messages.length === 0 ? (
            <div className="py-8 text-center text-[#817b96] text-xs">
              No messages yet. Say hi to your movie partner! 🍿
            </div>
          ) : (
            room.messages.map((m) => {
              const isMe = m.senderId === currentUser.id;
              const sender = room.members.find((u) => u.id === m.senderId);
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full bg-[#1c1e2d] flex items-center justify-center text-sm ring-1.5 ring-[#4ee5c5] shrink-0 mt-0.5 overflow-hidden">
                      {sender?.avatarUrl?.startsWith('http') ? (
                        <img
                          src={sender.avatarUrl}
                          alt={m.senderName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{sender?.avatarUrl || '🐱'}</span>
                      )}
                    </div>
                  )}
                  <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-1.5 mb-0.5">
                      <span
                        className={`text-[11px] font-bold ${
                          isMe ? 'text-[#ff79b0]' : 'text-[#4ee5c5]'
                        }`}
                      >
                        {m.senderName}
                      </span>
                      <span className="text-[9px] text-[#787691]">{m.time}</span>
                    </div>
                    <div
                      className={`p-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        isMe
                          ? 'bg-[#ff79b0]/20 border border-[#ff79b0]/35 rounded-tr-xs text-[#f1eff9]'
                          : 'bg-[#1c1e2d] border border-[#25273a] rounded-tl-xs text-[#f1eff9]'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                  {isMe && (
                    <div className="w-7 h-7 rounded-full bg-[#ff79b0]/20 flex items-center justify-center text-sm ring-1.5 ring-[#ff79b0] shrink-0 mt-0.5 overflow-hidden">
                      {currentUser?.avatarUrl?.startsWith('http') ? (
                        <img
                          src={currentUser.avatarUrl}
                          alt={currentUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{currentUser?.avatarUrl || '🍿'}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />

          {/* Low Latency Pill */}
          <div className="self-center bg-[#161824]/90 rounded-full px-3 py-1 border border-[#25273a] flex items-center gap-2 text-[10px] text-[#c5c3d8] mt-1">
            <span className="flex items-center gap-1 text-[#4ee5c5]">
              <span className="material-symbols-outlined text-[12px]">wifi_tethering</span>
              Ultra-low latency {latencyMs}ms
            </span>
            <span className="text-[#787691]">•</span>
            <span className="text-[#f1eff9] font-medium">99% buffer</span>
          </div>
        </div>

        {/* Fixed Bottom Sticky Dock */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#12131c]/95 backdrop-blur-xl border-t border-[#25273a] z-50 flex flex-col">
          {/* Reaction Bar */}
          <div className="px-3 py-1.5 border-b border-[#25273a]/50 flex items-center justify-around">
            {[
              { emoji: '🍿', count: room.reactions['🍿'] || 0 },
              { emoji: '💖', count: room.reactions['💖'] || 0, special: true },
              { emoji: '🥺', count: room.reactions['🥺'] || 0 },
              { emoji: '✨', count: room.reactions['✨'] || 0, specialMint: true },
              { emoji: '🐱', count: room.reactions['🐱'] || 0 },
              { emoji: '😂', count: room.reactions['😂'] || 0 }
            ].map((r) => (
              <button
                key={r.emoji}
                type="button"
                onClick={() => sendReaction(r.emoji)}
                className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-xs font-bold transition-transform active:scale-110 cursor-pointer ${
                  r.special
                    ? 'bg-[#ff79b0]/15 border border-[#ff79b0]/25 text-[#ff79b0]'
                    : r.specialMint
                    ? 'bg-[#4ee5c5]/15 border border-[#4ee5c5]/25 text-[#4ee5c5]'
                    : 'bg-[#1c1e2d] text-[#c5c3d8]'
                }`}
              >
                <span>{r.emoji}</span>
                <span className="text-[10px]">{r.count}</span>
              </button>
            ))}
          </div>

          {/* Chat Input Field */}
          <form onSubmit={handleSendNote} className="p-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => sendReaction('💖')}
              className="w-9 h-9 rounded-full text-[#c5c3d8] hover:text-[#4ee5c5] flex items-center justify-center shrink-0 cursor-pointer"
              title="Quick heart"
            >
              <span className="material-symbols-outlined text-lg">sentiment_satisfied</span>
            </button>
            <div className="flex-1 bg-[#25273a] rounded-full px-3.5 py-1.5 flex items-center border border-[#31344c] focus-within:border-[#4ee5c5]">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Send a cozy message..."
                className="w-full bg-transparent outline-none text-xs text-[#f1eff9] placeholder-[#787691]"
              />
            </div>
            <button
              type="submit"
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#4ee5c5] to-[#7dfade] text-[#00382e] flex items-center justify-center shadow-md shadow-[#4ee5c5]/20 shrink-0 cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-base"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                send
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const MobileDeviceFrame: React.FC = () => {
  const { room } = useRoom();

  if (!room) {
    return (
      <div className="w-full flex justify-center py-12 text-[#b9b5cb] text-sm">
        <p>No active room. Create or join a room first.</p>
      </div>
    );
  }

  return <MobileDeviceFrameContent room={room} />;
};
