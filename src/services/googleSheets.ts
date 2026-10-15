import { Course, Order, User, Testimonial, Lesson } from '../types';

const STORAGE_KEYS = {
  SCRIPT_URL: 'kalaamunaa_apps_script_url',
  SHEET_URL: 'kalaamunaa_google_sheet_url',
  LAST_SYNC: 'kalaamunaa_last_sync_time',
  SYNC_ENABLED: 'kalaamunaa_sheet_sync_enabled',
};

export interface SheetConfig {
  scriptUrl: string | null;
  spreadsheetUrl: string | null;
  lastSyncTime: string | null;
  syncEnabled: boolean;
}

export const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyXf-75aHUSyuxqBBFlj-QTITFvaz1J4BnSikH_5NcIIo7fFQc3tXxXF6guTqrFjQSl/exec';

export function getSheetConfig(): SheetConfig {
  const envScriptUrl = (import.meta as any).env?.VITE_GOOGLE_APPS_SCRIPT_URL || null;
  const envSheetUrl = (import.meta as any).env?.VITE_GOOGLE_SHEET_URL || null;

  const scriptUrl = localStorage.getItem(STORAGE_KEYS.SCRIPT_URL) || envScriptUrl || DEFAULT_APPS_SCRIPT_URL;
  const spreadsheetUrl = localStorage.getItem(STORAGE_KEYS.SHEET_URL) || envSheetUrl;
  const lastSyncTime = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  const syncEnabled = localStorage.getItem(STORAGE_KEYS.SYNC_ENABLED) === 'false' ? false : (!!scriptUrl);

  return {
    scriptUrl,
    spreadsheetUrl,
    lastSyncTime,
    syncEnabled,
  };
}

export function saveSheetConfig(config: Partial<SheetConfig>) {
  if (config.scriptUrl !== undefined) {
    if (config.scriptUrl) {
      localStorage.setItem(STORAGE_KEYS.SCRIPT_URL, config.scriptUrl.trim());
      localStorage.setItem(STORAGE_KEYS.SYNC_ENABLED, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.SCRIPT_URL);
    }
  }
  if (config.spreadsheetUrl !== undefined) {
    if (config.spreadsheetUrl) localStorage.setItem(STORAGE_KEYS.SHEET_URL, config.spreadsheetUrl.trim());
    else localStorage.removeItem(STORAGE_KEYS.SHEET_URL);
  }
  if (config.lastSyncTime !== undefined) {
    if (config.lastSyncTime) localStorage.setItem(STORAGE_KEYS.LAST_SYNC, config.lastSyncTime);
    else localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
  }
  if (config.syncEnabled !== undefined) {
    localStorage.setItem(STORAGE_KEYS.SYNC_ENABLED, config.syncEnabled ? 'true' : 'false');
  }
}

// Test connectivity to Google Apps Script Web App
export async function testGoogleSheetsConnection(customScriptUrl?: string): Promise<{ success: boolean; message: string }> {
  const urlToTest = (customScriptUrl || getSheetConfig().scriptUrl || '').trim();
  if (!urlToTest) {
    return {
      success: false,
      message: 'URL Google Apps Script belum dimasukkan. Silakan masukkan URL Web App yang berakhiran /exec.',
    };
  }

  try {
    const testUrl = `${urlToTest}${urlToTest.includes('?') ? '&' : '?'}action=PING&t=${Date.now()}`;
    const res = await fetch(testUrl, { method: 'GET' });
    if (!res.ok) {
      return {
        success: false,
        message: `Google Apps Script mengembalikan HTTP status ${res.status}. Pastikan URL berakhiran /exec dan deployment disetel ke Siapa Saja (Anyone).`,
      };
    }
    const json = await res.json();
    if (json.success) {
      saveSheetConfig({ lastSyncTime: new Date().toISOString() });
      return {
        success: true,
        message: 'Koneksi Berhasil! Google Apps Script aktif dan terhubung ke Google Spreadsheet.',
      };
    } else {
      return {
        success: false,
        message: json.message || 'Respons dari Google Apps Script tidak sesuai.',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal tersambung: ${err.message || 'CORS/Network error'}. Pastikan saat Deploy di Apps Script, opsi "Who has access" dipilih "Anyone" (Siapa saja).`,
    };
  }
}

// Helper to send data to Google Apps Script Web App
async function sendToAppsScript(payload: any): Promise<boolean> {
  const { scriptUrl } = getSheetConfig();
  if (!scriptUrl) return false;

  try {
    // Mode no-cors avoids CORS preflight issues with Google Apps Script redirect
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(payload),
    });
    saveSheetConfig({ lastSyncTime: new Date().toISOString() });
    return true;
  } catch (err) {
    try {
      const getUrl = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}action=${encodeURIComponent(payload.action)}&data=${encodeURIComponent(JSON.stringify(payload))}`;
      if (getUrl.length < 2000) {
        await fetch(getUrl, { mode: 'no-cors' });
        saveSheetConfig({ lastSyncTime: new Date().toISOString() });
        return true;
      }
    } catch (e2) {}
    console.warn('Gagal mengirim data ke Google Spreadsheet Web App:', err);
    return false;
  }
}

// ---------------- APPEND / UPDATE ON REGISTER & LOGIN ----------------
export async function appendUserToSheet(user: User, action: 'DAFTAR' | 'LOGIN') {
  await sendToAppsScript({
    action: 'USER_EVENT',
    eventType: action,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '-',
      createdAt: user.createdAt,
      lastActive: new Date().toISOString(),
    },
  });
}

// ---------------- APPEND ON ORDER (CHECKOUT) ----------------
export async function appendOrderToSheet(order: Order) {
  await sendToAppsScript({
    action: 'ORDER_EVENT',
    order: {
      id: order.id,
      studentName: order.studentName,
      studentEmail: order.studentEmail,
      studentPhone: order.studentPhone || '-',
      courses: order.items.map((i) => `${i.title} (${i.price})`).join('; '),
      totalPrice: order.totalPrice,
      status: order.status.toUpperCase(),
      createdAt: order.createdAt,
      approvedAt: order.approvedAt || '-',
    },
  });
}

// ---------------- UPDATE ORDER STATUS (ON APPROVE) ----------------
export async function updateOrderStatusInSheet(orderId: string, status: 'approved' | 'rejected') {
  await sendToAppsScript({
    action: 'UPDATE_ORDER_STATUS',
    orderId,
    status: status.toUpperCase(),
    approvedAt: new Date().toISOString(),
  });
}

// ---------------- APPEND ON COURSE CREATED ----------------
export async function appendCourseToSheet(course: Course) {
  await sendToAppsScript({
    action: 'COURSE_EVENT',
    course: {
      id: course.id,
      title: course.title,
      arabicTitle: course.arabicTitle,
      category: course.category,
      level: course.level,
      price: course.price,
      originalPrice: course.originalPrice,
      instructor: course.instructorName || 'Mudarris Kalaamunaa',
      lessonsCount: course.lessons.length,
      certificateFormUrl: course.certificateFormUrl || '-',
      description: course.description,
      lessons: course.lessons.map((l, idx) => ({
        id: l.id,
        order: idx + 1,
        title: l.title,
        arabicTitle: l.arabicTitle || '-',
        duration: l.duration || '15 Menit',
        youtubeUrl: l.youtubeUrl,
        quizUrl: l.quizUrl,
      })),
    },
  });
}

// ---------------- PUSH ALL CURRENT DATA TO SPREADSHEET ----------------
export async function pushAllToGoogleSheets(state: {
  users: User[];
  courses: Course[];
  orders: Order[];
  testimonials: Testimonial[];
}): Promise<boolean> {
  const { scriptUrl } = getSheetConfig();
  if (!scriptUrl) {
    throw new Error('URL Web App Google Spreadsheet belum diatur.');
  }

  const payload = {
    action: 'PUSH_ALL',
    data: {
      users: state.users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone || '-',
        createdAt: u.createdAt,
        lastActive: new Date().toISOString(),
      })),
      courses: state.courses.map((c) => ({
        idkursus: c.id,
        judulkursus: c.title,
        judularab: c.arabicTitle || '-',
        kategori: c.category || 'Kaidah Bahasa',
        tingkat: c.level || 'Pemula',
        harga: c.price || 0,
        hargaasli: c.originalPrice || c.price || 0,
        pengajar: c.instructorName || 'Mudarris Kalaamunaa',
        jumlahpelajaran: c.lessons ? c.lessons.length : 0,
        linkformsertifikat: c.certificateFormUrl || '-',
        deskripsi: c.description || '-',
        id: c.id,
        title: c.title,
        arabicTitle: c.arabicTitle || '-',
        category: c.category,
        level: c.level,
        price: c.price,
        originalPrice: c.originalPrice,
        instructor: c.instructorName || 'Mudarris Kalaamunaa',
        lessonsCount: c.lessons ? c.lessons.length : 0,
        certificateFormUrl: c.certificateFormUrl || '-',
        description: c.description,
      })),
      lessons: state.courses.flatMap((c) =>
        (c.lessons || []).map((l, idx) => ({
          idpelajaran: l.id,
          idkursus: c.id,
          urutan: idx + 1,
          judulpelajaran: l.title,
          judularab: l.arabicTitle || '-',
          durasi: l.duration || '15 Menit',
          linkyoutube: l.youtubeUrl || '',
          linkgoogleformkuis: l.quizUrl || '',
          lessonId: l.id,
          courseId: c.id,
          order: idx + 1,
          title: l.title,
          arabicTitle: l.arabicTitle || '-',
          duration: l.duration || '15 Menit',
          youtubeUrl: l.youtubeUrl || '',
          quizUrl: l.quizUrl || '',
        }))
      ),
      orders: state.orders.map((o) => ({
        idpesanan: o.id,
        namasiswa: o.studentName,
        emailsiswa: o.studentEmail,
        nowhatsapp: o.studentPhone || '-',
        daftarkursus: o.items.map((i) => `${i.title} (${i.price})`).join('; '),
        totalharga: o.totalPrice,
        status: o.status.toUpperCase(),
        tanggalpesan: o.createdAt,
        tanggalapproval: o.approvedAt || '-',
        id: o.id,
        studentName: o.studentName,
        studentEmail: o.studentEmail,
        studentPhone: o.studentPhone || '-',
        courses: o.items.map((i) => `${i.title} (${i.price})`).join('; '),
        totalPrice: o.totalPrice,
        createdAt: o.createdAt,
        approvedAt: o.approvedAt || '-',
      })),
      testimonials: state.testimonials.map((t) => ({
        id: t.id,
        namasiswa: t.name,
        namakursus: t.courseName,
        rating: t.rating,
        komentar: t.comment,
        tanggal: t.createdAt,
        name: t.name,
        courseName: t.courseName,
        comment: t.comment,
        createdAt: t.createdAt,
      })),
    },
  };

  const ok = await sendToAppsScript(payload);
  if (!ok) {
    throw new Error('Gagal mengirim data ke Google Apps Script.');
  }
  return true;
}

// ---------------- AUTO-SYNC IN BACKGROUND ----------------
export async function autoSyncToGoogleSheets(customState?: {
  users?: User[];
  courses?: Course[];
  orders?: Order[];
  testimonials?: Testimonial[];
}): Promise<boolean> {
  const { scriptUrl } = getSheetConfig();
  if (!scriptUrl) return false;

  try {
    const users = customState?.users || JSON.parse(localStorage.getItem('kalaamunaa_users') || '[]');
    const courses = customState?.courses || JSON.parse(localStorage.getItem('kalaamunaa_courses') || '[]');
    const orders = customState?.orders || JSON.parse(localStorage.getItem('kalaamunaa_orders') || '[]');
    const testimonials = customState?.testimonials || JSON.parse(localStorage.getItem('kalaamunaa_testimonials') || '[]');

    return await pushAllToGoogleSheets({ users, courses, orders, testimonials });
  } catch (err) {
    console.warn('Auto sync ke Google Sheets gagal:', err);
    return false;
  }
}

// ---------------- PULL ALL DATA FROM SPREADSHEET ----------------
export async function pullFromGoogleSheets(): Promise<{
  users: User[];
  courses: Course[];
  orders: Order[];
  testimonials: Testimonial[];
}> {
  const { scriptUrl } = getSheetConfig();
  if (!scriptUrl) {
    throw new Error('URL Web App Google Spreadsheet belum diatur.');
  }

  // Request JSON from Google Apps Script doGet endpoint
  const url = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}action=GET_ALL&t=${Date.now()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Gagal mengambil data dari Google Spreadsheet (HTTP ${res.status})`);
  }

  const json = await res.json();
  if (!json.success && !json.data) {
    throw new Error(json.message || 'Format data Google Spreadsheet tidak sesuai.');
  }

  const rawData = json.data || json;

  // 1. Users
  const parsedUsers: User[] = (rawData.users || []).map((u: any) => ({
    id: (u.id || u.ID || 'user-' + Date.now()).toString(),
    name: (u.name || u.namalengkap || u['Nama Lengkap'] || 'Peserta').toString(),
    email: (u.email || u.Email || '').toString().toLowerCase().trim(),
    role: (u.role || u.Role || 'student') as any,
    phone: (u.phone || u.nowhatsapp || u['No WhatsApp'] || '').toString() !== '-' ? (u.phone || u.nowhatsapp || u['No WhatsApp'] || '').toString() : '',
    createdAt: (u.createdAt || u.tanggaldaftar || u['Tanggal Daftar'] || new Date().toISOString()).toString(),
  })).filter((u: User) => u.email);

  // 2. Lessons group with smart column-swap resilience
  const lessonsByCourse: Record<string, Lesson[]> = {};
  (rawData.lessons || []).forEach((l: any) => {
    const rawPelajaran = (l.idpelajaran || l['ID Pelajaran'] || l.lessonId || '').toString();
    const rawKursus = (l.idkursus || l['ID Kursus'] || l.courseId || '').toString();

    let courseId = '';
    let lessonId = '';

    if (rawKursus.startsWith('course-')) {
      courseId = rawKursus;
      lessonId = rawPelajaran || ('lesson-' + Math.random().toString(36).slice(2, 8));
    } else if (rawPelajaran.startsWith('course-')) {
      courseId = rawPelajaran;
      lessonId = rawKursus || ('lesson-' + Math.random().toString(36).slice(2, 8));
    } else {
      courseId = rawKursus || rawPelajaran || '';
      lessonId = rawPelajaran || rawKursus || ('lesson-' + Math.random().toString(36).slice(2, 8));
    }

    if (!courseId) return;
    if (!lessonsByCourse[courseId]) lessonsByCourse[courseId] = [];

    const orderNum = Number(l.urutan || l['Urutan'] || l.order) || (lessonsByCourse[courseId].length + 1);
    const title = (l.judulpelajaran || l['Judul Pelajaran'] || l.title || 'Materi Pelajaran').toString();
    const rawArabic = (l.judularab || l['Judul Arab'] || l.arabicTitle || '').toString();
    const arabicTitle = rawArabic !== '-' ? rawArabic : '';
    const duration = (l.durasi || l['Durasi'] || l.duration || '15 Menit').toString();
    const youtubeUrl = (l.linkyoutube || l['Link YouTube'] || l.youtubeUrl || '').toString();
    const quizUrl = (l.linkgoogleformkuis || l['Link Google Form Kuis'] || l.quizUrl || '').toString();

    lessonsByCourse[courseId].push({
      id: lessonId,
      order: orderNum,
      title,
      arabicTitle,
      duration,
      youtubeUrl,
      quizUrl,
    });
  });

  // Sort lessons in each course by order
  Object.keys(lessonsByCourse).forEach(cId => {
    lessonsByCourse[cId].sort((a, b) => a.order - b.order);
  });

  // 3. Courses
  const rawLocal = localStorage.getItem('kalaamunaa_courses');
  const localExisting: Course[] = rawLocal ? JSON.parse(rawLocal) : [];

  const parsedCourses: Course[] = (rawData.courses || []).map((c: any) => {
    const id = (c.id || c.idkursus || c['ID Kursus'] || '').toString() || ('course-' + Date.now());
    const title = (c.title || c.judulkursus || c['Judul Kursus'] || '').toString();
    if (!title) return null as any;

    const localMatch = localExisting.find(ex => ex.id === id || ex.title.toLowerCase() === title.toLowerCase());

    const lessons = (lessonsByCourse[id] && lessonsByCourse[id].length > 0)
      ? lessonsByCourse[id]
      : (localMatch?.lessons || [
          {
            id: 'lesson-' + id + '-1',
            title: 'Pelajaran 1: Pengantar Materi',
            arabicTitle: 'الدرس الأول',
            duration: '15 Menit',
            youtubeUrl: 'https://www.youtube.com/watch?v=kYJv_i7tq-k',
            quizUrl: 'https://forms.google.com',
            order: 1,
          },
        ]);

    const arabicTitle = (c.arabicTitle || c.judularab || c['Judul Arab'] || localMatch?.arabicTitle || '').toString();
    const category = (c.category || c.kategori || c['Kategori'] || localMatch?.category || 'Kaidah Bahasa').toString();
    const level = (c.level || c.tingkat || c['Tingkat'] || localMatch?.level || 'Pemula') as any;
    const price = Number(c.price || c.harga || c['Harga'] || localMatch?.price || 0);
    const originalPrice = Number(c.originalPrice || c.hargaasli || c['Harga Asli'] || localMatch?.originalPrice || price);
    const instructorName = (c.instructor || c.pengajar || c['Pengajar'] || localMatch?.instructorName || 'Mudarris Kalaamunaa').toString();
    const certificateFormUrl = (c.certificateFormUrl || c.linkformsertifikat || c['Link Form Sertifikat'] || localMatch?.certificateFormUrl || 'https://forms.google.com').toString();
    const description = (c.description || c.deskripsi || c['Deskripsi'] || localMatch?.description || '').toString();
    const thumbnail = (c.thumbnail || c.foto || c['Thumbnail'] || localMatch?.thumbnail || 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=800&q=80').toString();

    return {
      id,
      slug: localMatch?.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title,
      arabicTitle: arabicTitle !== '-' ? arabicTitle : '',
      category,
      level,
      price,
      originalPrice,
      thumbnail,
      description: description !== '-' ? description : '',
      whatYouWillGet: localMatch?.whatYouWillGet || [
        'Memahami materi bahasa Arab terstruktur',
        'Latihan dan kuis pemahaman tiap modul',
        'Sertifikat kelulusan resmi',
      ],
      features: localMatch?.features || ['Video Interaktif', 'Kuis Per Modul', 'E-Sertifikat Resmi'],
      certificateFormUrl: certificateFormUrl !== '-' ? certificateFormUrl : 'https://forms.google.com',
      instructorName,
      status: 'published' as const,
      lessons,
    };
  }).filter((c: Course | null): c is Course => c !== null);

  // 4. Orders
  const parsedOrders: Order[] = (rawData.orders || []).map((o: any) => {
    const rawCourses = o.courses || o.daftarkursus || o['Daftar Kursus'] || o.items || '';
    const items = typeof rawCourses === 'string'
      ? rawCourses.split('; ').map((itemStr: string) => {
          const parts = itemStr.split(' (');
          return {
            courseId: 'course-' + Math.random(),
            title: parts[0] || 'Kursus',
            price: parseInt(parts[1]?.replace(')', '') || '0') || Number(o.totalPrice || o.totalharga || o['Total Harga']) || 0,
          };
        })
      : rawCourses;

    const studentEmail = (o.studentEmail || o.emailsiswa || o['Email Siswa'] || '').toString();
    const studentUser = parsedUsers.find((u) => u.email.toLowerCase() === studentEmail.toLowerCase());

    const orderId = (o.id || o.idpesanan || o['ID Pesanan'] || 'ORD-' + Math.floor(100000 + Math.random() * 900000)).toString();
    const rawStatus = (o.status || o.Status || 'PENDING').toString().toLowerCase();

    return {
      id: orderId,
      studentId: studentUser ? studentUser.id : ('user-' + studentEmail),
      studentName: (o.studentName || o.namasiswa || o['Nama Siswa'] || 'Siswa').toString(),
      studentEmail,
      studentPhone: (o.studentPhone || o.nowhatsapp || o['No WhatsApp'] || '').toString() !== '-' ? (o.studentPhone || o.nowhatsapp || o['No WhatsApp'] || '').toString() : '',
      items,
      totalPrice: Number(o.totalPrice || o.totalharga || o['Total Harga']) || 0,
      status: (rawStatus === 'approved' ? 'approved' : rawStatus === 'rejected' ? 'rejected' : 'pending') as any,
      createdAt: (o.createdAt || o.tanggalpesan || o['Tanggal Pesan'] || new Date().toISOString()).toString(),
      approvedAt: (o.approvedAt || o.tanggalapproval || o['Tanggal Approval']) !== '-' ? (o.approvedAt || o.tanggalapproval || o['Tanggal Approval']) : undefined,
    };
  }).filter((o: Order) => o.studentEmail);

  // 5. Testimonials
  const parsedTestimonials: Testimonial[] = (rawData.testimonials || []).map((t: any) => {
    const comment = (t.comment || t.komentar || t['Komentar'] || '').toString();
    if (!comment) return null as any;

    return {
      id: (t.id || t.ID || 'testi-' + Math.random()).toString(),
      name: (t.name || t.namasiswa || t['Nama Siswa'] || 'Peserta').toString(),
      courseName: (t.courseName || t.namakursus || t['Nama Kursus'] || 'Nahwu Kilat Dasar').toString(),
      rating: Number(t.rating || t.Rating) || 5,
      comment,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      createdAt: (t.createdAt || t.tanggal || t['Tanggal'] || new Date().toISOString().split('T')[0]).toString(),
    };
  }).filter((t: Testimonial | null): t is Testimonial => t !== null);

  saveSheetConfig({ lastSyncTime: new Date().toISOString() });

  return {
    users: parsedUsers,
    courses: parsedCourses,
    orders: parsedOrders,
    testimonials: parsedTestimonials,
  };
}

// Ready-to-paste Google Apps Script code for the user
export const APPS_SCRIPT_TEMPLATE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT DATABASE - KALAAMUNAA ARABIC LEARNING
 * 100% Bebas Firebase - Langsung tersimpan permanen ke Google Spreadsheet
 * =========================================================================
 * 
 * PANDUAN PENYETELAN PENTING (PASTIKAN LANGKAH 4 & 5 BENAR):
 * 1. Buka Google Spreadsheet Anda
 * 2. Klik menu 'Ekstensi' (Extensions) -> 'Apps Script'
 * 3. Hapus seluruh kode lama di editor, lalu tempel (paste) seluruh kode ini
 * 4. Klik tombol 'Terapkan' (Deploy) -> 'Deployment baru' (New deployment)
 *    (Jika sebelumnya sudah pernah deploy: pilih 'Kelola deployment' -> Edit -> Versi Baru)
 * 5. PENGATURAN WAJIB:
 *    - Jenis: 'Aplikasi Web' (Web app)
 *    - Jalankan sebagai (Execute as): 'Saya' / akun Google Anda sendiri (Me)
 *    - Yang memiliki akses (Who has access): 'Siapa saja' (Anyone)  <-- SANGAT PENTING!
 * 6. Klik 'Terapkan' (Deploy) & Izinkan Akses (Allow Access) jika diminta
 * 7. Salin URL Aplikasi Web berakhiran /exec ke web app Kalaamunaa!
 */

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    initTabsIfMissing(sheet);
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "GET_ALL";
    var payload = {};
    if (e && e.parameter) {
      if (e.parameter.data) {
        try { payload = JSON.parse(decodeURIComponent(e.parameter.data)); } catch (pErr) {}
      }
      for (var k in e.parameter) {
        if (payload[k] === undefined) payload[k] = e.parameter[k];
      }
    }
    return executeAction(sheet, action, payload);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    initTabsIfMissing(sheet);
    var contents = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    var payload = JSON.parse(contents);
    var action = payload.action;
    return executeAction(sheet, action, payload);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function executeAction(sheet, action, payload) {
  if (action === "PING") {
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Kalaamunaa API Ready" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "GET_ALL") {
    var result = {
      users: getSheetData(sheet, "Users"),
      courses: getSheetData(sheet, "Courses"),
      lessons: getSheetData(sheet, "Lessons"),
      orders: getSheetData(sheet, "Orders"),
      testimonials: getSheetData(sheet, "Testimonials")
    };
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "USER_EVENT") {
    var u = payload.user;
    if (u) {
      var usersSheet = sheet.getSheetByName("Users") || sheet.insertSheet("Users");
      usersSheet.appendRow([u.id, u.name, u.email, u.role, u.phone || "-", u.createdAt, (u.lastActive || "") + " (" + (payload.eventType || "EVENT") + ")"]);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "ORDER_EVENT") {
    var o = payload.order;
    if (o) {
      var ordersSheet = sheet.getSheetByName("Orders") || sheet.insertSheet("Orders");
      ordersSheet.appendRow([o.id, o.studentName, o.studentEmail, o.studentPhone || "-", o.courses, o.totalPrice, o.status, o.createdAt, o.approvedAt || "-"]);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "UPDATE_ORDER_STATUS") {
    var ordersSheet = sheet.getSheetByName("Orders");
    if (ordersSheet) {
      var data = ordersSheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == payload.orderId) {
          ordersSheet.getRange(i + 1, 7).setValue(payload.status);
          ordersSheet.getRange(i + 1, 9).setValue(payload.approvedAt || new Date().toISOString());
          break;
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "COURSE_EVENT") {
    var c = payload.course;
    if (c) {
      var coursesSheet = sheet.getSheetByName("Courses") || sheet.insertSheet("Courses");
      coursesSheet.appendRow([
        c.id, 
        c.title, 
        c.arabicTitle || "-", 
        c.category || "Kaidah Bahasa", 
        c.level || "Pemula", 
        c.price || 0, 
        c.originalPrice || 0, 
        c.instructor || "Mudarris Kalaamunaa", 
        c.lessonsCount || 0, 
        c.certificateFormUrl || "-", 
        c.description || "-"
      ]);
      if (c.lessons && c.lessons.length > 0) {
        var lessonsSheet = sheet.getSheetByName("Lessons") || sheet.insertSheet("Lessons");
        for (var j = 0; j < c.lessons.length; j++) {
          var l = c.lessons[j];
          lessonsSheet.appendRow([l.id, c.id, l.order, l.title, l.arabicTitle || "-", l.duration || "15 Menit", l.youtubeUrl || "", l.quizUrl || ""]);
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "PUSH_ALL") {
    var d = payload.data || payload;
    if (d.users) overwriteSheet(sheet, "Users", ["ID", "Nama Lengkap", "Email", "Role", "No WhatsApp", "Tanggal Daftar", "Terakhir Aktif"], d.users);
    if (d.courses) overwriteSheet(sheet, "Courses", ["ID Kursus", "Judul Kursus", "Judul Arab", "Kategori", "Tingkat", "Harga", "Harga Asli", "Pengajar", "Jumlah Pelajaran", "Link Form Sertifikat", "Deskripsi"], d.courses);
    if (d.lessons) overwriteSheet(sheet, "Lessons", ["ID Pelajaran", "ID Kursus", "Urutan", "Judul Pelajaran", "Judul Arab", "Durasi", "Link YouTube", "Link Google Form Kuis"], d.lessons);
    if (d.orders) overwriteSheet(sheet, "Orders", ["ID Pesanan", "Nama Siswa", "Email Siswa", "No WhatsApp", "Daftar Kursus", "Total Harga", "Status", "Tanggal Pesan", "Tanggal Approval"], d.orders);
    if (d.testimonials) overwriteSheet(sheet, "Testimonials", ["ID", "Nama Siswa", "Nama Kursus", "Rating", "Komentar", "Tanggal"], d.testimonials);
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Kalaamunaa API Ready" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function initTabsIfMissing(sheet) {
  var tabs = ["Users", "Courses", "Lessons", "Orders", "Testimonials"];
  for (var i = 0; i < tabs.length; i++) {
    if (!sheet.getSheetByName(tabs[i])) {
      var newSheet = sheet.insertSheet(tabs[i]);
      if (tabs[i] === "Users") newSheet.appendRow(["ID", "Nama Lengkap", "Email", "Role", "No WhatsApp", "Tanggal Daftar", "Terakhir Aktif"]);
      if (tabs[i] === "Courses") newSheet.appendRow(["ID Kursus", "Judul Kursus", "Judul Arab", "Kategori", "Tingkat", "Harga", "Harga Asli", "Pengajar", "Jumlah Pelajaran", "Link Form Sertifikat", "Deskripsi"]);
      if (tabs[i] === "Lessons") newSheet.appendRow(["ID Pelajaran", "ID Kursus", "Urutan", "Judul Pelajaran", "Judul Arab", "Durasi", "Link YouTube", "Link Google Form Kuis"]);
      if (tabs[i] === "Orders") newSheet.appendRow(["ID Pesanan", "Nama Siswa", "Email Siswa", "No WhatsApp", "Daftar Kursus", "Total Harga", "Status", "Tanggal Pesan", "Tanggal Approval"]);
      if (tabs[i] === "Testimonials") newSheet.appendRow(["ID", "Nama Siswa", "Nama Kursus", "Rating", "Komentar", "Tanggal"]);
    }
  }
}

function getSheetData(spreadsheet, sheetName) {
  var s = spreadsheet.getSheetByName(sheetName);
  if (!s) return [];
  var data = s.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j].toString().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
      row[key] = data[i][j];
      row[headers[j]] = data[i][j];
    }
    rows.push(row);
  }
  return rows;
}

function overwriteSheet(spreadsheet, sheetName, headers, objects) {
  var s = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
  s.clear();
  s.appendRow(headers);
  if (!objects || objects.length === 0) return;
  for (var i = 0; i < objects.length; i++) {
    var obj = objects[i];
    var row = [];
    for (var h = 0; h < headers.length; h++) {
      var headerName = headers[h];
      var cleanKey = headerName.toString().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
      var val = '';
      if (obj[headerName] !== undefined) {
        val = obj[headerName];
      } else if (obj[cleanKey] !== undefined) {
        val = obj[cleanKey];
      } else {
        // Fallbacks
        if (cleanKey === 'idkursus') val = obj.id || obj.courseId || '';
        else if (cleanKey === 'judulkursus') val = obj.title || '';
        else if (cleanKey === 'judularab') val = obj.arabicTitle || '';
        else if (cleanKey === 'kategori') val = obj.category || '';
        else if (cleanKey === 'tingkat') val = obj.level || '';
        else if (cleanKey === 'harga') val = obj.price || 0;
        else if (cleanKey === 'hargaasli') val = obj.originalPrice || 0;
        else if (cleanKey === 'pengajar') val = obj.instructor || obj.instructorName || '';
        else if (cleanKey === 'jumlahpelajaran') val = obj.lessonsCount || (obj.lessons ? obj.lessons.length : 0);
        else if (cleanKey === 'linkformsertifikat') val = obj.certificateFormUrl || '';
        else if (cleanKey === 'deskripsi') val = obj.description || '';
        else if (cleanKey === 'idpelajaran') val = obj.id || obj.lessonId || '';
        else if (cleanKey === 'urutan') val = obj.order || '';
        else if (cleanKey === 'judulpelajaran') val = obj.title || '';
        else if (cleanKey === 'durasi') val = obj.duration || '';
        else if (cleanKey === 'linkyoutube') val = obj.youtubeUrl || '';
        else if (cleanKey === 'linkgoogleformkuis') val = obj.quizUrl || '';
        else if (cleanKey === 'idpesanan') val = obj.id || '';
        else if (cleanKey === 'namasiswa') val = obj.studentName || obj.name || '';
        else if (cleanKey === 'emailsiswa') val = obj.studentEmail || obj.email || '';
        else if (cleanKey === 'nowhatsapp') val = obj.studentPhone || obj.phone || '';
        else if (cleanKey === 'daftarkursus') val = obj.courses || '';
        else if (cleanKey === 'totalharga') val = obj.totalPrice || 0;
        else if (cleanKey === 'tanggalpesan') val = obj.createdAt || '';
        else if (cleanKey === 'tanggalapproval') val = obj.approvedAt || '';
        else if (cleanKey === 'namakursus') val = obj.courseName || '';
        else if (cleanKey === 'komentar') val = obj.comment || '';
        else if (cleanKey === 'tanggal') val = obj.createdAt || '';
      }
      if (val === undefined || val === null) val = '';
      row.push(val);
    }
    s.appendRow(row);
  }
}
`;
