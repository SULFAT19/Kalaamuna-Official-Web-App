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
      })),
      courses: state.courses.map((c) => ({
        id: c.id,
        title: c.title,
        arabicTitle: c.arabicTitle,
        category: c.category,
        level: c.level,
        price: c.price,
        originalPrice: c.originalPrice,
        instructor: c.instructorName || 'Mudarris Kalaamunaa',
        lessonsCount: c.lessons.length,
        certificateFormUrl: c.certificateFormUrl || '-',
        description: c.description,
      })),
      lessons: state.courses.flatMap((c) =>
        c.lessons.map((l, idx) => ({
          courseId: c.id,
          lessonId: l.id,
          order: idx + 1,
          title: l.title,
          arabicTitle: l.arabicTitle || '-',
          duration: l.duration || '15 Menit',
          youtubeUrl: l.youtubeUrl,
          quizUrl: l.quizUrl,
        }))
      ),
      orders: state.orders.map((o) => ({
        id: o.id,
        studentName: o.studentName,
        studentEmail: o.studentEmail,
        studentPhone: o.studentPhone || '-',
        courses: o.items.map((i) => `${i.title} (${i.price})`).join('; '),
        totalPrice: o.totalPrice,
        status: o.status.toUpperCase(),
        createdAt: o.createdAt,
        approvedAt: o.approvedAt || '-',
      })),
      testimonials: state.testimonials.map((t) => ({
        id: t.id,
        name: t.name,
        courseName: t.courseName,
        rating: t.rating,
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
    id: u.id || 'user-' + Date.now(),
    name: u.name || 'Peserta',
    email: u.email || '',
    role: u.role || 'student',
    phone: u.phone !== '-' ? u.phone : '',
    createdAt: u.createdAt || new Date().toISOString(),
  })).filter((u: User) => u.email);

  // 2. Lessons group
  const lessonsByCourse: Record<string, Lesson[]> = {};
  (rawData.lessons || []).forEach((l: any) => {
    const courseId = l.courseId || '';
    if (!lessonsByCourse[courseId]) lessonsByCourse[courseId] = [];
    lessonsByCourse[courseId].push({
      id: l.lessonId || l.id || 'lesson-' + Math.random(),
      order: Number(l.order) || lessonsByCourse[courseId].length + 1,
      title: l.title || 'Materi Pelajaran',
      arabicTitle: l.arabicTitle !== '-' ? l.arabicTitle : '',
      duration: l.duration || '15 Menit',
      youtubeUrl: l.youtubeUrl || '',
      quizUrl: l.quizUrl || '',
    });
  });

  // 3. Courses
  const parsedCourses: Course[] = (rawData.courses || []).map((c: any) => {
    const id = c.id || 'course-' + Date.now();
    const title = c.title || 'Kursus Bahasa Arab';
    const lessons = lessonsByCourse[id] || [
      {
        id: 'lesson-' + id + '-1',
        title: 'Pelajaran 1: Pengantar Materi',
        arabicTitle: 'الدرس الأول',
        duration: '15 Menit',
        youtubeUrl: 'https://www.youtube.com/watch?v=kYJv_i7tq-k',
        quizUrl: 'https://forms.google.com',
        order: 1,
      },
    ];

    return {
      id,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title,
      arabicTitle: c.arabicTitle || '',
      category: c.category || 'Kaidah Bahasa',
      level: c.level || 'Pemula',
      price: Number(c.price) || 0,
      originalPrice: Number(c.originalPrice) || Number(c.price) || 0,
      thumbnail: 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=800&q=80',
      description: c.description || '',
      whatYouWillGet: [
        'Memahami materi bahasa Arab terstruktur',
        'Latihan dan kuis pemahaman tiap modul',
        'Sertifikat kelulusan resmi',
      ],
      features: ['Video Interaktif', 'Kuis Per Modul', 'E-Sertifikat Resmi'],
      certificateFormUrl: c.certificateFormUrl !== '-' ? c.certificateFormUrl : 'https://forms.google.com',
      instructorName: c.instructor || 'Mudarris Kalaamunaa',
      status: 'published' as const,
      lessons,
    };
  }).filter((c: Course) => c.title);

  // 4. Orders
  const parsedOrders: Order[] = (rawData.orders || []).map((o: any) => {
    const rawCourses = o.courses || o.items || '';
    const items = typeof rawCourses === 'string'
      ? rawCourses.split('; ').map((itemStr: string) => {
          const parts = itemStr.split(' (');
          return {
            courseId: 'course-' + Math.random(),
            title: parts[0] || 'Kursus',
            price: parseInt(parts[1]?.replace(')', '') || '0') || Number(o.totalPrice) || 0,
          };
        })
      : rawCourses;

    const studentUser = parsedUsers.find((u) => u.email.toLowerCase() === (o.studentEmail || '').toLowerCase());

    return {
      id: o.id || 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      studentId: studentUser ? studentUser.id : 'user-' + o.studentEmail,
      studentName: o.studentName || 'Siswa',
      studentEmail: o.studentEmail || '',
      studentPhone: o.studentPhone !== '-' ? o.studentPhone : '',
      items,
      totalPrice: Number(o.totalPrice) || 0,
      status: (o.status || 'PENDING').toLowerCase() as any,
      createdAt: o.createdAt || new Date().toISOString(),
      approvedAt: o.approvedAt !== '-' ? o.approvedAt : undefined,
    };
  }).filter((o: Order) => o.studentEmail);

  // 5. Testimonials
  const parsedTestimonials: Testimonial[] = (rawData.testimonials || []).map((t: any) => ({
    id: t.id || 'testi-' + Math.random(),
    name: t.name || 'Peserta',
    courseName: t.courseName || 'Nahwu Kilat Dasar',
    rating: Number(t.rating) || 5,
    comment: t.comment || '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    createdAt: t.createdAt || new Date().toISOString().split('T')[0],
  })).filter((t: Testimonial) => t.comment);

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
 * Google Apps Script untuk Kalaamunaa Arabic Learning
 * 100% Bebas Firebase - Langsung tersimpan ke Google Spreadsheet
 * 
 * Cara Pasang:
 * 1. Buka Google Spreadsheet Anda
 * 2. Klik menu 'Ekstensi' (Extensions) -> 'Apps Script'
 * 3. Hapus semua kode yang ada, lalu tempel (paste) seluruh kode ini
 * 4. Klik tombol 'Terapkan' (Deploy) -> 'Deployment baru' (New deployment)
 * 5. Pilih jenis: 'Aplikasi Web' (Web app)
 * 6. Pada 'Yang memiliki akses' (Who has access), pilih: 'Siapa saja' (Anyone)
 * 7. Klik 'Terapkan' (Deploy), lalu salin URL Aplikasi Web (contoh: https://script.google.com/macros/s/.../exec)
 * 8. Tempelkan URL tersebut ke web app Kalaamunaa pada menu Sinkronisasi Spreadsheet!
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "GET_ALL";
  
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
  
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Kalaamunaa API Ready" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;

    // Inisialisasi tab jika belum ada
    initTabsIfMissing(sheet);

    if (action === "USER_EVENT") {
      var u = payload.user;
      var usersSheet = sheet.getSheetByName("Users");
      usersSheet.appendRow([u.id, u.name, u.email, u.role, u.phone, u.createdAt, u.lastActive + " (" + payload.eventType + ")"]);
    } 
    else if (action === "ORDER_EVENT") {
      var o = payload.order;
      var ordersSheet = sheet.getSheetByName("Orders");
      ordersSheet.appendRow([o.id, o.studentName, o.studentEmail, o.studentPhone, o.courses, o.totalPrice, o.status, o.createdAt, o.approvedAt]);
    }
    else if (action === "UPDATE_ORDER_STATUS") {
      var ordersSheet = sheet.getSheetByName("Orders");
      var data = ordersSheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == payload.orderId) {
          ordersSheet.getRange(i + 1, 7).setValue(payload.status);
          ordersSheet.getRange(i + 1, 9).setValue(payload.approvedAt);
          break;
        }
      }
    }
    else if (action === "COURSE_EVENT") {
      var c = payload.course;
      var coursesSheet = sheet.getSheetByName("Courses");
      coursesSheet.appendRow([c.id, c.title, c.arabicTitle, c.category, c.level, c.price, c.originalPrice, c.instructor, c.lessonsCount, c.certificateFormUrl, c.description]);
      
      if (c.lessons && c.lessons.length > 0) {
        var lessonsSheet = sheet.getSheetByName("Lessons");
        for (var j = 0; j < c.lessons.length; j++) {
          var l = c.lessons[j];
          lessonsSheet.appendRow([l.id, c.id, l.order, l.title, l.arabicTitle, l.duration, l.youtubeUrl, l.quizUrl]);
        }
      }
    }
    else if (action === "PUSH_ALL") {
      var d = payload.data;
      if (d.users) overwriteSheet(sheet, "Users", ["ID", "Nama Lengkap", "Email", "Role", "No WhatsApp", "Tanggal Daftar", "Terakhir Aktif"], d.users);
      if (d.courses) overwriteSheet(sheet, "Courses", ["ID Kursus", "Judul Kursus", "Judul Arab", "Kategori", "Tingkat", "Harga", "Harga Asli", "Pengajar", "Jumlah Pelajaran", "Link Form Sertifikat", "Deskripsi"], d.courses);
      if (d.lessons) overwriteSheet(sheet, "Lessons", ["ID Pelajaran", "ID Kursus", "Urutan", "Judul Pelajaran", "Judul Arab", "Durasi", "Link YouTube", "Link Google Form Kuis"], d.lessons);
      if (d.orders) overwriteSheet(sheet, "Orders", ["ID Pesanan", "Nama Siswa", "Email Siswa", "No WhatsApp", "Daftar Kursus", "Total Harga", "Status", "Tanggal Pesan", "Tanggal Approval"], d.orders);
      if (d.testimonials) overwriteSheet(sheet, "Testimonials", ["ID", "Nama Siswa", "Nama Kursus", "Rating", "Komentar", "Tanggal"], d.testimonials);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
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
  for (var i = 0; i < objects.length; i++) {
    var vals = Object.values(objects[i]);
    s.appendRow(vals);
  }
}
`;
