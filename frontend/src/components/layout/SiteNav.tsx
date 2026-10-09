import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { currentUser, fetchMe, logout } from '../../services/api.ts';
import cybersecurityLogo from '../../assets/cybersecurity_department_a05_logo_symbol.png';
import youthUnionLogo from '../../assets/ho_chi_minh_communist_youth_union.png';

const LINKS = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/gioi-thieu', label: 'Giới thiệu' },
  { to: '/luyen-thi', label: 'Luyện thi' },
  { to: '/phong-thi', label: 'Phòng thi' },
  { to: '/lien-he', label: 'Liên hệ' },
];

/** Thanh điều hướng chung: Trang chủ / Giới thiệu / Luyện thi / Phòng thi / Liên hệ. */
export default function SiteNav() {
  const [user, setUser] = useState(currentUser());
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => setUser(currentUser());
    window.addEventListener('storage', sync);
    window.addEventListener('eq-auth', sync);
    // Tự xác minh token còn hiệu lực không
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
    <header className="sticky top-0 z-40 bg-[#8B0000] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <img src={cybersecurityLogo} alt="Cục An ninh mạng" className="h-10 w-auto object-contain" />
          <img src={youthUnionLogo} alt="Đoàn TNCS Hồ Chí Minh" className="h-10 w-auto object-contain" />
          <span className="font-bold text-base md:text-lg tracking-wider text-white uppercase ml-1 drop-shadow-sm whitespace-nowrap">
            CỤC AN NINH MẠNG
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D4AF37] text-[#8B0000] hover:bg-[#E5C158] cursor-pointer"
            >
              <ShieldCheck size={14} /> Quản trị
            </button>
          )}
          {user && (
            <div className="ml-2 flex items-center gap-2 text-xs text-white">
              <span className="font-bold">{user.username}</span>
              <button
                type="button"
                onClick={doLogout}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </nav>

        <button
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-white/10 text-white cursor-pointer"
          onClick={() => setOpen((o) => !o)}
          aria-label="Thực đơn"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-white/20 px-4 py-2 flex flex-col gap-1 bg-[#8B0000]">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg text-sm font-semibold ${isActive ? 'bg-white/20 text-white' : 'text-white/90'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-bold bg-[#D4AF37] text-[#8B0000]">
              Quản trị viên
            </NavLink>
          )}
          {user ? (
            <button type="button" onClick={() => { setOpen(false); doLogout(); }} className="text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-white">
              Đăng xuất ({user.username})
            </button>
          ) : (
            <NavLink to="/dang-nhap" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-bold bg-[#D4AF37] text-[#8B0000]">
              Đăng nhập
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}
