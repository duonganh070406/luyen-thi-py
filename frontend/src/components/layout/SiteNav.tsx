import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { currentUser, fetchMe, logout } from '../../services/api.ts';
import cybersecurityLogo from '../../assets/cybersecurity_department_a05_logo_symbol.png';
import youthUnionLogo from '../../assets/ho_chi_minh_communist_youth_union.png';

const LINKS = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/luyen-thi', label: 'Ôn luyện' },
  { to: '/phong-thi', label: 'Tham gia kiểm tra' },
  { to: '/gioi-thieu', label: 'Hướng dẫn' },
  { to: '/lien-he', label: 'Liên hệ' },
];

/** Header 2 tang kieu cong an: thanh thuong hieu trang + thanh dieu huong do. */
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
    <header className="shadow-md">
      {/* Tang 1: thuong hieu (nen trang) */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer select-none text-left"
          >
            <img src={cybersecurityLogo} alt="Cục An ninh mạng" className="h-11 md:h-12 w-auto object-contain shrink-0" />
            <span className="leading-tight">
              <span className="block text-[10px] font-semibold tracking-widest text-slate-500 uppercase">Bộ Công an</span>
              <span className="block text-sm md:text-base font-extrabold tracking-wide text-primary uppercase">Cục An ninh mạng</span>
              <span className="block text-[9px] md:text-[10px] font-medium tracking-wider text-slate-500 uppercase">Hệ thống kiểm tra đánh giá</span>
            </span>
          </button>
          <div className="hidden sm:flex items-center gap-2.5 text-right shrink-0">
            <span className="leading-tight">
              <span className="block text-[10px] font-semibold tracking-widest text-slate-500 uppercase">Đoàn TNCS Hồ Chí Minh</span>
              <span className="block text-sm font-extrabold tracking-wide text-primary uppercase">Cục An ninh mạng</span>
            </span>
            <img src={youthUnionLogo} alt="Đoàn TNCS Hồ Chí Minh" className="h-11 md:h-12 w-auto object-contain" />
          </div>
        </div>
      </div>

      {/* Tang 2: thanh dieu huong (nen do) - giu dinh khi cuon */}
      <div className="bg-primary sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-11 flex items-center justify-between gap-2">
          <nav className="hidden md:flex items-center gap-1 h-full">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `relative h-11 px-4 flex items-center text-[12px] font-bold uppercase tracking-wider transition-colors ${
                    isActive ? 'text-white' : 'text-white/75 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    <span className={`absolute left-3 right-3 bottom-0 h-[3px] rounded-t bg-gold transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user?.role === 'admin' && (
              <button
                type="button"
                onClick={() => navigate('/admin/rooms')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-gold text-primary-deep hover:bg-gold-light cursor-pointer"
              >
                <ShieldCheck size={13} /> Quản trị
              </button>
            )}
            {user ? (
              <div className="flex items-center gap-1.5 text-[11px] text-white">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="font-bold hover:underline cursor-pointer px-1"
                  title="Xem hồ sơ"
                >
                  {user.username}
                </button>
                <button
                  type="button"
                  onClick={doLogout}
                  className="p-1.5 rounded-md hover:bg-white/15 text-white cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <NavLink
                to="/dang-nhap"
                className="px-3 py-1.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-white/15 text-white hover:bg-white/25 transition-colors"
              >
                Đăng nhập
              </NavLink>
            )}
          </div>

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
          <nav className="md:hidden border-t border-white/20 px-4 py-2 flex flex-col gap-1 bg-primary-dark">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider ${isActive ? 'bg-white/20 text-white' : 'text-white/80'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {user?.role === 'admin' && (
              <NavLink to="/admin/rooms" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-gold text-primary-deep">
                Quản trị
              </NavLink>
            )}
            {user ? (
              <>
                <NavLink to="/profile" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-xs font-semibold text-white">
                  Hồ sơ ({user.username} · {user.role})
                </NavLink>
                <button type="button" onClick={() => { setOpen(false); doLogout(); }} className="text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-white/80">
                  Đăng xuất
                </button>
              </>
            ) : (
              <NavLink to="/dang-nhap" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-gold text-primary-deep">
                Đăng nhập
              </NavLink>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
