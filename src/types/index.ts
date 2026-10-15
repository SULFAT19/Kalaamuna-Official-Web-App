export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  arabicTitle?: string;
  duration?: string;
  youtubeUrl: string;
  quizUrl: string; // Google Form URL
  order: number;
}

export interface Course {
  id: string;
  title: string;
  arabicTitle: string;
  slug: string;
  category: string;
  level: 'Pemula' | 'Menengah' | 'Lanjutan';
  price: number;
  originalPrice: number;
  thumbnail: string;
  description: string;
  whatYouWillGet: string[];
  features: string[];
  certificateFormUrl: string; // Google Form link for certificate submission
  lessons: Lesson[];
  status: 'published' | 'draft';
  instructorName?: string;
}

export interface CartItem {
  courseId: string;
  title: string;
  arabicTitle?: string;
  price: number;
  thumbnail: string;
}

export type OrderStatus = 'pending' | 'approved' | 'rejected';

export interface Order {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  items: {
    courseId: string;
    title: string;
    price: number;
  }[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  approvedAt?: string;
}

export interface StudentProgress {
  studentId: string;
  courseId: string;
  watchedLessonIds: string[]; // Clicked "Saya sudah menonton"
  completedQuizIds: string[]; // Clicked "Saya sudah kerjakan kuis"
  completedLessonIds: string[]; // Fully completed lesson
  currentLessonId?: string;
  isCertificateRequested?: boolean;
  completedAt?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  courseName: string;
  rating: number; // 1 - 5
  comment: string;
  avatar?: string;
  createdAt: string;
}

export interface AdminPost {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  thumbnail?: string;
  createdAt: string;
}
