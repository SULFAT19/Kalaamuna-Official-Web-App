import React, { useState } from 'react';
import { BookOpen, Calendar, User as UserIcon, ArrowRight, X, Sparkles } from 'lucide-react';
import { AdminPost } from '../types';

interface BlogSectionProps {
  posts: AdminPost[];
}

export const BlogSection: React.FC<BlogSectionProps> = ({ posts }) => {
  const [selectedPost, setSelectedPost] = useState<AdminPost | null>(null);

  return (
    <section id="artikel" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#0047AB] text-xs font-bold tracking-wide uppercase border border-blue-100">
            <Sparkles className="w-4 h-4" />
            <span>Kabar & Edukasi</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Postingan & Wawasan dari <span className="text-[#0047AB]">Mudarris</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Tips belajar, mutiara hikmah bahasa Arab, serta pengumuman resmi terbaru dari admin Kalaamunaa.
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <img
                    src={
                      post.thumbnail ||
                      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#0047AB] text-white text-xs font-bold px-3 py-1 rounded-lg">
                    {post.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{post.createdAt}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>{post.author}</span>
                    </span>
                  </div>

                  <h3
                    onClick={() => setSelectedPost(post)}
                    className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-[#0047AB] transition-colors cursor-pointer line-clamp-2"
                  >
                    {post.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Action read more */}
              <div className="p-6 pt-0 border-t border-slate-100 mt-2">
                <button
                  onClick={() => setSelectedPost(post)}
                  className="w-full py-2 text-xs font-bold text-[#0047AB] hover:text-[#003380] flex items-center justify-between group-hover:translate-x-1 transition-transform cursor-pointer"
                >
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>

      </div>

      {/* Reading Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#0047AB]">
                {selectedPost.category}
              </span>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedPost.thumbnail && (
              <img
                src={selectedPost.thumbnail}
                alt={selectedPost.title}
                className="w-full h-56 object-cover"
              />
            )}

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-3 text-xs text-slate-400">
                <span>Tanggal: {selectedPost.createdAt}</span>
                <span>•</span>
                <span>Penulis: {selectedPost.author}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {selectedPost.title}
              </h2>

              <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed border-t border-slate-100 pt-4">
                {selectedPost.content}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-6 py-2.5 rounded-xl bg-[#0047AB] text-white text-xs font-bold"
              >
                Tutup Artikel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
