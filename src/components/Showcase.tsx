import React, { useState, useEffect } from 'react';
import { Play, FileText, ExternalLink, Plus, X, Upload } from 'lucide-react';
import { firestoreService, ShowcaseItem } from '../lib/firestoreService';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';

export default function Showcase() {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'video' | 'report'>('video');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewItem, setPreviewItem] = useState<ShowcaseItem | null>(null);

  const { language, t } = useLanguage();

  useEffect(() => {
    const unsubscribe = firestoreService.subscribeToShowcase((newItems) => {
      setItems(newItems);
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      // Backend supports up to 100MB now
      if (file.size > 100 * 1024 * 1024) {
        setError(t('showcase.file_too_large'));
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, "")); // Set title to filename without extension
      
      if (file.type.startsWith('video/')) {
        setType('video');
      } else {
        setType('report');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError(language === 'zh' ? '请选择一个本地视频或报文章档。' : 'Please select a local file or document from your computer.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError(language === 'zh' ? '请填写标题与简介描述。' : 'Please fill in both the title and description.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Upload to node backend server instead of encoding to local Base64/Firestore!
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Backend file upload failed');
      }

      const { url } = await uploadRes.json();

      // 2. Save file url reference into Firestore
      await firestoreService.createShowcaseItem({
        title: title.trim(),
        description: description.trim(),
        url: url, // This points to server-stored static file '/uploads/...'
        type,
        thumbnail: type === 'video' 
          ? 'https://images.unsplash.com/photo-1492691523319-a78b40304521?auto=format&fit=crop&q=80&w=800' 
          : 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setShowForm(false);
    } catch (err: any) {
      console.error(err);
      let friendlyError = language === 'zh' ? '成果上传失败' : 'Failed to share item';
      friendlyError = err.message || friendlyError;
      setError(friendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold mb-4 text-white">{t('showcase.title')}</h2>
          <p className="text-slate-400 leading-relaxed font-light">
            {t('showcase.subtitle')}
          </p>
        </div>
        
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 group cursor-pointer"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          {t('showcase.add_btn')}
        </button>
      </div>

      {/* Upload/Share Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none"
            >
              <div className="glass w-full max-w-xl p-8 rounded-3xl pointer-events-auto max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Upload className="w-6 h-6 text-indigo-400" /> {t('showcase.modal_title')}
                  </h3>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 cursor-pointer">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm italic">
                      {error}
                    </div>
                  )}

                  {/* File Upload Area */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">{t('showcase.modal_file_label')}</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        accept="video/*,.pdf,.doc,.docx"
                      />
                      <div className="border-2 border-dashed border-white/10 group-hover:border-indigo-500/50 rounded-2xl p-8 flex flex-col items-center justify-center transition-all bg-white/5">
                        <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 mb-3" />
                        <span className="text-sm font-medium text-slate-300">
                          {selectedFile ? selectedFile.name : t('showcase.modal_file_desc_1')}
                        </span>
                        {selectedFile ? (
                          <span className="text-[10px] text-slate-500 mt-1">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 mt-2 text-center max-w-[280px]">
                            {t('showcase.modal_file_desc_2')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setType('video')}
                      className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 cursor-pointer ${
                        type === 'video' ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'border-white/10 text-slate-500'
                      }`}
                    >
                      <Play className="w-6 h-6" />
                      <span className="text-xs font-bold uppercase tracking-wider">{t('showcase.modal_type_video')}</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setType('report')}
                      className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 cursor-pointer ${
                        type === 'report' ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'border-white/10 text-slate-500'
                      }`}
                    >
                      <FileText className="w-6 h-6" />
                      <span className="text-xs font-bold uppercase tracking-wider">{t('showcase.modal_type_report')}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">{t('showcase.modal_title_label')}</label>
                    <input 
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-0"
                      placeholder={t('showcase.modal_title_placeholder')}
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">{t('showcase.modal_desc_label')}</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-0 min-h-[100px]"
                      placeholder={t('showcase.modal_desc_placeholder')}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="w-full p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? t('showcase.modal_publishing') : t('showcase.modal_submit')}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {items.length === 0 ? (
          <div className="col-span-full py-24 text-center glass border-dashed">
            <p className="text-slate-500 italic font-light">{t('showcase.placeholder_no_items')}</p>
          </div>
        ) : (
          items.map((item) => (
            <motion.div 
              layout
              key={item.id} 
              className="group glass rounded-3xl overflow-hidden transition-all hover:border-indigo-500/30 cursor-pointer flex flex-col justify-between"
              onClick={() => setPreviewItem(item)}
            >
              <div>
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={(item.url && item.url.startsWith('data:image/')) ? item.url : (item.thumbnail || 'https://images.unsplash.com/photo-1492691523319-a78b40304521?auto=format&fit=crop&q=80&w=800')} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 grayscale group-hover:grayscale-0" 
                    alt={item.title}
                  />
                  <div className="absolute inset-0 bg-indigo-900/20 group-hover:bg-indigo-900/40 transition-colors flex items-center justify-center">
                    {item.type === 'video' ? (
                      <div className="w-16 h-16 glass rounded-full flex items-center justify-center scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center scale-90 group-hover:scale-100 transition-transform shadow-[0_0_20px_rgba(79,70,229,0.5)]">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-8 space-y-4">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="text-2xl font-bold leading-tight text-white">{item.title}</h3>
                    <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold py-1 px-2 glass-dark rounded-md shrink-0">
                      {item.type === 'video' ? t('showcase.modal_type_video').toUpperCase() : t('showcase.modal_type_report').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-400 font-light leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="px-8 pb-8 pt-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewItem(item);
                  }}
                  className="flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors group/btn cursor-pointer"
                >
                  {item.type === 'video' ? t('showcase.watch_now') : t('showcase.access_file')} 
                  <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Media Lightbox */}
      <AnimatePresence>
        {previewItem && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewItem(null)}
              className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[110]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-[111] pointer-events-none"
            >
              <div className="glass w-full max-w-4xl p-6 rounded-3xl pointer-events-auto max-h-[90vh] flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-4">
                  <h4 className="text-xl font-bold text-white truncate pr-4">{previewItem.title}</h4>
                  <button 
                    onClick={() => setPreviewItem(null)} 
                    className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex-1 w-full flex items-center justify-center bg-black/40 rounded-2xl overflow-hidden p-4 min-h-[40vh] max-h-[60vh]">
                  {previewItem.type === 'video' ? (
                    <video 
                      src={previewItem.url} 
                      controls 
                      autoPlay 
                      className="w-full h-full max-h-[55vh] rounded-xl object-contain"
                    />
                  ) : (previewItem.url?.startsWith('data:image/') || previewItem.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                    <img 
                      src={previewItem.url} 
                      alt={previewItem.title} 
                      className="w-full h-full max-h-[55vh] rounded-xl object-contain"
                    />
                  ) : (
                    <div className="text-center space-y-6 max-w-md p-8">
                      <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto">
                        <FileText className="w-8 h-8" />
                      </div>
                      <h5 className="text-lg font-semibold text-white">{t('showcase.lightbox_secure')}</h5>
                      <p className="text-sm text-slate-400 leading-relaxed font-light">
                        {t('showcase.lightbox_secure_desc')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                  <p className="text-xs text-slate-500 italic font-mono uppercase tracking-widest">
                    Secured Database Asset
                  </p>
                  <a 
                    href={previewItem.url}
                    download={previewItem.title}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 rotate-180" /> {t('showcase.download')} {previewItem.type === 'video' ? t('showcase.modal_type_video') : t('showcase.modal_type_report')}
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {items.length > 0 && (
        <div className="glass p-12 text-center border-dashed">
          <p className="text-slate-500 italic font-light">{t('showcase.more_coming')}</p>
        </div>
      )}
    </div>
  );
}
