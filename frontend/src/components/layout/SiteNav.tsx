import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { GraduationCap, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { currentUser, fetchMe, logout } from '../../services/api.ts';

const LINKS = [
  { to: '/', label: 'Trang chu', end: true },
  { to: '/gioi-thieu', label: 'Gioi thieu' },
  { to: '/luyen-thi', label: 'Luyen thi' },
  { to: '/phong-thi', label: 'Phong thi' },
  { to: '/lien-he', label: 'Lien he' },
];

/** Thanh dieu huong chung: Trang chu / Gioi thieu / Luyen thi / Phong thi / Lien he. */
export default function SiteNav() {
  const [user, setUser] = useState(currentUser());
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => setUser(currentUser());
    window.addEventListener('storage', sync);
    window.addEventListener('eq-auth', sync);
    // Tu xac minh token con hieu luc khong (vd server vua reset data)
    if (currentUser()) {
      fetchMe().catch(() => {
        logout();
        setUser(null);
      });
    }
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('eq-auth', sync);
    };
  }, []);

  const doLogout = () => {
    logout();
    setUser(null);
    window.dispatchEvent(new Event('eq-auth'));
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-bold text-indigo-700 cursor-pointer"
        >
          <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
            <GraduationCap size={18} />
          </span>
          <span className="hidden sm:inline">EduQuest</span>
        </button>
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex-1" />
        {user?.role === 'admin' && (
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-pointer"
          >
            <ShieldCheck size={15} /> Quan tri
          </button>
        )}
        {user ? (
          <span className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
            <span className="font-bold text-slate-800">{user.username}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100">{user.role}</span>
            <button
              type="button"
              onClick={doLogout}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              title="Dang xuat"
            >
              <LogOut size={16} />
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/dang-nhap')}
            className="hidden sm:block px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 cursor-pointer"
          >
            Dang nhap
          </button>
        )}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-slate-100 px-4 py-2 flex flex-col gap-1 bg-white">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg text-sm font-semibold ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-bold text-amber-700 bg-amber-50">
              Quan tri vien
            </NavLink>
          )}
          {user ? (
            <button type="button" onClick={() => { setOpen(false); doLogout(); }} className="text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600">
              Dang xuat ({user.username})
            </button>
          ) : (
            <NavLink to="/dang-nhap" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-bold text-indigo-700 bg-indigo-50">
              Dang nhap
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}
