import React from 'react';
import { Mail, MessageCircle, Instagram, Heart, ArrowUp, BookOpen, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Brand & Arabic Identity */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-[#0047AB] text-white flex items-center justify-center font-bold text-xl font-arabic shadow-md shadow-blue-500/20">
                ك
              </div>
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-white">Kalaamunaa</h3>
                <p className="text-xs text-blue-300 font-arabic font-medium">
                  لِتَعْلِيمِ اللُّغَةِ العَرَبِيَّةِ
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Platform kursus bahasa Arab online terstruktur untuk pemula hingga tingkat lanjut. Didukung video YouTube tematik, kuis Google Form per bab, dan e-sertifikat resmi.
            </p>

            <div className="font-arabic text-amber-300 text-sm font-semibold pt-1">
              "اللُّغَةُ العَرَبِيَّةُ مِفْتَاحُ الفَهْمِ وَالعِلْمِ"
            </div>
          </div>

          {/* Col 2: Program Kursus */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">
              Program Kursus
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <a href="#kursus" className="hover:text-amber-300 transition-colors">
                  • Nahwu Kilat Dasar (Struktur Kalimat)
                </a>
              </li>
              <li>
                <a href="#kursus" className="hover:text-amber-300 transition-colors">
                  • Muhadatsah Praktis Sehari-hari
                </a>
              </li>
              <li>
                <a href="#kursus" className="hover:text-amber-300 transition-colors">
                  • Bahasa Arab Qur'ani & Tadabbur
                </a>
              </li>
              <li>
                <a href="#kursus" className="hover:text-amber-300 transition-colors">
                  • Sharaf & Morfologi Kata
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigasi Cepat */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">
              Navigasi
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <a href="#keunggulan" className="hover:text-white transition-colors">
                  Keunggulan Sistem Belajar
                </a>
              </li>
              <li>
                <a href="#kursus" className="hover:text-white transition-colors">
                  Katalog Semua Kursus
                </a>
              </li>
              <li>
                <a href="#testimoni" className="hover:text-white transition-colors">
                  Testimoni Peserta
                </a>
              </li>
              <li>
                <a href="#artikel" className="hover:text-white transition-colors">
                  Postingan & Artikel Edukasi
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Kontak Resmi & Media Sosial (Required Links) */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">
              Hubungi Kami
            </h4>
            <p className="text-xs text-slate-400">
              Ada pertanyaan seputar kursus, pendaftaran, atau konfirmasi pesanan? Hubungi admin resmi kami:
            </p>

            <div className="space-y-3">
              {/* Email */}
              <a
                href="mailto:kalaamunaa.arabiclearning@gmail.com"
                className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#0047AB] text-slate-300 hover:text-white transition-all text-xs group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-[#0047AB] flex items-center justify-center shrink-0 group-hover:bg-[#0047AB] group-hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-slate-500 block">Email Resmi:</span>
                  <span className="font-semibold text-slate-200">kalaamunaa.arabiclearning@gmail.com</span>
                </div>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/kalaamunaa.arabic"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 text-slate-300 hover:text-white transition-all text-xs group"
              >
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Instagram:</span>
                  <span className="font-semibold text-slate-200">@kalaamunaa.arabic</span>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/6282311776535?text=Assalamualaikum%20Admin%20Kalaamunaa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-all text-xs group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">WhatsApp Admin:</span>
                  <span className="font-semibold text-slate-200">+62 823-1177-6535</span>
                </div>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar & Copyright */}
        <div className="mt-14 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Kalaamunaa For Arabic Learning. Hak Cipta Dilindungi Undang-Undang.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center space-x-1.5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span>Kembali ke Atas</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
