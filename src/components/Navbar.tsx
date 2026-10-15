import React, { useState } from 'react';
import { BookOpen, ShoppingCart, User as UserIcon, LogOut, Menu, X, ShieldCheck, GraduationCap } from 'lucide-react';
import { User, CartItem } from '../types';

interface NavbarProps {
  currentUser: User | null;
  cart: CartItem[];
  onOpenCart: () => void;
  onOpenAuth: (defaultTab?: 'student' | 'teacher' | 'register') => void;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  cart,
  onOpenCart,
  onOpenAuth,
  onLogout,
  currentView,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-3 text-left focus:outline-hidden group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#0047AB] text-white flex items-center justify-center shadow-md shadow-[#0047AB]/20 transition-transform group-hover:scale-105">
              <span className="font-arabic text-2xl font-bold">ك</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold text-[#0047AB] tracking-tight">Kalaamunaa</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0047AB] border border-blue-100">
                  Arabic Learning
                </span>
              </div>
              <p className="text-xs text-slate-500 font-arabic font-medium">
                كَلَامُنَا لِتَعْلِيمِ اللُّغَةِ العَرَبِيَّةِ
              </p>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
            <button
              onClick={() => onNavigate('landing')}
              className={`transition-colors hover:text-[#0047AB] cursor-pointer ${
                currentView === 'landing' ? 'text-[#0047AB] font-bold' : ''
              }`}
            >
              Beranda
            </button>
            <a
              href="#keunggulan"
              onClick={() => {
                if (currentView !== 'landing') onNavigate('landing');
              }}
              className="transition-colors hover:text-[#0047AB]"
            >
              Keunggulan
            </a>
            <a
              href="#kursus"
              onClick={() => {
                if (currentView !== 'landing') onNavigate('landing');
              }}
              className="transition-colors hover:text-[#0047AB]"
            >
              Katalog Kursus
            </a>
            <a
              href="#testimoni"
              onClick={() => {
                if (currentView !== 'landing') onNavigate('landing');
              }}
              className="transition-colors hover:text-[#0047AB]"
            >
              Testimoni
            </a>
            <a
              href="#artikel"
              onClick={() => {
                if (currentView !== 'landing') onNavigate('landing');
              }}
              className="transition-colors hover:text-[#0047AB]"
            >
              Postingan Admin
            </a>
          </nav>

          {/* Desktop Right Action Bar */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-[#0047AB] hover:border-[#0047AB] transition-colors focus:outline-hidden"
              title="Keranjang Belanja"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#0047AB] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Auth Condition */}
            {currentUser ? (
              <div className="flex items-center space-x-3">
                {currentUser.role === 'teacher' || currentUser.role === 'admin' ? (
                  <button
                    onClick={() => onNavigate('admin')}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs ${
                      currentView === 'admin'
                        ? 'bg-[#003380] text-white'
                        : 'bg-[#0047AB] text-white hover:bg-[#003380]'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Dasbor Mudarris</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('student')}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs ${
                      currentView === 'student'
                        ? 'bg-[#003380] text-white'
                        : 'bg-[#0047AB] text-white hover:bg-[#003380]'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Kursus Saya</span>
                  </button>
                )}

                <div className="flex items-center space-x-2 bg-slate-100 px-3 py-2 rounded-xl text-xs font-medium text-slate-700">
                  <UserIcon className="w-4 h-4 text-[#0047AB]" />
                  <span className="max-w-[120px] truncate">{currentUser.name}</span>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth('student')}
                  className="px-4 py-2.5 text-sm font-bold text-[#0047AB] hover:bg-blue-50 rounded-xl transition-colors"
                >
                  Masuk
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-[#0047AB] hover:bg-[#003380] rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  Daftar Peserta
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger & Cart */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-lg border border-slate-200 text-slate-700"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#0047AB] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 focus:outline-hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
            <button
              onClick={() => {
                onNavigate('landing');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 text-[#0047AB]"
            >
              Beranda
            </button>
            <a
              href="#keunggulan"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              Keunggulan Kursus
            </a>
            <a
              href="#kursus"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              Katalog Kursus
            </a>
            <a
              href="#testimoni"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              Testimoni Peserta
            </a>
            <a
              href="#artikel"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              Postingan Admin
            </a>
          </nav>

          <div className="pt-3 border-t border-slate-200">
            {currentUser ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 px-3">
                  Masuk sebagai: <span className="text-[#0047AB]">{currentUser.name}</span> ({currentUser.role})
                </div>
                {currentUser.role === 'teacher' || currentUser.role === 'admin' ? (
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#0047AB] text-white font-bold text-sm"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Buka Dasbor Mudarris</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onNavigate('student');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#0047AB] text-white font-bold text-sm"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Buka Kursus Saya</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  Keluar dari Akun
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onOpenAuth('student');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 text-center text-sm font-bold text-[#0047AB] bg-blue-50 rounded-xl"
                >
                  Masuk
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('register');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 text-center text-sm font-bold text-white bg-[#0047AB] rounded-xl"
                >
                  Daftar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
