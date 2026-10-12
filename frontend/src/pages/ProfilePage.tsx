import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User as UserIcon, LogOut, Loader2 } from 'lucide-react';
import { currentUser, fetchMe, logout } from '../services/api.ts';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [checking, setChecking] = useState(true);

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

  if (checking) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#8B0000]" size={32} />
      </div>
    );
  }

  if (!user) return null;
  const isAdmin = user.role === 'admin';

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs text-center">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4 ${isAdmin ? 'bg-[#8B0000]' : 'bg-slate-700'}`}>
          {user.username.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-xl font-bold text-slate-900">{user.username}</h1>
        <div className="mt-2 flex justify-center">
          {isAdmin ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#8B0000]/10 text-[#8B0000] border border-[#8B0000]/20">
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

        <div className="mt-6 flex flex-col gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="w-full py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#700000] text-white text-sm font-bold cursor-pointer transition-colors"
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
