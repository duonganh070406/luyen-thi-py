import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dongSonBg from '../assets/dong_son_bg.jpg';
import { login } from '../services/api.ts';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await login(username.trim(), password);
      window.dispatchEvent(new Event('eq-auth'));
      navigate(r.role === 'admin' ? '/admin' : '/luyen-thi');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `radial-gradient(circle at center, rgba(30, 2, 2, 0.65) 0%, rgba(20, 0, 0, 0.92) 100%), url(${dongSonBg})`,
        backgroundColor: '#2A0000',
      }}
    >
      <div className="relative w-full max-w-[340px] z-10">
        <div className="rounded-2xl border border-red-900/60 bg-[#350202]/92 backdrop-blur-md px-7 py-8 shadow-2xl text-white">
          <h1 className="text-xl font-bold text-white mb-6 text-center tracking-wide">
            Đăng nhập
          </h1>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-200 mb-1.5 ml-1">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full h-10 rounded-full bg-white px-4 text-xs text-slate-900 font-medium outline-none shadow-inner border border-slate-300 focus:ring-2 focus:ring-[#D4AF37]"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-200 mb-1.5 ml-1">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full h-10 rounded-full bg-white px-4 text-xs text-slate-900 font-medium outline-none shadow-inner border border-slate-300 focus:ring-2 focus:ring-[#D4AF37]"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-[11px] text-red-200 bg-red-950/80 border border-red-800 rounded-lg px-3 py-1.5 text-center">
                {error}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !username.trim() || !password}
                className="w-full h-10 rounded-full bg-[#D4AF37] hover:bg-[#E5C158] active:bg-[#C29E2E] text-[#3D0A0A] text-xs font-bold transition-colors cursor-pointer shadow-md disabled:opacity-60 flex items-center justify-center tracking-wider"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
