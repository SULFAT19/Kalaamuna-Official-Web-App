import React, { useState } from 'react';
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
  Play
} from 'lucide-react';
import { 
  getSheetConfig, 
  saveSheetConfig, 
  pushAllToGoogleSheets, 
  pullFromGoogleSheets,
  APPS_SCRIPT_TEMPLATE 
} from '../services/googleSheets';
import { getUsers, saveUsers, getCourses, saveCourses, getOrders, saveOrders, getTestimonials, saveTestimonials } from '../services/storage';

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
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'sync' | 'setup' | 'code'>('sync');

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
                <span>100% Pure Google Spreadsheet (Tanpa Firebase)</span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight mt-0.5">
                Integrasi Google Spreadsheet
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
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'code'
                ? 'border-b-2 border-emerald-600 text-emerald-700 bg-white font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Kode Apps Script</span>
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
                    <span className="text-xs font-semibold text-slate-500">Status Koneksi:</span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <div className={`w-3 h-3 rounded-full ${config.scriptUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                      <span className="text-sm font-bold text-slate-800">
                        {config.scriptUrl ? '🟢 Terhubung ke Google Spreadsheet' : '⚪ Belum Terhubung (Masukkan URL Script)'}
                      </span>
                    </div>
                  </div>

                  {config.spreadsheetUrl && (
                    <a
                      href={config.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors self-start"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Buka File Spreadsheet ↗</span>
                    </a>
                  )}
                </div>

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
                      Mengunggah seluruh daftar Siswa, Kursus, Materi Video, Pesanan, dan Testimoni saat ini ke Google Spreadsheet.
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
                  Setiap kali ada pendaftaran siswa baru, login, pesanan checkout dari keranjang, atau admin approve pesanan, web app secara otomatis mengirimkan baris baru ke Google Spreadsheet Anda tanpa perantara pihak ketiga.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2 text-xs text-blue-900">
                <h4 className="font-bold text-sm flex items-center space-x-1.5 text-blue-950">
                  <HelpCircle className="w-4 h-4 text-[#0047AB]" />
                  <span>Langkah Cepat Menghubungkan Google Spreadsheet (1 Menit):</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed text-slate-700">
                  <li>Buka atau buat file Google Spreadsheet baru di Google Drive Anda.</li>
                  <li>Di menu Google Spreadsheet, klik <strong>Ekstensi (Extensions) → Apps Script</strong>.</li>
                  <li>Salin kode dari tab <strong>"Kode Apps Script"</strong> di atas, lalu tempel ke editor Apps Script.</li>
                  <li>Klik tombol biru <strong>Terapkan (Deploy) → Deployment baru (New deployment)</strong>.</li>
                  <li>Pilih jenis <strong>Aplikasi Web (Web app)</strong>, dan pada <em>"Yang memiliki akses (Who has access)"</em> pilih <strong>Siapa saja (Anyone)</strong>.</li>
                  <li>Salin <strong>URL Aplikasi Web</strong> yang dihasilkan (berakhiran <code>/exec</code>), lalu tempelkan di bawah ini.</li>
                </ol>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    1. URL Web App Google Apps Script (Wajib untuk Simpan & Tarik Data):
                  </label>
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
                    2. Link Google Spreadsheet (Opsional, untuk tombol pintas buka sheet):
                  </label>
                  <input
                    type="url"
                    value={sheetUrlInput}
                    onChange={(e) => setSheetUrlInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <button
                  onClick={handleSaveConfig}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-md"
                >
                  Simpan Pengaturan Spreadsheet
                </button>
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
            className="px-6 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
