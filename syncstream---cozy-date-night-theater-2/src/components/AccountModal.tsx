import React, { useState } from 'react';
import { useRoom } from '../context/RoomContext';
import { CUTE_AVATARS } from '../data/mockData';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, showToast } = useRoom();

  const [mode, setMode] = useState<'create' | 'login'>('create');
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || '');
  const [password, setPassword] = useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(currentUser.avatarUrl);
  const [isHost, setIsHost] = useState(currentUser.isHost);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated = {
      id: currentUser.id || 'user-' + Date.now().toString(36),
      name: name.trim(),
      email: email.trim(),
      avatarUrl: selectedAvatarUrl,
      isHost: isHost
    };

    setCurrentUser(updated);
    showToast(
      mode === 'create'
        ? `Account created! Welcome, ${updated.name} 💕`
        : `Signed in as ${updated.name} ✨`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#181a26] border border-[#ff79b0]/30 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-scale-in">
        <div className="flex items-center justify-between pb-2 border-b border-[#282b3f]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#ff79b0]/20 flex items-center justify-center text-[#ff79b0]">
              <span className="material-symbols-outlined text-base">badge</span>
            </div>
            <h3 className="text-base font-bold text-[#f1eef8]">
              {mode === 'create' ? 'Create Cozy Account' : 'Sign In to Theater'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#b9b5cb] hover:text-[#f1eef8] p-1 rounded-full hover:bg-[#202334]"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 bg-[#202334] p-1 rounded-full border border-[#282b3f] text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`py-1.5 rounded-full transition-all cursor-pointer ${
              mode === 'create'
                ? 'bg-[#ff79b0] text-[#4a0425] shadow-sm'
                : 'text-[#b9b5cb] hover:text-[#f1eef8]'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-1.5 rounded-full transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#ff79b0] text-[#4a0425] shadow-sm'
                : 'text-[#b9b5cb] hover:text-[#f1eef8]'
            }`}
          >
            Sign In
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-[11px] font-bold text-[#b9b5cb] uppercase mb-1">
              Your Name / Nickname
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex, Maya, Sam..."
              required
              className="w-full bg-[#0d0e16] border border-[#282b3f] focus:border-[#ff79b0] rounded-xl px-3.5 py-2 text-xs text-[#f1eef8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#b9b5cb] uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@datenight.cozy"
              className="w-full bg-[#0d0e16] border border-[#282b3f] focus:border-[#ff79b0] rounded-xl px-3.5 py-2 text-xs text-[#f1eef8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#b9b5cb] uppercase mb-1">
              Password or Secret Pin
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0d0e16] border border-[#282b3f] focus:border-[#ff79b0] rounded-xl px-3.5 py-2 text-xs text-[#f1eef8] focus:outline-none"
            />
          </div>

          {/* Host vs Guest role toggle */}
          <div className="flex items-center justify-between p-3 bg-[#202334] rounded-xl border border-[#282b3f]">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#f1eef8]">Room Host Account</span>
              <span className="text-[10px] text-[#b9b5cb]">
                Can curate playlist and manage remote modes
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isHost}
                onChange={(e) => setIsHost(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#282b3f] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff79b0]"></div>
            </label>
          </div>

          {/* Avatar choice */}
          <div>
            <label className="block text-[11px] font-bold text-[#b9b5cb] uppercase mb-1.5">
              Select Profile Avatar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {CUTE_AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatarUrl(av.url || av.emoji || '🐱')}
                  className={`aspect-square rounded-xl flex items-center justify-center p-1 border transition-all cursor-pointer ${
                    selectedAvatarUrl === (av.url || av.emoji)
                      ? 'bg-[#202334] border-2 border-[#ff79b0] text-[#ff79b0]'
                      : 'bg-[#0d0e16] border-[#282b3f] text-[#b9b5cb] hover:border-white/20'
                  }`}
                  title={av.name}
                >
                  {av.url ? (
                    <img
                      src={av.url}
                      alt={av.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-xl">{av.emoji || '🐱'}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#ff79b0] to-[#ff9bc4] text-[#4a0425] font-bold text-xs shadow-lg shadow-[#ff79b0]/25 active:scale-95 transition-all cursor-pointer"
            >
              {mode === 'create' ? 'Create Account & Save Profile 💕' : 'Sign In to Theater ✨'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
