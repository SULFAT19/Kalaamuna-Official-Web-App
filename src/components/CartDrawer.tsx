import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { CartItem, User, Order } from '../types';
import { formatRupiah, createOrder, generateWhatsAppOrderUrl } from '../services/storage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currentUser: User | null;
  onRemoveItem: (courseId: string) => void;
  onOrderPlaced: (newOrder: Order) => void;
  onRequireLogin: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  currentUser,
  onRemoveItem,
  onOrderPlaced,
  onRequireLogin,
}) => {
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string>('');

  if (!isOpen) return null;

  const total = cart.reduce((acc, curr) => acc + curr.price, 0);

  const handleCheckout = () => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    if (cart.length === 0) return;

    // Create the order
    const order = createOrder(currentUser, cart);
    const waUrl = generateWhatsAppOrderUrl(currentUser.name, order.items, order.totalPrice);
    
    setCreatedOrder(order);
    setWhatsAppUrl(waUrl);
    onOrderPlaced(order);
  };

  const handleResetAndClose = () => {
    setCreatedOrder(null);
    setWhatsAppUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#0047AB]" />
              <h2 className="text-lg font-bold text-slate-900">Keranjang Belanja</h2>
              {cart.length > 0 && !createdOrder && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#0047AB]">
                  {cart.length}
                </span>
              )}
            </div>
            <button
              onClick={handleResetAndClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {createdOrder ? (
              // Order Successful state with WhatsApp CTA
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-9 h-9" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-slate-900">Pesanan Berhasil Dibuat!</h3>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Kode Pesanan: <span className="text-[#0047AB]">{createdOrder.id}</span>
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Pesanan Anda telah dicatat ke dasbor admin dengan status{' '}
                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      Menunggu Approval
                    </span>.
                  </p>
                </div>

                {/* Important notice required by prompt */}
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-left space-y-2 text-xs text-amber-900">
                  <div className="flex items-center space-x-2 font-bold text-amber-800">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Perhatian Akses Kursus:</span>
                  </div>
                  <p className="leading-relaxed">
                    Kursus tidak dapat dijalankan kecuali telah mendapatkan <strong>approval dari Admin</strong>. 
                    Silakan klik tombol WhatsApp di bawah untuk konfirmasi pendaftaran ke nomor <strong>6282311776535</strong>.
                  </p>
                </div>

                {/* Order Summary details */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-xs">
                  <span className="font-bold text-slate-700 block border-b border-slate-200 pb-1.5">
                    Rincian Kursus:
                  </span>
                  {createdOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600">
                      <span className="truncate max-w-[220px]">{item.title}</span>
                      <span className="font-semibold text-slate-900">{formatRupiah(item.price)}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-[#0047AB]">
                    <span>Total Pembayaran</span>
                    <span>{formatRupiah(createdOrder.totalPrice)}</span>
                  </div>
                </div>

                {/* Direct WhatsApp Button */}
                <div className="space-y-3 pt-2">
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Kirim Pesan Konfirmasi ke WhatsApp</span>
                  </a>

                  <p className="text-[11px] text-slate-400">
                    Pesan otomatis telah disiapkan sesuai pesanan Anda.
                  </p>

                  <button
                    onClick={handleResetAndClose}
                    className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                  >
                    Tutup & Lihat Status di Kursus Saya
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              // Empty cart
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800">Keranjang Belanja Kosong</h4>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Anda belum memilih kursus apa pun. Silakan lihat katalog kursus kami dan pilih program yang diminati.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#0047AB] text-white text-xs font-bold hover:bg-[#003380]"
                >
                  Jelajahi Kursus
                </button>
              </div>
            ) : (
              // Cart items list
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.courseId}
                    className="flex items-center space-x-3 p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                      {item.arabicTitle && (
                        <p className="text-[11px] font-arabic text-amber-700 truncate">{item.arabicTitle}</p>
                      )}
                      <p className="text-sm font-extrabold text-[#0047AB] mt-1">
                        {formatRupiah(item.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.courseId)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Hapus dari keranjang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {!currentUser && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-[#0047AB] shrink-0 mt-0.5" />
                    <p>
                      Silakan masuk atau daftar terlebih dahulu agar pesanan kursus Anda terhubung ke akun Anda.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Checkout Bar */}
          {!createdOrder && cart.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Total ({cart.length} Kursus):</span>
                <span className="text-2xl font-black text-[#0047AB]">{formatRupiah(total)}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-4 rounded-xl bg-[#0047AB] hover:bg-[#003380] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Checkout & Lanjut ke WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-slate-400">
                Setelah checkout, Anda akan langsung diarahkan ke WhatsApp Admin 6282311776535 untuk approval kursus.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
