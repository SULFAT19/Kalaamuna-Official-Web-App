import React from 'react';
import { X, CheckCircle2, Video, FileText, ShoppingCart, Award, BookOpen, Clock, Users } from 'lucide-react';
import { Course } from '../types';
import { formatRupiah } from '../services/storage';

interface CourseDetailModalProps {
  course: Course | null;
  onClose: () => void;
  onAddToCart: (course: Course) => void;
  onEnrollNow: (course: Course) => void;
  hasAccess?: boolean;
  orderPending?: boolean;
  onStartCourse?: (courseId: string) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  onClose,
  onAddToCart,
  onEnrollNow,
  hasAccess,
  orderPending,
  onStartCourse,
}) => {
  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Modal Header Bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#0047AB]">
              {course.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              Tingkat {course.level}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Hero Banner */}
        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-900 shrink-0">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
            <p className="font-arabic text-amber-300 text-xl font-bold">{course.arabicTitle}</p>
            <h2 className="text-xl sm:text-2xl font-extrabold leading-snug">{course.title}</h2>
            {course.instructorName && (
              <p className="text-xs text-blue-200">Pengajar: {course.instructorName}</p>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8 flex-1">
          {/* Status Alert if enrolled */}
          {hasAccess ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-sm font-semibold">Anda telah memiliki akses penuh ke kursus ini!</span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  if (onStartCourse) onStartCourse(course.id);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Buka Kelas
              </button>
            </div>
          ) : orderPending ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center space-x-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Pesanan Anda Sedang Menunggu Approval Admin.</span>
                <p className="text-xs mt-0.5 text-amber-700">Akses akan dibuka otomatis begitu konfirmasi WhatsApp disetujui Mudarris.</p>
              </div>
            </div>
          ) : null}

          {/* Deskripsi Kursus */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#0047AB]" />
              <span>Deskripsi Kursus</span>
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              {course.description}
            </p>
          </section>

          {/* Apa yang Akan Didapatkan Setelah Kursus (Mandatory from prompt) */}
          <section className="space-y-4 bg-blue-50/70 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-base sm:text-lg font-bold text-[#0047AB] flex items-center space-x-2">
              <Award className="w-5 h-5 text-[#0047AB]" />
              <span>Apa yang Akan Anda Dapatkan Setelah Kursus:</span>
            </h3>
            <ul className="space-y-3">
              {course.whatYouWillGet && course.whatYouWillGet.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-[#0047AB] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Silabus Pelajaran */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Video className="w-5 h-5 text-[#0047AB]" />
                <span>Silabus & Materi Pembelajaran</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {course.lessons.length} Pelajaran Video & Kuis
              </span>
            </div>

            <div className="space-y-2.5">
              {course.lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-[#0047AB] text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{lesson.title}</p>
                      {lesson.arabicTitle && (
                        <p className="text-xs font-arabic text-slate-500">{lesson.arabicTitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
                    <span className="hidden sm:inline bg-white px-2 py-1 rounded-md border border-slate-200">
                      {lesson.duration || '15 Menit'}
                    </span>
                    <span className="bg-amber-50 text-amber-800 px-2 py-1 rounded-md border border-amber-200 text-[11px] font-bold">
                      Video + Kuis
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Fitur Tambahan */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {course.features.map((feat, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium text-center">
                {feat}
              </div>
            ))}
          </section>
        </div>

        {/* Modal Sticky Bottom Actions */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block line-through">
              {formatRupiah(course.originalPrice)}
            </span>
            <div className="text-2xl font-black text-[#0047AB]">
              {formatRupiah(course.price)}
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {!hasAccess && !orderPending && (
              <>
                <button
                  onClick={() => {
                    onAddToCart(course);
                  }}
                  className="flex-1 sm:flex-initial px-5 py-3 rounded-xl border-2 border-[#0047AB] text-[#0047AB] hover:bg-blue-50 font-bold text-sm transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>+ Keranjang</span>
                </button>

                <button
                  onClick={() => {
                    onEnrollNow(course);
                  }}
                  className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-[#0047AB] hover:bg-[#003380] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>Daftar Sekarang</span>
                </button>
              </>
            )}

            {hasAccess && (
              <button
                onClick={() => {
                  onClose();
                  if (onStartCourse) onStartCourse(course.id);
                }}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md"
              >
                Mulai Belajar Sekarang
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
