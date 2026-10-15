import React from 'react';
import { ArrowRight, CheckCircle2, MessageCircle, PlayCircle, Award, BookCheck } from 'lucide-react';

interface HeroProps {
  onExploreCourses: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreCourses }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#003380] via-[#0047AB] to-[#003884] text-white pt-16 pb-24 lg:pt-20 lg:pb-32">
      {/* Decorative Islamic geometric background lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="islamic-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="30" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-grid)" />
        </svg>
      </div>

      {/* Floating subtle ambient glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-100 text-xs sm:text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Program Intensif Online Bersama Mudarris Kalaamunaa</span>
            </div>

            <div className="font-arabic text-amber-300 text-lg sm:text-2xl font-bold tracking-wide">
              تَعَلَّمِ العَرَبِيَّةَ فَإِنَّهَا مِنْ دِينِكُمْ
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight">
              Kuasai Bahasa Arab <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-amber-200">
                Al-Qur'an & Percakapan
              </span>{' '}
              Secara Terstruktur
            </h1>

            <p className="text-base sm:text-lg text-blue-100/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Pelajari Nahwu, Sharaf, dan Muhadatsah praktis langkah demi langkah. Sistem pembelajaran terpadu dengan 
              <span className="text-white font-semibold"> verifikasi video bertahap</span>, <span className="text-white font-semibold">kuis evaluasi</span>, dan <span className="text-white font-semibold">e-sertifikat kelulusan</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onExploreCourses}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-base transition-all shadow-lg hover:shadow-xl hover:scale-102 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Pilih Kursus Sekarang</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href="https://wa.me/6282311776535?text=Assalamualaikum%20Admin%20Kalaamunaa,%20saya%20ingin%20tanya-tanya%20mengenai%20kursus%20bahasa%20Arab"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-base transition-all flex items-center justify-center space-x-2 backdrop-blur-xs"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <span>Konsultasi WhatsApp</span>
              </a>
            </div>

            {/* Micro Benefits list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-xs sm:text-sm text-blue-100/80 border-t border-white/15">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Materi dari Dasar</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Kuis Tiap Bab</span>
              </div>
              <div className="flex items-center space-x-2 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Sertifikat Resmi</span>
              </div>
            </div>
          </div>

          {/* Right Visual Card Column */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl text-white space-y-5">
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-bold flex items-center justify-center font-arabic text-xl">
                      ع
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Metode Kalaamunaa</h4>
                      <p className="text-xs text-blue-200">Sistem Belajar Bertingkat</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Terverifikasi
                  </span>
                </div>

                {/* Step cards visual */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center text-blue-200">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-blue-200">Tahap 1</p>
                      <p className="text-xs sm:text-sm font-semibold">Tonton Video Materi YouTube</p>
                    </div>
                    <span className="text-[11px] text-amber-300 font-medium">Klik Selesai</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/30 flex items-center justify-center text-amber-200">
                      <BookCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-blue-200">Tahap 2</p>
                      <p className="text-xs sm:text-sm font-semibold">Kerjakan Kuis Google Form</p>
                    </div>
                    <span className="text-[11px] text-emerald-300 font-medium">Buka Materi</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/30 flex items-center justify-center text-emerald-200">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-blue-200">Tahap Akhir</p>
                      <p className="text-xs sm:text-sm font-semibold">Ajukan E-Sertifikat Kelulusan</p>
                    </div>
                    <span className="text-[11px] text-emerald-300 font-medium">Form Otomatis</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-3 rounded-xl bg-blue-950/60 border border-white/10 text-xs text-blue-200 flex items-center justify-between">
                    <span>Approval Kursus via WhatsApp</span>
                    <span className="font-semibold text-emerald-300">0823-1177-6535</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
