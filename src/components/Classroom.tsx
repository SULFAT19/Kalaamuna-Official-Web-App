import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Lock, 
  PlayCircle, 
  HelpCircle, 
  Award, 
  ExternalLink, 
  ChevronRight, 
  Sparkles,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import { Course, Lesson, StudentProgress, User } from '../types';
import { 
  getYouTubeEmbedUrl, 
  getStudentProgress, 
  saveStudentProgress 
} from '../services/storage';

interface ClassroomProps {
  course: Course;
  currentUser: User;
  onBack: () => void;
}

export const Classroom: React.FC<ClassroomProps> = ({
  course,
  currentUser,
  onBack,
}) => {
  const [progress, setProgress] = useState<StudentProgress>(() =>
    getStudentProgress(currentUser.id, course.id)
  );

  // Current active lesson
  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    if (progress.currentLessonId) return progress.currentLessonId;
    return course.lessons[0]?.id || '';
  });

  // Active step inside the lesson: 'video' | 'quiz'
  const [currentStep, setCurrentStep] = useState<'video' | 'quiz'>('video');

  const currentLesson = course.lessons.find((l) => l.id === activeLessonId) || course.lessons[0];
  const currentIndex = course.lessons.findIndex((l) => l.id === activeLessonId);

  // Check state of current lesson
  const isCurrentWatched = currentLesson ? progress.watchedLessonIds.includes(currentLesson.id) : false;
  const isCurrentQuizDone = currentLesson ? progress.completedQuizIds.includes(currentLesson.id) : false;
  const isCurrentCompleted = currentLesson ? progress.completedLessonIds.includes(currentLesson.id) : false;

  // Total completion
  const totalLessons = course.lessons.length;
  const completedCount = progress.completedLessonIds.length;
  const isAllCourseCompleted = totalLessons > 0 && completedCount >= totalLessons;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Check if a specific lesson is unlocked
  const isLessonUnlocked = (lessonIndex: number): boolean => {
    // Teachers/admins can inspect any lesson
    if (currentUser.role === 'teacher' || currentUser.role === 'admin') return true;
    if (lessonIndex === 0) return true;
    // For lesson N, previous lesson (N-1) must be in completedLessonIds
    const prevLesson = course.lessons[lessonIndex - 1];
    return progress.completedLessonIds.includes(prevLesson.id);
  };

  // Action: "Saya Sudah Menonton"
  const handleMarkWatched = () => {
    if (!currentLesson) return;
    const updatedWatched = Array.from(new Set([...progress.watchedLessonIds, currentLesson.id]));
    const updated: StudentProgress = {
      ...progress,
      watchedLessonIds: updatedWatched,
    };
    setProgress(updated);
    saveStudentProgress(updated);
    // Automatically switch or invite user to quiz
    setCurrentStep('quiz');
  };

  // Action: "Saya Sudah Kerjakan Kuis"
  const handleMarkQuizDone = () => {
    if (!currentLesson) return;
    const updatedQuiz = Array.from(new Set([...progress.completedQuizIds, currentLesson.id]));
    const updatedCompleted = Array.from(new Set([...progress.completedLessonIds, currentLesson.id]));

    // Check next lesson
    const nextLesson = course.lessons[currentIndex + 1];
    const updated: StudentProgress = {
      ...progress,
      completedQuizIds: updatedQuiz,
      completedLessonIds: updatedCompleted,
      currentLessonId: nextLesson ? nextLesson.id : currentLesson.id,
    };
    setProgress(updated);
    saveStudentProgress(updated);
  };

  // Action: Next lesson
  const handleNextLesson = () => {
    const nextLesson = course.lessons[currentIndex + 1];
    if (nextLesson && isLessonUnlocked(currentIndex + 1)) {
      setActiveLessonId(nextLesson.id);
      setCurrentStep('video');
    }
  };

  // Action: "Ajukan Sertifikat"
  const handleRequestCertificate = () => {
    const updated: StudentProgress = {
      ...progress,
      isCertificateRequested: true,
      completedAt: new Date().toISOString(),
    };
    setProgress(updated);
    saveStudentProgress(updated);

    const formUrl = course.certificateFormUrl || 'https://forms.google.com';
    window.open(formUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali ke Beranda</span>
          </button>

          <div className="border-l border-slate-800 pl-3">
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[240px] sm:max-w-md">
              {course.title}
            </h1>
            <p className="text-[11px] font-arabic text-amber-300 hidden sm:block">
              {course.arabicTitle}
            </p>
          </div>
        </div>

        {/* Course Progress Status in Top Bar */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-300">
              {completedCount} dari {totalLessons} Materi Tuntas
            </span>
            <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {progressPercentage}%
          </span>
        </div>
      </header>

      {/* Main LMS Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Player & Quiz Interface */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Certificate Banner if Course Completed */}
          {isAllCourseCompleted && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-900/60 via-amber-800/40 to-slate-900 border-2 border-amber-500/50 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-lg">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold">
                      <Sparkles className="w-3 h-3" />
                      <span>Selamat! Kursus Selesai 100%</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">
                      Klaim Sertifikat Kelulusan Resmi Kalaamunaa
                    </h3>
                    <p className="text-xs text-amber-100/80">
                      Anda telah menuntaskan seluruh video dan kuis. Ajukan penerbitan e-sertifikat Anda sekarang.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRequestCertificate}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition-all shadow-lg hover:scale-102 flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
                >
                  <Award className="w-5 h-5" />
                  <span>Ajukan Sertifikat</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* Current Lesson Header */}
          <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 text-xs text-blue-400 font-semibold mb-1">
                <span>Pelajaran {currentIndex + 1} dari {totalLessons}</span>
                <span>•</span>
                <span>{currentLesson?.duration || '15 Menit'}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                {currentLesson?.title}
              </h2>
              {currentLesson?.arabicTitle && (
                <p className="font-arabic text-amber-300 text-sm mt-0.5">
                  {currentLesson.arabicTitle}
                </p>
              )}
            </div>

            {/* Step Toggle Bar: Video vs Quiz */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold self-start sm:self-center">
              <button
                onClick={() => setCurrentStep('video')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                  currentStep === 'video'
                    ? 'bg-[#0047AB] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PlayCircle className="w-4 h-4" />
                <span>1. Video Materi</span>
              </button>

              <button
                onClick={() => {
                  if (isCurrentWatched || currentUser.role === 'teacher' || currentUser.role === 'admin') {
                    setCurrentStep('quiz');
                  }
                }}
                disabled={!isCurrentWatched && currentUser.role !== 'teacher' && currentUser.role !== 'admin'}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                  currentStep === 'quiz'
                    ? 'bg-[#0047AB] text-white shadow-xs'
                    : isCurrentWatched
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                {!isCurrentWatched && currentUser.role !== 'teacher' && currentUser.role !== 'admin' ? (
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <HelpCircle className="w-4 h-4" />
                )}
                <span>2. Kuis Evaluasi</span>
              </button>
            </div>
          </div>

          {/* Video or Quiz Viewer */}
          {currentStep === 'video' ? (
            <div className="space-y-4">
              {/* Responsive Video Container */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
                {currentLesson?.youtubeUrl ? (
                  <iframe
                    src={getYouTubeEmbedUrl(currentLesson.youtubeUrl)}
                    title={currentLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                    <PlayCircle className="w-16 h-16 mb-2 opacity-40" />
                    <p className="text-sm font-semibold">Video belum ditambahkan oleh Admin.</p>
                  </div>
                )}
              </div>

              {/* Action Bar for Video: "Saya sudah menonton" */}
              <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-xs font-semibold text-slate-300">
                    Syarat Melanjutkan ke Kuis Evaluasi:
                  </p>
                  <p className="text-xs text-slate-400">
                    {isCurrentWatched
                      ? '✓ Anda telah mengonfirmasi menonton materi ini. Silakan kerjakan kuis evaluasi.'
                      : 'Simak video penjelasan sampai tuntas, lalu tekan tombol "Saya Sudah Menonton" untuk membuka kuis.'}
                  </p>
                </div>

                {isCurrentWatched ? (
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <span className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center space-x-1.5 justify-center flex-1 sm:flex-initial">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sudah Ditonton</span>
                    </span>

                    <button
                      onClick={() => setCurrentStep('quiz')}
                      className="px-5 py-2.5 rounded-xl bg-[#0047AB] hover:bg-[#003380] text-white text-xs font-bold transition-colors flex items-center space-x-1.5 justify-center flex-1 sm:flex-initial"
                    >
                      <span>Lanjut ke Kuis</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleMarkWatched}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0047AB] hover:bg-[#003380] text-white font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:scale-102 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5 text-amber-300" />
                    <span>Saya Sudah Menonton</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Quiz View */
            <div className="space-y-4">
              {!isCurrentWatched && currentUser.role !== 'teacher' && currentUser.role !== 'admin' ? (
                <div className="p-8 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
                  <Lock className="w-10 h-10 text-amber-400 mx-auto" />
                  <h3 className="text-base font-bold text-white">Kuis Belum Terbuka</h3>
                  <p className="text-xs text-amber-200/80 max-w-sm mx-auto">
                    Anda belum menyelesaikan tahap menonton video. Silakan tonton materi dan klik "Saya Sudah Menonton" terlebih dahulu.
                  </p>
                  <button
                    onClick={() => setCurrentStep('video')}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
                  >
                    Kembali ke Video
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Google Form Quiz Card */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center justify-center">
                          <HelpCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base">
                            Kuis Pemahaman: {currentLesson?.title}
                          </h3>
                          <p className="text-xs text-slate-400">
                            Kuis dibuat via Google Form resmi Kalaamunaa
                          </p>
                        </div>
                      </div>

                      <a
                        href={currentLesson?.quizUrl || 'https://forms.google.com'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center space-x-1.5"
                      >
                        <span>Buka Kuis di Tab Baru</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Google Form Link Notice */}
                    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-sm space-y-3">
                      <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                        Instruksi Kuis:
                      </p>
                      <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-400">
                        <li>Klik tautan Google Form di atas atau tombol buka kuis.</li>
                        <li>Jawab seluruh pertanyaan pemahaman materi pelajaran ini dengan seksama.</li>
                        <li>Setelah menekan 'Kirim' / 'Submit' pada formulir kuis, kembali ke halaman ini.</li>
                        <li>Tekan tombol <strong>"Saya Sudah Kerjakan Kuis"</strong> di bawah untuk membuka pelajaran selanjutnya.</li>
                      </ol>

                      <div className="pt-2">
                        <a
                          href={currentLesson?.quizUrl || 'https://forms.google.com'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-xs font-bold text-blue-400 hover:text-blue-300 underline"
                        >
                          <span>{currentLesson?.quizUrl || 'https://forms.google.com'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar for Quiz: "Saya sudah kerjakan kuis" */}
                  <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <p className="text-xs font-semibold text-slate-300">
                        Konfirmasi Penyelesaian Kuis:
                      </p>
                      <p className="text-xs text-slate-400">
                        {isCurrentQuizDone
                          ? '✓ Pelajaran ini telah tuntas! Anda dapat beralih ke materi selanjutnya.'
                          : 'Tidak bisa lanjut ke pelajaran berikutnya kecuali sudah menekan tombol Saya Sudah Kerjakan Kuis.'}
                      </p>
                    </div>

                    {isCurrentQuizDone ? (
                      <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <span className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center space-x-1.5 justify-center flex-1 sm:flex-initial">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Kuis Tuntas</span>
                        </span>

                        {currentIndex < totalLessons - 1 ? (
                          <button
                            onClick={handleNextLesson}
                            className="px-5 py-2.5 rounded-xl bg-[#0047AB] hover:bg-[#003380] text-white text-xs font-bold transition-all flex items-center space-x-1.5 justify-center flex-1 sm:flex-initial"
                          >
                            <span>Pelajaran Selanjutnya</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={handleRequestCertificate}
                            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all flex items-center space-x-1.5 justify-center flex-1 sm:flex-initial"
                          >
                            <Award className="w-4 h-4" />
                            <span>Ajukan Sertifikat</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={handleMarkQuizDone}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:scale-102 flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Saya Sudah Kerjakan Kuis</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Lessons Syllabus & Progress Navigation */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-[#0047AB]" />
                <h3 className="font-bold text-sm text-white">Daftar Pelajaran Kursus</h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                {completedCount}/{totalLessons} Selesai
              </span>
            </div>

            {/* List of lessons with status markers */}
            <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
              {course.lessons.map((lesson, idx) => {
                const isCompleted = progress.completedLessonIds.includes(lesson.id);
                const isCurrent = lesson.id === activeLessonId;
                const isUnlocked = isLessonUnlocked(idx);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      if (isUnlocked) {
                        setActiveLessonId(lesson.id);
                        setCurrentStep('video');
                      }
                    }}
                    disabled={!isUnlocked}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start space-x-3 cursor-pointer ${
                      isCurrent
                        ? 'bg-[#0047AB]/20 border-[#0047AB] text-white'
                        : isCompleted
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200 hover:bg-emerald-950/40'
                        : isUnlocked
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        : 'bg-slate-900/40 border-slate-800/40 text-slate-600 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {/* Status icon badge */}
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                          ✓
                        </div>
                      ) : isCurrent ? (
                        <div className="w-5 h-5 rounded-full bg-[#0047AB] text-white flex items-center justify-center">
                          <PlayCircle className="w-3.5 h-3.5" />
                        </div>
                      ) : isUnlocked ? (
                        <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-600 flex items-center justify-center">
                          <Lock className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400">
                          Pelajaran {idx + 1}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {lesson.duration || '15m'}
                        </span>
                      </div>
                      <p className="text-xs font-bold truncate mt-0.5">{lesson.title}</p>
                      {lesson.arabicTitle && (
                        <p className="text-[10px] font-arabic text-amber-300 truncate mt-0.5">
                          {lesson.arabicTitle}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Certificate Quick Button in Sidebar */}
            <div className="pt-4 border-t border-slate-800 mt-4">
              <button
                onClick={handleRequestCertificate}
                disabled={!isAllCourseCompleted}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                  isAllCourseCompleted
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md cursor-pointer'
                    : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>
                  {isAllCourseCompleted
                    ? 'Ajukan Sertifikat Kelulusan'
                    : `Sertifikat (${completedCount}/${totalLessons} Selesai)`}
                </span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
