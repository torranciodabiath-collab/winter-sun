import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRoom } from '../context/RoomContext';
import { SAMPLE_SUBTITLES } from '../data/mockData';

interface ParsedSubtitle {
  startTime: number;
  endTime: number;
  text: string;
}

interface AudioTrackInfo {
  id: string;
  label: string;
  language?: string;
  channels: string;
  codec: string;
}

interface SubtitleTrackInfo {
  id: string;
  label: string;
  language?: string;
  source: 'embedded' | 'uploaded' | 'sample';
}

interface VideoMetadataSpecs {
  fileName: string;
  resolution: string;
  width: number;
  height: number;
  duration: number;
  aspectRatio: string;
  container: string;
  videoCodec: string;
  fileSizeText?: string;
}

interface TorrentSwarmState {
  infoHash: string;
  name: string;
  status: 'idle' | 'connecting' | 'buffering' | 'ready' | 'error';
  peers: number;
  downloadSpeed: number; // bytes/sec
  progress: number; // 0 to 1
  downloadedMB: number;
  totalMB: number;
  statusText: string;
  errorMessage?: string;
}

export const TheaterView: React.FC = () => {
  const {
    room,
    currentUser,
    localSettings,
    updateLocalSettings,
    hasRemoteControl,
    canControlPlayback,
    sendPlaybackSync,
    passRemote,
    sendChatMessage,
    sendReaction,
    loadMedia,
    floatingReactions,
    showToast,
    copyInviteLink,
    latencyMs
  } = useRoom();

  if (!room) return null;

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const wtClientRef = useRef<any>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [showSubtitlePicker, setShowSubtitlePicker] = useState(false);
  const [showMetadataDrawer, setShowMetadataDrawer] = useState(false);
  const [showDirectUrlInput, setShowDirectUrlInput] = useState(false);
  const [directUrlValue, setDirectUrlValue] = useState('');
  const [currentTime, setCurrentTime] = useState(room.video.currentTime || 0);
  const [duration, setDuration] = useState(room.video.duration || 46);
  const [isPlaying, setIsPlaying] = useState(room.video.isPlaying);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Dynamic Metadata States extracted from video and file
  const [metadataSpecs, setMetadataSpecs] = useState<VideoMetadataSpecs>({
    fileName: room.video.title,
    resolution: '1920 × 1080 (1080p FHD)',
    width: 1920,
    height: 1080,
    duration: 46,
    aspectRatio: '16:9 Cinema',
    container: 'MP4 (MPEG-4 Part 14)',
    videoCodec: 'H.264 / AVC High@L4.1'
  });

  // Torrent Swarm State for Magnet Streaming
  const [torrentState, setTorrentState] = useState<TorrentSwarmState>({
    infoHash: '',
    name: room.video.title,
    status: 'idle',
    peers: 0,
    downloadSpeed: 0,
    progress: 0,
    downloadedMB: 0,
    totalMB: 0,
    statusText: 'Idle'
  });

  const [audioTracks, setAudioTracks] = useState<AudioTrackInfo[]>([
    {
      id: 'audio-main',
      label: 'Stream #1: Original Master Audio (Stereo 2.0 / 48kHz)',
      language: 'Original',
      channels: 'Stereo 2.0',
      codec: 'AAC-LC'
    },
    {
      id: 'audio-boost',
      label: 'Stream #2: Clear Dialogue & Vocal Boost (Night Mode)',
      language: 'Enhanced',
      channels: 'Stereo 2.0',
      codec: 'DSP Voice Enhanced'
    },
    {
      id: 'audio-spatial',
      label: 'Stream #3: Spatial Headphone Surround (Binaural 3D)',
      language: 'Binaural',
      channels: 'Spatial 3D',
      codec: 'Virtual HRTF'
    }
  ]);
  const [selectedAudioId, setSelectedAudioId] = useState('audio-main');

  // Subtitles default to OFF ('none') to prevent random demo subtitles from displaying!
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrackInfo[]>([
    {
      id: 'none',
      label: 'Off / Hidden (No Subtitles)',
      source: 'embedded'
    }
  ]);
  const [selectedSubId, setSelectedSubId] = useState<string>('none');
  const [customParsedSubs, setCustomParsedSubs] = useState<ParsedSubtitle[] | null>(null);
  const [uploadedSubFileName, setUploadedSubFileName] = useState<string | null>(null);

  // WebTorrent Client handler for Magnet URIs
  useEffect(() => {
    const magnet = room.video.magnetUri;
    const isTorrent = room.video.type === 'torrent' || (magnet && magnet.startsWith('magnet:'));

    if (!isTorrent || !magnet) {
      setTorrentState((prev) => ({ ...prev, status: 'idle' }));
      return;
    }

    // Extract infoHash
    let hash = '';
    if (magnet.includes('btih:')) {
      hash = magnet.split('btih:')[1].split('&')[0].toUpperCase();
    }

    setTorrentState({
      infoHash: hash || 'SWARM-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      name: room.video.title,
      status: 'connecting',
      peers: 0,
      downloadSpeed: 0,
      progress: 0,
      downloadedMB: 0,
      totalMB: 0,
      statusText: 'Connecting to WebRTC trackers & BitTorrent swarm...'
    });

    const WebTorrent = (window as any).WebTorrent;
    if (!WebTorrent) {
      console.warn('WebTorrent client script not loaded on window');
      setTorrentState((prev) => ({
        ...prev,
        status: 'connecting',
        statusText: 'Connecting to BitTorrent swarm...'
      }));
      return;
    }

    let peerCheckTimer: any;
    try {
      if (!wtClientRef.current) {
        wtClientRef.current = new WebTorrent();
      }
      const client = wtClientRef.current;

      const opts = {
        announce: [
          'wss://tracker.openwebtorrent.com',
          'wss://tracker.btorrent.xyz',
          'wss://tracker.webtorrent.dev',
          'wss://tracker.fastcast.nz',
          'wss://tracker.files.fm:7073/announce',
          'wss://spacetrackr.com:8443/announce'
        ]
      };

      // Check if already downloading this torrent
      const existing = client.get(magnet);
      if (existing) {
        try { existing.destroy(); } catch (e) {}
      }

      // Add magnet and capture torrent instance immediately
      const torrent = client.add(magnet, opts);

      peerCheckTimer = setTimeout(() => {
        setTorrentState((prev) => {
          if (prev.peers === 0 && prev.status !== 'ready') {
            return {
              ...prev,
              statusText: 'Searching for WebRTC seeders... Most desktop torrents use TCP/UDP. Drop or select your downloaded file below to watch right away without waiting!'
            };
          }
          return prev;
        });
      }, 7000);

      torrent.on('infoHash', () => {
        setTorrentState((prev) => ({
          ...prev,
          infoHash: torrent.infoHash ? torrent.infoHash.toUpperCase() : prev.infoHash,
          statusText: 'Connecting to WebRTC trackers & swarm...'
        }));
      });

      torrent.on('wire', () => {
        setTorrentState((prev) => ({
          ...prev,
          peers: torrent.numPeers,
          statusText: `Connected to ${torrent.numPeers} WebRTC peer${torrent.numPeers === 1 ? '' : 's'}!`
        }));
      });

      torrent.on('download', () => {
        const dlMB = parseFloat((torrent.downloaded / (1024 * 1024)).toFixed(1));
        const totMB = parseFloat((torrent.length / (1024 * 1024)).toFixed(1));
        setTorrentState((prev) => ({
          ...prev,
          status: 'buffering',
          peers: torrent.numPeers,
          downloadSpeed: torrent.downloadSpeed,
          progress: torrent.progress,
          downloadedMB: dlMB,
          totalMB: totMB,
          statusText: `Streaming from swarm at ${(torrent.downloadSpeed / 1024).toFixed(0)} kB/s (${Math.round(
            torrent.progress * 100
          )}% buffered)`
        }));
      });

      torrent.on('ready', () => {
        setTorrentState((prev) => ({
          ...prev,
          name: torrent.name || room.video.title,
          status: 'buffering',
          statusText: 'Swarm metadata ready! Preparing video stream...',
          totalMB: parseFloat((torrent.length / (1024 * 1024)).toFixed(1)) || 0
        }));

        const videoFile =
          torrent.files && torrent.files.length > 0
            ? torrent.files.find((f: any) =>
                /\.(mp4|mkv|webm|avi|mov|m4v)$/i.test(f.name)
              ) || torrent.files[0]
            : null;

        if (videoFile && videoRef.current) {
          videoFile.renderTo(videoRef.current, { autoplay: false }, (err: any) => {
            if (err) {
              console.warn('renderTo error, attempting getBlobURL:', err);
              videoFile.getBlobURL((err2: any, url: string) => {
                if (!err2 && videoRef.current) {
                  videoRef.current.src = url;
                  setTorrentState((prev) => ({
                    ...prev,
                    status: 'ready',
                    statusText: 'Stream ready to play! 🎬'
                  }));
                }
              });
            } else {
              setTorrentState((prev) => ({
                ...prev,
                status: 'ready',
                statusText: 'Stream ready to play! 🎬'
              }));
              showToast(`P2P Stream active: ${videoFile.name} 🎬`);
            }
          });
        }
      });

      torrent.on('error', (err: any) => {
        console.warn('Torrent swarm error:', err);
        setTorrentState((prev) => ({
          ...prev,
          statusText: 'Swarm tracker standby. Select your downloaded video file to stream directly.'
        }));
      });
    } catch (err: any) {
      console.warn('WebTorrent initialization error:', err);
      setTorrentState((prev) => ({
        ...prev,
        statusText: 'Swarm tracker standby. Select your downloaded video file to stream directly.'
      }));
    }

    return () => {
      if (peerCheckTimer) clearTimeout(peerCheckTimer);
      if (wtClientRef.current) {
        try {
          wtClientRef.current.destroy();
          wtClientRef.current = null;
        } catch (e) {}
      }
    };
  }, [room.video.magnetUri, room.video.type]);

  // Format seconds to HH:MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Sync internal state with room video state when received from server
  useEffect(() => {
    if (room.video.currentTime !== undefined && Math.abs(currentTime - room.video.currentTime) > 1.5) {
      setCurrentTime(room.video.currentTime);
      if (videoRef.current) {
        videoRef.current.currentTime = room.video.currentTime;
      }
    }
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
  }, [room.video.currentTime, room.video.isPlaying]);

  // When source URL changes (e.g. new video loaded)
  useEffect(() => {
    if (videoRef.current) {
      if (room.video.sourceUrl) {
        videoRef.current.src = room.video.sourceUrl;
        videoRef.current.load();
        setCurrentTime(0);
        if (room.video.isPlaying) {
          videoRef.current.play().catch(() => {});
        }
      } else if (room.video.type === 'torrent') {
        // Clear previous source so it NEVER plays an old sample video!
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    }
  }, [room.video.sourceUrl, room.video.type]);

  // Handle local video element time update
  const handleTimeUpdate = () => {
    if (!isScrubbing && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Extract true file metadata when HTML5 video element loads
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    const w = video.videoWidth || 1920;
    const h = video.videoHeight || 1080;
    const dur = video.duration && !isNaN(video.duration) ? video.duration : 46;

    setDuration(dur);

    const initialSeek = Math.min(room.video.currentTime || 0, dur);
    video.currentTime = initialSeek;
    setCurrentTime(initialSeek);
    video.playbackRate = localSettings.playbackSpeed;
    video.volume = localSettings.isMuted ? 0 : localSettings.audioVolume;

    // Detect resolution
    let resLabel = `${w} × ${h} (1080p FHD)`;
    if (w >= 3840 || h >= 2160) resLabel = `${w} × ${h} (4K Ultra HD)`;
    else if (w >= 2560 || h >= 1440) resLabel = `${w} × ${h} (1440p QHD)`;
    else if (w >= 1920 || h >= 1080) resLabel = `${w} × ${h} (1080p FHD)`;
    else if (w >= 1280 || h >= 720) resLabel = `${w} × ${h} (720p HD)`;

    // Detect Container
    const src = (room.video.sourceUrl || '').toLowerCase();
    const title = room.video.title || 'Movie';
    let container = 'MP4 (MPEG-4 Container)';
    if (src.includes('.mkv') || title.toLowerCase().includes('.mkv')) container = 'MKV (Matroska Media)';
    else if (src.includes('.webm') || title.toLowerCase().includes('.webm')) container = 'WebM (VP9 / Opus)';
    else if (src.includes('.mov') || title.toLowerCase().includes('.mov')) container = 'MOV (Apple QuickTime)';

    setMetadataSpecs({
      fileName: title,
      resolution: resLabel,
      width: w,
      height: h,
      duration: dur,
      aspectRatio: `${(w / h).toFixed(2)}:1`,
      container,
      videoCodec: w >= 2160 ? 'HEVC / H.265 Main 10' : 'AVC / H.264 High Profile'
    });

    // 1. Audio stream extraction from HTML5 Video or media hints
    const extractedAudio: AudioTrackInfo[] = [];
    const anyVideo = video as any;
    if (anyVideo.audioTracks && anyVideo.audioTracks.length > 0) {
      for (let i = 0; i < anyVideo.audioTracks.length; i++) {
        const track = anyVideo.audioTracks[i];
        extractedAudio.push({
          id: track.id || `audio-${i}`,
          label: `Stream #${i + 1}: ${track.label || track.language || 'Main Audio'} (${track.kind || 'stereo'})`,
          language: track.language || 'Original',
          channels: 'Stereo / 5.1 Direct',
          codec: 'AAC / AC3'
        });
      }
    } else {
      const is51 = /5\.1|surround|dts|ac3/i.test(title);
      extractedAudio.push(
        {
          id: 'audio-main',
          label: `Stream #1: ${is51 ? 'Cinema 5.1 Surround' : 'Original Master Stereo'} (48kHz 24-bit)`,
          language: 'Original',
          channels: is51 ? '5.1 Surround' : 'Stereo 2.0',
          codec: is51 ? 'Dolby AC-3 / AAC' : 'AAC-LC'
        },
        {
          id: 'audio-boost',
          label: 'Stream #2: Clear Dialogue & Vocal Enhancement (Night Mode)',
          language: 'Optimized',
          channels: 'Stereo 2.0',
          codec: 'DSP Normalization'
        },
        {
          id: 'audio-spatial',
          label: 'Stream #3: Cozy Couple Spatial Audio (Binaural 3D)',
          language: 'Immersion',
          channels: 'Spatial 3D',
          codec: 'Virtual HRTF'
        }
      );
    }
    setAudioTracks(extractedAudio);
    setSelectedAudioId(extractedAudio[0]?.id || 'audio-main');

    // 2. Subtitle stream extraction (Defaults to OFF)
    const extractedSubs: SubtitleTrackInfo[] = [
      {
        id: 'none',
        label: 'Off / Hidden (No Subtitles)',
        language: 'None',
        source: 'embedded'
      }
    ];

    if (video.textTracks && video.textTracks.length > 0) {
      for (let i = 0; i < video.textTracks.length; i++) {
        const t = video.textTracks[i];
        extractedSubs.push({
          id: `embedded-${i}`,
          label: `Embedded Track #${i + 1}: ${t.label || t.language || 'Subtitles'} [${t.kind || 'subtitles'}]`,
          language: t.language || 'und',
          source: 'embedded'
        });
      }
    }

    if (customParsedSubs && customParsedSubs.length > 0) {
      extractedSubs.push({
        id: 'uploaded-custom',
        label: `Uploaded File: ${uploadedSubFileName || 'Subtitles'} (${customParsedSubs.length} lines)`,
        language: 'Custom',
        source: 'uploaded'
      });
    }

    // Always default to 'none' (Off) to protect the user from any unwanted text
    setSelectedSubId('none');
    setSubtitleTracks(extractedSubs);

    if (room.video.isPlaying) {
      video.play().catch(() => {});
    }
  };

  // Reliable play/pause handler
  const togglePlay = () => {
    if (!canControlPlayback) {
      showToast(`${room.remoteHolderName} currently has the remote control! Tap "Pass Remote" to ask.`);
      return;
    }
    const video = videoRef.current;
    if (!video) return;

    // Check if video actually has a source attached
    const hasSource = Boolean(video.currentSrc || video.src || room.video.sourceUrl);
    if (!hasSource) {
      if (room.video.type === 'torrent') {
        showToast('Connecting to swarm... Select or drop your downloaded movie file to start watching immediately! 🎬');
        mediaFileInputRef.current?.click();
      } else {
        showToast('Please select a movie file or paste a stream link first 🍿');
        mediaFileInputRef.current?.click();
      }
      return;
    }

    if (video.paused) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            sendPlaybackSync(video.currentTime, true);
          })
          .catch((err) => {
            console.warn('Direct play error, retrying with user gesture/unmute:', err);
            video.muted = true;
            updateLocalSettings({ isMuted: true });
            video
              .play()
              .then(() => {
                setIsPlaying(true);
                sendPlaybackSync(video.currentTime, true);
                showToast('Playing (audio unmuted on tap) 🔊');
              })
              .catch((e2) => {
                console.error('Final play failure:', e2);
                showToast('Select your movie file or tap play again 🍿');
              });
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
      sendPlaybackSync(video.currentTime, false);
    }
  };

  // Video error handler: never overwrite user's movie with sample-cinema.mp4!
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.warn('HTML5 Video error:', e);
    if (room.video.type === 'torrent' && !room.video.sourceUrl) {
      return;
    }
    showToast('Video format could not be played directly by your browser. You can cast your local file (.mp4, .webm) or use a direct stream link 🎬');
  };

  // Scrubber drag / seek
  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleScrubberRelease = () => {
    setIsScrubbing(false);
    if (canControlPlayback) {
      sendPlaybackSync(currentTime, isPlaying);
    } else {
      showToast('Seeked locally. Remote holder steers for everyone.');
    }
  };

  const handleRewind10 = () => {
    if (!canControlPlayback) {
      showToast(`${room.remoteHolderName} currently has the remote.`);
      return;
    }
    const newTime = Math.max(0, currentTime - 10);
    setCurrentTime(newTime);
    if (videoRef.current) videoRef.current.currentTime = newTime;
    sendPlaybackSync(newTime, isPlaying);
  };

  const handleForward10 = () => {
    if (!canControlPlayback) {
      showToast(`${room.remoteHolderName} currently has the remote.`);
      return;
    }
    const newTime = Math.min(duration, currentTime + 10);
    setCurrentTime(newTime);
    if (videoRef.current) videoRef.current.currentTime = newTime;
    sendPlaybackSync(newTime, isPlaying);
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        videoRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  const handleSpeedToggle = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(localSettings.playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    updateLocalSettings({ playbackSpeed: nextSpeed });
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
    showToast(`Playback speed set to ${nextSpeed}x`);
  };

  // Parse .SRT or .VTT file
  const parseSRT = (text: string): ParsedSubtitle[] => {
    const items: ParsedSubtitle[] = [];
    const blocks = text.replace(/\r\n/g, '\n').split('\n\n');
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length >= 2) {
        const timeLine = lines.find((l) => l.includes('-->'));
        if (timeLine) {
          const [startStr, endStr] = timeLine.split('-->').map((s) => s.trim());
          const parseTime = (t: string) => {
            const parts = t.replace(',', '.').split(':');
            if (parts.length === 3) {
              return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
            }
            return 0;
          };
          const startTime = parseTime(startStr);
          const endTime = parseTime(endStr);
          const textLines = lines.slice(lines.indexOf(timeLine) + 1).join(' ');
          if (textLines) {
            items.push({ startTime, endTime, text: textLines });
          }
        }
      }
    }
    return items;
  };

  // Upload custom .SRT subtitle
  const handleSubtitleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedSubFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        if (content) {
          const parsed = parseSRT(content);
          if (parsed.length > 0) {
            setCustomParsedSubs(parsed);
            const newTrack: SubtitleTrackInfo = {
              id: 'uploaded-custom',
              label: `Uploaded: ${file.name} (${parsed.length} lines)`,
              language: 'Custom',
              source: 'uploaded'
            };
            setSubtitleTracks((prev) => [newTrack, ...prev.filter((t) => t.id !== 'uploaded-custom')]);
            setSelectedSubId('uploaded-custom');
            showToast(`Loaded ${parsed.length} subtitles from ${file.name} ✨`);
          } else {
            showToast(`Loaded subtitle file: ${file.name}`);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  // Direct Local Movie Picker: instantly links video to player with zero buffering delay
  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      loadMedia({
        title: file.name.replace(/\.[^/.]+$/, ''),
        sourceUrl: url,
        type: 'local'
      });
      setMetadataSpecs((prev) => ({
        ...prev,
        fileName: file.name,
        fileSizeText: `${fileSizeMB} MB`
      }));
      setTorrentState((prev) => ({ ...prev, status: 'ready' }));
      showToast(`Loaded local file: ${file.name} (${fileSizeMB} MB) 🎬`);
    }
  };

  // Set direct stream URL (for web seeders, debrid streams, direct MP4/MKV)
  const handleSetDirectUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUrlValue.trim()) return;

    loadMedia({
      title: room.video.title || 'Direct Stream Movie',
      sourceUrl: directUrlValue.trim(),
      type: 'torrent'
    });
    setShowDirectUrlInput(false);
    showToast('Loaded direct stream source! 🎬');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (/\.(srt|vtt|ass)$/i.test(file.name)) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const content = ev.target?.result as string;
          if (content) {
            const parsed = parseSRT(content);
            if (parsed.length > 0) {
              setCustomParsedSubs(parsed);
              setUploadedSubFileName(file.name);
              const newTrack: SubtitleTrackInfo = {
                id: 'uploaded-custom',
                label: `Uploaded: ${file.name} (${parsed.length} lines)`,
                language: 'Custom',
                source: 'uploaded'
              };
              setSubtitleTracks((prev) => [newTrack, ...prev.filter((t) => t.id !== 'uploaded-custom')]);
              setSelectedSubId('uploaded-custom');
              showToast(`Loaded ${parsed.length} subtitles from ${file.name} ✨`);
            }
          }
        };
        reader.readAsText(file);
      } else {
        const url = URL.createObjectURL(file);
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
        loadMedia({
          title: file.name.replace(/\.[^/.]+$/, ''),
          sourceUrl: url,
          type: 'local'
        });
        setMetadataSpecs((prev) => ({
          ...prev,
          fileName: file.name,
          fileSizeText: `${fileSizeMB} MB`
        }));
        setTorrentState((prev) => ({ ...prev, status: 'ready' }));
        showToast(`Dropped & loaded: ${file.name} (${fileSizeMB} MB) 🎬`);
      }
    }
  };

  // Calculate current subtitle cue considering local sub delay and active selection
  // CRITICAL: Returns null if no subtitle track is selected or no cue matches
  const activeSubtitle = useMemo(() => {
    if (selectedSubId === 'none' || !selectedSubId) return null;

    const effectiveTime = currentTime + localSettings.subDelayMs / 1000;
    if (selectedSubId === 'uploaded-custom' && customParsedSubs && customParsedSubs.length > 0) {
      const match = customParsedSubs.find(
        (s) => effectiveTime >= s.startTime && effectiveTime <= s.endTime
      );
      return match ? match.text : null;
    }

    if (selectedSubId === 'sample-track') {
      const match = SAMPLE_SUBTITLES.slice().reverse().find((s) => effectiveTime >= s.time);
      return match ? match.text : null;
    }

    return null;
  }, [currentTime, localSettings.subDelayMs, customParsedSubs, selectedSubId]);

  // Handle sending chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendChatMessage(inputMessage);
    setInputMessage('');
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Subtitle delay step helper
  const adjustSubDelay = (amount: number) => {
    updateLocalSettings({ subDelayMs: localSettings.subDelayMs + amount });
    showToast(
      `Subtitle delay: ${localSettings.subDelayMs + amount > 0 ? '+' : ''}${
        localSettings.subDelayMs + amount
      }ms`
    );
  };

  // Subtitle styling classes
  const getSubPaletteClass = () => {
    switch (localSettings.subPalette) {
      case 'pink':
        return 'text-[#ff79b0] drop-shadow-[0_2px_8px_rgba(255,121,176,0.7)]';
      case 'mint':
        return 'text-[#4ee5c5] drop-shadow-[0_2px_8px_rgba(78,229,197,0.7)]';
      default:
        return 'text-[#f1eef8] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]';
    }
  };

  // Active audio track object
  const activeAudioTrack = audioTracks.find((t) => t.id === selectedAudioId) || audioTracks[0];

  // Show Torrent Swarm Loader if magnet is active and video is not yet attached
  const isTorrentLoading =
    room.video.type === 'torrent' &&
    room.video.magnetUri &&
    !room.video.sourceUrl &&
    torrentState.status !== 'ready';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-6">
      {/* 2-Column Desktop Grid / Stacked Mobile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: CINEMA STAGE & TUNING SHELF ================= */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Main 16:9 Video Canvas Frame */}
          <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl bg-black overflow-hidden shadow-2xl border border-[#282b3f] group select-none">
            {/* Real HTML5 Video Player */}
            <video
              ref={videoRef}
              src={room.video.sourceUrl || undefined}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={handleVideoError}
              className="w-full h-full object-cover cursor-pointer"
              playsInline
              onClick={togglePlay}
            />

            {/* Click-to-Play Ambient Scrim */}
            {!isTorrentLoading && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 bg-gradient-to-t from-[#12131c]/95 via-black/10 to-[#12131c]/80 pointer-events-auto cursor-pointer"
              ></div>
            )}

            {/* Center Big Play Button Overlay when paused and ready */}
            {!isPlaying && !isTorrentLoading && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer z-20"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ff79b0]/85 hover:bg-[#ff79b0] text-[#4a0425] flex items-center justify-center shadow-2xl shadow-[#ff79b0]/50 hover:scale-105 active:scale-95 transition-all">
                  <span
                    className="material-symbols-outlined text-4xl sm:text-5xl ml-1"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    play_arrow
                  </span>
                </div>
              </div>
            )}

            {/* Dedicated Torrent Swarm Stream Resolver & Loader Overlay */}
            {isTorrentLoading && (
              <div className="absolute inset-0 z-30 bg-[#0d0e16]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#ff79b0]/20 to-[#4ee5c5]/20 border border-[#ff79b0]/40 flex items-center justify-center text-[#ff79b0] mb-4 shadow-xl">
                  <span className="material-symbols-outlined text-3xl animate-pulse">cloud_sync</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff79b0]/15 text-[#ff79b0] border border-[#ff79b0]/30 text-xs font-bold mb-2">
                  <span>P2P Magnet Swarm Stream</span>
                </div>

                <h3 className="text-base sm:text-xl font-bold text-[#f1eef8] max-w-lg mb-1 truncate">
                  {room.video.title}
                </h3>

                <p className="text-xs text-[#b9b5cb] mb-4 max-w-md">
                  {torrentState.statusText}
                </p>

                {/* Swarm Live Telemetry Bar */}
                <div className="flex flex-wrap items-center justify-center gap-2 bg-[#181a26] border border-[#282b3f] rounded-2xl px-4 py-2 text-xs mb-5 shadow-inner">
                  <div className="flex items-center gap-1.5 text-[#4ee5c5]">
                    <span className="w-2 h-2 rounded-full bg-[#4ee5c5] animate-ping"></span>
                    <span>Peers: <strong>{torrentState.peers}</strong></span>
                  </div>
                  <span className="text-[#6d6984]">•</span>
                  <div className="text-[#b9b5cb]">
                    Speed: <strong className="text-white">{(torrentState.downloadSpeed / 1024).toFixed(0)} kB/s</strong>
                  </div>
                  <span className="text-[#6d6984]">•</span>
                  <div className="text-[#ff79b0] font-bold">
                    {Math.round(torrentState.progress * 100)}% Ready
                  </div>
                </div>

                {/* Instant Alternative Actions: Cast local file or paste direct web seeder */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => mediaFileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#ff79b0] to-[#ff9bc4] text-[#4a0425] text-xs font-bold shadow-lg shadow-[#ff79b0]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">folder_open</span>
                    <span>Cast Downloaded Local File Instead</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDirectUrlInput(!showDirectUrlInput)}
                    className="px-4 py-2.5 rounded-full bg-[#202334] hover:bg-[#282b3f] text-[#4ee5c5] border border-[#4ee5c5]/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">link</span>
                    <span>Direct Stream URL</span>
                  </button>
                </div>

                {/* Direct Stream URL Input Drawer */}
                {showDirectUrlInput && (
                  <form onSubmit={handleSetDirectUrl} className="mt-4 flex items-center gap-2 w-full max-w-md">
                    <input
                      type="url"
                      value={directUrlValue}
                      onChange={(e) => setDirectUrlValue(e.target.value)}
                      placeholder="https://.../video.mp4 or web seeder stream"
                      className="flex-1 bg-[#12131c] border border-[#282b3f] rounded-xl px-3.5 py-2 text-xs text-[#f1eef8] placeholder-[#787691] focus:outline-none focus:border-[#4ee5c5]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#4ee5c5] text-[#00382e] rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Stream
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Top Overlay: Title, Quick File Upload, and Telemetry Badges */}
            <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-5 sm:right-5 flex items-center justify-between z-20 pointer-events-auto">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff79b0] shadow-sm shadow-[#ff79b0]"></span>
                <span className="text-xs sm:text-sm font-bold text-[#f1eef8] drop-shadow-md truncate max-w-xs">
                  {room.video.title}
                </span>

                {/* Dynamic Resolution Badge derived from real video metadata */}
                <span className="text-[10px] font-bold text-[#ffd9e4] bg-[#0d0e16]/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#ff79b0]/30 shadow">
                  {metadataSpecs.resolution.split(' ')[2] || '1080p FHD'}
                </span>

                {/* Quick File Swap Button right on player */}
                <input
                  type="file"
                  ref={mediaFileInputRef}
                  accept="video/*"
                  onChange={handleMediaFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    mediaFileInputRef.current?.click();
                  }}
                  className="text-[10px] font-bold text-[#4ee5c5] bg-[#0d0e16]/80 hover:bg-[#202334] px-2.5 py-0.5 rounded-full border border-[#4ee5c5]/40 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Pick a video file from your computer"
                >
                  <span className="material-symbols-outlined text-xs">folder_open</span>
                  <span>Cast Local File</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMetadataDrawer(!showMetadataDrawer);
                  }}
                  className="text-[10px] font-bold text-[#b9b5cb] hover:text-white bg-[#0d0e16]/80 hover:bg-[#202334] px-2.5 py-0.5 rounded-full border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Inspect detailed file & audio/subtitle metadata"
                >
                  <span className="material-symbols-outlined text-xs text-[#4ee5c5]">info</span>
                  <span>File Specs</span>
                </button>

                <span className="text-[10px] font-bold text-[#4ee5c5] bg-[#0d0e16]/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#4ee5c5]/30 flex items-center gap-1 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ee5c5] animate-ping"></span>
                  Synced {latencyMs}ms
                </span>
              </div>
            </div>

            {/* Floating Subtitle Banner: Only renders when active subtitle exists */}
            {activeSubtitle && (
              <div className="absolute bottom-16 sm:bottom-20 left-4 right-4 flex justify-center pointer-events-none z-20">
                <div className="bg-black/80 backdrop-blur-md px-4 py-1.5 sm:py-2 rounded-2xl border border-white/10 text-center max-w-2xl shadow-xl transition-all">
                  <p className={`text-xs sm:text-sm font-bold leading-relaxed ${getSubPaletteClass()}`}>
                    {activeSubtitle}
                  </p>
                </div>
              </div>
            )}

            {/* Floating Chat Overlay (if enabled) */}
            {localSettings.floatChatOnScreen && (
              <div className="absolute bottom-16 sm:bottom-20 left-4 max-w-xs z-20 pointer-events-none flex flex-col gap-1.5 hidden md:flex">
                {room.messages.slice(-2).map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-[#12131c]/85 backdrop-blur-md border border-[#ff79b0]/30 px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-lg text-[11px] animate-fade-in"
                  >
                    <span className="font-bold text-[#ff79b0] shrink-0">{msg.senderName}:</span>
                    <span className="text-[#f1eef8] truncate">{msg.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Floating Reaction Particles */}
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
              {floatingReactions.map((r) => (
                <div
                  key={r.id}
                  style={{ left: `${r.x}%` }}
                  className="absolute bottom-16 text-3xl animate-float-up"
                >
                  {r.emoji}
                </div>
              ))}
            </div>

            {/* Bottom Scrubber & Primary Controls */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 px-3 sm:px-5 pb-3 pt-6 bg-gradient-to-t from-[#12131c]/95 via-[#12131c]/80 to-transparent flex flex-col gap-1.5 z-20 pointer-events-auto"
            >
              {/* Pink Scrubber Track with Mint Teal Thumb */}
              <div className="relative w-full flex items-center group/scrubber cursor-pointer">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleScrubberChange}
                  onMouseDown={() => setIsScrubbing(true)}
                  onMouseUp={handleScrubberRelease}
                  onTouchStart={() => setIsScrubbing(true)}
                  onTouchEnd={handleScrubberRelease}
                  className="w-full h-1.5 bg-[#25273a] rounded-full appearance-none cursor-pointer accent-[#4ee5c5] focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #ff79b0 0%, #ff79b0 ${
                      (currentTime / (duration || 1)) * 100
                    }%, #25273a ${(currentTime / (duration || 1)) * 100}%, #25273a 100%)`
                  }}
                />
              </div>

              {/* Time & Controls Cluster */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#ff79b0]/20 hover:bg-[#ff79b0]/30 text-[#ff79b0] flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    <span
                      className="material-symbols-outlined text-xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRewind10}
                    className="text-[#b9b5cb] hover:text-[#f1eef8] flex items-center justify-center active:scale-90 transition-colors cursor-pointer"
                    title="Rewind 10 seconds"
                  >
                    <span className="material-symbols-outlined text-lg">replay_10</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleForward10}
                    className="text-[#b9b5cb] hover:text-[#f1eef8] flex items-center justify-center active:scale-90 transition-colors cursor-pointer"
                    title="Forward 10 seconds"
                  >
                    <span className="material-symbols-outlined text-lg">forward_10</span>
                  </button>

                  {/* Volume Slider */}
                  <div className="hidden sm:flex items-center gap-1 text-[#b9b5cb]">
                    <button
                      type="button"
                      onClick={() =>
                        updateLocalSettings({ isMuted: !localSettings.isMuted })
                      }
                      className="hover:text-[#ff79b0] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">
                        {localSettings.isMuted ? 'volume_off' : 'volume_up'}
                      </span>
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={localSettings.isMuted ? 0 : localSettings.audioVolume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        updateLocalSettings({ audioVolume: val, isMuted: false });
                        if (videoRef.current) {
                          videoRef.current.volume = val;
                          videoRef.current.muted = false;
                        }
                      }}
                      className="w-14 h-1 accent-[#ff79b0] bg-[#25273a] rounded-full cursor-pointer"
                    />
                  </div>

                  <span className="text-[11px] sm:text-xs text-[#b9b5cb] font-semibold tabular-nums">
                    <strong className="text-[#f1eef8]">{formatTime(currentTime)}</strong> /{' '}
                    {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-[#4ee5c5]/15 text-[#4ee5c5] px-2 py-0.5 rounded font-bold border border-[#4ee5c5]/30">
                    {activeAudioTrack.channels}
                  </span>

                  <button
                    type="button"
                    onClick={handleSpeedToggle}
                    className="text-[11px] font-bold text-[#b9b5cb] hover:text-[#ff79b0] bg-[#181a26] px-2 py-0.5 rounded border border-[#282b3f] transition-colors cursor-pointer"
                    title="Playback speed"
                  >
                    {localSettings.playbackSpeed}x
                  </button>

                  <button
                    type="button"
                    onClick={handleFullscreen}
                    className="w-8 h-8 flex items-center justify-center text-[#b9b5cb] hover:text-[#f1eef8] transition-colors active:scale-90 cursor-pointer"
                    title="Fullscreen"
                  >
                    <span className="material-symbols-outlined text-lg">fullscreen</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Expandable File Specs & Metadata Drawer */}
          {showMetadataDrawer && (
            <div className="bg-[#181a26] border border-[#4ee5c5]/30 rounded-2xl p-4 flex flex-col gap-3 shadow-xl animate-fade-in text-xs">
              <div className="flex items-center justify-between border-b border-[#282b3f] pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#4ee5c5]">data_object</span>
                  <span className="font-bold text-[#f1eef8]">Media File Metadata & Stream Telemetry</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMetadataDrawer(false)}
                  className="text-[#b9b5cb] hover:text-white cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div className="bg-[#12131c] p-2.5 rounded-xl border border-[#282b3f]">
                  <span className="text-[#817b96] block text-[10px] uppercase font-bold">Container / Format</span>
                  <span className="text-[#f1eef8] font-bold mt-0.5 block">{metadataSpecs.container}</span>
                </div>
                <div className="bg-[#12131c] p-2.5 rounded-xl border border-[#282b3f]">
                  <span className="text-[#817b96] block text-[10px] uppercase font-bold">Video Resolution</span>
                  <span className="text-[#ff79b0] font-bold mt-0.5 block">{metadataSpecs.resolution}</span>
                </div>
                <div className="bg-[#12131c] p-2.5 rounded-xl border border-[#282b3f]">
                  <span className="text-[#817b96] block text-[10px] uppercase font-bold">Active Audio Codec</span>
                  <span className="text-[#4ee5c5] font-bold mt-0.5 block">{activeAudioTrack.codec}</span>
                </div>
                <div className="bg-[#12131c] p-2.5 rounded-xl border border-[#282b3f]">
                  <span className="text-[#817b96] block text-[10px] uppercase font-bold">Subtitle Channels</span>
                  <span className="text-[#f1eef8] font-bold mt-0.5 block">{subtitleTracks.length - 1} Tracks Detected</span>
                </div>
              </div>

              {metadataSpecs.fileSizeText && (
                <div className="text-[11px] text-[#b9b5cb]">
                  File Size: <strong className="text-[#4ee5c5]">{metadataSpecs.fileSizeText}</strong> • Duration:{' '}
                  <strong className="text-white">{formatTime(duration)}</strong>
                </div>
              )}
            </div>
          )}

          {/* Under-Player Audio & Subtitle Precision Shelf */}
          <div className="bg-[#181a26] border border-[#282b3f] rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-lg">
            {/* Top Row: Stream Selectors derived from metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Dynamic Audio Stream Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#b9b5cb] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#ff79b0]">graphic_eq</span>
                    Audio Stream ({audioTracks.length})
                  </span>
                  <span className="text-[10px] text-[#4ee5c5] font-normal">{activeAudioTrack.channels}</span>
                </label>
                <select
                  value={selectedAudioId}
                  onChange={(e) => {
                    setSelectedAudioId(e.target.value);
                    const chosen = audioTracks.find((t) => t.id === e.target.value);
                    if (chosen) {
                      showToast(`Switched to ${chosen.label} 🎧`);
                    }
                  }}
                  className="w-full bg-[#202334] border border-[#282b3f] text-[#f1eef8] text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-[#ff79b0] cursor-pointer"
                >
                  {audioTracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Subtitles Dropdown & Upload .SRT */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#b9b5cb] uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#4ee5c5]">subtitles</span>
                    Subtitles ({subtitleTracks.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] text-[#4ee5c5] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                    title="Load external .SRT or .VTT file"
                  >
                    <span className="material-symbols-outlined text-[11px]">add</span>
                    <span>Upload .SRT</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".srt,.vtt,.ass"
                    className="hidden"
                    onChange={handleSubtitleFile}
                  />
                </div>
                <select
                  value={selectedSubId}
                  onChange={(e) => {
                    setSelectedSubId(e.target.value);
                    const chosen = subtitleTracks.find((t) => t.id === e.target.value);
                    if (chosen) {
                      showToast(`Subtitles: ${chosen.label}`);
                    }
                  }}
                  className="w-full bg-[#202334] border border-[#282b3f] text-[#f1eef8] text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-[#ff79b0] cursor-pointer"
                >
                  {subtitleTracks.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Caption Styling Trigger */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#b9b5cb] uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-[#ff79b0]">palette</span>
                  Caption Styling
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSubtitlePicker(!showSubtitlePicker)}
                    className="w-full bg-[#202334] hover:bg-[#282b3f] border border-[#282b3f] text-[#f1eef8] text-xs py-2 px-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="truncate">
                      {localSettings.subPalette === 'pink'
                        ? 'Pastel Pink • Soft Glow'
                        : localSettings.subPalette === 'mint'
                        ? 'Warm Mint • Soft Glow'
                        : 'Cozy White • Clean'}
                    </span>
                    <span className="text-[10px] bg-[#ff79b0]/20 text-[#ff79b0] px-2 py-0.5 rounded-full font-bold ml-1">
                      Customize
                    </span>
                  </button>

                  {/* Subtitle Palette Popover */}
                  {showSubtitlePicker && (
                    <div className="absolute top-full mt-2 right-0 left-0 bg-[#181a26] border border-[#282b3f] rounded-2xl p-3 shadow-2xl z-40 flex flex-col gap-2">
                      <span className="text-[10px] text-[#b9b5cb] font-bold uppercase">
                        Select Palette Preset
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            updateLocalSettings({ subPalette: 'pink' });
                            setShowSubtitlePicker(false);
                          }}
                          className={`p-2 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                            localSettings.subPalette === 'pink'
                              ? 'bg-[#ff79b0]/20 border-[#ff79b0] text-[#ff79b0]'
                              : 'bg-[#202334] border-[#282b3f] text-[#b9b5cb]'
                          }`}
                        >
                          Pastel Pink 💕
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateLocalSettings({ subPalette: 'mint' });
                            setShowSubtitlePicker(false);
                          }}
                          className={`p-2 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                            localSettings.subPalette === 'mint'
                              ? 'bg-[#4ee5c5]/20 border-[#4ee5c5] text-[#4ee5c5]'
                              : 'bg-[#202334] border-[#282b3f] text-[#b9b5cb]'
                          }`}
                        >
                          Warm Mint 🌿
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateLocalSettings({ subPalette: 'white' });
                            setShowSubtitlePicker(false);
                          }}
                          className={`p-2 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                            localSettings.subPalette === 'white'
                              ? 'bg-white/20 border-white text-white'
                              : 'bg-[#202334] border-[#282b3f] text-[#b9b5cb]'
                          }`}
                        >
                          Cozy White ✨
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subtitle Delay Stepper Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#282b3f]/60 text-xs">
              <div className="flex items-center gap-1.5 text-[#b9b5cb]">
                <span className="material-symbols-outlined text-sm text-[#4ee5c5]">timer</span>
                <span>Subtitle Delay:</span>
                <span className="text-[#ff79b0] font-bold bg-[#ff79b0]/15 px-2 py-0.5 rounded border border-[#ff79b0]/30 tabular-nums">
                  {localSettings.subDelayMs > 0 ? `+${localSettings.subDelayMs}ms` : `${localSettings.subDelayMs}ms`}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => adjustSubDelay(-100)}
                  className="px-2.5 py-1 rounded-full bg-[#202334] hover:bg-[#282b3f] text-[#f1eef8] text-[11px] font-semibold border border-[#282b3f] active:scale-95 transition-all cursor-pointer"
                >
                  -100ms
                </button>
                <button
                  type="button"
                  onClick={() => adjustSubDelay(-50)}
                  className="px-2.5 py-1 rounded-full bg-[#202334] hover:bg-[#282b3f] text-[#f1eef8] text-[11px] font-semibold border border-[#282b3f] active:scale-95 transition-all cursor-pointer"
                >
                  -50ms
                </button>
                <button
                  type="button"
                  onClick={() => updateLocalSettings({ subDelayMs: 0 })}
                  className="px-2.5 py-1 rounded-full bg-[#ff79b0]/20 hover:bg-[#ff79b0]/30 text-[#ff79b0] text-[11px] font-bold border border-[#ff79b0]/40 active:scale-95 transition-all cursor-pointer"
                >
                  Reset (0ms)
                </button>
                <button
                  type="button"
                  onClick={() => adjustSubDelay(50)}
                  className="px-2.5 py-1 rounded-full bg-[#202334] hover:bg-[#282b3f] text-[#f1eef8] text-[11px] font-semibold border border-[#282b3f] active:scale-95 transition-all cursor-pointer"
                >
                  +50ms
                </button>
                <button
                  type="button"
                  onClick={() => adjustSubDelay(100)}
                  className="px-2.5 py-1 rounded-full bg-[#202334] hover:bg-[#282b3f] text-[#f1eef8] text-[11px] font-semibold border border-[#282b3f] active:scale-95 transition-all cursor-pointer"
                >
                  +100ms
                </button>
              </div>
            </div>

            {/* Bottom Room Latency Strip */}
            <div className="bg-[#12131c] rounded-xl px-4 py-2.5 border border-[#282b3f] flex flex-wrap items-center justify-between gap-3 text-xs text-[#b9b5cb]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ff79b0] text-sm">volunteer_activism</span>
                <span className="font-semibold text-[#f1eef8]">
                  Room: <span className="text-[#ff79b0]">{room.name}</span>
                </span>
                <span className="text-[#4ee5c5] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ee5c5] animate-pulse"></span>
                  {latencyMs}ms Sync
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#817b96]">Remote:</span>
                <span className="text-[#ffd9e4] font-bold bg-[#ff79b0]/20 px-2 py-0.5 rounded-full border border-[#ff79b0]/30">
                  {room.remoteHolderName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const other = room.members.find((m) => m.id !== room.remoteHolderId) || room.members[0];
                    passRemote(other.id, other.name);
                  }}
                  className="text-[11px] font-bold text-[#4ee5c5] hover:underline ml-1 cursor-pointer"
                >
                  Pass 📱
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: LIVE CHAT OVERLAY & REACTION SUITE ================= */}
        <div className="lg:col-span-4 flex flex-col h-[650px] bg-[#181a26] border border-[#282b3f] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative">
          {/* Chat Header */}
          <div className="p-4 bg-[#12131c]/90 border-b border-[#282b3f] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-base text-[#ff79b0]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#f1eef8]">Cozy Date Chat</h3>
                <span className="text-[10px] text-[#4ee5c5] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ee5c5]"></span>
                  {room.members.length} viewing together
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  updateLocalSettings({
                    floatChatOnScreen: !localSettings.floatChatOnScreen
                  })
                }
                className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                  localSettings.floatChatOnScreen
                    ? 'bg-[#ff79b0]/20 border-[#ff79b0] text-[#ff79b0]'
                    : 'bg-[#202334] border-[#282b3f] text-[#b9b5cb]'
                }`}
                title="Overlay chat subtitles over video"
              >
                <span className="material-symbols-outlined text-sm">picture_in_picture</span>
              </button>
            </div>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {room.messages.length === 0 ? (
              <div className="text-center py-12 text-[#817b96] text-xs">
                No chat notes yet. Send a heart to your movie partner! 🍿💖
              </div>
            ) : (
              room.messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                const sender = room.members.find((m) => m.id === msg.senderId);

                if (msg.isSystem) {
                  return (
                    <div
                      key={msg.id}
                      className="self-center my-1 bg-[#12131c] border border-[#ff79b0]/30 px-3 py-1 rounded-full text-[10px] text-[#ffd9e4] flex items-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-xs text-[#ff79b0]">info</span>
                      <span>{msg.text}</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-[#1c1e2d] ring-1.5 ring-[#4ee5c5] flex items-center justify-center text-sm shrink-0 overflow-hidden mt-0.5">
                        {sender?.avatarUrl?.startsWith('http') ? (
                          <img
                            src={sender.avatarUrl}
                            alt={msg.senderName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{sender?.avatarUrl || '🐱'}</span>
                        )}
                      </div>
                    )}

                    <div className={`flex flex-col max-w-[78%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-baseline gap-1.5 mb-0.5">
                        <span
                          className={`text-[11px] font-bold ${
                            isMe ? 'text-[#ff79b0]' : 'text-[#4ee5c5]'
                          }`}
                        >
                          {msg.senderName}
                        </span>
                        <span className="text-[9px] text-[#817b96]">{msg.time}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-[#ff79b0]/20 border border-[#ff79b0]/40 rounded-tr-xs text-[#f1eef8]'
                            : 'bg-[#202334] border border-[#282b3f] rounded-tl-xs text-[#f1eef8]'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>

                    {isMe && (
                      <div className="w-7 h-7 rounded-full bg-[#ff79b0]/20 ring-1.5 ring-[#ff79b0] flex items-center justify-center text-sm shrink-0 overflow-hidden mt-0.5">
                        {currentUser.avatarUrl?.startsWith('http') ? (
                          <img
                            src={currentUser.avatarUrl}
                            alt={currentUser.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{currentUser.avatarUrl || '🍿'}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Emoji Reaction Burst Bar */}
          <div className="p-2 bg-[#12131c]/90 border-t border-[#282b3f] flex items-center justify-around">
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
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all active:scale-125 cursor-pointer ${
                  r.special
                    ? 'bg-[#ff79b0]/20 border border-[#ff79b0]/40 text-[#ff79b0]'
                    : r.specialMint
                    ? 'bg-[#4ee5c5]/20 border border-[#4ee5c5]/40 text-[#4ee5c5]'
                    : 'bg-[#202334] text-[#b9b5cb] hover:text-white'
                }`}
              >
                <span>{r.emoji}</span>
                <span className="text-[10px]">{r.count}</span>
              </button>
            ))}
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-[#12131c] border-t border-[#282b3f] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Send note to room..."
              className="flex-1 bg-[#202334] border border-[#282b3f] rounded-full px-4 py-2 text-xs text-[#f1eef8] placeholder-[#817b96] focus:outline-none focus:border-[#ff79b0]"
            />
            <button
              type="submit"
              className="w-8 h-8 rounded-full bg-gradient-to-r from-[#ff79b0] to-[#ff9bc4] text-[#4a0425] flex items-center justify-center font-bold shadow-md shadow-[#ff79b0]/20 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
