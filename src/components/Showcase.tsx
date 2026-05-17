import React, { useState, useEffect } from 'react';
import { Play, FileText, ExternalLink, Plus, X, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { firestoreService, ShowcaseItem } from '../lib/firestoreService';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

export default function Showcase() {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [type, setType] = useState<'video' | 'report'>('video');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, "")); // Set title to filename without extension
      
      // Auto-detect type
      if (file.type.startsWith('video/')) {
        setType('video');
      } else {
        setType('report');
      }

      // If it's a small file (like a report/image), we could convert to base64
      // But for production, we tell users to provide a stable link for large assets
      if (file.size > 1024 * 1024) {
        setError("Note: That's a large file! For the best experience, we recommend uploading to Google Drive/YouTube and pasting the link below.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || (!url && !selectedFile) || !description) {
      setError('Please provide a file or a link, and fill in the title/description.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let finalUrl = url;
      
      // Handle the file if selected and no URL provided
      if (selectedFile && !url) {
        if (selectedFile.size < 1024 * 1024) { // Under 1MB
           const reader = new FileReader();
           const base64Data = await new Promise<string>((resolve) => {
             reader.onloadend = () => resolve(reader.result as string);
             reader.readAsDataURL(selectedFile);
           });
           finalUrl = base64Data;
        } else {
          throw new Error("File too large for direct upload (>1MB). Please use a link from Google Drive or YouTube.");
        }
      }

      await firestoreService.createShowcaseItem({
        title,
        description,
        url: finalUrl,
        type,
        thumbnail: thumbnail || (type === 'video' 
          ? 'https://images.unsplash.com/photo-1492691523319-a78b40304521?auto=format&fit=crop&q=80&w=800' 
          : 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800'),
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setUrl('');
      setThumbnail('');
      setSelectedFile(null);
      setShowForm(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to share item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold mb-4 text-white">Project Showcase</h2>
          <p className="text-slate-400 leading-relaxed font-light">
            Insights from the community. Share your documentaries, research reports, or personal logs to help others 
            understand the complexity of masculinity today.
          </p>
        </div>
        
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Share Your Work
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
                    <Upload className="w-6 h-6 text-indigo-400" /> Share Project
                  </h3>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Select File from Computer</label>
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
                          {selectedFile ? selectedFile.name : "Drag & drop or click to choose file"}
                        </span>
                        {selectedFile && (
                          <span className="text-[10px] text-slate-500 mt-1">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">OR USE A LINK</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setType('video')}
                      className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                        type === 'video' ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'border-white/10 text-slate-500'
                      }`}
                    >
                      <Play className="w-6 h-6" />
                      <span className="text-xs font-bold uppercase tracking-wider">Video</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setType('report')}
                      className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                        type === 'report' ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'border-white/10 text-slate-500'
                      }`}
                    >
                      <FileText className="w-6 h-6" />
                      <span className="text-xs font-bold uppercase tracking-wider">Report</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Project Title</label>
                    <input 
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-0"
                      placeholder="e.g. Masculinity in 2024 Documentary"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Project Description</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-0 min-h-[100px]"
                      placeholder="Give a brief summary of your work..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                        <LinkIcon className="w-3 h-3" /> File Link (Primary)
                      </label>
                      <input 
                        type="url"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-indigo-500 focus:ring-0"
                        placeholder="Google Drive, YouTube, etc."
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                        <ImageIcon className="w-3 h-3" /> Thumbnail URL
                      </label>
                      <input 
                        type="url"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-indigo-500 focus:ring-0"
                        placeholder="Link to an image (Optional)"
                        value={thumbnail}
                        onChange={e => setThumbnail(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="w-full p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish to Showcase'}
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
            <p className="text-slate-500 italic font-light">No community projects shared yet. Be the first to contribute!</p>
          </div>
        ) : (
          items.map((item) => (
            <motion.div 
              layout
              key={item.id} 
              className="group glass rounded-3xl overflow-hidden transition-all hover:border-indigo-500/30"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={item.thumbnail || 'https://images.unsplash.com/photo-1492691523319-a78b40304521?auto=format&fit=crop&q=80&w=800'} 
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
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-bold leading-tight text-white">{item.title}</h3>
                  <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold py-1 px-2 glass-dark rounded-md">
                    {item.type === 'video' ? 'VIDEO' : 'REPORT'}
                  </span>
                </div>
                <p className="text-slate-400 font-light leading-relaxed line-clamp-3">
                  {item.description}
                </p>
                <div className="pt-4 flex items-center justify-between">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors group/btn"
                  >
                    {item.type === 'video' ? 'Watch Now' : 'Access File'} 
                    <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="glass p-12 text-center border-dashed">
          <p className="text-slate-500 italic font-light">More records being organized by the community...</p>
        </div>
      )}
    </div>
  );
}
