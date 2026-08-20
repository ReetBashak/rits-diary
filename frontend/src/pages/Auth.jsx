import { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Auth({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', resetToken: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    try {
      if (isForgot) {
        if (!form.resetToken) {
          const res = await axios.post(`${API_BASE}/api/auth/forgot-password`, { email: form.email });
          setMsg(`Token: ${res.data.resetToken} (Paste below to reset)`);
        } else {
          const res = await axios.post(`${API_BASE}/api/auth/reset-password`, {
            resetToken: form.resetToken,
            newPassword: form.newPassword
          });
          setMsg(res.data.msg);
          setIsForgot(false);
        }
      } else {
        const endpoint = isRegister ? 'register' : 'login';
        const res = await axios.post(`${API_BASE}/api/auth/${endpoint}`, form);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onLoginSuccess(res.data.user);
      }
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white border-4 border-orange-200 rounded-[2rem] p-8 w-full max-w-md shadow-xl text-center relative overflow-hidden">
        <div className="text-5xl mb-2">🎀</div>
        <h2 className="text-2xl font-black text-stone-700 mb-1">
          {isForgot ? 'Recover Key 🗝️' : isRegister ? 'Create Cozy Nook ✨' : 'Welcome Back 🍊'}
        </h2>
        <p className="text-xs text-stone-400 mb-6">"Viva La Vida — Live a colorful memory"</p>

        {msg && (
          <div className="p-2 mb-4 text-xs font-semibold bg-orange-100 text-orange-600 rounded-xl border border-orange-300">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {isRegister && !isForgot && (
            <input
              type="text"
              placeholder="Your cute nickname..."
              className="px-4 py-2.5 rounded-2xl bg-orange-50 border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email address..."
            className="px-4 py-2.5 rounded-2xl bg-orange-50 border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          {!isForgot ? (
            <input
              type="password"
              placeholder="Secret passcode..."
              className="px-4 py-2.5 rounded-2xl bg-orange-50 border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          ) : (
            <>
              <input
                type="text"
                placeholder="Paste Reset Token..."
                className="px-4 py-2.5 rounded-2xl bg-purple-50 border border-purple-200 focus:outline-none text-sm"
                value={form.resetToken}
                onChange={(e) => setForm({ ...form, resetToken: e.target.value })}
              />
              {form.resetToken && (
                <input
                  type="password"
                  placeholder="Enter brand new password..."
                  className="px-4 py-2.5 rounded-2xl bg-green-50 border border-green-200 focus:outline-none text-sm"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  required
                />
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-3 bg-orange-400 hover:bg-orange-500 text-white font-bold rounded-2xl shadow-md transform active:scale-95 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isForgot ? (form.resetToken ? 'Update Passcode 🔑' : 'Send Reset Token 📨') : isRegister ? 'Enter Diary Land 🍓' : 'Unlock Diary 🔓'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-1 text-xs font-semibold text-stone-500">
          {!isForgot ? (
            <>
              <span className="cursor-pointer hover:text-orange-500" onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? 'Already have an account? Log In' : "Don't have a diary yet? Sign Up"}
              </span>
              <span className="cursor-pointer text-stone-400 hover:text-stone-600 underline text-[11px]" onClick={() => setIsForgot(true)}>
                Forgot your key?
              </span>
            </>
          ) : (
            <span className="cursor-pointer text-orange-500 hover:underline" onClick={() => setIsForgot(false)}>
              Back to Login
            </span>
          )}
        </div>
      </div>
    </div>
  );
}