import React, { useState, useEffect } from 'react';
import { 
  getCurrentUser, 
  setCurrentUser, 
  getCourses, 
  getCart, 
  addToCart as storageAddToCart, 
  removeFromCart as storageRemoveFromCart, 
  getTestimonials, 
  getPosts, 
  initializeStorage 
} from './services/storage';
import { User, Course, CartItem, Testimonial, AdminPost } from './types';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { CourseCatalog } from './components/CourseCatalog';
import { CourseDetailModal } from './components/CourseDetailModal';
import { TestimonialsSection } from './components/TestimonialsSection';
import { BlogSection } from './components/BlogSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Classroom } from './components/Classroom';

export default function App() {
  // Initialize storage
  useEffect(() => {
    initializeStorage();
  }, []);

  // Main state
  const [currentUser, setCurrentUserState] = useState<User | null>(() => getCurrentUser());
  const [courses, setCourses] = useState<Course[]>(() => getCourses());
  const [cart, setCart] = useState<CartItem[]>(() => getCart());
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => getTestimonials());
  const [posts, setPosts] = useState<AdminPost[]>(() => getPosts());

  // View routing: 'landing' | 'student' | 'admin' | 'classroom'
  const [currentView, setCurrentView] = useState<'landing' | 'student' | 'admin' | 'classroom'>('landing');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'student' | 'teacher' | 'register'>('student');
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<Course | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync courses whenever updated from Admin Dashboard
  const refreshAppData = () => {
    setCourses(getCourses());
    setTestimonials(getTestimonials());
    setPosts(getPosts());
  };

  // Cart operations
  const handleAddToCart = (course: Course) => {
    const res = storageAddToCart(course);
    setCart(getCart());
    showToast(res.message);
  };

  const handleRemoveFromCart = (courseId: string) => {
    storageRemoveFromCart(courseId);
    setCart(getCart());
    showToast('Kursus dihapus dari keranjang.');
  };

  const handleEnrollNow = (course: Course) => {
    storageAddToCart(course);
    setCart(getCart());
    setSelectedCourseDetail(null);
    setIsCartOpen(true);
  };

  // Auth operations
  const handleLoginSuccess = (user: User) => {
    setCurrentUserState(user);
    showToast(`Ahlan wa Sahlan, ${user.name}!`);
    if (user.role === 'teacher' || user.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('student');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
    setCurrentView('landing');
    showToast('Anda telah berhasil keluar.');
  };

  const handleStartCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    setCurrentView('classroom');
  };

  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0047AB] text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom-4">
          {toastMessage}
        </div>
      )}

      {/* Navbar: visible in landing, student, and admin views */}
      {currentView !== 'classroom' && (
        <Navbar
          currentUser={currentUser}
          cart={cart}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={(tab = 'student') => {
            setAuthDefaultTab(tab);
            setIsAuthOpen(true);
          }}
          onLogout={handleLogout}
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view as any)}
        />
      )}

      {/* Main Views */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <>
            <Hero
              onExploreCourses={() => {
                const el = document.getElementById('kursus');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <Features />

            <CourseCatalog
              courses={courses}
              currentUser={currentUser}
              onSelectCourse={(course) => setSelectedCourseDetail(course)}
              onAddToCart={handleAddToCart}
              onStartCourse={handleStartCourse}
            />

            <TestimonialsSection testimonials={testimonials} />

            <BlogSection posts={posts} />
          </>
        )}

        {currentView === 'student' && currentUser && (
          <StudentDashboard
            currentUser={currentUser}
            courses={courses}
            onStartCourse={handleStartCourse}
            onBrowseCourses={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'admin' && currentUser && (
          <AdminDashboard onCourseUpdated={refreshAppData} />
        )}

        {currentView === 'classroom' && currentUser && activeCourse && (
          <Classroom
            course={activeCourse}
            currentUser={currentUser}
            onBack={() => {
              if (currentUser.role === 'teacher' || currentUser.role === 'admin') {
                setCurrentView('admin');
              } else {
                setCurrentView('student');
              }
            }}
          />
        )}
      </main>

      {/* Footer: visible in landing, student, and admin views */}
      {currentView !== 'classroom' && <Footer />}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        currentUser={currentUser}
        onRemoveItem={handleRemoveFromCart}
        onOrderPlaced={() => {
          setCart(getCart());
        }}
        onRequireLogin={() => {
          setIsCartOpen(false);
          setAuthDefaultTab('student');
          setIsAuthOpen(true);
          showToast('Silakan masuk atau daftar terlebih dahulu untuk checkout.');
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultTab={authDefaultTab}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={selectedCourseDetail}
        onClose={() => setSelectedCourseDetail(null)}
        onAddToCart={handleAddToCart}
        onEnrollNow={handleEnrollNow}
        onStartCourse={handleStartCourse}
      />
    </div>
  );
}
