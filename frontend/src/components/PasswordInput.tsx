import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
}

/** O nhap mat khau: che mat khau + nut con mat xem dang nhap den dau. */
export default function PasswordInput({ value, onChange, placeholder, label }: Props) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      {label && <span className="text-sm font-semibold text-slate-700">{label}</span>}
      <span className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
        <Lock size={16} className="text-slate-400 shrink-0" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Nhập mật khẩu'}
          className="flex-1 min-w-0 bg-transparent outline-none text-sm"
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
          aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          title={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
    </label>
  );
}
