import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput.tsx';
import { login, register } from '../services/api.ts';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = mode === 'login'
        ? await login(username.trim(), password)
        : await register(username.trim(), password);
      window.dispatchEvent(new Event('eq-auth'));
      navigate(r.role === 'admin' ? '/admin' : '/luyen-thi');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 mb-1">
          {mode === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}
        </h1>
        <p className="text-xs text-slate-500 mb-5">
          {mode === 'login'
            ? 'Quản trị viên đăng nhập để quản lý đề thi và phòng thi.'
            : 'Tài khoản tự đăng ký chỉ có quyền người dùng.'}
        </p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Tên đăng nhập</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="vd: admin"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              autoComplete="username"
            />
          </label>
          <PasswordInput value={password} onChange={setPassword} label="Mật khẩu" placeholder="Nhập mật khẩu" />
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="mt-1 w-full py-3 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>
        <div className="mt-4 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <>Chưa có tài khoản? <button type="button" onClick={() => setMode('register')} className="text-indigo-600 font-bold cursor-pointer">Đăng ký</button></>
          ) : (
            <>Đã có tài khoản? <button type="button" onClick={() => setMode('login')} className="text-indigo-600 font-bold cursor-pointer">Đăng nhập</button></>
          )}
        </div>
        <p className="mt-4 text-center text-[11px] text-slate-400">
          Mặc định: <b>admin / admin123</b> · <Link to="/phong-thi" className="text-indigo-500 underline">Vào thi không cần mật khẩu</Link>
        </p>
      </div>
    </div>
  );
}
