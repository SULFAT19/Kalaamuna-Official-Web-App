import React, { useState } from 'react';
import { ShoppingCart, Eye, Star, BookOpen, Clock, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { Course, User } from '../types';
import { formatRupiah, checkCourseAccess, getStudentProgress } from '../services/storage';

interface CourseCatalogProps {
  courses: Course[];
  currentUser: User | null;
  onSelectCourse: (course: Course) => void;
  onAddToCart: (course: Course) => void;
  onStartCourse: (courseId: string) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  courses,
  currentUser,
  onSelectCourse,
  onAddToCart,
  onStartCourse,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Extract unique categories
  const categories = ['Semua', ...Array.from(new Set(courses.map((c) => c.category)))];

  const filteredCourses = selectedCategory === 'Semua'
    ? courses
    : courses.filter((c) => c.category === selectedCategory);

  return (
    <section id="kursus" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#0047AB] text-xs font-bold tracking-wide uppercase border border-blue-100">
            <BookOpen className="w-4 h-4" />
            <span>Pilihan Program Unggulan</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Katalog Kursus Bahasa Arab <span className="text-[#0047AB]">Kalaamunaa</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Pilih kursus yang sesuai dengan target belajar Anda. Setiap paket dilengkapi dengan video tematik, latihan kuis per modul, dan sertifikat resmi.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0047AB] text-white shadow-md shadow-[#0047AB]/20 scale-102'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            const { hasAccess, orderStatus } = currentUser
              ? checkCourseAccess(currentUser.id, course.id, currentUser.role)
              : { hasAccess: false, orderStatus: undefined };

            const progress = currentUser && hasAccess
              ? getStudentProgress(currentUser.id, course.id)
              : null;

            const isFinished = progress && course.lessons.length > 0 && progress.completedLessonIds.length >= course.lessons.length;

            return (
              <div
                key={course.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                {/* Course Thumbnail */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* Level & Category Badges */}
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0047AB] text-white shadow-xs">
                      {course.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs">
                      {course.level}
                    </span>
                  </div>

                  {/* Arabic Subtitle Overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="font-arabic text-amber-300 text-sm font-semibold truncate drop-shadow-md">
                      {course.arabicTitle}
                    </p>
                  </div>

                  {/* Status Overlay if enrolled */}
                  {hasAccess && (
                    <div className="absolute top-3 right-3">
                      {isFinished ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-md flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tuntas (100%)</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-md flex items-center space-x-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Aktif Terdaftar</span>
                        </span>
                      )}
                    </div>
                  )}

                  {!hasAccess && orderStatus === 'pending' && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-white shadow-md flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Menunggu Approval</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Course Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 
                      onClick={() => onSelectCourse(course)}
                      className="font-bold text-lg text-slate-900 group-hover:text-[#0047AB] transition-colors cursor-pointer line-clamp-2"
                    >
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  {/* Lessons count & key benefit */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5">
                      <BookOpen className="w-4 h-4 text-[#0047AB]" />
                      <span>{course.lessons.length} Pelajaran & Kuis</span>
                    </div>
                    <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
                      Sertifikat Kelulusan
                    </span>
                  </div>

                  {/* Progress Indicator for enrolled student */}
                  {hasAccess && progress && (
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-600">Progres Belajar:</span>
                        <span className="text-[#0047AB]">
                          {progress.completedLessonIds.length} / {course.lessons.length} Selesai
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${course.lessons.length > 0 ? (progress.completedLessonIds.length / course.lessons.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Price & Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {course.originalPrice > course.price && (
                        <span className="text-xs text-slate-400 line-through block">
                          {formatRupiah(course.originalPrice)}
                        </span>
                      )}
                      <span className="text-xl font-black text-[#0047AB]">
                        {formatRupiah(course.price)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onSelectCourse(course)}
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-[#0047AB] hover:border-[#0047AB] transition-colors"
                        title="Lihat Detail Kursus"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {hasAccess ? (
                        <button
                          onClick={() => onStartCourse(course.id)}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                        >
                          Masuk Kelas
                        </button>
                      ) : orderStatus === 'pending' ? (
                        <button
                          onClick={() => onSelectCourse(course)}
                          className="px-3 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs"
                        >
                          Menunggu Persetujuan
                        </button>
                      ) : (
                        <button
                          onClick={() => onAddToCart(course)}
                          className="px-3.5 py-2.5 rounded-xl bg-[#0047AB] hover:bg-[#003380] text-white font-bold text-xs transition-all shadow-xs hover:shadow-md flex items-center space-x-1.5"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>+ Keranjang</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
