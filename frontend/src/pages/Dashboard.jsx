import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit3, X, Sparkles, Calendar, Paperclip, Eye } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const STICKER_CATEGORIES = {
  Moods: ['🍊', '🍓', '🍰', '🧸', '☁️', '🥑', '🍭', '🎨'],
  Peaceful: ['🌿', '🍵', '🕯️', '🌸', '🌊', '☕', '📖', '🕊️'],
  Girly: ['🎀', '💄', '💖', '🩰', '💅', '🌷', '🧁', '✨'],
  Gaming: ['🎮', '👾', '🕹️', '⚡', '🎧', '🏆', '🔥', '⚔️'],
};

export default function Dashboard({ themeConfig }) {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodEmoji, setMoodEmoji] = useState('🍊');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [editFile, setEditFile] = useState(null);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/entries`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEntries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('moodEmoji', moodEmoji);
    if (file) formData.append('media', file);

    try {
      await axios.post(`${API_BASE}/api/entries`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTitle('');
      setContent('');
      setFile(null);
      fetchEntries();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEntry = async () => {
    if (!selectedEntry) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('title', editTitle);
    formData.append('content', editContent);
    formData.append('moodEmoji', editEmoji);
    if (editFile) formData.append('media', editFile);

    try {
      const res = await axios.put(`${API_BASE}/api/entries/${selectedEntry._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSelectedEntry(res.data);
      setIsEditing(false);
      fetchEntries();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/entries/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEntries(entries.filter(entry => entry._id !== id));
      setSelectedEntry(null);
    } catch (err) {
      console.error(err);
    }
  };

  const openViewModal = (entry) => {
    setSelectedEntry(entry);
    setEditTitle(entry.title);
    setEditContent(entry.content);
    setEditEmoji(entry.moodEmoji);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
      {/* Create Memory Box */}
      <div className={`border-2 rounded-[2rem] p-6 shadow-sm transition-all ${themeConfig.cardBg} ${themeConfig.borderColor}`}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 opacity-75" />
          <h2 className={`font-bold text-lg ${themeConfig.primaryText}`}>New Memory Entry</h2>
        </div>

        <form onSubmit={handleCreateEntry} className="space-y-4">
          {/* Categorized Stickers */}
          <div className="space-y-2">
            <span className="text-xs font-bold opacity-60">Pick your sticker:</span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-black/5 dark:bg-white/5 rounded-2xl">
              {Object.entries(STICKER_CATEGORIES).flatMap(([, list]) => list).map((e, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setMoodEmoji(e)}
                  className={`text-xl p-1.5 rounded-full transition transform cursor-pointer ${
                    moodEmoji === e ? 'scale-125 bg-black/10 dark:bg-white/20' : 'hover:scale-110'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            placeholder="Give this memory a title..."
            className={`w-full px-4 py-2.5 border rounded-2xl font-bold focus:outline-none focus:ring-2 text-sm ${themeConfig.inputBg} ${themeConfig.borderColor}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            rows="3"
            placeholder="Write secret thoughts, doodles, notes..."
            className={`w-full px-4 py-2.5 border rounded-2xl focus:outline-none focus:ring-2 text-sm ${themeConfig.inputBg} ${themeConfig.borderColor}`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex flex-wrap justify-between items-center gap-3 pt-1">
            <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition shadow-sm ${themeConfig.buttonSecondary}`}>
              <Paperclip className="w-3.5 h-3.5" />
              <span>Attach Media</span>
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*,audio/*"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
            {file && <span className="text-xs font-semibold opacity-75">Selected: {file.name}</span>}

            <button
              type="submit"
              disabled={loading}
              className={`font-bold px-6 py-2 rounded-full text-sm shadow-md transition transform active:scale-95 disabled:opacity-50 cursor-pointer ${themeConfig.buttonPrimary}`}
            >
              {loading ? 'Saving...' : `Save Memory ${themeConfig.icon}`}
            </button>
          </div>
        </form>
      </div>

      {/* Diary List Header */}
      <div className="flex justify-between items-center">
        <h3 className={`font-black text-lg flex items-center gap-2 ${themeConfig.primaryText}`}>
          <span>Memories Timeline</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10">{entries.length}</span>
        </h3>
      </div>

      {/* Compact List View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {entries.map((entry) => (
          <div
            key={entry._id}
            onClick={() => openViewModal(entry)}
            className={`border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4 group ${themeConfig.cardBg} ${themeConfig.borderColor}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl p-2 bg-black/5 dark:bg-white/5 rounded-2xl shrink-0 group-hover:scale-110 transition-transform">
                {entry.moodEmoji}
              </span>
              <div className="min-w-0">
                <h4 className={`font-bold text-sm truncate ${themeConfig.primaryText}`}>
                  {entry.title}
                </h4>
                <div className="flex items-center gap-2 text-[11px] opacity-60">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                  {entry.mediaType !== 'none' && (
                    <span className="px-1.5 py-0.5 bg-black/5 rounded text-[10px] uppercase font-bold">
                      {entry.mediaType}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Read
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Reader & Editor Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-lg border-2 rounded-[2rem] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${themeConfig.cardBg} ${themeConfig.borderColor}`}>
            <div className="flex justify-between items-center border-b pb-3 border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{isEditing ? editEmoji : selectedEntry.moodEmoji}</span>
                <span className="text-xs opacity-60 font-semibold">
                  {new Date(selectedEntry.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <h2 className={`font-extrabold text-xl ${themeConfig.primaryText}`}>{selectedEntry.title}</h2>
                <p className="text-sm whitespace-pre-wrap leading-relaxed opacity-90">{selectedEntry.content}</p>

                {selectedEntry.mediaUrl && (
                  <div className="rounded-2xl overflow-hidden border border-black/10">
                    {selectedEntry.mediaType === 'image' && (
                      <img src={`${API_BASE}${selectedEntry.mediaUrl}`} alt="Memory" className="w-full max-h-72 object-cover" />
                    )}
                    {selectedEntry.mediaType === 'video' && (
                      <video controls className="w-full max-h-72">
                        <source src={`${API_BASE}${selectedEntry.mediaUrl}`} />
                      </video>
                    )}
                    {selectedEntry.mediaType === 'audio' && (
                      <audio controls className="w-full p-2">
                        <source src={`${API_BASE}${selectedEntry.mediaUrl}`} />
                      </audio>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1.5 bg-black/5 dark:bg-white/5 rounded-xl">
                  {Object.entries(STICKER_CATEGORIES).flatMap(([, list]) => list).map((e, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditEmoji(e)}
                      className={`text-lg p-1 rounded ${editEmoji === e ? 'bg-black/15' : ''}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl font-bold text-sm ${themeConfig.inputBg}`}
                />
                <textarea
                  rows="4"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl text-sm ${themeConfig.inputBg}`}
                />
                <input
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={(e) => setEditFile(e.target.files[0])}
                  className="text-xs"
                />
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-black/10 dark:border-white/10">
              <button
                onClick={() => handleDelete(selectedEntry._id)}
                className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>

              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-full cursor-pointer ${themeConfig.buttonSecondary}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-xs font-bold px-3 py-1.5 rounded-full hover:bg-black/10 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateEntry}
                      disabled={loading}
                      className={`text-xs font-bold px-4 py-2 rounded-full cursor-pointer ${themeConfig.buttonPrimary}`}
                    >
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}