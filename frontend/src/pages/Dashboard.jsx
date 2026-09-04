import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Trash2, Sparkles, Calendar, Paperclip, Eye, Mic, Square, Camera, X, WifiOff, RefreshCw, Image as ImageIcon } from 'lucide-react';

const API_BASE = 'https://rits-diary-backend.vercel.app';

const STICKER_CATEGORIES = {
  Moods: ['🍊', '🍓', '🍰', '🧸', '☁️', '🥑', '🍭', '🎨'],
  Peaceful: ['🌿', '🍵', '🕯️', '🌸', '🌊', '☕', '📖', '🕊️'],
  Girly: ['🎀', '💄', '💖', '🩰', '💅', '🌷', '🧁', '✨'],
  Gaming: ['🎮', '👾', '🕹️', '⚡', '🎧', '🏆', '🔥', '⚔️'],
};

export default function Dashboard({ themeConfig }) {
  const [entries, setEntries] = useState([]);
  const [offlineEntries, setOfflineEntries] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodEmoji, setMoodEmoji] = useState('🍊');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const loadOfflineNotes = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('viva_offline_notes') || '[]');
      setOfflineEntries(saved);
    } catch {
      setOfflineEntries([]);
    }
  };

  // 1. Direct fetch from backend
  const fetchEntries = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get(`${API_BASE}/api/entries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) {
        setEntries(res.data);
      }
    } catch (err) {
      console.error('Fetch entries failed:', err);
    }
  };

  // Sync offline notes only when back online
  const syncOfflineEntries = async () => {
    const saved = JSON.parse(localStorage.getItem('viva_offline_notes') || '[]');
    if (!navigator.onLine || saved.length === 0) return;

    const token = localStorage.getItem('token');
    for (const item of saved) {
      const formData = new FormData();
      formData.append('title', item.title);
      formData.append('content', item.content || '');
      formData.append('moodEmoji', item.moodEmoji || '🍊');

      try {
        await axios.post(`${API_BASE}/api/entries`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.warn('Sync note error:', err);
      }
    }

    localStorage.removeItem('viva_offline_notes');
    setOfflineEntries([]);
    fetchEntries();
  };

  useEffect(() => {
    fetchEntries();
    loadOfflineNotes();

    const handleOnline = () => {
      setIsOnline(true);
      fetchEntries();
      syncOfflineEntries();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleFileChange = (selected) => {
    if (selected) {
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selected));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const recordedAudioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        setFile(recordedAudioFile);
        setIsRecording(false);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch {
      alert('Microphone permission denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // 2. Direct Online / Offline Creation
  const handleCreateEntry = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    // Online Hai Toh Seedha Live Save Hoga (Pehle ki tarah)
    if (navigator.onLine) {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('moodEmoji', moodEmoji);
      if (file) formData.append('media', file);

      try {
        const res = await axios.post(`${API_BASE}/api/entries`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        setEntries(prev => [res.data, ...prev]);
        setTitle('');
        setContent('');
        setFile(null);
        setPreviewUrl(null);
        setLoading(false);
        return;
      } catch (err) {
        console.error('Online upload error:', err);
      }
    }

    // Agar Net Bilkul Band Hai Tabhi Phone Mein Save Hoga
    const offlineItem = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      moodEmoji,
      createdAt: new Date().toISOString()
    };

    const currentOffline = JSON.parse(localStorage.getItem('viva_offline_notes') || '[]');
    currentOffline.unshift(offlineItem);
    localStorage.setItem('viva_offline_notes', JSON.stringify(currentOffline));
    setOfflineEntries(currentOffline);

    setTitle('');
    setContent('');
    setFile(null);
    setPreviewUrl(null);
    setLoading(false);
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

  const extractMedia = (item) => {
    const url = item.mediaUrl || item.imageUrl || item.fileUrl || item.image || null;
    let type = item.mediaType || 'image';

    if (url) {
      if (url.match(/\.(mp4|mov|webm)$/i)) type = 'video';
      else if (url.match(/\.(mp3|wav|m4a|ogg)$/i)) type = 'audio';
    }

    return { url, type };
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
      {/* Offline Alert Only When Network Is Off */}
      {!isOnline && (
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-400 text-amber-700 dark:text-amber-300 rounded-2xl text-xs font-bold">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>No Internet. Note will save on phone and upload automatically when internet reconnects.</span>
        </div>
      )}

      {/* Sync Banner */}
      {isOnline && offlineEntries.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-400 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
            <span>{offlineEntries.length} offline note(s) saved during disconnected state.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={syncOfflineEntries}
              className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-700"
            >
              Upload Now
            </button>
            <button
              type="button"
              onClick={() => { localStorage.removeItem('viva_offline_notes'); setOfflineEntries([]); }}
              className="p-1 text-gray-500 hover:text-rose-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* New Memory Box */}
      <div className={`border-2 rounded-[2rem] p-6 shadow-sm transition-all ${themeConfig.cardBg} ${themeConfig.borderColor}`}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 opacity-75" />
          <h2 className={`font-bold text-lg ${themeConfig.primaryText}`}>New Memory Entry</h2>
        </div>

        <form onSubmit={handleCreateEntry} className="space-y-4">
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

          {previewUrl && (
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-300">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <X
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full p-0.5 cursor-pointer"
                onClick={() => { setFile(null); setPreviewUrl(null); }}
              />
            </div>
          )}

          <div className="flex flex-wrap justify-between items-center gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <label className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition shadow-sm ${themeConfig.buttonSecondary}`}>
                <Paperclip className="w-3.5 h-3.5" />
                <span>Media</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/*,audio/*"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                />
              </label>

              <label className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition shadow-sm ${themeConfig.buttonSecondary}`}>
                <Camera className="w-3.5 h-3.5" />
                <span>Snap</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                />
              </label>

              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition shadow-sm cursor-pointer ${themeConfig.buttonSecondary}`}
                >
                  <Mic className="w-3.5 h-3.5" /> Record
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" /> Stop
                </button>
              )}
            </div>

            {file && !previewUrl && (
              <div className="flex items-center gap-1 bg-black/5 px-2.5 py-1 rounded-full text-xs">
                <span className="truncate max-w-[140px] font-semibold">{file.name}</span>
                <X className="w-3.5 h-3.5 cursor-pointer text-rose-500" onClick={() => setFile(null)} />
              </div>
            )}

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

      {/* Cloud Timeline */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className={`font-black text-lg flex items-center gap-2 ${themeConfig.primaryText}`}>
            <span>Memories Timeline</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10">{entries.length}</span>
          </h3>
          <button
            onClick={fetchEntries}
            className="text-xs font-bold opacity-60 hover:opacity-100 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry) => {
            const { url, type } = extractMedia(entry);
            return (
              <div
                key={entry._id}
                onClick={() => setSelectedEntry(entry)}
                className={`border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group ${themeConfig.cardBg} ${themeConfig.borderColor}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl p-2 bg-black/5 dark:bg-white/5 rounded-2xl shrink-0 group-hover:scale-110 transition-transform">
                      {entry.moodEmoji || '🍊'}
                    </span>
                    <div className="min-w-0">
                      <h4 className={`font-bold text-sm truncate ${themeConfig.primaryText}`}>{entry.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] opacity-60">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Open
                  </span>
                </div>

                {url && type === 'image' && (
                  <div className="w-full h-36 rounded-xl overflow-hidden border border-black/5">
                    <img
                      src={url}
                      alt={entry.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      crossOrigin="anonymous"
                    />
                  </div>
                )}

                {url && type !== 'image' && (
                  <div className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/5 flex items-center gap-1 w-fit uppercase">
                    <ImageIcon className="w-3 h-3" /> {type} attached
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal View */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-lg border-2 rounded-[2rem] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${themeConfig.cardBg} ${themeConfig.borderColor}`}>
            <div className="flex justify-between items-center border-b pb-3 border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedEntry.moodEmoji || '🍊'}</span>
                <span className="text-xs opacity-60 font-semibold">{new Date(selectedEntry.createdAt).toLocaleString()}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="p-1 rounded-full hover:bg-black/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h2 className={`font-extrabold text-xl ${themeConfig.primaryText}`}>{selectedEntry.title}</h2>
              {selectedEntry.content && (
                <p className="text-sm whitespace-pre-wrap leading-relaxed opacity-90">{selectedEntry.content}</p>
              )}

              {(() => {
                const { url, type } = extractMedia(selectedEntry);
                if (!url) return null;
                return (
                  <div className="rounded-2xl overflow-hidden border border-black/10 bg-black/5">
                    {type === 'image' && (
                      <img
                        src={url}
                        alt={selectedEntry.title}
                        className="w-full max-h-96 object-contain"
                        crossOrigin="anonymous"
                      />
                    )}
                    {type === 'video' && (
                      <video controls className="w-full max-h-96">
                        <source src={url} />
                      </video>
                    )}
                    {type === 'audio' && (
                      <audio controls className="w-full p-3">
                        <source src={url} />
                      </audio>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => handleDelete(selectedEntry._id)}
                className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Memory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}