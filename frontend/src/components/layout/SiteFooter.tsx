import { Link } from 'react-router-dom';

/** Chan trang do dam kieu cong an. */
export default function SiteFooter() {
  return (
    <footer className="bg-primary-deep text-white/85 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 text-center sm:text-left">
        <div className="leading-relaxed">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-gold-light">
            Hệ thống kiểm tra nhận thức nghiệp vụ cơ bản
          </p>
          <p className="text-[11px] uppercase tracking-wider text-white/70">
            Bộ Công an – Cục An ninh mạng
          </p>
          <p className="text-[11px] text-white/50">
            Đoàn TNCS Hồ Chí Minh – Cục An ninh mạng
          </p>
        </div>
        <div className="text-[11px] text-white/60 leading-relaxed sm:text-right">
          <p>Phục vụ ôn tập, củng cố và kiểm tra nhận thức cho cán bộ, chiến sĩ.</p>
          <p>
            <Link to="/gioi-thieu" className="hover:text-gold-light underline underline-offset-2">Hướng dẫn sử dụng</Link>
            {' · '}
            <Link to="/lien-he" className="hover:text-gold-light underline underline-offset-2">Liên hệ hỗ trợ</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
