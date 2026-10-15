import React, { useState } from 'react';
import { 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  Award, 
  MessageCircle, 
  BookOpen, 
  ShoppingBag,
  AlertCircle
} from 'lucide-react';
import { User, Course, Order } from '../types';
import { 
  getOrders, 
  getStudentProgress, 
  formatRupiah,
  generateWhatsAppOrderUrl 
} from '../services/storage';

interface StudentDashboardProps {
  currentUser: User;
  courses: Course[];
  onStartCourse: (courseId: string) => void;
  onBrowseCourses: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  courses,
  onStartCourse,
  onBrowseCourses,
}) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'orders'>('courses');

  const orders = getOrders().filter((o) => o.studentId === currentUser.id);

  // Determine user's enrolled courses and their approval status
  interface EnrolledItem {
    course: Course;
    status: 'approved' | 'pending' | 'rejected';
    orderId: string;
    orderDate: string;
  }

  const enrolledMap = new Map<string, EnrolledItem>();

  orders.forEach((ord) => {
    ord.items.forEach((item) => {
      const courseObj = courses.find((c) => c.id === item.courseId);
      if (courseObj) {
        // If already approved, keep approved. Otherwise use order status
        const existing = enrolledMap.get(courseObj.id);
        if (!existing || (existing.status !== 'approved' && ord.status === 'approved')) {
          enrolledMap.set(courseObj.id, {
            course: courseObj,
            status: ord.status,
            orderId: ord.id,
            orderDate: ord.createdAt,
          });
        }
      }
    });
  });

  const enrolledList = Array.from(enrolledMap.values());
  const approvedCourses = enrolledList.filter((e) => e.status === 'approved');
  const pendingCourses = enrolledList.filter((e) => e.status === 'pending');

  return (
    <div className="py-10 bg-slate-50 min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile / Welcome Header */}
        <div className="bg-gradient-to-r from-[#003380] via-[#0047AB] to-[#003884] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center font-bold text-2xl font-arabic">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-blue-400/20 text-blue-200 text-xs font-semibold mb-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Akun Peserta Kalaamunaa</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Ahlan wa Sahlan, {currentUser.name}!
                </h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                  {currentUser.email} {currentUser.phone && `• ${currentUser.phone}`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={onBrowseCourses}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Tambah Kursus Baru</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-3 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'courses'
                ? 'bg-[#0047AB] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Kursus Saya ({enrolledList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'orders'
                ? 'bg-[#0047AB] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Riwayat Pesanan & Status ({orders.length})</span>
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'courses' ? (
          <div className="space-y-6">
            {/* Alert for Pending Courses if any */}
            {pendingCourses.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">Ada {pendingCourses.length} kursus yang sedang menunggu Approval Admin:</span>
                    <p className="text-xs text-amber-800">
                      Kursus tidak dapat dibuka sebelum diapprove oleh admin di WhatsApp 6282311776535.
                    </p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/6282311776535?text=${encodeURIComponent(
                    `Assalamualaikum Admin Kalaamunaa, saya ${currentUser.name} mengonfirmasi approval untuk kursus saya.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center space-x-1.5 shrink-0"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Konfirmasi di WhatsApp</span>
                </a>
              </div>
            )}

            {enrolledList.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0047AB] mx-auto flex items-center justify-center">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800">Anda Belum Mengikuti Kursus</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Mulai perjalanan belajar bahasa Arab Anda hari ini! Pilih dari kelas Nahwu kilat, Muhadatsah praktis, atau Bahasa Arab Al-Qur'an.
                  </p>
                </div>
                <button
                  onClick={onBrowseCourses}
                  className="px-6 py-3 rounded-xl bg-[#0047AB] text-white font-bold text-xs hover:bg-[#003380] transition-colors"
                >
                  Jelajahi Katalog Kursus
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledList.map(({ course, status }) => {
                  const progress = getStudentProgress(currentUser.id, course.id);
                  const completedLessons = progress.completedLessonIds.length;
                  const totalLessons = course.lessons.length;
                  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                  const isFinished = totalLessons > 0 && completedLessons >= totalLessons;

                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Thumbnail & Badges */}
                        <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />

                          {/* Approval Status Badge */}
                          <div className="absolute top-3 right-3">
                            {status === 'approved' ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-md flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Disetujui (Aktif)</span>
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Menunggu Approval</span>
                              </span>
                            )}
                          </div>

                          <div className="absolute bottom-3 left-4 right-4 text-white">
                            <p className="font-arabic text-amber-300 text-xs font-bold truncate">
                              {course.arabicTitle}
                            </p>
                            <h3 className="font-extrabold text-sm line-clamp-1">{course.title}</h3>
                          </div>
                        </div>

                        {/* Progress Details */}
                        <div className="p-5 space-y-4">
                          {status === 'approved' ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-600">Status Belajar:</span>
                                <span className={isFinished ? 'text-emerald-600' : 'text-[#0047AB]'}>
                                  {isFinished ? 'Tuntas (100%)' : `${percent}% Selesai`}
                                </span>
                              </div>

                              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isFinished ? 'bg-emerald-500' : 'bg-[#0047AB]'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                                <span>{completedLessons} dari {totalLessons} Pelajaran Tuntas</span>
                                {isFinished && (
                                  <span className="text-amber-600 font-bold flex items-center space-x-1">
                                    <Award className="w-3.5 h-3.5" />
                                    <span>Sertifikat Siap</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                              <p className="font-bold flex items-center space-x-1">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Menunggu Approval Mudarris</span>
                              </p>
                              <p className="text-[11px] leading-relaxed text-amber-800">
                                Akses materi dan kuis akan terbuka secara otomatis segera setelah admin menyetujui pesanan Anda.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="p-5 pt-0">
                        {status === 'approved' ? (
                          <button
                            onClick={() => onStartCourse(course.id)}
                            className="w-full py-3 rounded-xl bg-[#0047AB] hover:bg-[#003380] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            <PlayCircle className="w-4 h-4" />
                            <span>
                              {completedLessons === 0 ? 'Mulai Belajar' : isFinished ? 'Buka Kelas & Sertifikat' : 'Lanjutkan Belajar'}
                            </span>
                          </button>
                        ) : (
                          <a
                            href={`https://wa.me/6282311776535?text=${encodeURIComponent(
                              `Assalamualaikum Admin Kalaamunaa, saya ${currentUser.name} mohon approval untuk kursus [${course.title}].`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center space-x-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Chat WhatsApp Admin</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Orders History Tab */
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Riwayat Pesanan Anda</h3>
                <p className="text-xs text-slate-500">
                  Daftar transaksi dan status approval dari Mudarris Kalaamunaa
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Belum ada riwayat transaksi.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono font-bold text-xs text-[#0047AB] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                          {ord.id}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(ord.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="pt-1">
                        <p className="text-sm font-bold text-slate-800">
                          {ord.items.map((i) => i.title).join(', ')}
                        </p>
                      </div>

                      <p className="text-xs font-extrabold text-[#0047AB]">
                        Total: {formatRupiah(ord.totalPrice)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      {ord.status === 'approved' ? (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Disetujui Admin</span>
                        </span>
                      ) : ord.status === 'pending' ? (
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center space-x-1.5">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span>Menunggu Approval</span>
                          </span>

                          <a
                            href={generateWhatsAppOrderUrl(ord.studentName, ord.items, ord.totalPrice)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors"
                            title="Chat WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      ) : (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          Dibatalkan
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
