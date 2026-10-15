import React from 'react';
import { 
  Sparkles, 
  CheckCircle, 
  Video, 
  FileCheck2, 
  Award, 
  Headphones, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

export const Features: React.FC = () => {
  const featuresList = [
    {
      icon: <Video className="w-6 h-6 text-[#0047AB]" />,
      title: 'Materi Video Tematik & YouTube Terpilih',
      desc: 'Setiap pelajaran dikemas dalam penjelasan video yang padat, fokus, dan mudah dipahami, langsung dari Mudarris berpengalaman.',
      badge: 'Video Eksklusif',
    },
    {
      icon: <FileCheck2 className="w-6 h-6 text-[#0047AB]" />,
      title: 'Sistem Kunci Belajar (Nonton & Kuis)',
      desc: 'Tidak bisa melompat sebelum memahami! Anda wajib menonton video dan menyelesaikan kuis Google Form sebelum membuka materi selanjutnya.',
      badge: 'Disiplin & Terukur',
    },
    {
      icon: <Award className="w-6 h-6 text-[#0047AB]" />,
      title: 'Sertifikat Kelulusan Resmi',
      desc: 'Selesaikan semua kuis hingga akhir silabus dan ajukan sertifikat kelulusan resmi Kalaamunaa yang terverifikasi.',
      badge: 'Terverifikasi',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#0047AB]" />,
      title: 'Verifikasi & Approval Cepat via WhatsApp',
      desc: 'Sistem checkout terintegrasi WhatsApp 6282311776535 memastikan pendaftaran Anda langsung diverifikasi oleh Mudarris.',
      badge: 'Keamanan Akses',
    },
    {
      icon: <Clock className="w-6 h-6 text-[#0047AB]" />,
      title: 'Fleksibel: Belajar Kapan Saja',
      desc: 'Akses materi 24 jam tanpa batasan waktu dari smartphone, tablet, maupun laptop sesuai kenyamanan jadwal Anda.',
      badge: 'Akses Fleksibel',
    },
    {
      icon: <Headphones className="w-6 h-6 text-[#0047AB]" />,
      title: 'Bimbingan & Konsultasi Langsung',
      desc: 'Dukungan tanya-jawab langsung dengan Mudarris jika menemui kesulitan dalam memahami i\'rab, tashrif, atau percakapan.',
      badge: 'Bimbingan Aktif',
    },
  ];

  return (
    <section id="keunggulan" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 text-[#0047AB] text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Keunggulan Kalaamunaa</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Mengapa Belajar Bahasa Arab di <span className="text-[#0047AB]">Kalaamunaa</span>?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Kami memadukan kemudahan teknologi modern dengan ketelitian kurikulum tradisional agar proses belajar bahasa Arab terasa ringan dan berbuah hasil nyata.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-[#0047AB]/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-[#0047AB]/10 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#0047AB] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center space-x-1 text-xs font-semibold text-[#0047AB]">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Standar Mutu Kalaamunaa</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
