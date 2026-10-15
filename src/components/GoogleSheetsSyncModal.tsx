import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  Sparkles, 
  Link as LinkIcon, 
  HelpCircle, 
  X, 
  Activity, 
  Database,
  FileJson,
  ArrowRight
} from 'lucide-react';
import { 
  getSheetConfig, 
  saveSheetConfig, 
  pushAllToGoogleSheets, 
  pullFromGoogleSheets,
  testGoogleSheetsConnection,
  APPS_SCRIPT_TEMPLATE 
} from '../services/googleSheets';
import { 
  getUsers, 
  saveUsers, 
  getCourses, 
  saveCourses, 
  getOrders, 
  saveOrders, 
  getTestimonials, 
  saveTestimonials,
  exportFullDatabase,
  importFullDatabase
} from '../services/storage';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRefreshed: () => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  onDataRefreshed,
}) => {
  const [config, setConfig] = useState(() => getSheetConfig());
  const [scriptUrlInput, setScriptUrlInput] = useState(config.scriptUrl || '');
  const [sheetUrlInput, setSheetUrlInput] = useState(config.spreadsheetUrl || '');
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'sync' | 'setup' | 'backup' | 'code'>('sync');

  useEffect(() => {
    if (isOpen) {
      const current = getSheetConfig();
      setConfig(current);
      setScriptUrlInput(current.scriptUrl || '');
      setSheetUrlInput(current.spreadsheetUrl || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Save Config
  const handleSaveConfig = () => {
    saveSheetConfig({
      scriptUrl: scriptUrlInput.trim(),
      spreadsheetUrl: sheetUrlInput.trim(),
    });
    setConfig(getSheetConfig());
    setStatusMessage({ type: 'success', text: 'Pengaturan Google Spreadsheet berhasil disimpan!' });
  };

  // Test Connection
  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      setStatusMessage({ type: 'info', text: 'Menguji koneksi ke Google Apps Script...' });
      const res = await testGoogleSheetsConnection(scriptUrlInput.trim());
      if (res.success) {
        setConfig(getSheetConfig());
        setStatusMessage({ type: 'success', text: res.message });
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menguji koneksi.' });
    } finally {
      setTestingConnection(false);
    }
  };

  // Push all local data to sheets
  const handlePushAll = async () => {
    if (!config.scriptUrl) {
      setStatusMessage({ type: 'error', text: 'URL Web App Google Spreadsheet belum diatur. Silakan atur di tab "Panduan & Hubungkan".' });
      setActiveTab('setup');
      return;
    }

    try {
      setLoading(true);
      setStatusMessage({ type: 'info', text: 'Sedang mengirim data ke Google Spreadsheet...' });
      
      const currentState = {
        users: getUsers(),
        courses: getCourses(),
        orders: getOrders(),
        testimonials: getTestimonials(),
      };

      await pushAllToGoogleSheets(currentState);
      setConfig(getSheetConfig());
      setStatusMessage({ 
        type: 'success', 
        text: 'Alhamdulillah! Seluruh data (Siswa, Kursus, Pesanan, & Testimoni) berhasil dikirim dan tersimpan di Google Spreadsheet Anda!' 
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mengirim data ke Google Spreadsheet.' });
    } finally {
      setLoading(false);
    }
  };

  // Pull data from sheets into web app
  const handlePullAll = async () => {
    if (!config.scriptUrl) {
      setStatusMessage({ type: 'error', text: 'URL Web App Google Spreadsheet belum diatur. Silakan atur di tab "Panduan & Hubungkan".' });
      setActiveTab('setup');
      return;
    }

    try {
      setLoading(true);
      setStatusMessage({ type: 'info', text: 'Sedang menarik data terbaru dari Google Spreadsheet...' });

      const pulled = await pullFromGoogleSheets();

      if (pulled.users.length > 0) saveUsers(pulled.users);
      if (pulled.courses.length > 0) saveCourses(pulled.courses);
      if (pulled.orders.length > 0) saveOrders(pulled.orders);
      if (pulled.testimonials.length > 0) saveTestimonials(pulled.testimonials);

      setConfig(getSheetConfig());
      onDataRefreshed();
      setStatusMessage({ 
        type: 'success', 
        text: `Berhasil menarik data dari Google Spreadsheet! (${pulled.courses.length} Kursus, ${pulled.orders.length} Pesanan, ${pulled.users.length} Siswa). Web app telah diperbarui!` 
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mengambil data dari Google Spreadsheet. Pastikan URL Apps Script benar dan izin telah diatur ke Siapa saja (Anyone).' });
    } finally {
      setLoading(false);
    }
  };

  // Backup JSON download
  const handleDownloadBackup = () => {
    const backupData = exportFullDatabase();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `kalaamunaa-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setStatusMessage({ type: 'success', text: 'File cadangan (backup JSON) berhasil diunduh ke komputer Anda!' });
  };

  // Restore JSON upload
  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const ok = importFullDatabase(json);
        if (ok) {
          onDataRefreshed();
          setStatusMessage({ type: 'success', text: 'Database berhasil dipulihkan dari file JSON! Seluruh kursus & data telah diperbarui.' });
        } else {
          setStatusMessage({ type: 'error', text: 'Format file JSON cadangan tidak sesuai.' });
        }
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Gagal membaca file JSON. Pastikan file valid.' });
      }
    };
    reader.readAsText(file);
  };

  const copyScriptCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Penyimpanan Data Google Spreadsheet (Bebas Firebase)</span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight mt-0.5">
                Database & Sinkronisasi Kalaamunaa
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'sync'
                ? 'border-b-2 border-emerald-600 text-emerald-700 bg-white font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sinkronisasi Data</span>
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'setup'
                ? 'border-b-2 border-emerald-600 text-emerald-700 bg-white font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Panduan & Hubungkan</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'backup'
                ? 'border-b-2 border-emerald-600 text-emerald-700 bg-white font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Cadangan (JSON)</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'code'
                ? 'border-b-2 border-emerald-600 text-emerald-700 bg-white font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Kode Script</span>
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div className={`mx-6 mt-6 p-4 rounded-2xl text-xs flex items-center space-x-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span className="leading-relaxed">{statusMessage.text}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {activeTab === 'sync' && (
            <div className="space-y-6">
              {/* Connection Status Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">Status Database Cloud:</span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <div className={`w-3 h-3 rounded-full ${config.scriptUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                      <span className="text-sm font-bold text-slate-800">
                        {config.scriptUrl ? '🟢 Terhubung ke Google Spreadsheet' : '⚪ Belum Terhubung ke Google Spreadsheet'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {config.scriptUrl && (
                      <button
                        onClick={handleTestConnection}
                        disabled={testingConnection}
                        className="px-3.5 py-1.5 rounded-xl border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <Activity className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                        <span>{testingConnection ? 'Menguji...' : 'Tes Koneksi'}</span>
                      </button>
                    )}

                    {config.spreadsheetUrl && (
                      <a
                        href={config.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>Buka Sheet ↗</span>
                      </a>
                    )}
                  </div>
                </div>

                {!config.scriptUrl && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                    <p className="font-bold">⚠️ Mengapa kustomisasi Anda belum tersimpan di Google Drive / Perangkat Lain?</p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Saat ini, perubahan kursus, materi video YouTube, dan kuis baru tersimpan di <strong>LocalStorage (Browser laptop ini)</strong>. Agar tersimpan permanen di cloud dan bisa dibuka oleh seluruh siswa di HP/laptop mereka atau Vercel, Anda perlu menghubungkan <strong>URL Google Apps Script</strong> di tab <em>"Panduan & Hubungkan"</em>.
                    </p>
                  </div>
                )}

                {config.lastSyncTime && (
                  <p className="text-[11px] text-slate-400 border-t border-slate-200 pt-2">
                    Terakhir disinkronkan: {new Date(config.lastSyncTime).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>

              {/* Action Buttons: 2-Way Synchronization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pull from Google Sheets */}
                <div className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-500/50 bg-white space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0047AB] flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Tarik Data dari Spreadsheet (Pull)</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Mengambil pembaruan kursus baru, harga, siswa, atau data yang Anda edit langsung di spreadsheet ke web app.
                    </p>
                  </div>
                  <button
                    onClick={handlePullAll}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-[#0047AB] hover:bg-[#003380] text-white font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tarik Pembaruan Sekarang</span>
                  </button>
                </div>

                {/* Push to Google Sheets */}
                <div className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-500/50 bg-white space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Kirim Semua Data ke Spreadsheet (Push)</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Mengunggah seluruh daftar Siswa, Kursus, Materi Video, Pesanan, dan Testimoni saat ini ke Google Spreadsheet Anda.
                    </p>
                  </div>
                  <button
                    onClick={handlePushAll}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Kirim Semua Data</span>
                  </button>
                </div>
              </div>

              {/* Automatic sync notice */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p className="font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Sistem Otomatis Real-time:</span>
                </p>
                <p className="text-emerald-800 leading-relaxed text-[11px]">
                  Setiap kali ada pendaftaran siswa baru, login, pesanan checkout dari keranjang, atau admin menambah materi & approve pesanan, web app secara otomatis mengirimkan pembaruan langsung ke Google Spreadsheet Anda.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2 text-xs text-blue-900">
                <h4 className="font-bold text-sm flex items-center space-x-1.5 text-blue-950">
                  <HelpCircle className="w-4 h-4 text-[#0047AB]" />
                  <span>Langkah Cepat Menghubungkan Google Spreadsheet (Hanya 1 Menit):</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed text-slate-700">
                  <li>Buka atau buat file Google Spreadsheet baru di Google Drive Anda.</li>
                  <li>Di menu Google Spreadsheet, klik <strong>Ekstensi (Extensions) → Apps Script</strong>.</li>
                  <li>Salin kode dari tab <strong>"Kode Script"</strong> di atas, lalu tempel ke editor Apps Script.</li>
                  <li>Klik tombol biru <strong>Terapkan (Deploy) → Deployment baru (New deployment)</strong>.</li>
                  <li>Pilih jenis <strong>Aplikasi Web (Web app)</strong>, dan pada <em>"Yang memiliki akses (Who has access)"</em> pilih <strong>Siapa saja (Anyone)</strong>.</li>
                  <li>Salin <strong>URL Aplikasi Web</strong> yang dihasilkan (berakhiran <code>/exec</code>), lalu tempelkan di formulir bawah ini.</li>
                </ol>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      1. URL Web App Google Apps Script (Wajib berakhiran /exec):
                    </label>
                    <span className="text-[11px] text-emerald-700 font-semibold">Aktif untuk Semua Siswa</span>
                  </div>
                  <input
                    type="url"
                    value={scriptUrlInput}
                    onChange={(e) => setScriptUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    2. Link File Google Spreadsheet (Opsional, untuk tombol pintas buka sheet):
                  </label>
                  <input
                    type="url"
                    value={sheetUrlInput}
                    onChange={(e) => setSheetUrlInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={handleSaveConfig}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-md cursor-pointer"
                  >
                    Simpan Pengaturan Spreadsheet
                  </button>

                  <button
                    onClick={handleTestConnection}
                    disabled={testingConnection || !scriptUrlInput}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors border border-slate-300 disabled:opacity-40 cursor-pointer"
                  >
                    {testingConnection ? 'Menguji...' : 'Uji Koneksi'}
                  </button>
                </div>
              </div>

              {/* Vercel Tip */}
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Tips untuk Publikasi di Vercel:</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Agar website di Vercel otomatis memakai database Google Spreadsheet tanpa perlu konfigurasi di tiap browser pengunjung, tambahkan Environment Variable di Vercel:
                </p>
                <div className="p-2.5 bg-slate-950 rounded-xl font-mono text-[11px] text-emerald-300 space-y-1 border border-slate-800">
                  <div>VITE_GOOGLE_APPS_SCRIPT_URL = {scriptUrlInput || 'https://script.google.com/macros/s/.../exec'}</div>
                  <div>VITE_GOOGLE_SHEET_URL = {sheetUrlInput || 'https://docs.google.com/spreadsheets/d/.../edit'}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <h4 className="font-bold text-sm flex items-center space-x-1.5 text-amber-950">
                  <Database className="w-4 h-4 text-amber-700" />
                  <span>Cadangan Data Mandiri (JSON Backup & Restore):</span>
                </h4>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Jika Anda belum sempat menghubungkan Google Spreadsheet atau ingin menyimpan salinan seluruh kursus, materi video YouTube, postingan, dan testimoni ke komputer Anda, Anda dapat mengunduh file cadangan kapan saja.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Download Backup */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0047AB] flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Download Backup Database</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Unduh seluruh isi website (Kursus, Pelajaran, Kuis, Siswa, Testimoni) dalam file <code>.json</code>.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadBackup}
                    className="w-full py-2.5 rounded-xl bg-[#0047AB] hover:bg-[#003380] text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File JSON</span>
                  </button>
                </div>

                {/* Upload Backup */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Restore / Pulihkan dari File</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Pulihkan seluruh data kursus yang pernah Anda kustomisasi ke browser ini.
                    </p>
                  </div>
                  <label className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>Pilih File Backup JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleRestoreBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Kode Google Apps Script Otomatis</h4>
                  <p className="text-xs text-slate-500">
                    Salin kode ini ke menu <em>Ekstensi → Apps Script</em> pada Google Spreadsheet Anda.
                  </p>
                </div>

                <button
                  onClick={copyScriptCode}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedScript ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Kode'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-300 text-[11px] font-mono overflow-x-auto max-h-72 border border-slate-800 leading-relaxed">
                  {APPS_SCRIPT_TEMPLATE}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {config.spreadsheetUrl ? (
              <a
                href={config.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-700 hover:underline flex items-center space-x-1"
              >
                <span>Buka Google Sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span>100% Langsung Google Spreadsheet Tanpa Firebase</span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
