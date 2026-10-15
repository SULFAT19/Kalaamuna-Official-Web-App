import React from 'react';
import { Star, MessageSquareQuote, CheckCircle, Sparkles } from 'lucide-react';
import { Testimonial } from '../types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  return (
    <section id="testimoni" className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-[#0047AB] text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Pengalaman Belajar Nyata</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Apa Kata Para Peserta <span className="text-[#0047AB]">Kalaamunaa</span>?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Simak testimoni dan kesan dari para pembelajar yang telah membuktikan kemudahan sistem pembelajaran terstruktur kami.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testi) => (
            <div
              key={testi.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Star rating and quote icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testi.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <MessageSquareQuote className="w-6 h-6 text-blue-200 group-hover:text-[#0047AB] transition-colors" />
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed line-clamp-6">
                  "{testi.comment}"
                </p>
              </div>

              {/* Author info */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center space-x-3">
                <img
                  src={
                    testi.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={testi.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {testi.name}
                  </h4>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                    <p className="text-[11px] text-[#0047AB] font-semibold truncate">
                      {testi.courseName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
