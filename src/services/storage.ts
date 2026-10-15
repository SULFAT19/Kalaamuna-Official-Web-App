import { Course, Order, OrderStatus, User, StudentProgress, Testimonial, AdminPost, CartItem } from '../types';
import { INITIAL_COURSES, INITIAL_TESTIMONIALS, INITIAL_POSTS, INITIAL_USERS, ADMIN_CREDENTIALS } from '../data/initialData';
import { appendUserToSheet, appendOrderToSheet, appendCourseToSheet, updateOrderStatusInSheet } from './googleSheets';

const STORAGE_KEYS = {
  COURSES: 'kalaamunaa_courses',
  ORDERS: 'kalaamunaa_orders',
  USERS: 'kalaamunaa_users',
  CURRENT_USER: 'kalaamunaa_current_user',
  CART: 'kalaamunaa_cart',
  PROGRESS: 'kalaamunaa_progress',
  TESTIMONIALS: 'kalaamunaa_testimonials',
  POSTS: 'kalaamunaa_posts',
};

// Initialize default state if not already set
export function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TESTIMONIALS)) {
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(INITIAL_TESTIMONIALS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    // Provide a sample approved order for Ahmad Fauzan so the demo has immediate visual data
    const sampleOrders: Order[] = [
      {
        id: 'ord-1001',
        studentId: 'user-student-demo',
        studentName: 'Ahmad Fauzan',
        studentEmail: 'ahmad.fauzan@gmail.com',
        studentPhone: '081298765432',
        items: [
          {
            courseId: 'course-nahwu-dasar',
            title: 'Nahwu Kilat Dasar: Memahami Struktur Kalimat Arab & Al-Qur\'an',
            price: 199000,
          },
        ],
        totalPrice: 199000,
        status: 'approved',
        createdAt: '2026-03-10T10:00:00.000Z',
        approvedAt: '2026-03-10T10:15:00.000Z',
      },
      {
        id: 'ord-1002',
        studentId: 'user-student-demo',
        studentName: 'Ahmad Fauzan',
        studentEmail: 'ahmad.fauzan@gmail.com',
        studentPhone: '081298765432',
        items: [
          {
            courseId: 'course-muhadatsah-sehari-hari',
            title: 'Muhadatsah Praktis: Percakapan Bahasa Arab Sehari-hari',
            price: 179000,
          },
        ],
        totalPrice: 179000,
        status: 'pending',
        createdAt: '2026-04-10T09:30:00.000Z',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(sampleOrders));
  }

  // Provide initial student progress for demo user
  if (!localStorage.getItem(STORAGE_KEYS.PROGRESS)) {
    const sampleProgress: Record<string, StudentProgress> = {
      'user-student-demo_course-nahwu-dasar': {
        studentId: 'user-student-demo',
        courseId: 'course-nahwu-dasar',
        watchedLessonIds: ['lesson-1-1'],
        completedQuizIds: ['lesson-1-1'],
        completedLessonIds: ['lesson-1-1'],
        currentLessonId: 'lesson-1-2',
        isCertificateRequested: false,
      },
    };
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(sampleProgress));
  }
  if (!localStorage.getItem('kalaamunaa_apps_script_url')) {
    localStorage.setItem('kalaamunaa_apps_script_url', 'https://script.google.com/macros/s/AKfycbyXf-75aHUSyuxqBBFlj-QTITFvaz1J4BnSikH_5NcIIo7fFQc3tXxXF6guTqrFjQSl/exec');
    localStorage.setItem('kalaamunaa_sheet_sync_enabled', 'true');
  }
}

// ---------------- COURSES ----------------
export function getCourses(): Course[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.COURSES);
  return data ? JSON.parse(data) : INITIAL_COURSES;
}

export function saveCourses(courses: Course[]) {
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
}

export function getCourseById(id: string): Course | undefined {
  const courses = getCourses();
  return courses.find((c) => c.id === id);
}

// ---------------- USERS & AUTH ----------------
export function getUsers(): User[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : INITIAL_USERS;
}

export function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export function loginTeacher(usernameInput: string, passwordInput: string): { success: boolean; user?: User; message?: string } {
  const cleanUser = usernameInput.trim();
  const cleanPass = passwordInput.trim();

  // Match username or email as Guru
  const isMatch = (cleanUser.toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase() ||
                   cleanUser.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase()) &&
                  cleanPass === ADMIN_CREDENTIALS.password;

  if (isMatch) {
    const adminUser: User = {
      id: 'user-admin',
      name: 'Mudarris Kalaamunaa',
      email: ADMIN_CREDENTIALS.email,
      role: 'teacher',
      phone: '082311776535',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    setCurrentUser(adminUser);
    appendUserToSheet(adminUser, 'LOGIN');
    return { success: true, user: adminUser };
  }
  return { success: false, message: 'Username atau password Guru salah. Pastikan Username: "Mudarris Kalaamunaa" dan Password sesuai petunjuk.' };
}

export function loginStudent(emailInput: string, passwordInput: string): { success: boolean; user?: User; message?: string } {
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === emailInput.trim().toLowerCase());
  
  if (!user) {
    return { success: false, message: 'Email tidak ditemukan. Silakan mendaftar terlebih dahulu.' };
  }

  // Stored password check via localStorage credentials map
  const passwordsMap = JSON.parse(localStorage.getItem('kalaamunaa_passwords') || '{}');
  const storedPassword = passwordsMap[user.email.toLowerCase()] || 'password123';

  if (storedPassword !== passwordInput) {
    return { success: false, message: 'Password salah. Silakan coba lagi.' };
  }

  setCurrentUser(user);
  appendUserToSheet(user, 'LOGIN');
  return { success: true, user };
}

export function registerStudent(name: string, email: string, password: string, phone: string = ''): { success: boolean; user?: User; message?: string } {
  const users = getUsers();
  const exists = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (exists) {
    return { success: false, message: 'Email sudah terdaftar. Silakan login langsung.' };
  }

  const newUser: User = {
    id: 'user-' + Date.now(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    role: 'student',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Save password
  const passwordsMap = JSON.parse(localStorage.getItem('kalaamunaa_passwords') || '{}');
  passwordsMap[newUser.email] = password;
  localStorage.setItem('kalaamunaa_passwords', JSON.stringify(passwordsMap));

  setCurrentUser(newUser);
  appendUserToSheet(newUser, 'DAFTAR');
  return { success: true, user: newUser };
}

// ---------------- CART ----------------
export function getCart(): CartItem[] {
  const data = localStorage.getItem(STORAGE_KEYS.CART);
  return data ? JSON.parse(data) : [];
}

export function addToCart(course: Course): { added: boolean; message: string } {
  const cart = getCart();
  if (cart.some((item) => item.courseId === course.id)) {
    return { added: false, message: 'Kursus ini sudah ada di keranjang Anda.' };
  }
  cart.push({
    courseId: course.id,
    title: course.title,
    arabicTitle: course.arabicTitle,
    price: course.price,
    thumbnail: course.thumbnail,
  });
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  return { added: true, message: 'Kursus berhasil ditambahkan ke keranjang.' };
}

export function removeFromCart(courseId: string) {
  const cart = getCart().filter((item) => item.courseId !== courseId);
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem(STORAGE_KEYS.CART);
}

// ---------------- ORDERS & APPROVAL ----------------
export function getOrders(): Order[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return data ? JSON.parse(data) : [];
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

export function createOrder(student: User, cartItems: CartItem[]): Order {
  const orders = getOrders();
  const total = cartItems.reduce((acc, curr) => acc + curr.price, 0);

  const newOrder: Order = {
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    studentId: student.id,
    studentName: student.name,
    studentEmail: student.email,
    studentPhone: student.phone || '',
    items: cartItems.map((c) => ({
      courseId: c.courseId,
      title: c.title,
      price: c.price,
    })),
    totalPrice: total,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  orders.unshift(newOrder);
  saveOrders(orders);
  clearCart();
  appendOrderToSheet(newOrder);
  return newOrder;
}

export function approveOrder(orderId: string): boolean {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = 'approved';
    orders[idx].approvedAt = new Date().toISOString();
    saveOrders(orders);
    updateOrderStatusInSheet(orderId, 'approved');
    return true;
  }
  return false;
}

export function rejectOrder(orderId: string): boolean {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = 'rejected';
    saveOrders(orders);
    updateOrderStatusInSheet(orderId, 'rejected');
    return true;
  }
  return false;
}

export function checkCourseAccess(studentId: string, courseId: string, userRole?: string): { hasAccess: boolean; orderStatus?: OrderStatus } {
  // Teachers/Admins have access to all courses
  if (userRole === 'teacher' || userRole === 'admin') {
    return { hasAccess: true, orderStatus: 'approved' };
  }

  const orders = getOrders();
  const userOrders = orders.filter((o) => o.studentId === studentId);

  // Check if approved order exists for this course
  for (const ord of userOrders) {
    const hasItem = ord.items.some((item) => item.courseId === courseId);
    if (hasItem) {
      if (ord.status === 'approved') {
        return { hasAccess: true, orderStatus: 'approved' };
      }
      if (ord.status === 'pending') {
        return { hasAccess: false, orderStatus: 'pending' };
      }
    }
  }

  return { hasAccess: false, orderStatus: undefined };
}

// ---------------- STUDENT PROGRESS ----------------
export function getStudentProgress(studentId: string, courseId: string): StudentProgress {
  initializeStorage();
  const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || '{}');
  const key = `${studentId}_${courseId}`;
  if (allProgress[key]) {
    return allProgress[key];
  }
  return {
    studentId,
    courseId,
    watchedLessonIds: [],
    completedQuizIds: [],
    completedLessonIds: [],
    isCertificateRequested: false,
  };
}

export function saveStudentProgress(progress: StudentProgress) {
  const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || '{}');
  const key = `${progress.studentId}_${progress.courseId}`;
  allProgress[key] = progress;
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
}

// ---------------- TESTIMONIALS & POSTS ----------------
export function getTestimonials(): Testimonial[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
  return data ? JSON.parse(data) : INITIAL_TESTIMONIALS;
}

export function saveTestimonials(testimonials: Testimonial[]) {
  localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials));
}

export function getPosts(): AdminPost[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.POSTS);
  return data ? JSON.parse(data) : INITIAL_POSTS;
}

export function savePosts(posts: AdminPost[]) {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
}

// ---------------- HELPERS ----------------
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Convert various YouTube link forms to standard embed URL
export function getYouTubeEmbedUrl(url: string): string {
  if (!url) return '';
  // If already embed URL
  if (url.includes('youtube.com/embed/')) return url;

  let videoId = '';
  // youtu.be/VIDEO_ID
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  }
  // youtube.com/watch?v=VIDEO_ID
  else if (url.includes('watch?v=')) {
    videoId = url.split('watch?v=')[1]?.split('&')[0] || '';
  }
  // just the 11 character ID
  else if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    videoId = url;
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }
  return url;
}

// WhatsApp link generator matching exact user requirement:
// "Assalamualaikum Admin Kalaamunaa,\nSaya {Nama siswa} ingin mengikuti kursus [kursus 1 x harganya], [kursus 2 x harganya]...dan seterusnya sesuai paket kursus yang dia pilih. Total (Rpxxxx sesuai total kurus yang dia pesan diisi otomatis)"
export function generateWhatsAppOrderUrl(studentName: string, items: { title: string; price: number }[], totalPrice: number): string {
  const phoneNumber = '6282311776535';
  
  const courseListText = items
    .map((item) => `[${item.title} x ${formatRupiah(item.price)}]`)
    .join(', ');

  const message = `Assalamualaikum Admin Kalaamunaa,\nSaya ${studentName} ingin mengikuti kursus ${courseListText}. Total ${formatRupiah(totalPrice)}`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

// ---------------- BACKUP & RESTORE DATABASE JSON ----------------
export interface AppDatabaseBackup {
  version: string;
  exportedAt: string;
  courses: Course[];
  posts: AdminPost[];
  testimonials: Testimonial[];
  orders: Order[];
  users: User[];
}

export function exportFullDatabase(): AppDatabaseBackup {
  initializeStorage();
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    courses: getCourses(),
    posts: getPosts(),
    testimonials: getTestimonials(),
    orders: getOrders(),
    users: getUsers(),
  };
}

export function importFullDatabase(data: Partial<AppDatabaseBackup>): boolean {
  try {
    if (data.courses && Array.isArray(data.courses) && data.courses.length > 0) {
      saveCourses(data.courses);
    }
    if (data.posts && Array.isArray(data.posts)) {
      savePosts(data.posts);
    }
    if (data.testimonials && Array.isArray(data.testimonials)) {
      saveTestimonials(data.testimonials);
    }
    if (data.orders && Array.isArray(data.orders)) {
      saveOrders(data.orders);
    }
    if (data.users && Array.isArray(data.users)) {
      saveUsers(data.users);
    }
    return true;
  } catch (err) {
    console.error('Failed to import database:', err);
    return false;
  }
}

