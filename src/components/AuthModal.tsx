import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, GraduationCap, AlertCircle, Sparkles } from 'lucide-react';
import { loginStudent, loginTeacher, registerStudent } from '../services/storage';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'student' | 'teacher' | 'register';
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'student',
  onLoginSuccess,
}) => {
  const [tab, setTab] = useState<'student' | 'teacher' | 'register'>(defaultTab);

  // Student Login fields
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Teacher Login fields
  const [teacherUsername, setTeacherUsername] = useState('Mudarris Kalaamunaa');
  const [teacherPassword, setTeacherPassword] = useState('KaLaAmUnAa123');

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = loginStudent(studentEmail, studentPassword);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onClose();
    } else {
      setErrorMsg(res.message || 'Login gagal.');
    }
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = loginTeacher(teacherUsername, teacherPassword);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onClose();
    } else {
      setErrorMsg(res.message || 'Username atau password Guru salah.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Mohon lengkapi seluruh formulir pendaftaran.');
      return;
    }
    const res = registerStudent(regName, regEmail, regPassword, regPhone);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onClose();
    } else {
      setErrorMsg(res.message || 'Pendaftaran gagal.');
    }
  };

  const setDemoStudent = () => {
    setTab('student');
    setStudentEmail('ahmad.fauzan@gmail.com');
    setStudentPassword('password123');
    setErrorMsg('');
  };

  const setDemoTeacher = () => {
    setTab('teacher');
    setTeacherUsername('Mudarris Kalaamunaa');
    setTeacherPassword('KaLaAmUnAa123');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#003380] to-[#0047AB] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="font-arabic text-amber-300 text-lg">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
          <h2 className="text-xl font-extrabold tracking-tight mt-1">Kalaamunaa Arabic Learning</h2>
          <p className="text-xs text-blue-100">Silakan masuk untuk mengakses materi dan kursus</p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
          <button
            onClick={() => {
              setTab('student');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
              tab === 'student'
                ? 'border-b-2 border-[#0047AB] text-[#0047AB] bg-white font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Masuk Peserta</span>
          </button>
          <button
            onClick={() => {
              setTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
              tab === 'register'
                ? 'border-b-2 border-[#0047AB] text-[#0047AB] bg-white font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Daftar Akun</span>
          </button>
          <button
            onClick={() => {
              setTab('teacher');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
              tab === 'teacher'
                ? 'border-b-2 border-[#0047AB] text-[#0047AB] bg-white font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Login Guru</span>
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="m-6 mb-0 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Content */}
        <div className="p-6">
          {tab === 'student' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Peserta</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#0047AB] focus:ring-1 focus:ring-[#0047AB]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#0047AB] focus:ring-1 focus:ring-[#0047AB]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0047AB] hover:bg-[#003380] text-white font-bold text-sm transition-all shadow-md mt-2 cursor-pointer"
              >
                Masuk ke Kelas Saya
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={setDemoStudent}
                  className="text-xs text-[#0047AB] hover:underline font-semibold flex items-center justify-center space-x-1 mx-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Isi Otomatis Akun Demo Siswa (Ahmad Fauzan)</span>
                </button>
              </div>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Muhammad Farhan"
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#0047AB]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Aktif</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="farhan@gmail.com"
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#0047AB]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nomor WhatsApp (Untuk Konfirmasi)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#0047AB]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Buat password akun Anda"
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#0047AB]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0047AB] hover:bg-[#003380] text-white font-bold text-sm transition-all shadow-md mt-2 cursor-pointer"
              >
                Daftar & Mulai Belajar
              </button>
            </form>
          )}

          {tab === 'teacher' && (
            <form onSubmit={handleTeacherLogin} className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0047AB]" />
                  <span>Kredensial Khusus Guru (Sesuai Permintaan):</span>
                </p>
                <p className="text-[11px]">
                  Username: <span className="font-mono font-bold text-[#0047AB]">Mudarris Kalaamunaa</span>
                </p>
                <p className="text-[11px]">
                  Password: <span className="font-mono font-bold text-[#0047AB]">KaLaAmUnAa123</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Username Guru</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={teacherUsername}
                    onChange={(e) => setTeacherUsername(e.target.value)}
                    placeholder="Mudarris Kalaamunaa"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#0047AB]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Password Guru</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="KaLaAmUnAa123"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#0047AB]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0047AB] hover:bg-[#003380] text-white font-bold text-sm transition-all shadow-md mt-2 cursor-pointer"
              >
                Masuk ke Dasbor Mudarris
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={setDemoTeacher}
                  className="text-xs text-[#0047AB] hover:underline font-semibold"
                >
                  Gunakan Kredensial Resmi Guru
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
