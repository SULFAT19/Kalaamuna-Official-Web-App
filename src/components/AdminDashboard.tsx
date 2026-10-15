import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Video, 
  FileCheck2, 
  Award, 
  Users, 
  DollarSign, 
  MessageCircle, 
  ExternalLink,
  Save,
  X,
  FileText,
  Star,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import { 
  Order, 
  Course, 
  Lesson, 
  AdminPost, 
  Testimonial, 
  User 
} from '../types';
import { 
  getOrders, 
  saveOrders, 
  getCourses, 
  saveCourses, 
  getPosts, 
  savePosts, 
  getTestimonials, 
  saveTestimonials, 
  getUsers, 
  formatRupiah 
} from '../services/storage';
import { GoogleSheetsSyncModal } from './GoogleSheetsSyncModal';
import { getSheetConfig, appendCourseToSheet } from '../services/googleSheets';

interface AdminDashboardProps {
  onCourseUpdated: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onCourseUpdated }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'courses' | 'posts' | 'testimonials' | 'students' | 'sheets'>('orders');

  // Local state for live reactivity
  const [orders, setOrders] = useState<Order[]>(() => getOrders());
  const [courses, setCourses] = useState<Course[]>(() => getCourses());
  const [posts, setPosts] = useState<AdminPost[]>(() => getPosts());
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => getTestimonials());
  const users = getUsers().filter((u) => u.role === 'student');

  // Modal states for Courses & Lessons
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Lesson Management Modal
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<Course | null>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Post Modal
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null);

  // Testimonial Modal
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Google Sheets Modal
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);

  const handleSyncRefresh = () => {
    setOrders(getOrders());
    setCourses(getCourses());
    setTestimonials(getTestimonials());
    onCourseUpdated();
  };

  // ---------------- ORDER APPROVAL LOGIC ----------------
  const handleApproveOrder = (orderId: string) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'approved' as const,
          approvedAt: new Date().toISOString(),
        };
      }
      return o;
    });
    setOrders(updated);
    saveOrders(updated);
    onCourseUpdated();
  };

  const handleRejectOrder = (orderId: string) => {
    if (!confirm('Yakin ingin membatalkan pesanan ini?')) return;
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, status: 'rejected' as const };
      }
      return o;
    });
    setOrders(updated);
    saveOrders(updated);
  };

  // ---------------- COURSE CRUD ----------------
  const handleSaveCourse = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get('title') as string;
    const arabicTitle = formData.get('arabicTitle') as string;
    const category = formData.get('category') as string;
    const level = formData.get('level') as 'Pemula' | 'Menengah' | 'Lanjutan';
    const price = Number(formData.get('price')) || 0;
    const originalPrice = Number(formData.get('originalPrice')) || price;
    const thumbnail = (formData.get('thumbnail') as string) || 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=800&q=80';
    const description = formData.get('description') as string;
    const certificateFormUrl = (formData.get('certificateFormUrl') as string) || 'https://forms.google.com';
    const instructorName = (formData.get('instructorName') as string) || 'Mudarris Kalaamunaa';

    const whatYouWillGetRaw = formData.get('whatYouWillGet') as string;
    const whatYouWillGet = whatYouWillGetRaw
      ? whatYouWillGetRaw.split('\n').filter((s) => s.trim().length > 0)
      : ['Memahami kaidah bahasa Arab dasar', 'Mampu praktik langsung', 'Sertifikat kelulusan'];

    let updatedCourses: Course[];

    if (editingCourse) {
      updatedCourses = courses.map((c) => {
        if (c.id === editingCourse.id) {
          return {
            ...c,
            title,
            arabicTitle,
            category,
            level,
            price,
            originalPrice,
            thumbnail,
            description,
            whatYouWillGet,
            certificateFormUrl,
            instructorName,
          };
        }
        return c;
      });
    } else {
      const newCourse: Course = {
        id: 'course-' + Date.now(),
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title,
        arabicTitle,
        category,
        level,
        price,
        originalPrice,
        thumbnail,
        description,
        whatYouWillGet,
        features: ['Video Interaktif', 'Kuis Per Modul', 'E-Sertifikat Resmi'],
        certificateFormUrl,
        instructorName,
        status: 'published',
        lessons: [
          {
            id: 'lesson-' + Date.now() + '-1',
            title: 'Pelajaran 1: Pengantar Materi',
            arabicTitle: 'الدرس الأول',
            duration: '15 Menit',
            youtubeUrl: 'https://www.youtube.com/watch?v=kYJv_i7tq-k',
            quizUrl: 'https://forms.google.com',
            order: 1,
          },
        ],
      };
      updatedCourses = [newCourse, ...courses];
      appendCourseToSheet(newCourse);
    }

    setCourses(updatedCourses);
    saveCourses(updatedCourses);
    onCourseUpdated();
    setIsCourseModalOpen(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kursus ini? Semua pelajaran di dalamnya akan terhapus.')) return;
    const updated = courses.filter((c) => c.id !== courseId);
    setCourses(updated);
    saveCourses(updated);
    onCourseUpdated();
  };

  // ---------------- LESSON CRUD ----------------
  const handleSaveLesson = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCourseForLessons) return;
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get('title') as string;
    const arabicTitle = formData.get('arabicTitle') as string;
    const duration = (formData.get('duration') as string) || '15 Menit';
    const youtubeUrl = formData.get('youtubeUrl') as string;
    const quizUrl = formData.get('quizUrl') as string;

    const currentLessons = [...selectedCourseForLessons.lessons];
    let updatedLessons: Lesson[];

    if (editingLesson) {
      updatedLessons = currentLessons.map((l) => {
        if (l.id === editingLesson.id) {
          return {
            ...l,
            title,
            arabicTitle,
            duration,
            youtubeUrl,
            quizUrl,
          };
        }
        return l;
      });
    } else {
      const newLesson: Lesson = {
        id: 'lesson-' + Date.now(),
        title,
        arabicTitle,
        duration,
        youtubeUrl,
        quizUrl,
        order: currentLessons.length + 1,
      };
      updatedLessons = [...currentLessons, newLesson];
    }

    const updatedCourse = {
      ...selectedCourseForLessons,
      lessons: updatedLessons,
    };

    const updatedCourses = courses.map((c) => (c.id === updatedCourse.id ? updatedCourse : c));
    setCourses(updatedCourses);
    saveCourses(updatedCourses);
    setSelectedCourseForLessons(updatedCourse);
    onCourseUpdated();
    setIsLessonModalOpen(false);
    setEditingLesson(null);
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!selectedCourseForLessons) return;
    if (!confirm('Hapus pelajaran ini?')) return;

    const updatedLessons = selectedCourseForLessons.lessons.filter((l) => l.id !== lessonId);
    const updatedCourse = {
      ...selectedCourseForLessons,
      lessons: updatedLessons,
    };
    const updatedCourses = courses.map((c) => (c.id === updatedCourse.id ? updatedCourse : c));
    setCourses(updatedCourses);
    saveCourses(updatedCourses);
    setSelectedCourseForLessons(updatedCourse);
    onCourseUpdated();
  };

  const handleUpdateCertificateUrl = (courseId: string, newUrl: string) => {
    const updatedCourses = courses.map((c) => {
      if (c.id === courseId) {
        return { ...c, certificateFormUrl: newUrl };
      }
      return c;
    });
    setCourses(updatedCourses);
    saveCourses(updatedCourses);
    if (selectedCourseForLessons && selectedCourseForLessons.id === courseId) {
      setSelectedCourseForLessons({ ...selectedCourseForLessons, certificateFormUrl: newUrl });
    }
    onCourseUpdated();
  };

  // ---------------- POST CRUD ----------------
  const handleSavePost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const excerpt = formData.get('excerpt') as string;
    const content = formData.get('content') as string;
    const thumbnail = (formData.get('thumbnail') as string) || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80';

    let updatedPosts: AdminPost[];
    if (editingPost) {
      updatedPosts = posts.map((p) => {
        if (p.id === editingPost.id) {
          return { ...p, title, category, excerpt, content, thumbnail };
        }
        return p;
      });
    } else {
      const newPost: AdminPost = {
        id: 'post-' + Date.now(),
        title,
        category,
        excerpt,
        content,
        thumbnail,
        author: 'Mudarris Kalaamunaa',
        createdAt: new Date().toISOString().split('T')[0],
      };
      updatedPosts = [newPost, ...posts];
    }
    setPosts(updatedPosts);
    savePosts(updatedPosts);
    setIsPostModalOpen(false);
    setEditingPost(null);
  };

  const handleDeletePost = (postId: string) => {
    if (!confirm('Hapus artikel ini?')) return;
    const updated = posts.filter((p) => p.id !== postId);
    setPosts(updated);
    savePosts(updated);
  };

  // ---------------- TESTIMONIAL CRUD ----------------
  const handleSaveTestimonial = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get('name') as string;
    const courseName = formData.get('courseName') as string;
    const rating = Number(formData.get('rating')) || 5;
    const comment = formData.get('comment') as string;
    const avatar = (formData.get('avatar') as string) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

    let updatedTestis: Testimonial[];
    if (editingTestimonial) {
      updatedTestis = testimonials.map((t) => {
        if (t.id === editingTestimonial.id) {
          return { ...t, name, courseName, rating, comment, avatar };
        }
        return t;
      });
    } else {
      const newTesti: Testimonial = {
        id: 'testi-' + Date.now(),
        name,
        courseName,
        rating,
        comment,
        avatar,
        createdAt: new Date().toISOString().split('T')[0],
      };
      updatedTestis = [newTesti, ...testimonials];
    }
    setTestimonials(updatedTestis);
    saveTestimonials(updatedTestis);
    setIsTestimonialModalOpen(false);
    setEditingTestimonial(null);
  };

  const handleDeleteTestimonial = (testiId: string) => {
    if (!confirm('Hapus ulasan ini?')) return;
    const updated = testimonials.filter((t) => t.id !== testiId);
    setTestimonials(updated);
    saveTestimonials(updated);
  };

  // Computed summary metrics
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const approvedOrders = orders.filter((o) => o.status === 'approved');
  const totalRevenue = approvedOrders.reduce((acc, curr) => acc + curr.totalPrice, 0);

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Admin */}
        <div className="bg-[#0047AB] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-arabic text-2xl font-bold">
              م
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Pusat Kendali Mudarris Kalaamunaa</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Dasbor Manajemen & Approval Kursus
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                Kustomisasi penuh materi video YouTube, kuis Google Form, link sertifikat, serta approval pesanan siswa.
              </p>
            </div>
          </div>
        </div>

        {/* Google Sheets Integration Card */}
        {(() => {
          const sheetConfig = getSheetConfig();
          return (
            <div className="bg-gradient-to-r from-emerald-900/90 via-emerald-800/80 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                      {sheetConfig.scriptUrl ? '🟢 Google Spreadsheet Terhubung' : '⚪ Google Spreadsheet Belum Terhubung'}
                    </span>
                    {sheetConfig.lastSyncTime && (
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        Terakhir sinkron: {new Date(sheetConfig.lastSyncTime).toLocaleTimeString('id-ID')}
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-base text-white mt-1">
                    Penyimpanan Data Google Spreadsheet
                  </h3>
                  <p className="text-xs text-emerald-100/80">
                    Setiap pendaftaran peserta, login, pesanan checkout, dan penambahan kursus baru tersimpan langsung ke Google Spreadsheet.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 w-full sm:w-auto">
                {sheetConfig.spreadsheetUrl && (
                  <a
                    href={sheetConfig.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <span>Buka Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={() => setIsSheetModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sinkronisasi Spreadsheet</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Menunggu Approval</p>
              <h4 className="text-2xl font-black text-amber-600">{pendingOrders.length}</h4>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Pesanan Disetujui</p>
              <h4 className="text-2xl font-black text-emerald-600">{approvedOrders.length}</h4>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#0047AB] flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Total Kursus Aktif</p>
              <h4 className="text-2xl font-black text-[#0047AB]">{courses.length}</h4>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Total Omzet</p>
              <h4 className="text-lg font-black text-purple-700">{formatRupiah(totalRevenue)}</h4>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'orders'
                ? 'bg-[#0047AB] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Approval Pesanan ({pendingOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'courses'
                ? 'bg-[#0047AB] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Kelola Kursus & Materi</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'sheets'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Database Google Sheets</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'posts'
                ? 'bg-[#0047AB] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Postingan Admin ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('testimonials')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'testimonials'
                ? 'bg-[#0047AB] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Testimoni Peserta ({testimonials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'students'
                ? 'bg-[#0047AB] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Siswa ({users.length})</span>
          </button>
        </div>

        {/* ---------------- TAB 1: ORDERS & APPROVAL ---------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Daftar Pesanan Menunggu Approval
                  </h3>
                  <p className="text-xs text-slate-500">
                    Siswa tidak dapat mengakses kursus sebelum disetujui melalui tombol Approve di bawah.
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full self-start">
                  {pendingOrders.length} Pesanan Baru
                </span>
              </div>

              {pendingOrders.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="font-semibold text-sm text-slate-600">Semua pesanan telah diproses!</p>
                  <p className="text-xs">Tidak ada antrean pesanan yang menunggu approval saat ini.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pendingOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-amber-50/20"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-xs font-bold bg-[#0047AB] text-white px-2.5 py-0.5 rounded-md">
                            {ord.id}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(ord.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-base text-slate-900">{ord.studentName}</span>
                          <span className="text-xs text-slate-500">({ord.studentEmail})</span>
                          {ord.studentPhone && (
                            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                              WA: {ord.studentPhone}
                            </span>
                          )}
                        </div>

                        <div className="pt-1">
                          <p className="text-xs text-slate-600 font-medium">
                            Kursus Dipesan:{' '}
                            <span className="font-bold text-slate-900">
                              {ord.items.map((i) => `${i.title} (${formatRupiah(i.price)})`).join(', ')}
                            </span>
                          </p>
                        </div>

                        <p className="text-sm font-extrabold text-[#0047AB]">
                          Total: {formatRupiah(ord.totalPrice)}
                        </p>
                      </div>

                      {/* Approval Buttons */}
                      <div className="flex items-center space-x-3 w-full lg:w-auto">
                        <a
                          href={`https://wa.me/${ord.studentPhone ? ord.studentPhone.replace(/^0/, '62') : '6282311776535'}?text=${encodeURIComponent(
                            `Assalamualaikum ${ord.studentName}, pesanan kursus Anda di Kalaamunaa sedang kami verifikasi.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-bold flex items-center space-x-1.5"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Hubungi Siswa</span>
                        </a>

                        <button
                          onClick={() => handleRejectOrder(ord.id)}
                          className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold"
                        >
                          Tolak
                        </button>

                        <button
                          onClick={() => handleApproveOrder(ord.id)}
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Buka Akses</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Approved Orders List */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-6 border-b border-slate-200">
                <h3 className="font-bold text-base text-slate-900">Riwayat Pesanan yang Telah Di-approve</h3>
              </div>
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {approvedOrders.map((ord) => (
                  <div key={ord.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-[#0047AB]">{ord.id}</span>
                        <span className="font-bold text-slate-800">{ord.studentName}</span>
                        <span className="text-slate-400">({ord.studentEmail})</span>
                      </div>
                      <p className="text-slate-500 mt-0.5">
                        {ord.items.map((i) => i.title).join(', ')} • {formatRupiah(ord.totalPrice)}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Aktif (Approved)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- TAB 2: COURSES & LESSONS MANAGEMENT ---------------- */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Katalog & Silabus Kursus</h3>
                <p className="text-xs text-slate-500">
                  Tambah kursus, kelola video materi YouTube, kuis Google Form, dan form pengajuan sertifikat.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCourse(null);
                  setIsCourseModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0047AB] hover:bg-[#003380] text-white text-xs font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kursus Baru</span>
              </button>
            </div>

            {/* Courses Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 w-full bg-slate-900">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-[#0047AB] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                        {course.category}
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 text-slate-800 text-[11px] font-bold px-2 py-1 rounded-lg">
                        {course.level}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <p className="font-arabic text-amber-700 text-xs font-bold">{course.arabicTitle}</p>
                      <h4 className="font-bold text-base text-slate-900 line-clamp-2">{course.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{course.description}</p>
                      <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-100">
                        <span className="text-[#0047AB]">{formatRupiah(course.price)}</span>
                        <span className="text-slate-500">{course.lessons.length} Pelajaran</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0 space-y-2">
                    <button
                      onClick={() => {
                        setSelectedCourseForLessons(course);
                      }}
                      className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0047AB] text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      <span>Kelola Pelajaran & Kuis ({course.lessons.length})</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingCourse(course);
                          setIsCourseModalOpen(true);
                        }}
                        className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Kursus</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Kursus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- TAB 3: ADMIN POSTS ---------------- */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Postingan & Pengumuman Admin</h3>
                <p className="text-xs text-slate-500">
                  Artikel, tips belajar tata bahasa Arab, dan pengumuman untuk ditampilkan di landing page.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingPost(null);
                  setIsPostModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0047AB] hover:bg-[#003380] text-white text-xs font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Postingan Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {post.thumbnail && (
                      <img src={post.thumbnail} alt={post.title} className="h-44 w-full object-cover" />
                    )}
                    <div className="p-5 space-y-2">
                      <span className="text-[11px] font-bold text-[#0047AB] bg-blue-50 px-2.5 py-1 rounded-md">
                        {post.category}
                      </span>
                      <h4 className="font-bold text-base text-slate-900 line-clamp-2 mt-2">{post.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-3">{post.excerpt}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">{post.createdAt}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingPost(post);
                          setIsPostModalOpen(true);
                        }}
                        className="p-2 text-slate-500 hover:text-[#0047AB] rounded-lg hover:bg-slate-50"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- TAB 4: TESTIMONIALS ---------------- */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Kelola Testimoni Peserta</h3>
                <p className="text-xs text-slate-500">
                  Ulasan dan jumlah bintang dari peserta yang tampil di beranda website.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingTestimonial(null);
                  setIsTestimonialModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0047AB] hover:bg-[#003380] text-white text-xs font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Testimoni</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testi) => (
                <div
                  key={testi.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-amber-400">
                        {Array.from({ length: testi.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400">{testi.createdAt}</span>
                    </div>

                    <p className="text-xs text-slate-600 italic leading-relaxed">
                      "{testi.comment}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {testi.avatar && (
                        <img src={testi.avatar} alt={testi.name} className="w-9 h-9 rounded-full object-cover" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-800">{testi.name}</p>
                        <p className="text-[10px] text-[#0047AB] font-medium">{testi.courseName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingTestimonial(testi);
                          setIsTestimonialModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-[#0047AB]"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(testi.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- TAB 5: STUDENTS LIST ---------------- */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Daftar Akun Peserta Terdaftar</h3>
              <p className="text-xs text-slate-500">
                Data siswa yang telah mendaftar melalui form registrasi peserta.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {users.map((student) => {
                const studentOrders = orders.filter((o) => o.studentId === student.id && o.status === 'approved');
                return (
                  <div key={student.id} className="p-5 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0047AB] flex items-center justify-center font-bold text-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{student.name}</h4>
                        <p className="text-xs text-slate-500">{student.email} • {student.phone || 'No WA belum diisi'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-[#0047AB]">
                      {studentOrders.length} Kursus Aktif
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------- TAB 6: GOOGLE SHEETS DATABASE ---------------- */}
        {activeTab === 'sheets' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Integrasi Google Sheets Terpusat</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                    Database Kursus, Siswa & Transaksi di Google Spreadsheet
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Seluruh aktivitas web app Kalaamunaa tersimpan secara terstruktur ke dalam 5 tab spreadsheet.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsSheetModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-md"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Buka Panel Sinkronisasi</span>
                  </button>
                </div>
              </div>

              {/* 5 Tabs breakdown cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Tab 1: Users
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">Pendaftaran & Login Siswa</h4>
                  <p className="text-xs text-slate-600">
                    Mencatat ID, nama lengkap, email, nomor WhatsApp, waktu pendaftaran, serta riwayat login siswa.
                  </p>
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    {users.length} Siswa Terdaftar
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                    Tab 2 & 4: Courses & Lessons
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">Materi & Kuis YouTube</h4>
                  <p className="text-xs text-slate-600">
                    Menyimpan judul kursus, tingkat, harga, link sertifikat, serta video YouTube dan kuis Google Form per bab.
                  </p>
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    {courses.length} Kursus Aktif
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    Tab 3: Orders
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">Transaksi & Status Approval</h4>
                  <p className="text-xs text-slate-600">
                    Daftar paket yang dipesan siswa, total rupiah, dan status approval (PENDING/APPROVED).
                  </p>
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    {orders.length} Transaksi Tercatat
                  </span>
                </div>
              </div>

              {/* Status and Action banner */}
              {(() => {
                const sheetConfig = getSheetConfig();
                return (
                  <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Status Spreadsheet:</span>
                      </p>
                      {sheetConfig.spreadsheetUrl ? (
                        <a
                          href={sheetConfig.spreadsheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-extrabold text-emerald-800 hover:underline flex items-center space-x-1"
                        >
                          <span>{sheetConfig.spreadsheetUrl}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <p className="text-xs text-amber-800">
                          Spreadsheet belum dibuat. Klik tombol di kanan untuk membuat otomatis di Google Drive Anda.
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => setIsSheetModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-md shrink-0 cursor-pointer"
                    >
                      Buka Pengaturan & Sinkronkan Sekarang
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

      </div>

      {/* ================= MODAL: COURSE EDIT / CREATE ================= */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="font-bold text-lg text-slate-900">
                {editingCourse ? 'Edit Data Kursus' : 'Tambah Kursus Baru'}
              </h3>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Judul Kursus</label>
                  <input
                    name="title"
                    defaultValue={editingCourse?.title || ''}
                    placeholder="Contoh: Nahwu Kilat Dasar"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#0047AB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Judul Bahasa Arab</label>
                  <input
                    name="arabicTitle"
                    defaultValue={editingCourse?.arabicTitle || ''}
                    placeholder="القواعد النحوية الأساسية"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-arabic focus:outline-hidden focus:border-[#0047AB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Kategori</label>
                  <input
                    name="category"
                    defaultValue={editingCourse?.category || 'Kaidah Bahasa'}
                    placeholder="Contoh: Kaidah Bahasa"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tingkat</label>
                  <select
                    name="level"
                    defaultValue={editingCourse?.level || 'Pemula'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="Pemula">Pemula</option>
                    <option value="Menengah">Menengah</option>
                    <option value="Lanjutan">Lanjutan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Harga (Rp)</label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={editingCourse?.price || 199000}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Harga Coret (Rp)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    defaultValue={editingCourse?.originalPrice || 350000}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Pengajar / Mudarris</label>
                  <input
                    name="instructorName"
                    defaultValue={editingCourse?.instructorName || 'Mudarris Kalaamunaa'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">URL Gambar Thumbnail</label>
                <input
                  name="thumbnail"
                  defaultValue={editingCourse?.thumbnail || 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=800&q=80'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Deskripsi Lengkap Kursus</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingCourse?.description || ''}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Apa yang Akan Didapatkan (Pisahkan tiap poin dengan baris baru)
                </label>
                <textarea
                  name="whatYouWillGet"
                  rows={3}
                  defaultValue={editingCourse?.whatYouWillGet?.join('\n') || ''}
                  placeholder="Memahami kaidah Nahwu dasar&#10;Mampu membaca teks Al-Qur'an&#10;Sertifikat resmi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1 bg-amber-50 p-3 rounded-xl border border-amber-200">
                <label className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>Link Google Form Pengajuan Sertifikat Kursus</span>
                </label>
                <input
                  name="certificateFormUrl"
                  defaultValue={editingCourse?.certificateFormUrl || 'https://docs.google.com/forms/d/e/sample/viewform'}
                  placeholder="https://docs.google.com/forms/..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-sm bg-white"
                />
                <p className="text-[11px] text-amber-700">
                  Ketika siswa menuntaskan seluruh video dan kuis, tombol "Ajukan Sertifikat" akan mengarahkan ke link ini.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0047AB] text-white text-xs font-bold hover:bg-[#003380] transition-colors"
                >
                  Simpan Kursus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LESSONS & QUIZ MANAGEMENT ================= */}
      {selectedCourseForLessons && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold text-[#0047AB] bg-blue-50 px-2.5 py-1 rounded-md">
                  Kelola Materi Kursus
                </span>
                <h3 className="font-extrabold text-xl text-slate-900 mt-1">
                  {selectedCourseForLessons.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCourseForLessons(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Edit for Certificate URL */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <label className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-amber-700" />
                <span>Link Google Form Pengajuan Sertifikat untuk Kursus Ini:</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={selectedCourseForLessons.certificateFormUrl || ''}
                  onChange={(e) => handleUpdateCertificateUrl(selectedCourseForLessons.id, e.target.value)}
                  placeholder="https://docs.google.com/forms/..."
                  className="flex-1 px-3 py-2 rounded-xl border border-amber-300 text-xs bg-white"
                />
              </div>
              <p className="text-[11px] text-amber-700">
                Tombol "Ajukan Sertifikat" di akun siswa yang telah lulus akan otomatis mengarahkan ke link ini.
              </p>
            </div>

            {/* Lessons List Header */}
            <div className="flex items-center justify-between pt-2">
              <h4 className="font-bold text-sm text-slate-800">
                Daftar Pelajaran ({selectedCourseForLessons.lessons.length})
              </h4>
              <button
                onClick={() => {
                  setEditingLesson(null);
                  setIsLessonModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#0047AB] text-white text-xs font-bold hover:bg-[#003380] flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Pelajaran</span>
              </button>
            </div>

            {/* Lessons items */}
            <div className="space-y-3">
              {selectedCourseForLessons.lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-md bg-[#0047AB] text-white text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h5 className="font-bold text-sm text-slate-900">{lesson.title}</h5>
                    </div>
                    {lesson.arabicTitle && (
                      <p className="font-arabic text-xs text-amber-700 pl-8">{lesson.arabicTitle}</p>
                    )}
                    <div className="pl-8 text-xs text-slate-500 space-x-3">
                      <span>YouTube: <span className="font-mono text-blue-600 truncate max-w-[150px] inline-block align-bottom">{lesson.youtubeUrl}</span></span>
                      <span>•</span>
                      <span>Kuis Form: <span className="font-mono text-purple-600 truncate max-w-[150px] inline-block align-bottom">{lesson.quizUrl}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setEditingLesson(lesson);
                        setIsLessonModalOpen(true);
                      }}
                      className="p-2 text-slate-600 hover:text-[#0047AB] rounded-lg hover:bg-white"
                      title="Edit Pelajaran"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-white"
                      title="Hapus Pelajaran"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedCourseForLessons(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT SINGLE LESSON ================= */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-bold text-base text-slate-900">
                {editingLesson ? 'Edit Pelajaran & Kuis' : 'Tambah Pelajaran Baru'}
              </h4>
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Judul Pelajaran</label>
                <input
                  name="title"
                  defaultValue={editingLesson?.title || ''}
                  placeholder="Contoh: Pelajaran 1: Pengenalan Isim dan Ciri-cirinya"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#0047AB]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Judul Bahasa Arab (Opsional)</label>
                <input
                  name="arabicTitle"
                  defaultValue={editingLesson?.arabicTitle || ''}
                  placeholder="الدرس الأول: علامات الاسم"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-arabic focus:outline-hidden focus:border-[#0047AB]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Perkiraan Durasi</label>
                <input
                  name="duration"
                  defaultValue={editingLesson?.duration || '15 Menit'}
                  placeholder="Contoh: 18 Menit"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1 bg-blue-50/70 p-3.5 rounded-xl border border-blue-200">
                <label className="text-xs font-bold text-[#0047AB] flex items-center space-x-1.5">
                  <Video className="w-4 h-4" />
                  <span>Link Video YouTube</span>
                </label>
                <input
                  name="youtubeUrl"
                  defaultValue={editingLesson?.youtubeUrl || ''}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-blue-300 text-xs bg-white focus:outline-hidden focus:border-[#0047AB]"
                />
                <p className="text-[11px] text-slate-500">
                  Admin cukup memasukkan link YouTube, sistem akan otomatis menampilkannya di pemutar video siswa.
                </p>
              </div>

              <div className="space-y-1 bg-purple-50/70 p-3.5 rounded-xl border border-purple-200">
                <label className="text-xs font-bold text-purple-900 flex items-center space-x-1.5">
                  <FileCheck2 className="w-4 h-4" />
                  <span>Link Google Form Kuis</span>
                </label>
                <input
                  name="quizUrl"
                  defaultValue={editingLesson?.quizUrl || ''}
                  placeholder="https://docs.google.com/forms/d/..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-purple-300 text-xs bg-white focus:outline-hidden focus:border-purple-600"
                />
                <p className="text-[11px] text-purple-700">
                  Setelah menonton video dan menekan tombol "Saya Sudah Menonton", siswa akan mengerjakan kuis melalui form ini.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0047AB] text-white text-xs font-bold hover:bg-[#003380]"
                >
                  Simpan Pelajaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: POST EDIT / CREATE ================= */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingPost ? 'Edit Postingan Admin' : 'Buat Postingan Baru'}
              </h3>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Judul Postingan</label>
                <input
                  name="title"
                  defaultValue={editingPost?.title || ''}
                  placeholder="Contoh: Kiat Menghafal Mufrodat"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Kategori</label>
                <input
                  name="category"
                  defaultValue={editingPost?.category || 'Tips Belajar'}
                  placeholder="Tips Belajar / Kaidah Nahwu / Pengumuman"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Gambar Banner (URL)</label>
                <input
                  name="thumbnail"
                  defaultValue={editingPost?.thumbnail || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Ringkasan Singkat (Excerpt)</label>
                <textarea
                  name="excerpt"
                  rows={2}
                  defaultValue={editingPost?.excerpt || ''}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Isi Lengkap Postingan</label>
                <textarea
                  name="content"
                  rows={5}
                  defaultValue={editingPost?.content || ''}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0047AB] text-white text-xs font-bold"
                >
                  Terbitkan Postingan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TESTIMONIAL EDIT / CREATE ================= */}
      {isTestimonialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingTestimonial ? 'Edit Testimoni' : 'Tambah Testimoni Baru'}
              </h3>
              <button
                onClick={() => setIsTestimonialModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTestimonial} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Siswa / Peserta</label>
                <input
                  name="name"
                  defaultValue={editingTestimonial?.name || ''}
                  placeholder="Contoh: Muhammad Rizky"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Kursus yang Diikuti</label>
                <input
                  name="courseName"
                  defaultValue={editingTestimonial?.courseName || 'Nahwu Kilat Dasar'}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Jumlah Bintang (Rating)</label>
                <select
                  name="rating"
                  defaultValue={editingTestimonial?.rating || 5}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
                  <option value={3}>⭐⭐⭐ (3 Bintang)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Foto Avatar (URL)</label>
                <input
                  name="avatar"
                  defaultValue={editingTestimonial?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Kalimat Testimoni</label>
                <textarea
                  name="comment"
                  rows={3}
                  defaultValue={editingTestimonial?.comment || ''}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTestimonialModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0047AB] text-white text-xs font-bold"
                >
                  Simpan Testimoni
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: GOOGLE SHEETS SYNC ================= */}
      <GoogleSheetsSyncModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        onDataRefreshed={handleSyncRefresh}
      />

    </div>
  );
};
