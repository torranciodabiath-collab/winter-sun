import React, { useState } from 'react';
import { useRoom } from '../context/RoomContext';
import { RemoteMode } from '../types';

export const RoomSettingsView: React.FC = () => {
  const {
    room,
    localSettings,
    updateLocalSettings,
    updateSettings,
    setRemoteMode,
    passRemote,
    copyInviteLink,
    showToast
  } = useRoom();

  if (!room) return null;

  const [bandwidthSlider, setBandwidthSlider] = useState(110);
  const [privacyMode, setPrivacyMode] = useState<'couples' | 'friends'>('couples');
  const [transcodeOption, setTranscodeOption] = useState<'original' | 'adaptive'>('original');

  const getSliderText = (val: number) => {
    if (val >= 90) return 'Ultra Smooth (Fastest) ✨';
    if (val >= 50) return 'HD Balanced (Cozy)';
    return 'Battery Saver Mode';
  };

  const handleSaveAll = () => {
    updateSettings({
      bandwidthTier: getSliderText(bandwidthSlider),
      privacy: privacyMode === 'couples' ? 'couples_only' : 'friends'
    });
    showToast('All room & playback preferences saved! 💕');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-6">
      {/* Cozy Header Section */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 bg-[#181a26]/80 border border-[#282b3f] rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#ff79b0]/5 to-transparent pointer-events-none"></div>

        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-2 text-[#ff79b0] text-xs font-semibold tracking-wide">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              sparkles
            </span>
            <span>Movie Date Controls • Cozy Sanctuary</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#f1eef8] tracking-tight">
            Cozy Room Settings
          </h1>

          {/* Room Selector & Info Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2 bg-[#202334] px-3.5 py-1.5 rounded-full border border-[#282b3f] text-[#f1eef8] font-medium">
              <span className="material-symbols-outlined text-[#ff79b0] text-sm">local_florist</span>
              <span>{room.name}</span>
              <span className="text-[10px] bg-[#12131c] text-[#ff79b0] px-2 py-0.5 rounded-full border border-[#ff79b0]/30 font-semibold font-mono">
                {room.id}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#202334] px-3 py-1.5 rounded-full border border-[#282b3f] text-[#b9b5cb]">
              <span className="material-symbols-outlined text-[#4ee5c5] text-sm">
                sentiment_very_satisfied
              </span>
              <span>Sync Quality: Perfect Match (100%)</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#202334] px-3 py-1.5 rounded-full border border-[#282b3f] text-[#b9b5cb]">
              <span className="material-symbols-outlined text-[#ff79b0] text-sm">lock_clock</span>
              <span>Together for 2h 45m</span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto relative z-10">
          <button
            type="button"
            onClick={copyInviteLink}
            className="flex items-center gap-1.5 bg-[#202334] hover:bg-[#282b3f] text-[#f1eef8] border border-[#282b3f] px-4 py-2 rounded-full text-xs font-semibold shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm text-[#ff79b0]">link</span>
            <span>Share Date Link</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#ff79b0] to-[#ff9bc4] text-[#4c0024] font-bold text-xs px-5 py-2 rounded-full shadow-lg shadow-[#ff79b0]/25 active:scale-95 transition-all cursor-pointer"
          >
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
            <span>Save Preferences</span>
          </button>

          <button
            type="button"
            onClick={() => showToast('Date session saved. Sleep tight! 🌙')}
            className="flex items-center gap-1.5 bg-[#202334] text-[#ffb4ab] hover:bg-[#ffb4ab]/15 border border-[#ffb4ab]/25 px-4 py-2 rounded-full text-xs font-semibold active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">nightlight</span>
            <span>Wrap Up Date</span>
          </button>
        </div>
      </section>

      {/* Main 2-Column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ================= CARD 1: PLAYBACK & REMOTE SHARING ================= */}
        <section className="bg-[#181a26] border border-[#282b3f] rounded-2xl p-6 flex flex-col gap-5 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-[#282b3f]/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#ff79b0]/15 flex items-center justify-center text-[#ff79b0]">
                <span className="material-symbols-outlined text-lg">play_circle</span>
              </div>
              <h2 className="text-base font-bold text-[#f1eef8] tracking-tight">
                Playback &amp; Remote Sharing
              </h2>
            </div>
            <span className="text-xs px-3 py-0.5 rounded-full bg-[#ff79b0]/15 text-[#ff79b0] border border-[#ff79b0]/30 font-semibold">
              Date Mode
            </span>
          </div>

          {/* Radio Cards: Control Mode */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-[#b9b5cb] uppercase tracking-wider font-semibold">
              Who Holds The Remote?
            </span>
            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {/* Option 1: Shared Remote */}
              <label
                onClick={() => setRemoteMode('shared')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 ${
                  room.remoteMode === 'shared'
                    ? 'bg-[#202334] border-[#ff79b0]'
                    : 'bg-[#181a26] border-[#282b3f] hover:bg-[#202334]'
                }`}
              >
                <input
                  type="radio"
                  name="playback_mode"
                  checked={room.remoteMode === 'shared'}
                  onChange={() => setRemoteMode('shared')}
                  className="mt-1 accent-[#ff79b0] w-4 h-4 shrink-0"
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#f1eef8] flex items-center gap-2 flex-wrap">
                      Shared Remote (Both Can Pause)
                      <span className="text-[10px] bg-[#ff79b0]/20 text-[#ff79b0] border border-[#ff79b0]/40 px-2 py-0.5 rounded-full font-bold">
                        BEST FOR US 💕
                      </span>
                    </span>
                    <span className="material-symbols-outlined text-[#ff79b0] text-base shrink-0">
                      supervisor_account
                    </span>
                  </div>
                  <p className="text-xs text-[#b9b5cb] pt-1 leading-relaxed">
                    Either one of you can pause for snack breaks, rewind funny moments, or adjust volume anytime without asking!
                  </p>
                </div>
              </label>

              {/* Option 2: Take Turns */}
              <label
                onClick={() => setRemoteMode('turn_taking')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 ${
                  room.remoteMode === 'turn_taking'
                    ? 'bg-[#202334] border-[#ff79b0]'
                    : 'bg-[#181a26] border-[#282b3f] hover:bg-[#202334]'
                }`}
              >
                <input
                  type="radio"
                  name="playback_mode"
                  checked={room.remoteMode === 'turn_taking'}
                  onChange={() => setRemoteMode('turn_taking')}
                  className="mt-1 accent-[#ff79b0] w-4 h-4 shrink-0"
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#f1eef8]">
                      Take Turns (Pass the Remote)
                    </span>
                    <span className="material-symbols-outlined text-[#b9b5cb] text-base shrink-0">
                      settings_remote
                    </span>
                  </div>
                  <p className="text-xs text-[#b9b5cb] pt-1 leading-relaxed">
                    Keep one active remote holder. Pass the cute remote token back and forth whenever someone wants to steer the playlist.
                  </p>
                </div>
              </label>

              {/* Option 3: Host Exclusive */}
              <label
                onClick={() => setRemoteMode('host_only')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 ${
                  room.remoteMode === 'host_only'
                    ? 'bg-[#202334] border-[#ff79b0]'
                    : 'bg-[#181a26] border-[#282b3f] hover:bg-[#202334]'
                }`}
              >
                <input
                  type="radio"
                  name="playback_mode"
                  checked={room.remoteMode === 'host_only'}
                  onChange={() => setRemoteMode('host_only')}
                  className="mt-1 accent-[#ff79b0] w-4 h-4 shrink-0"
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#f1eef8]">Host Curated</span>
                    <span className="material-symbols-outlined text-[#b9b5cb] text-base shrink-0">
                      lock
                    </span>
                  </div>
                  <p className="text-xs text-[#b9b5cb] pt-1 leading-relaxed">
                    Only Alex controls playback. Perfect if you planned a surprise watch order or want Maya to just sit back and relax.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Couple Comfort Toggles */}
          <div className="flex flex-col gap-3 pt-1">
            {/* Toggle 1: Snack break */}
            <div className="flex items-center justify-between p-4 bg-[#202334] border border-[#282b3f] rounded-xl">
              <div className="flex flex-col gap-0.5 pr-4">
                <span className="text-xs font-bold text-[#f1eef8]">Snack Break Auto-Pause</span>
                <span className="text-xs text-[#b9b5cb] leading-relaxed">
                  If either of your connections lags or buffers, pauses gently so no one misses a scene.
                </span>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ snackPause: !room.snackPause })}
                className={`w-12 h-6 rounded-full flex items-center p-0.5 transition-colors duration-200 shrink-0 cursor-pointer ${
                  room.snackPause ? 'bg-[#ff79b0]' : 'bg-[#282b3f]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform duration-200 shadow-sm flex items-center justify-center ${
                    room.snackPause
                      ? 'bg-[#4c0024] translate-x-6'
                      : 'bg-[#b9b5cb] translate-x-0'
                  }`}
                >
                  {room.snackPause && (
                    <span className="material-symbols-outlined text-[10px] text-white">check</span>
                  )}
                </div>
              </button>
            </div>

            {/* Toggle 2: Audio equalizer */}
            <div className="flex items-center justify-between p-4 bg-[#202334] border border-[#282b3f] rounded-xl">
              <div className="flex flex-col gap-0.5 pr-4">
                <span className="text-xs font-bold text-[#f1eef8]">Gentle Audio Equalizer</span>
                <span className="text-xs text-[#b9b5cb] leading-relaxed">
                  Balances loud explosions and soft whispers so late-night watching stays cozy and relaxing.
                </span>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ gentleAudio: !room.gentleAudio })}
                className={`w-12 h-6 rounded-full flex items-center p-0.5 transition-colors duration-200 shrink-0 cursor-pointer ${
                  room.gentleAudio ? 'bg-[#ff79b0]' : 'bg-[#282b3f]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform duration-200 shadow-sm flex items-center justify-center ${
                    room.gentleAudio
                      ? 'bg-[#4c0024] translate-x-6'
                      : 'bg-[#b9b5cb] translate-x-0'
                  }`}
                >
                  {room.gentleAudio && (
                    <span className="material-symbols-outlined text-[10px] text-white">check</span>
                  )}
                </div>
              </button>
            </div>

            {/* Cozy Status Pill */}
            <div className="bg-[#12131c] p-4 rounded-xl border border-[#282b3f] flex flex-col gap-2">
              <div className="flex justify-between items-center text-[#b9b5cb] text-xs">
                <span className="flex items-center gap-1.5">
                  <span
                    className="material-symbols-outlined text-[#4ee5c5] text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                  Connection Harmony
                </span>
                <span className="text-[#4ee5c5] font-semibold">100% In Sync</span>
              </div>
              <div className="w-full h-2 bg-[#202334] rounded-full overflow-hidden flex">
                <div className="h-full bg-gradient-to-r from-[#ff79b0] to-[#4ee5c5] w-full rounded-full"></div>
              </div>
              <div className="flex justify-between text-[#b9b5cb] text-[11px] pt-0.5">
                <span>Direct Partner Link: Active</span>
                <span>Lag Offset: 0.2ms (Seamless)</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CARD 2: OUR COZY ROOM & PARTNER ================= */}
        <section className="bg-[#181a26] border border-[#282b3f] rounded-2xl p-6 flex flex-col gap-5 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-[#282b3f]/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#4ee5c5]/15 flex items-center justify-center text-[#4ee5c5]">
                <span className="material-symbols-outlined text-lg">hotel_class</span>
              </div>
              <h2 className="text-base font-bold text-[#f1eef8] tracking-tight">
                Our Cozy Room &amp; Partner
              </h2>
            </div>
            <span className="text-xs px-3 py-0.5 rounded-full bg-[#4ee5c5]/15 text-[#4ee5c5] border border-[#4ee5c5]/30 font-semibold">
              {room.members.length} Loving Viewers
            </span>
          </div>

          {/* Room Privacy Mode */}
          <div className="grid grid-cols-2 gap-2 bg-[#202334] p-1.5 rounded-full border border-[#282b3f]">
            <button
              type="button"
              onClick={() => setPrivacyMode('couples')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                privacyMode === 'couples'
                  ? 'bg-gradient-to-r from-[#ff79b0] to-[#ff9bc4] text-[#4c0024] shadow-sm'
                  : 'text-[#b9b5cb] hover:text-[#f1eef8]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">lock_open</span>
              <span>Couples Only (Secret)</span>
            </button>

            <button
              type="button"
              onClick={() => setPrivacyMode('friends')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                privacyMode === 'friends'
                  ? 'bg-gradient-to-r from-[#ff79b0] to-[#ff9bc4] text-[#4c0024] shadow-sm'
                  : 'text-[#b9b5cb] hover:text-[#f1eef8]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">group</span>
              <span>Add Close Friends</span>
            </button>
          </div>

          {/* Privacy Protection Pill */}
          <div className="flex items-center justify-between p-4 bg-[#202334] border border-[#282b3f] rounded-xl">
            <div className="flex flex-col gap-0.5 pr-4">
              <span className="text-xs font-bold text-[#f1eef8]">Strict Couple Privacy</span>
              <span className="text-xs text-[#b9b5cb] leading-relaxed">
                No stranger can join or view the date room. IP addresses &amp; network details are permanently shielded.
              </span>
            </div>
            <button
              type="button"
              className="w-12 h-6 rounded-full bg-[#4ee5c5] flex items-center p-0.5 shrink-0"
            >
              <div className="w-5 h-5 rounded-full bg-[#00382d] translate-x-6 shadow-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-[10px] text-white">check</span>
              </div>
            </button>
          </div>

          {/* Date Attendees Table */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#b9b5cb] uppercase tracking-wider font-semibold">
                Date Night Members
              </span>
              <span className="text-xs text-[#ff79b0] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff79b0]"></span>
                In Room ({room.members.length}/2)
              </span>
            </div>

            <div className="bg-[#12131c] rounded-xl border border-[#282b3f] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#202334] text-[#b9b5cb] text-[11px] font-semibold border-b border-[#282b3f]">
                    <th className="py-2.5 px-4">SWEETHEARTS</th>
                    <th className="py-2.5 px-3 text-center">BADGE</th>
                    <th className="py-2.5 px-3 text-center">STATUS</th>
                    <th className="py-2.5 px-4 text-right">REMOTE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282b3f]/50">
                  {room.members.map((member) => (
                    <tr key={member.id} className="hover:bg-[#202334]/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {member.avatarUrl.startsWith('http') ? (
                              <img
                                src={member.avatarUrl}
                                alt={member.name}
                                className={`w-8 h-8 rounded-full object-cover ring-2 ${
                                  member.role === 'host' ? 'ring-[#ff79b0]' : 'ring-[#4ee5c5]'
                                }`}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#ff79b0]/20 flex items-center justify-center text-sm font-bold">
                                {member.avatarUrl}
                              </div>
                            )}
                            <span className="absolute -bottom-1 -right-1 text-xs">
                              {member.role === 'host' ? '🍿' : '💖'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#f1eef8] text-xs">{member.name}</span>
                            <span className="text-[10px] text-[#b9b5cb]">
                              {member.role === 'host' ? 'Ready with popcorn' : 'Cozy in blanket'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                            member.role === 'host'
                              ? 'bg-[#ff79b0]/20 text-[#ff79b0] border-[#ff79b0]/40'
                              : 'bg-[#4ee5c5]/20 text-[#4ee5c5] border-[#4ee5c5]/40'
                          }`}
                        >
                          {member.role === 'host' ? 'HOST 👑' : 'PLAYER 2 🎮'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center text-[#4ee5c5] font-medium text-xs">
                        Watching
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => passRemote(member.id, member.name)}
                            className={`p-1.5 rounded-full transition-colors ${
                              room.remoteHolderId === member.id
                                ? 'text-[#ff79b0] hover:bg-[#ff79b0]/20'
                                : 'text-[#b9b5cb] hover:text-[#4ee5c5]'
                            }`}
                            title="Pass remote to this member"
                          >
                            <span className="material-symbols-outlined text-base">
                              {room.remoteHolderId === member.id ? 'settings_remote' : 'check_circle'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ================= CARD 3: STREAM QUALITY & COMFORT ================= */}
        <section className="bg-[#181a26] border border-[#282b3f] rounded-2xl p-6 flex flex-col gap-5 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-[#282b3f]/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#ff79b0]/15 flex items-center justify-center text-[#ff79b0]">
                <span className="material-symbols-outlined text-lg">hd</span>
              </div>
              <h2 className="text-base font-bold text-[#f1eef8] tracking-tight">
                Stream Quality &amp; Comfort
              </h2>
            </div>
            <span className="text-xs px-3 py-0.5 rounded-full bg-[#ff79b0]/15 text-[#ff79b0] border border-[#ff79b0]/30 font-semibold">
              Crystal Clear
            </span>
          </div>

          {/* Streaming Mode Pill */}
          <div className="flex items-center justify-between bg-[#202334] border border-[#282b3f] p-4 rounded-xl">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#f1eef8]">Cinema Quality Mode</span>
              <span className="text-xs text-[#b9b5cb]">
                High-fidelity lossless streaming directly to each other
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#4ee5c5]/15 border border-[#4ee5c5]/30 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#4ee5c5]"></span>
              <span className="text-xs text-[#4ee5c5] font-bold">Crisp 1080p / 4K</span>
            </div>
          </div>

          {/* Streaming Smoothness Slider */}
          <div className="flex flex-col gap-2.5 bg-[#202334] border border-[#282b3f] p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#f1eef8]">Streaming Smoothness</span>
                <span className="text-xs text-[#b9b5cb]">
                  Keeps both devices perfectly synced even on Wi-Fi
                </span>
              </div>
              <span className="text-xs font-bold text-[#ff79b0]">
                {getSliderText(bandwidthSlider)}
              </span>
            </div>
            <div className="py-2">
              <input
                type="range"
                min="10"
                max="110"
                step="10"
                value={bandwidthSlider}
                onChange={(e) => setBandwidthSlider(parseInt(e.target.value, 10))}
                className="w-full accent-[#ff79b0] h-2 bg-[#12131c] rounded-full cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#b9b5cb] pt-2">
                <span>Battery Saver</span>
                <span>Balanced</span>
                <span>High Quality</span>
                <span className="text-[#ff79b0] font-bold">Ultra Smooth ✨</span>
              </div>
            </div>
          </div>

          {/* Quality Preferences Options */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-[#b9b5cb] uppercase tracking-wider font-semibold">
              Cozy Viewing Options
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label
                onClick={() => setTranscodeOption('original')}
                className={`cursor-pointer border-2 p-4 rounded-xl flex items-start gap-3 transition-all ${
                  transcodeOption === 'original'
                    ? 'bg-[#202334] border-[#ff79b0]'
                    : 'bg-[#181a26] border-[#282b3f] hover:bg-[#202334]'
                }`}
              >
                <input
                  type="radio"
                  name="transcode_opt"
                  checked={transcodeOption === 'original'}
                  onChange={() => setTranscodeOption('original')}
                  className="mt-1 accent-[#ff79b0] w-4 h-4 shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#f1eef8]">Original Quality</span>
                  <span className="text-xs text-[#b9b5cb] pt-0.5">
                    Crystal clear colors &amp; perfect audio matching your source file.
                  </span>
                </div>
              </label>

              <label
                onClick={() => setTranscodeOption('adaptive')}
                className={`cursor-pointer border-2 p-4 rounded-xl flex items-start gap-3 transition-all ${
                  transcodeOption === 'adaptive'
                    ? 'bg-[#202334] border-[#ff79b0]'
                    : 'bg-[#181a26] border-[#282b3f] hover:bg-[#202334]'
                }`}
              >
                <input
                  type="radio"
                  name="transcode_opt"
                  checked={transcodeOption === 'adaptive'}
                  onChange={() => setTranscodeOption('adaptive')}
                  className="mt-1 accent-[#ff79b0] w-4 h-4 shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#f1eef8]">Adaptive Cozy</span>
                  <span className="text-xs text-[#b9b5cb] pt-0.5">
                    Auto-adjusts if one of you moves to phone or has slow Wi-Fi.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </section>

        {/* ================= CARD 4: AUDIO & SUBTITLE STYLING ================= */}
        <section className="bg-[#181a26] border border-[#282b3f] rounded-2xl p-6 flex flex-col gap-5 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-[#282b3f]/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#4ee5c5]/15 flex items-center justify-center text-[#4ee5c5]">
                <span className="material-symbols-outlined text-lg">subtitles</span>
              </div>
              <h2 className="text-base font-bold text-[#f1eef8] tracking-tight">
                Audio &amp; Subtitle Styling
              </h2>
            </div>
            <span className="text-xs px-3 py-0.5 rounded-full bg-[#4ee5c5]/15 text-[#4ee5c5] border border-[#4ee5c5]/30 font-semibold">
              Custom Look
            </span>
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#b9b5cb] uppercase tracking-wider font-semibold">
                Audio Language
              </label>
              <select className="w-full bg-[#202334] border border-[#282b3f] text-[#f1eef8] py-2.5 px-3 rounded-xl appearance-none text-xs focus:outline-none focus:border-[#ff79b0] cursor-pointer">
                <option>English (Original Cinema Track)</option>
                <option>English (Director's Commentary)</option>
                <option>Japanese (Original with Subs)</option>
                <option>French (Sweet Romance Dub)</option>
                <option>Spanish (Castilian)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#b9b5cb] uppercase tracking-wider font-semibold">
                Subtitles
              </label>
              <select className="w-full bg-[#202334] border border-[#282b3f] text-[#f1eef8] py-2.5 px-3 rounded-xl appearance-none text-xs focus:outline-none focus:border-[#ff79b0] cursor-pointer">
                <option>English (Complete Dialogue)</option>
                <option>English (Foreign Speech Only)</option>
                <option>Spanish (Latin America)</option>
                <option>French (Subtitles)</option>
                <option>None (Subtitles Off)</option>
              </select>
            </div>
          </div>

          {/* Auto-Find Subtitles Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#202334] border border-[#282b3f] rounded-xl">
            <div className="flex flex-col gap-0.5 pr-4">
              <span className="text-xs font-bold text-[#f1eef8]">Auto-Find Cozy Subtitles</span>
              <span className="text-xs text-[#b9b5cb] leading-relaxed">
                Automatically downloads perfectly matched subtitles so you don't have to look for them.
              </span>
            </div>
            <button
              type="button"
              className="w-12 h-6 rounded-full bg-[#ff79b0] flex items-center p-0.5 shrink-0"
            >
              <div className="w-5 h-5 rounded-full bg-[#4c0024] translate-x-6 shadow-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-[10px] text-white">check</span>
              </div>
            </button>
          </div>

          {/* Subtitle Palette Presets */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-[#b9b5cb] uppercase tracking-wider font-semibold">
              Subtitle Palette (Soft &amp; Readable)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Pastel Pink */}
              <div
                onClick={() => updateLocalSettings({ subPalette: 'pink' })}
                className={`cursor-pointer p-3.5 rounded-xl flex flex-col justify-between h-28 relative transition-all border-2 ${
                  localSettings.subPalette === 'pink'
                    ? 'bg-[#202334] border-[#ff79b0] shadow-sm'
                    : 'bg-[#181a26] border-[#282b3f] hover:bg-[#202334]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#f1eef8]">Pastel Pink</span>
                  <span
                    className="material-symbols-outlined text-[#ff79b0] text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                </div>
                <div className="w-full text-center py-1.5 bg-[#12131c]/90 rounded-lg">
                  <span className="text-xs font-bold tracking-wide text-[#ff79b0]">
                    "I love this part! 💕"
                  </span>
                </div>
              </div>

              {/* Warm Mint */}
              <div
                onClick={() => updateLocalSettings({ subPalette: 'mint' })}
                className={`cursor-pointer p-3.5 rounded-xl flex flex-col justify-between h-28 relative transition-all border-2 ${
                  localSettings.subPalette === 'mint'
                    ? 'bg-[#202334] border-[#4ee5c5] shadow-sm'
                    : 'bg-[#181a26] border-[#282b3f] hover:bg-[#202334]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#f1eef8]">Warm Mint</span>
                  <span className="w-3.5 h-3.5 rounded-full bg-[#4ee5c5]/30 border border-[#4ee5c5]"></span>
                </div>
                <div className="w-full text-center py-1.5 bg-[#12131c]/90 rounded-lg">
                  <span className="text-xs font-bold tracking-wide text-[#4ee5c5]">
                    "I love this part! 🌿"
                  </span>
                </div>
              </div>

              {/* Cozy White */}
              <div
                onClick={() => updateLocalSettings({ subPalette: 'white' })}
                className={`cursor-pointer p-3.5 rounded-xl flex flex-col justify-between h-28 relative transition-all border-2 ${
                  localSettings.subPalette === 'white'
                    ? 'bg-[#202334] border-white shadow-sm'
                    : 'bg-[#181a26] border-[#282b3f] hover:bg-[#202334]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#f1eef8]">Cozy White</span>
                  <span className="w-3.5 h-3.5 rounded-full bg-white/20 border border-white/50"></span>
                </div>
                <div className="w-full text-center py-1.5 bg-[#12131c]/90 rounded-lg">
                  <span className="text-xs font-medium tracking-wide text-[#f1eef8]">
                    "I love this part!"
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bluetooth Headphone Delay Box */}
          <div className="bg-[#202334] border border-[#282b3f] p-4 rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#f1eef8]">
                Bluetooth Headphone Sync Offset
              </span>
              <span className="text-xs text-[#b9b5cb]">
                Fixes tiny audio delay when using AirPods or wireless buds
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() =>
                  updateLocalSettings({
                    bluetoothDelayMs: localSettings.bluetoothDelayMs - 10
                  })
                }
                className="w-7 h-7 bg-[#181a26] hover:bg-[#282b3f] border border-[#282b3f] rounded-lg text-[#f1eef8] flex items-center justify-center transition-all cursor-pointer"
              >
                -
              </button>
              <span className="px-2 text-[#4ee5c5] tabular-nums">
                {localSettings.bluetoothDelayMs}ms
              </span>
              <button
                type="button"
                onClick={() =>
                  updateLocalSettings({
                    bluetoothDelayMs: localSettings.bluetoothDelayMs + 10
                  })
                }
                className="w-7 h-7 bg-[#181a26] hover:bg-[#282b3f] border border-[#282b3f] rounded-lg text-[#f1eef8] flex items-center justify-center transition-all cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Encrypted Status Strip */}
      <section className="bg-[#181a26] border border-[#282b3f] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#ff79b0]/15 flex items-center justify-center text-[#ff79b0]">
            <span className="material-symbols-outlined text-base">lock</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#f1eef8]">
              End-to-End Encrypted Couple Stream
            </span>
            <span className="text-[11px] text-[#b9b5cb]">
              Only you and your partner can watch • No logs or recordings stored
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-[#b9b5cb]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4ee5c5] animate-pulse"></span>
            Partner Connected
          </span>
          <span className="hidden sm:inline text-[#282b3f]">•</span>
          <span>Text Chat Only (No Mic / Cam Needed)</span>
        </div>
      </section>
    </div>
  );
};
