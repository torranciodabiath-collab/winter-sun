import React, { useState } from 'react';
import { useRoom } from '../context/RoomContext';

interface WatchlistViewProps {
  onPlayMovie: (title: string, url: string) => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({ onPlayMovie }) => {
  const { showToast } = useRoom();

  const [watchlist, setWatchlist] = useState([
    {
      id: 'w1',
      title: 'Spirited Away (千と千尋の神隠し)',
      director: 'Hayao Miyazaki',
      year: '2001',
      duration: '2h 5m',
      genre: 'Studio Ghibli • Fantasy Romance',
      addedBy: 'Alex',
      rating: '10/10 Cozy',
      url: '/videos/sample-cinema.mp4',
      poster: 'https://lh3.googleusercontent.com/aida/AEtjO1WQ5prJZ0JIqQcUW1Xpkkd9tDhRWU8BrZN0raeoMyFC44xcv-zZe9X0f4OqTpvt-AY4H6Hi0ZHTPogdHdbjOQHuc2xCLQf6L-UCPdLpuVQOQGipqibN6hCgAgnOtNJTquSHKFMbWiSf4aMDU3Par1YtP9HdTpSYvkMW0oQUg3_A2qBrWsu602_RsvVhfSd2pstcywPksuZbuhD4Vz9n_vvByR4vo8MOfUHkUGfwOVdsKWlBxBvWgQ0lDw',
      watched: false
    },
    {
      id: 'w2',
      title: "Howl's Moving Castle",
      director: 'Hayao Miyazaki',
      year: '2004',
      duration: '1h 59m',
      genre: 'Ghibli • Adventure • Sweet Romance',
      addedBy: 'Maya',
      rating: '10/10 Cozy',
      url: '/videos/sintel-trailer.mp4',
      poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_CK8PjJv7rEIH4RS0_42SSeKnT_yBd0Up4uxxzyKGsl2GtLeicw2YnllWJ1FqlBbn5gFswtrl180OzNNESn93aGrJVH8iNmQsykTuwkVkzE-RSgHXp3cqFkG0zgZ-Wlm-Oi3VvnurN7TwfGyEFUOtBGDUk1bHp6M4nylBkfTkM7RvkI5xNWCLHa9hOozkEHOupA1iZpfLUKZ9ok8MHM1rkOwXA2_giRQXHxpgvCu3etmqCJ_EqNIg',
      watched: false
    },
    {
      id: 'w3',
      title: 'Whispers of the Heart',
      director: 'Yoshifumi Kondo',
      year: '1995',
      duration: '1h 51m',
      genre: 'Romantic Drama • Country Road',
      addedBy: 'Alex & Maya',
      rating: 'Infinite Stars ✨',
      url: '/videos/sample-cinema.mp4',
      poster: 'https://lh3.googleusercontent.com/aida/AEtjO1WQ5prJZ0JIqQcUW1Xpkkd9tDhRWU8BrZN0raeoMyFC44xcv-zZe9X0f4OqTpvt-AY4H6Hi0ZHTPogdHdbjOQHuc2xCLQf6L-UCPdLpuVQOQGipqibN6hCgAgnOtNJTquSHKFMbWiSf4aMDU3Par1YtP9HdTpSYvkMW0oQUg3_A2qBrWsu602_RsvVhfSd2pstcywPksuZbuhD4Vz9n_vvByR4vo8MOfUHkUGfwOVdsKWlBxBvWgQ0lDw',
      watched: true
    },
    {
      id: 'w4',
      title: 'Your Name (Kimi no Na wa)',
      director: 'Makoto Shinkai',
      year: '2016',
      duration: '1h 47m',
      genre: 'Anime Romance • Emotional',
      addedBy: 'Maya',
      rating: 'Tears Guaranteed 🥺',
      url: '/videos/sintel-trailer.mp4',
      poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_CK8PjJv7rEIH4RS0_42SSeKnT_yBd0Up4uxxzyKGsl2GtLeicw2YnllWJ1FqlBbn5gFswtrl180OzNNESn93aGrJVH8iNmQsykTuwkVkzE-RSgHXp3cqFkG0zgZ-Wlm-Oi3VvnurN7TwfGyEFUOtBGDUk1bHp6M4nylBkfTkM7RvkI5xNWCLHa9hOozkEHOupA1iZpfLUKZ9ok8MHM1rkOwXA2_giRQXHxpgvCu3etmqCJ_EqNIg',
      watched: false
    }
  ]);

  const [newTitle, setNewTitle] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem = {
      id: 'w-' + Date.now(),
      title: newTitle.trim(),
      director: 'Our Selection',
      year: '2026',
      duration: '2h 00m',
      genre: 'Cozy Movie Night Pick',
      addedBy: 'Both of us',
      rating: 'Excited to watch 💕',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_CK8PjJv7rEIH4RS0_42SSeKnT_yBd0Up4uxxzyKGsl2GtLeicw2YnllWJ1FqlBbn5gFswtrl180OzNNESn93aGrJVH8iNmQsykTuwkVkzE-RSgHXp3cqFkG0zgZ-Wlm-Oi3VvnurN7TwfGyEFUOtBGDUk1bHp6M4nylBkfTkM7RvkI5xNWCLHa9hOozkEHOupA1iZpfLUKZ9ok8MHM1rkOwXA2_giRQXHxpgvCu3etmqCJ_EqNIg',
      watched: false
    };

    setWatchlist([newItem, ...watchlist]);
    setNewTitle('');
    showToast(`Added "${newItem.title}" to our cozy watchlist! ✨`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-[#181a26] border border-[#282b3f] rounded-2xl p-6">
        <div>
          <span className="text-xs font-bold text-[#ff79b0] uppercase tracking-wider flex items-center gap-1">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
            Shared Cinema Journal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#f1eef8] tracking-tight mt-1">
            Our Movie Night Watchlist 🍿
          </h1>
          <p className="text-xs sm:text-sm text-[#b9b5cb] mt-1">
            Movies and series we plan to watch together under the blanket.
          </p>
        </div>

        {/* Add Movie Form */}
        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add movie idea..."
            className="bg-[#202334] border border-[#282b3f] rounded-full px-4 py-2 text-xs text-[#f1eef8] placeholder-[#817b96] focus:outline-none focus:border-[#ff79b0]"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-[#ff79b0] to-[#ff9bc4] text-[#4a0425] text-xs font-bold shadow-md shadow-[#ff79b0]/20 active:scale-95 transition-all cursor-pointer"
          >
            + Add
          </button>
        </form>
      </div>

      {/* Grid of Movies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {watchlist.map((item) => (
          <div
            key={item.id}
            className="bg-[#181a26] border border-[#282b3f] hover:border-[#ff79b0]/50 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between group"
          >
            <div className="relative aspect-video w-full overflow-hidden">
              <img
                src={item.poster}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181a26] via-transparent to-transparent"></div>
              <span className="absolute top-2 right-2 text-[10px] bg-[#0d0e16]/80 text-[#4ee5c5] font-bold px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-md">
                {item.duration}
              </span>
            </div>

            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-[#b9b5cb]">
                <span>{item.year}</span>
                <span className="text-[#ff79b0] font-bold">{item.rating}</span>
              </div>

              <h3 className="text-sm font-bold text-[#f1eef8] leading-snug line-clamp-1">
                {item.title}
              </h3>

              <p className="text-[11px] text-[#b9b5cb] line-clamp-1">{item.genre}</p>

              <div className="text-[10px] text-[#817b96] pt-1 border-t border-[#282b3f]">
                Added by: <strong className="text-[#ff79b0]">{item.addedBy}</strong>
              </div>

              <button
                type="button"
                onClick={() => onPlayMovie(item.title, item.url)}
                className="w-full mt-2 py-2 rounded-xl bg-[#202334] hover:bg-[#ff79b0] text-[#ff79b0] hover:text-[#4a0425] text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                <span>Play Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
