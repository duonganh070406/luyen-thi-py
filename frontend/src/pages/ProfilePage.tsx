import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, User as UserIcon, LogOut, Loader2, KeyRound } from 'lucide-react';
import { changePassword, currentUser, fetchMe, logout } from '../services/api.ts';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [user, setUser] = useState<{ username: string; role: string; must_change_password?: boolean } | null>(null);
  const [checking, setChecking] = useState(true);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    const local = currentUser();
    if (!local) {
      navigate('/dang-nhap');
      return;
    }
    // Xac minh token + lay role moi nhat tu server
    fetchMe()
      .then((me) => {
        setUser(me);
        localStorage.setItem('eq_user', JSON.stringify(me));
        window.dispatchEvent(new Event('eq-auth'));
      })
      .catch(() => {
        logout();
        window.dispatchEvent(new Event('eq-auth'));
        navigate('/dang-nhap');
      })
      .finally(() => setChecking(false));
  }, [navigate]);

  const doLogout = () => {
    logout();
    window.dispatchEvent(new Event('eq-auth'));
    navigate('/');
  };

  const doChangePassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setPassMsg('');
    if (newPass !== confirmPass) {
      setPassMsg('Mật khẩu mới nhập lại không khớp.');
      return;
    }
    setSavingPass(true);
    try {
      await changePassword(oldPass, newPass);
      // doi xong thu hoi het phien -> dang nhap lai
      logout();
      window.dispatchEvent(new Event('eq-auth'));
      navigate('/dang-nhap');
    } catch (err) {
      setPassMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingPass(false);
    }
  };

  if (checking) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) return null;
  const isAdmin = user.role === 'admin';

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs text-center">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4 ${isAdmin ? 'bg-primary' : 'bg-slate-700'}`}>
          {user.username.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-xl font-bold text-slate-900">{user.username}</h1>
        <div className="mt-2 flex justify-center">
          {isAdmin ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck size={14} /> Quản trị viên (admin)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
              <UserIcon size={14} /> Người dùng (user)
            </span>
          )}
        </div>

        <div className="mt-6 text-left text-sm flex flex-col gap-2">
          <div className="flex justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5">
            <span className="text-slate-500">Tên đăng nhập</span>
            <b className="text-slate-800">{user.username}</b>
          </div>
          <div className="flex justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5">
            <span className="text-slate-500">Vai trò</span>
            <b className="text-slate-800">{isAdmin ? 'admin' : 'user'}</b>
          </div>
          <div className="flex justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5">
            <span className="text-slate-500">Trạng thái</span>
            <b className="text-green-600">Đang đăng nhập</b>
          </div>
        </div>

        {(user.must_change_password || params.get('doi-mat-khau') === '1') && (
          <p className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left">
            Tài khoản đang dùng mật khẩu mặc định <b>admin123</b>. Bạn phải đổi mật khẩu mới để tiếp tục.
          </p>
        )}

        <form onSubmit={doChangePassword} className="mt-4 text-left rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <h2 className="flex items-center gap-2 font-bold text-sm text-slate-800 mb-3">
            <KeyRound size={15} /> Đổi mật khẩu
          </h2>
          <label className="block text-xs font-bold text-slate-600 mb-1">Mật khẩu hiện tại</label>
          <input
            type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none bg-white focus:border-primary mb-2"
          />
          <label className="block text-xs font-bold text-slate-600 mb-1">Mật khẩu mới (tối thiểu 3 ký tự)</label>
          <input
            type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none bg-white focus:border-primary mb-2"
          />
          <label className="block text-xs font-bold text-slate-600 mb-1">Nhập lại mật khẩu mới</label>
          <input
            type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none bg-white focus:border-primary mb-3"
          />
          {passMsg && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">{passMsg}</p>}
          <button
            type="submit"
            disabled={savingPass || !oldPass || !newPass}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold cursor-pointer hover:bg-slate-700 disabled:opacity-50"
          >
            {savingPass ? 'Đang đổi...' : 'Đổi mật khẩu (sẽ đăng nhập lại)'}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold cursor-pointer transition-colors"
            >
              Tới trang Quản trị
            </button>
          )}
          <button
            type="button"
            onClick={doLogout}
            className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-bold cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={15} /> Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
