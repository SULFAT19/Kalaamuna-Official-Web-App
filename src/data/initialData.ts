import { Course, Testimonial, AdminPost, User } from '../types';

export const ADMIN_CREDENTIALS = {
  username: 'Mudarris Kalaamunaa',
  password: 'KaLaAmUnAa123',
  email: 'mudarris@kalaamunaa.com',
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Mudarris Kalaamunaa',
    email: 'mudarris@kalaamunaa.com',
    role: 'teacher',
    phone: '082311776535',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-student-demo',
    name: 'Ahmad Fauzan',
    email: 'ahmad.fauzan@gmail.com',
    role: 'student',
    phone: '081298765432',
    createdAt: '2026-02-15T08:00:00.000Z',
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-nahwu-dasar',
    title: 'Nahwu Kilat Dasar: Memahami Struktur Kalimat Arab & Al-Qur\'an',
    arabicTitle: 'القواعد النحوية الأساسية للمبتدئين',
    slug: 'nahwu-dasar-kilat',
    category: 'Kaidah Bahasa',
    level: 'Pemula',
    price: 199000,
    originalPrice: 350000,
    thumbnail: 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=800&q=80',
    description: 'Pelajari pondasi utama tata bahasa Arab (Nahwu) dengan metode praktis dan aplikatif. Dirancang khusus bagi pemula agar mampu membaca dan memahami kalimat dalam bahasa Arab serta teks Al-Qur\'an tanpa bingung harakat.',
    whatYouWillGet: [
      'Memahami pembagian kata dalam bahasa Arab: Isim, Fi\'il, dan Huruf.',
      'Menguasai tanda-tanda I\'rab (Rafa\', Nashab, Jar, Jazm) dengan mudah.',
      'Mampu menganalisis kalimat dasar (Jumlah Ismiyyah dan Jumlah Fi\'liyyah).',
      'Praktik langsung membaca teks gundul dan ayat-ayat pendek Al-Qur\'an.',
      'Akses ke rekaman video selamanya, kuis evaluasi berkala, dan sertifikat kelulusan resmi.'
    ],
    features: [
      '5 Modul Pelajaran Terstruktur',
      'Kuis Pemahaman Tiap Pelajaran',
      'Sertifikat Kelulusan Resmi',
      'Konsultasi Bersama Mudarris'
    ],
    certificateFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScX_sample_form_nahwu/viewform',
    status: 'published',
    instructorName: 'Ustadz Mudarris Kalaamunaa, Lc.',
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'Pelajaran 1: Pengenalan Kalam & Pembagian Kata (Isim, Fi\'il, Huruf)',
        arabicTitle: 'الدرس الأول: تعريف الكلام وأقسام الكلمة',
        duration: '15 Menit',
        youtubeUrl: 'https://www.youtube.com/watch?v=kYJv_i7tq-k',
        quizUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_quiz_nahwu_1/viewform',
        order: 1,
      },
      {
        id: 'lesson-1-2',
        title: 'Pelajaran 2: Tanda-Tanda Isim & Ciri Khas Fi\'il',
        arabicTitle: 'الدرس الثاني: علامات الاسم وعلامات الفعل',
        duration: '18 Menit',
        youtubeUrl: 'https://www.youtube.com/watch?v=FqGq86_7c5s',
        quizUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_quiz_nahwu_2/viewform',
        order: 2,
      },
      {
        id: 'lesson-1-3',
        title: 'Pelajaran 3: Mengenal I\'rab & 4 Keadaan I\'rab',
        arabicTitle: 'الدرس الثالث: الإعراب وحالاته الأربع',
        duration: '22 Menit',
        youtubeUrl: 'https://www.youtube.com/watch?v=5Vz1yQeS_mQ',
        quizUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_quiz_nahwu_3/viewform',
        order: 3,
      },
      {
        id: 'lesson-1-4',
        title: 'Pelajaran 4: Jumlah Ismiyyah (Mubtada\' dan Khabar)',
        arabicTitle: 'الدرس الرابع: الجملة الاسمية (المبتدأ والخبر)',
        duration: '20 Menit',
        youtubeUrl: 'https://www.youtube.com/watch?v=6r_3P0uVkm8',
        quizUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_quiz_nahwu_4/viewform',
        order: 4,
      },
      {
        id: 'lesson-1-5',
        title: 'Pelajaran 5: Jumlah Fi\'liyyah & Evaluasi Akhir',
        arabicTitle: 'الدرس الخامس: الجملة الفعلية والاختبار النهائي',
        duration: '25 Menit',
        youtubeUrl: 'https://www.youtube.com/watch?v=N4tL3C0x9qw',
        quizUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_quiz_nahwu_5/viewform',
        order: 5,
      },
    ],
  },
  {
    id: 'course-muhadatsah-sehari-hari',
    title: 'Muhadatsah Praktis: Percakapan Bahasa Arab Sehari-hari',
    arabicTitle: 'المحادثة اليومية الحية والمباشرة',
    slug: 'muhadatsah-praktis-harian',
    category: 'Percakapan (Kalam)',
    level: 'Pemula',
    price: 179000,
    originalPrice: 299000,
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    description: 'Tingkatkan kepercayaan diri Anda dalam berbicara bahasa Arab secara aktif. Pelajari ungkapan percakapan sehari-hari, perkenalan, aktivitas harian, di pasar, bandara, hingga kampus.',
    whatYouWillGet: [
      'Ratusan kosakata (mufrodat) paling sering digunakan dalam percakapan.',
      'Melatih intonasi dan pengucapan (makhraj) yang fasih dan alami.',
      'Percakapan praktis dalam 10 situasi kehidupan nyata.',
      'Kepercayaan diri berbicara tanpa rasa takut salah tata bahasa.',
      'Sertifikat kelulusan resmi setelah menyelesaikan seluruh tes lisan/kuis.'
    ],
    features: [
      'Dialog Video Tematik',
      'Audio & Latihan Kuis Interaktif',
      'Sertifikat Kelulusan Resmi',
      'Grup Praktik Sesama Peserta'
    ],
    certificateFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScX_sample_form_muhadatsah/viewform',
    status: 'published',
    instructorName: 'Ustadzah Sarah Al-Azhariyyah',
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'Pelajaran 1: Ta\'aruf & Menyapa Teman Baru',
        arabicTitle: 'الدرس الأول: التعارف والتحيات',
        duration: '14 Menit',
        youtubeUrl: 'https://www.youtube.com/watch?v=zpOULjyy-n8',
        quizUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_quiz_muhadatsah_1/viewform',
        order: 1,
      },
      {
        id: 'lesson-2-2',
        title: 'Pelajaran 2: Aktivitas di Rumah & Bersama Keluarga',
        arabicTitle: 'الدرس الثاني: الأنشطة المنزلية والعائلة',
        duration: '16 Menit',
        youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
        quizUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_quiz_muhadatsah_2/viewform',
        order: 2,
      },
      {
        id: 'lesson-2-3',
        title: 'Pelajaran 3: Berbelanja di Pasar & Bertransaksi',
        arabicTitle: 'الدرس الثالث: التسوق في السوق والتجارة',
        duration: '19 Menit',
        youtubeUrl: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
        quizUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_quiz_muhadatsah_3/viewform',
        order: 3,
      },
    ],
  },
  {
    id: 'course-bahasa-arab-quran',
    title: 'Bahasa Arab Qur\'ani: Menyelami Keindahan & Makna Kalamullah',
    arabicTitle: 'لغة القرآن الكريم وتذوق بلاغته',
    slug: 'bahasa-arab-qurani',
    category: 'Kajian Al-Qur\'an',
    level: 'Menengah',
    price: 249000,
    originalPrice: 400000,
    thumbnail: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80',
    description: 'Program khusus bagi Anda yang ingin merasakan kekhusyukan shalat dan tadabbur Al-Qur\'an secara mendalam dengan memahami akar kata, morfologi (Sharaf), dan gaya bahasa mukjizat Al-Qur\'an.',
    whatYouWillGet: [
      'Memahami 80% kosakata yang paling berulang di dalam Al-Qur\'an.',
      'Mengenal wazan-wazan kata kerja (fi\'il) dan maknanya dalam ayat suci.',
      'Meningkatkan kekhusyukan saat mendengarkan bacaan imam shalat.',
      'Kiat tadabbur ayat langsung dari teks aslinya tanpa ketergantungan penuh pada terjemahan.',
      'Sertifikat kelulusan resmi program Bahasa Arab Qur\'ani.'
    ],
    features: [
      'Kajian Tadabbur Ayat Pilihan',
      'Modul Kosakata Frekuensi Tinggi',
      'Kuis Pemahaman Makna',
      'Sertifikat Kelulusan Resmi'
    ],
    certificateFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScX_sample_form_quran/viewform',
    status: 'published',
    instructorName: 'Dr. Ahmad Syakir, M.A.',
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'Pelajaran 1: Mengapa Memahami Bahasa Arab Al-Qur\'an Mengubah Khusyukmu',
        arabicTitle: 'الدرس الأول: أثر فهم لغة القرآن في الخشوع',
        duration: '21 Menit',
        youtubeUrl: 'https://www.youtube.com/watch?v=09R8_2nJtjg',
        quizUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_quiz_quran_1/viewform',
        order: 1,
      },
      {
        id: 'lesson-3-2',
        title: 'Pelajaran 2: Pola Akar Kata (Trilateral Roots) & Makna Mendalam',
        arabicTitle: 'الدرس الثاني: الجذور اللغوية ومعانيها العميقة',
        duration: '24 Menit',
        youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
        quizUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_quiz_quran_2/viewform',
        order: 2,
      },
      {
        id: 'lesson-3-3',
        title: 'Pelajaran 3: Bedah Surah Al-Fatihah & Juz \'Amma Secara Bahasa',
        arabicTitle: 'الدرس الثالث: تحليل سورة الفاتحة وجزء عم لغوياً',
        duration: '28 Menit',
        youtubeUrl: 'https://www.youtube.com/watch?v=RgKAFK5djSk',
        quizUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_quiz_quran_3/viewform',
        order: 3,
      },
    ],
  },
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'testi-1',
    name: 'Muhammad Rizky Pratama',
    courseName: 'Nahwu Kilat Dasar',
    rating: 5,
    comment: 'Alhamdulillah, penjelasan dari Mudarris Kalaamunaa sangat sistematis dan mudah dicerna! Dulu saya mengira Nahwu itu rumit dan bikin pusing, tapi di Kalaamunaa step-by-step videonya jelas banget, kuisnya juga menantang. Sangat direkomendasikan untuk pemula!',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-03-01',
  },
  {
    id: 'testi-2',
    name: 'Aisyah Nurul Hikmah',
    courseName: 'Muhadatsah Praktis',
    rating: 5,
    comment: 'Masya Allah, setelah mengikuti kursus Muhadatsah, saya yang tadinya ragu dan kaku sekarang sudah berani menyusun kalimat dan menyapa dalam bahasa Arab sehari-hari. Fitur kuis per materinya benar-benar memastikan kita paham sebelum lanjut!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-03-10',
  },
  {
    id: 'testi-3',
    name: 'Fadhil Al-Ghazali',
    courseName: 'Bahasa Arab Qur\'ani',
    rating: 5,
    comment: 'Sensasi shalat berjamaah jadi jauh lebih berbeda karena mulai memahami ayat-ayat yang dibacakan imam. Terima kasih banyak admin dan pengajar Kalaamunaa yang sangat responsif di WhatsApp ketika proses approval pendaftaran!',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-03-15',
  },
  {
    id: 'testi-4',
    name: 'Nabila Azzahra',
    courseName: 'Nahwu Kilat Dasar',
    rating: 5,
    comment: 'Sistem kursusnya rapi sekali. Harus nonton video dulu, lalu kerjakan kuis, baru bisa lanjut. Bikin kita disiplin dan beneran tuntas belajarnya. Sertifikatnya juga resmi dan rapi!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-03-20',
  },
];

export const INITIAL_POSTS: AdminPost[] = [
  {
    id: 'post-1',
    title: '3 Kiat Jitu Menghafal Kosakata Bahasa Arab Tanpa Mudah Lupa',
    category: 'Tips Belajar',
    excerpt: 'Sering merasa sudah menghafal mufrodat tapi seminggu kemudian lenyap? Simak metode asosiasi visual dan repetisi berkala yang diterapkan di Kalaamunaa.',
    content: `Bahasa Arab adalah bahasa yang kaya akan makna dan derivasi (tashrif). Seringkali pembelajar merasa kesulitan karena metode menghafal kosakata yang monoton seperti menghafal kamus.

Berikut 3 kiat jitu yang diajarkan oleh tim Mudarris Kalaamunaa:
1. **Gunakan dalam Kalimat Utuh (Jumlah Mufidah)**: Jangan menghafal kata terpisah seperti "Kitabun = Buku". Lebih baik hafalkan: "Qara'tu kitaban mufidan" (Saya membaca buku yang bermanfaat).
2. **Kaitkan dengan Lawan Kata dan Persamaan Kata**: Mengaitkan antonim (Dhid) dan sinonim memperkuat jejak memori otak.
3. **Praktekkan Saat Interaksi Harian**: Gunakan kata sapaan Arab dalam obrolan bersama teman belajar di komunitas Kalaamunaa.

Semoga bermanfaat dan terus semangat menuntut ilmu bahasa Al-Qur'an!`,
    author: 'Mudarris Kalaamunaa',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-03-25',
  },
  {
    id: 'post-2',
    title: 'Mengenal Perbedaan Mendasar Jumlah Ismiyyah dan Jumlah Fi\'liyyah',
    category: 'Kaidah Nahwu',
    excerpt: 'Membedakan apakah suatu kalimat diawali oleh isim atau fi\'il adalah langkah kunci pertama dalam meng-i\'rab kalimat Arab.',
    content: `Dalam tata bahasa Arab, kalimat sempurna (Al-Jumlah Al-Mufidah) pada umumnya terbagi menjadi dua konstruksi besar:

1. **Jumlah Ismiyyah (الجملة الاسمية)**:
Kalimat yang diawali dengan Isim (kata benda / nama / sifat). Terdiri dari dua rukun utama:
- **Mubtada'**: Pokok kalimat yang berkedudukan Rafa'.
- **Khabar**: Penjelas atau pelengkap mengenai kondisi Mubtada'.
*Contoh*: "العِلْمُ نُورٌ" (Al-'ilmu nuurun - Ilmu itu cahaya).

2. **Jumlah Fi'liyyah (الجملة الفعلية)**:
Kalimat yang diawali dengan Fi'il (kata kerja). Rukun dasarnya terdiri dari:
- **Fi'il**: Kata kerja (Madhi, Mudhari', atau Amr).
- **Fa'il**: Subjek pelaku perbuatan (Rafa').
*Contoh*: "قَرَأَ مُحَمَّدٌ القُرْآنَ" (Qara'a Muhammadun al-Qur'ana - Muhammad membaca Al-Qur'an).

Dengan menguasai dua struktur ini, Anda sudah menguasai 60% pondasi membaca kitab berbahasa Arab!`,
    author: 'Mudarris Kalaamunaa',
    thumbnail: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-03-28',
  },
  {
    id: 'post-3',
    title: 'Jadwal Kelas Mentoring Interaktif Batch Mendatang Telah Dibuka!',
    category: 'Pengumuman Resmi',
    excerpt: 'Pendaftaran gelombang baru untuk kelas Nahwu Kilat dan Percakapan telah resmi dibuka. Dapatkan potongan spesial!',
    content: `Ahlan wa Sahlan Sahabat Kalaamunaa!

Alhamdulillah, pendaftaran peserta baru untuk angkatan mentoring langsung telah resmi dibuka. Seluruh peserta yang mendaftar melalui website Kalaamunaa akan mendapatkan:
- Akses penuh modul materi video rekaman berdurasi lengkap
- Kuis evaluasi otomatis di setiap bab
- Akses WhatsApp tanya-jawab langsung dengan Mudarris Kalaamunaa
- E-Sertifikat resmi setelah tuntas menyelesaikan silabus

Silakan pilih paket kursus yang Anda minati di halaman Katalog Kursus, lakukan checkout, dan konfirmasikan pesanan Anda ke WhatsApp Admin untuk proses aktivasi kilat!`,
    author: 'Mudarris Kalaamunaa',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-04-02',
  },
];
