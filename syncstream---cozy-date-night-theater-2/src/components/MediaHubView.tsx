import React, { useState, useRef } from 'react';
import { useRoom } from '../context/RoomContext';

interface MediaHubViewProps {
  onStartTheater: () => void;
}

export const MediaHubView: React.FC<MediaHubViewProps> = ({ onStartTheater }) => {
  const { room, loadMedia, showToast } = useRoom();

  if (!room) return null;

  const [activeTab, setActiveTab] = useState<'torrent' | 'local'>('torrent');
  const [magnetInput, setMagnetInput] = useState(room.video.magnetUri || '');
  const [selectedFileName, setSelectedFileName] = useState(room.video.title || 'Movie Stream');
  const [selectedMovieTitle, setSelectedMovieTitle] = useState(room.video.title || 'Movie Stream');
  const [isInspecting, setIsInspecting] = useState(false);
  const [customSubtitleName, setCustomSubtitleName] = useState('');

  const localFileInputRef = useRef<HTMLInputElement>(null);
  const subFileInputRef = useRef<HTMLInputElement>(null);

  const presets = [
    {
      title: 'Spirited Away 4K Remaster',
      fileName: 'Spirited_Away_2001_Remastered_4K.mkv',
      url: '/videos/sample-cinema.mp4',
      magnet: 'magnet:?xt=urn:btih:e5832a888c39d49488e0e5a87b7a544f885e3d7a&dn=Spirited+Away+4K'
    },
    {
      title: "Howl's Moving Castle (1080p)",
      fileName: 'Howls_Moving_Castle_DualAudio_1080p.mkv',
      url: '/videos/sintel-trailer.mp4',
      magnet: 'magnet:?xt=urn:btih:2b24d7756f17e089d70c406de466b048fa5dcfdf&dn=Howls+Moving+Castle'
    },
    {
      title: 'Your Name (Kimi no Na wa) 4K',
      fileName: 'Your_Name_2016_4K_HDR.mkv',
      url: '/videos/sample-cinema.mp4',
      magnet: 'magnet:?xt=urn:btih:08a806904f2e519c5c24e031a0e8cb55ecb50e04&dn=Your+Name+4K'
    }
  ];

  const handleSelectPreset = (preset: typeof presets[0]) => {
    setMagnetInput(preset.magnet);
    setSelectedFileName(preset.fileName);
    setSelectedMovieTitle(preset.title);
    loadMedia({
      title: preset.title,
      sourceUrl: preset.url,
      type: 'torrent',
      magnetUri: preset.magnet
    });
    showToast(`Queued ${preset.title} for date night ✨`);
  };

  const handleInspect = () => {
    if (!magnetInput.trim()) {
      showToast('Please paste a magnet link or stream URL first');
      return;
    }
    setIsInspecting(true);

    const cleanMagnet = magnetInput.trim();
    let extractedTitle = 'Torrent Movie Stream';
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

    setSelectedMovieTitle(extractedTitle);
    setSelectedFileName(extractedTitle);

    setTimeout(() => {
      loadMedia({
        title: extractedTitle,
        sourceUrl: cleanMagnet.startsWith('http') ? cleanMagnet : '',
        magnetUri: cleanMagnet,
        type: 'torrent'
      });
      setIsInspecting(false);
      showToast(`Torrent swarm prepared: "${extractedTitle}" 🎬💕`);
    }, 600);
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setSelectedFileName(file.name);
      setSelectedMovieTitle(file.name.replace(/\.[^/.]+$/, ''));
      loadMedia({
        title: file.name.replace(/\.[^/.]+$/, ''),
        sourceUrl: fileUrl,
        type: 'local'
      });
      showToast(`Ready to stream local file: ${file.name} 🎬`);
    }
  };

  const handleSubtitleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomSubtitleName(file.name);
      showToast(`Linked custom subtitle file: ${file.name} 📝`);
    }
  };

  const handleStartMovie = () => {
    if (activeTab === 'torrent' && magnetInput.trim()) {
      const cleanMagnet = magnetInput.trim();
      let extractedTitle = selectedMovieTitle || 'Torrent Movie Stream';
      if (cleanMagnet.includes('dn=')) {
        try {
          extractedTitle = decodeURIComponent(cleanMagnet.split('dn=')[1].split('&')[0]).replace(/\+/g, ' ');
        } catch (e) {}
      }
      loadMedia({
        title: extractedTitle,
        sourceUrl: cleanMagnet.startsWith('http') ? cleanMagnet : '',
        magnetUri: cleanMagnet,
        type: 'torrent'
      });
    }
    showToast('Starting cozy movie date night... grab your popcorn! 🍿');
    onStartTheater();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff79b0] flex items-center gap-1">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                sparkles
              </span>
              Movie Date Night
            </span>
            <span className="text-[#6d6984] text-xs">•</span>
            <span className="text-[11px] px-3 py-0.5 rounded-full bg-[#ff79b0]/15 text-[#ff79b0] border border-[#ff79b0]/30 font-bold">
              {activeTab === 'torrent' ? 'COZY WEBRTC MAGNET STREAM' : 'COZY DIRECT BROWSER BEAM'}
            </span>
            <span className="text-[11px] px-3 py-0.5 rounded-full bg-[#4ee5c5]/15 text-[#4ee5c5] border border-[#4ee5c5]/30 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">lock</span>
              100% PRIVATE P2P
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#f1eef8] tracking-tight flex items-center gap-2">
            Couple's Movie Night Hub <span className="text-[#ff79b0] text-2xl">🍿✨</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#b9b5cb] mt-2 leading-relaxed">
            Put on your cozy clothes, grab your snacks, and queue up your favorite movies! Stream torrent links smoothly or beam files right from your laptop with perfectly synchronized playback and romantic zero-delay audio.
          </p>
        </div>

        {/* Protocol Tabs */}
        <div className="flex items-center bg-[#181a26] p-1.5 rounded-full border border-[#282b3f] shadow-lg shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('torrent')}
            className={`px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'torrent'
                ? 'bg-[#ff79b0] text-[#4a0425] shadow-md shadow-[#ff79b0]/25'
                : 'text-[#b9b5cb] hover:text-[#f1eef8]'
            }`}
          >
            <span className="material-symbols-outlined text-base">cloud_download</span>
            <span>Torrent / Magnet Stream</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'local'
                ? 'bg-[#ff79b0] text-[#4a0425] shadow-md shadow-[#ff79b0]/25'
                : 'text-[#b9b5cb] hover:text-[#f1eef8]'
            }`}
          >
            <span className="material-symbols-outlined text-base">folder_special</span>
            <span>Cast Our Local Files</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 12-Column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Input & Stream Inspector */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          {activeTab === 'torrent' ? (
            /* Magnet Input Card */
            <div className="bg-[#181a26] rounded-2xl p-5 sm:p-6 shadow-xl border border-[#282b3f] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-[#f1eef8] flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-[#ff79b0] text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                  <span>Paste Movie Magnet Link or Drop .Torrent</span>
                </label>
                <div className="flex items-center gap-1.5 text-[#4ee5c5] text-[11px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#4ee5c5] animate-ping"></span>
                  <span>Swarm Ready for Date Night</span>
                </div>
              </div>

              {/* Paste Input & Action */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={magnetInput}
                    onChange={(e) => setMagnetInput(e.target.value)}
                    placeholder="magnet:?xt=urn:btih:... or drag & drop date night movie torrent"
                    className="w-full bg-[#0d0e16] text-[#f1eef8] text-xs rounded-xl px-4 py-3 pr-10 border border-[#282b3f] focus:outline-none focus:border-[#ff79b0] shadow-inner"
                  />
                  {magnetInput && (
                    <button
                      type="button"
                      onClick={() => setMagnetInput('')}
                      className="absolute right-3 top-3 text-[#b9b5cb] hover:text-[#ff79b0]"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleInspect}
                  disabled={isInspecting}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#ff79b0] to-[#ff9bc4] text-[#4a0425] px-5 py-3 rounded-xl text-xs font-bold shadow-lg shadow-[#ff79b0]/25 transition-all active:scale-95 shrink-0 cursor-pointer"
                >
                  <span
                    className={`material-symbols-outlined text-base ${
                      isInspecting ? 'animate-spin' : ''
                    }`}
                  >
                    {isInspecting ? 'refresh' : 'auto_awesome'}
                  </span>
                  <span>{isInspecting ? 'Inspecting...' : 'Inspect & Prepare'}</span>
                </button>
              </div>

              {/* Couple Favorites Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#282b3f]/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff79b0] flex items-center gap-1 mr-1">
                  <span className="material-symbols-outlined text-xs">local_movies</span>
                  Couple Favorites:
                </span>
                {presets.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="text-xs bg-[#202334] hover:bg-[#ff79b0]/20 text-[#f1eef8] hover:text-[#ff79b0] px-3 py-1.5 rounded-full border border-[#282b3f] hover:border-[#ff79b0]/40 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <span>✨</span>
                    <span>{preset.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Local File Cast Card */
            <div className="bg-[#181a26] rounded-2xl p-6 shadow-xl border border-[#282b3f] flex flex-col gap-4">
              <input
                type="file"
                ref={localFileInputRef}
                accept="video/*"
                className="hidden"
                onChange={handleLocalFileChange}
              />
              <div
                onClick={() => localFileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-8 bg-[#0d0e16] border-2 border-dashed border-[#ff79b0]/40 hover:border-[#ff79b0] rounded-2xl text-center cursor-pointer transition-all hover:bg-[#202334]/60 group"
              >
                <div className="w-14 h-14 rounded-full bg-[#ff79b0]/15 border border-[#ff79b0]/30 flex items-center justify-center text-[#ff79b0] group-hover:scale-110 transition-transform mb-3 shadow-md">
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#f1eef8] mb-1">
                  Pick a movie file from your computer
                </h3>
                <p className="text-xs text-[#b9b5cb] max-w-md mb-4 leading-relaxed">
                  Have a movie downloaded on your laptop? Stream it straight to your partner's screen in lossless quality without uploading to any cloud server!
                </p>
                <button
                  type="button"
                  className="bg-gradient-to-r from-[#ff79b0] to-[#ff9bc4] text-[#4a0425] px-5 py-2.5 rounded-full text-xs font-bold shadow-md shadow-[#ff79b0]/20 hover:brightness-105 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">folder_open</span>
                  <span>Browse Movie Files...</span>
                </button>
              </div>

              {/* Local File Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#202334] p-3 rounded-xl border border-[#282b3f]">
                  <div className="flex items-center gap-1.5 text-[#ff79b0] text-[11px] font-bold uppercase mb-1">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    <span>Zero Waiting</span>
                  </div>
                  <p className="text-xs text-[#b9b5cb]">
                    Streams immediately from your memory buffer so movie night starts right now.
                  </p>
                </div>

                <div className="bg-[#202334] p-3 rounded-xl border border-[#282b3f]">
                  <div className="flex items-center gap-1.5 text-[#4ee5c5] text-[11px] font-bold uppercase mb-1">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    <span>Just For Us Two</span>
                  </div>
                  <p className="text-xs text-[#b9b5cb]">
                    Direct device-to-device WebRTC channel. Nothing stored on any public cloud.
                  </p>
                </div>

                <div className="bg-[#202334] p-3 rounded-xl border border-[#282b3f]">
                  <div className="flex items-center gap-1.5 text-[#d4bbff] text-[11px] font-bold uppercase mb-1">
                    <span className="material-symbols-outlined text-sm">favorite</span>
                    <span>Lossless Quality</span>
                  </div>
                  <p className="text-xs text-[#b9b5cb]">
                    Retains gorgeous 4K bitrates, surround audio, and smooth frame rates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Swarm Telemetry HUD */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#181a26] p-3.5 rounded-2xl border border-[#282b3f] flex items-center gap-3 shadow-md">
              <div className="w-9 h-9 rounded-xl bg-[#ff79b0]/15 border border-[#ff79b0]/20 flex items-center justify-center text-[#ff79b0] shrink-0">
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  groups
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#b9b5cb]">
                  Warm Swarm
                </div>
                <div className="text-xs font-bold text-[#f1eef8] flex items-center gap-1.5 mt-0.5">
                  <span>142 Friendly Peers</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff79b0]"></span>
                </div>
              </div>
            </div>

            <div className="bg-[#181a26] p-3.5 rounded-2xl border border-[#282b3f] flex items-center gap-3 shadow-md">
              <div className="w-9 h-9 rounded-xl bg-[#4ee5c5]/15 border border-[#4ee5c5]/20 flex items-center justify-center text-[#4ee5c5] shrink-0">
                <span className="material-symbols-outlined text-lg">timer</span>
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#b9b5cb]">
                  Buffer Ready In
                </div>
                <div className="text-xs font-bold text-[#f1eef8] mt-0.5">
                  &lt; 2.5s (Instant)
                </div>
              </div>
            </div>

            <div className="bg-[#181a26] p-3.5 rounded-2xl border border-[#282b3f] flex items-center gap-3 shadow-md">
              <div className="w-9 h-9 rounded-xl bg-[#d4bbff]/15 border border-[#d4bbff]/20 flex items-center justify-center text-[#d4bbff] shrink-0">
                <span className="material-symbols-outlined text-lg">speed</span>
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#b9b5cb]">
                  Stream Speed
                </div>
                <div className="text-xs font-bold text-[#f1eef8] mt-0.5">
                  28.4 MB/s Crisp
                </div>
              </div>
            </div>

            <div className="bg-[#181a26] p-3.5 rounded-2xl border border-[#282b3f] flex items-center gap-3 shadow-md">
              <div className="w-9 h-9 rounded-xl bg-[#4ee5c5]/15 border border-[#4ee5c5]/20 flex items-center justify-center text-[#4ee5c5] shrink-0">
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  favorite
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#b9b5cb]">
                  Couple Privacy
                </div>
                <div className="text-xs font-bold text-[#4ee5c5] mt-0.5">
                  Encrypted Tunnel
                </div>
              </div>
            </div>
          </div>

          {/* Torrent Package Inspector */}
          <div className="bg-[#181a26] rounded-2xl p-5 sm:p-6 shadow-xl border border-[#282b3f] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#282b3f] gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-[#f1eef8] flex items-center gap-1.5">
                  <span className="text-[#ff79b0]">♡</span> Movie Package Inspector
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#4ee5c5]/20 text-[#4ee5c5] border border-[#4ee5c5]/40 font-bold">
                  READY FOR DATE NIGHT ♡
                </span>
              </div>
              <span className="text-xs text-[#b9b5cb] bg-[#202334] px-3 py-1 rounded-full border border-[#282b3f]">
                Total Package: <strong className="text-[#ff79b0]">6.12 GB</strong>
              </span>
            </div>

            {/* File List */}
            <div className="flex flex-col gap-2.5">
              {/* Main Feature */}
              <div
                onClick={() => setSelectedFileName('Spirited_Away_2001_Remastered_4K.mkv')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedFileName.includes('Spirited')
                    ? 'bg-[#202334] border-[#ff79b0] shadow-sm'
                    : 'bg-[#181a26] border-[#282b3f] hover:bg-[#202334]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`material-symbols-outlined text-lg ${
                      selectedFileName.includes('Spirited') ? 'text-[#ff79b0]' : 'text-[#6d6984]'
                    }`}
                    style={selectedFileName.includes('Spirited') ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    favorite
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#ff79b0]/20 flex items-center justify-center text-[#ff79b0] shrink-0">
                    <span className="material-symbols-outlined text-base">movie</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#f1eef8] truncate flex items-center gap-2">
                      <span>Spirited_Away_2001_Remastered_4K.mkv</span>
                      <span className="text-[9px] bg-[#ff79b0]/20 text-[#ff79b0] px-2 py-0.5 rounded-full font-bold">
                        MAIN FEATURE
                      </span>
                    </div>
                    <div className="text-[10px] text-[#b9b5cb] flex items-center gap-2 mt-0.5">
                      <span>Matroska Cinema</span>
                      <span>•</span>
                      <span className="text-[#4ee5c5]">3840×2160 Vibrant 10-bit</span>
                      <span>•</span>
                      <span>23.98 fps</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#ff79b0] ml-3 shrink-0">4.85 GB</span>
              </div>

              {/* Special Feature */}
              <div
                onClick={() => setSelectedFileName('Spirited_Away_Special_Director_Commentary.mkv')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedFileName.includes('Special')
                    ? 'bg-[#202334] border-[#ff79b0]'
                    : 'bg-[#181a26] border-[#282b3f] hover:bg-[#202334]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`material-symbols-outlined text-lg ${
                      selectedFileName.includes('Special') ? 'text-[#ff79b0]' : 'text-[#6d6984]'
                    }`}
                    style={selectedFileName.includes('Special') ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    favorite
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#202334] flex items-center justify-center text-[#b9b5cb] shrink-0">
                    <span className="material-symbols-outlined text-base">movie_filter</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#f1eef8] truncate">
                      Spirited_Away_Special_Director_Commentary.mkv
                    </div>
                    <div className="text-[10px] text-[#b9b5cb] mt-0.5">
                      Special Feature • 1080p Studio Behind-the-Scenes
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[#b9b5cb] ml-3 shrink-0">1.22 GB</span>
              </div>

              {/* Subtitles File */}
              <div className="bg-[#12131c] border border-[#282b3f] rounded-xl p-3 flex items-center justify-between opacity-85">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="material-symbols-outlined text-[#4ee5c5] text-base shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_fix_high
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#4ee5c5]/15 flex items-center justify-center text-[#4ee5c5] shrink-0">
                    <span className="material-symbols-outlined text-base">subtitles</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#f1eef8] truncate">
                      Subtitles/English_Soft_Romance.ass
                    </div>
                    <div className="text-[10px] text-[#4ee5c5]">
                      Formatted stylized font subtitles automatically linked
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[#b9b5cb] ml-3 shrink-0">52.8 KB</span>
              </div>
            </div>

            {/* Cozy Cinema Specs Sheet */}
            <div className="bg-[#12131c] rounded-xl p-3.5 border border-[#282b3f] flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#ff79b0] flex items-center gap-1 uppercase tracking-wider text-[10px]">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                  Cozy Cinema Specs
                </span>
                <span className="text-[#b9b5cb]">P2P Stream Container: Matroska v4</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="bg-[#181a26] p-2.5 rounded-lg border border-[#282b3f]">
                  <div className="text-[9px] text-[#b9b5cb] uppercase font-bold">Video Quality</div>
                  <div className="text-xs font-bold text-[#f1eef8]">4K Cinema Color Remaster</div>
                  <div className="text-[10px] text-[#4ee5c5] mt-0.5">HEVC Main 10 • HDR</div>
                </div>
                <div className="bg-[#181a26] p-2.5 rounded-lg border border-[#282b3f]">
                  <div className="text-[9px] text-[#b9b5cb] uppercase font-bold">Soundtracks</div>
                  <div className="text-xs font-bold text-[#f1eef8]">Japanese &amp; English Dub</div>
                  <div className="text-[10px] text-[#b9b5cb] mt-0.5">Orchestral Master (5.1)</div>
                </div>
                <div className="bg-[#181a26] p-2.5 rounded-lg border border-[#282b3f]">
                  <div className="text-[9px] text-[#b9b5cb] uppercase font-bold">Cute Subtitles</div>
                  <div className="text-xs font-bold text-[#f1eef8]">English Dialogue + Signs</div>
                  <div className="text-[10px] text-[#ff79b0] mt-0.5">Soft styling with comfortable size</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Subtitle Sidecar & Launch Controller */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          {/* Subtitle & Translation Helper */}
          <div className="bg-[#181a26] rounded-2xl p-5 shadow-xl border border-[#282b3f] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold text-[#f1eef8] flex items-center gap-1.5">
                <span
                  className="material-symbols-outlined text-[#4ee5c5] text-base"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  subtitles
                </span>
                <span>Subtitle &amp; Translation Helper</span>
              </h2>
              <span className="text-[10px] bg-[#4ee5c5]/15 text-[#4ee5c5] border border-[#4ee5c5]/30 px-2.5 py-0.5 rounded-full font-bold">
                .SRT / .VTT / .ASS
              </span>
            </div>

            <p className="text-xs text-[#b9b5cb] leading-relaxed">
              Want custom styled subtitles or translated captions? Drop your subtitle file here and it will sync for both of you automatically!
            </p>

            <input
              type="file"
              ref={subFileInputRef}
              accept=".srt,.vtt,.ass"
              className="hidden"
              onChange={handleSubtitleFileChange}
            />

            <div
              onClick={() => subFileInputRef.current?.click()}
              className="bg-[#0d0e16] border border-dashed border-[#4ee5c5]/40 hover:border-[#4ee5c5] rounded-xl p-4 text-center cursor-pointer transition-all hover:bg-[#202334]/60 flex flex-col items-center justify-center group"
            >
              <span className="material-symbols-outlined text-[#4ee5c5] text-2xl mb-1 group-hover:scale-110 transition-transform">
                add_notes
              </span>
              <div className="text-xs font-bold text-[#f1eef8]">Drop custom subtitle file here</div>
              <div className="text-[10px] text-[#b9b5cb] mt-0.5">Or tap to browse from your device</div>
            </div>

            {/* Loaded Subtitle Chip */}
            <div className="flex items-center justify-between bg-[#202334] border border-[#282b3f] p-2.5 rounded-xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#4ee5c5]/20 flex items-center justify-center text-[#4ee5c5] shrink-0">
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-[#f1eef8] truncate font-bold">
                    {customSubtitleName}
                  </div>
                  <div className="text-[10px] text-[#4ee5c5]">
                    Auto-Synced • 0ms drift • 1,380 dialog cues
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCustomSubtitleName('English_Master_Subtitles.srt')}
                className="text-[#b9b5cb] hover:text-[#ffb4ab] p-1 transition-colors"
                title="Reset subtitle"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>

          {/* Media Visualizer Preview Banner */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#282b3f] bg-[#181a26]">
            <div
              className="w-full h-40 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA_CK8PjJv7rEIH4RS0_42SSeKnT_yBd0Up4uxxzyKGsl2GtLeicw2YnllWJ1FqlBbn5gFswtrl180OzNNESn93aGrJVH8iNmQsykTuwkVkzE-RSgHXp3cqFkG0zgZ-Wlm-Oi3VvnurN7TwfGyEFUOtBGDUk1bHp6M4nylBkfTkM7RvkI5xNWCLHa9hOozkEHOupA1iZpfLUKZ9ok8MHM1rkOwXA2_giRQXHxpgvCu3etmqCJ_EqNIg')`,
                filter: 'brightness(0.75) saturate(1.2)'
              }}
            >
              <div className="w-full h-full bg-gradient-to-t from-[#12131c] via-[#12131c]/50 to-transparent p-4 flex flex-col justify-end">
                <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-[#ff79b0]/25 text-[#ff79b0] border border-[#ff79b0]/40 font-bold backdrop-blur-md self-start">
                  OUR CINEMA BUFFER ACTIVE
                </span>
                <h3 className="text-sm font-bold text-[#f1eef8] mt-1 flex items-center gap-1.5">
                  <span>Cozy Living Room Projection Ready</span>
                  <span className="text-[#ff79b0]">✨</span>
                </h3>
                <p className="text-[11px] text-[#b9b5cb]">
                  16:9 Cinema Wide • True 10-Bit Color • Zero stutter
                </p>
              </div>
            </div>
          </div>

          {/* Ready to Watch Launch Summary Card */}
          <div className="bg-[#181a26] rounded-2xl p-5 shadow-2xl border border-[#282b3f] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#282b3f]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff79b0] animate-pulse"></span>
                <span className="text-xs uppercase tracking-wider text-[#ff79b0] font-bold flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-xs"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    celebration
                  </span>
                  Ready To Watch
                </span>
              </div>
              <span className="text-[10px] bg-[#ff79b0]/15 text-[#ff79b0] border border-[#ff79b0]/30 px-2 py-0.5 rounded-full font-bold">
                Date Night Room #01
              </span>
            </div>

            <div className="bg-[#0d0e16] rounded-xl p-3.5 flex flex-col gap-2 border border-[#282b3f] shadow-inner">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#ff79b0]">
                Currently Queued Movie
              </span>
              <div className="text-sm font-bold text-[#f1eef8] truncate">
                {selectedMovieTitle}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#282b3f]/40 text-xs">
                <div className="bg-[#181a26] p-2 rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-[#b9b5cb] block">Cozy Room</span>
                  <div className="font-bold text-[#f1eef8] text-[11px] truncate mt-0.5">
                    {room.name}
                  </div>
                </div>

                <div className="bg-[#181a26] p-2 rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-[#b9b5cb] block">Listeners</span>
                  <div className="font-bold text-[#4ee5c5] text-[11px] mt-0.5">
                    {room.members.length} Lovers Connected ♥
                  </div>
                </div>

                <div className="bg-[#181a26] p-2 rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-[#b9b5cb] block">Audio Track</span>
                  <div className="font-bold text-[#ff79b0] text-[11px] truncate mt-0.5">
                    Japanese (Orig 5.1)
                  </div>
                </div>

                <div className="bg-[#181a26] p-2 rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-[#b9b5cb] block">Subtitles</span>
                  <div className="font-bold text-[#4ee5c5] text-[11px] truncate mt-0.5">
                    English Soft (.srt)
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Checklist */}
            <div className="flex flex-col gap-2 text-xs text-[#b9b5cb]">
              <label className="flex items-center gap-2 cursor-pointer hover:text-[#f1eef8]">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-3.5 h-3.5 rounded accent-[#ff79b0] cursor-pointer"
                />
                <span>Synchronize play, pause, and rewinds together</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-[#f1eef8]">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-3.5 h-3.5 rounded accent-[#ff79b0] cursor-pointer"
                />
                <span>Auto-correct latency (&lt; 15ms perfect sync)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-[#f1eef8]">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-3.5 h-3.5 rounded accent-[#ff79b0] cursor-pointer"
                />
                <span>Pop up cute emoji reactions while watching together</span>
              </label>
            </div>

            {/* Launch Button Trigger */}
            <button
              type="button"
              onClick={handleStartMovie}
              className="w-full bg-gradient-to-r from-[#ff79b0] via-[#ff9bc4] to-[#4ee5c5] hover:brightness-105 text-[#4a0425] py-3.5 px-6 rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-[#ff79b0]/25 transition-all active:scale-95 cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                play_arrow
              </span>
              <span>Start Movie Date Night ♡</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
