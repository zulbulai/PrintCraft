import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Editor } from './components/Editor';
import { TemplateGallery } from './components/TemplateGallery';
import { Shop } from './components/Shop';
import { PaperSize, Template } from './types';
import { Layout, FileText, Settings, LogIn, LogOut, User as UserIcon, Palette, Printer, ChevronLeft, ShoppingCart, ArrowUpRight, CheckCircle2, Sparkles, Globe, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [view, setView] = useState<'landing' | 'templates' | 'editor' | 'shop'>('landing');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'user',
            createdAt: serverTimestamp(),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const logout = () => signOut(auth);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setPaperSize(template.paperSize);
    setOrientation(template.orientation);
    setView('editor');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
          <Printer className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
        </div>
      </div>
    );
  }

  if (view === 'editor') {
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setView('templates')}
              className="p-2.5 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                <Printer size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight font-display">PrintCraft <span className="text-indigo-600">Pro</span></span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Editing</span>
              <span className="text-sm font-bold text-slate-700">{selectedTemplate?.name || 'Untitled Design'}</span>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={paperSize} 
                onChange={(e) => setPaperSize(e.target.value as PaperSize)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              >
                <option value="A4">A4 Paper</option>
                <option value="A5">A5 Paper</option>
                <option value="Letter">Letter</option>
                <option value="Legal">Legal</option>
              </select>
              <select 
                value={orientation} 
                onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            <div className="w-px h-8 bg-slate-100 mx-2" />
            {user ? (
              <div className="flex items-center gap-3">
                <img src={user.photoURL || ''} className="w-9 h-9 rounded-full border-2 border-white shadow-md" alt="" />
                <button onClick={logout} className="p-2 hover:bg-red-50 rounded-xl transition-colors text-slate-400 hover:text-red-500">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button onClick={login} className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all">Sign In</button>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-hidden">
          <Editor 
            paperSize={paperSize} 
            orientation={orientation} 
            initialData={selectedTemplate?.canvasData} 
          />
        </main>
      </div>
    );
  }

  if (view === 'shop') {
    return (
      <div className="min-h-screen bg-white">
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setView('landing')}
                className="p-2.5 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                  <Printer size={20} />
                </div>
                <span className="text-xl font-bold tracking-tight font-display">PrintCraft <span className="text-indigo-600">Pro</span></span>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <button onClick={() => setView('templates')} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Templates</button>
              {user ? (
                <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                  <img src={user.photoURL || ''} className="w-9 h-9 rounded-full border-2 border-white shadow-md" alt="" />
                  <button onClick={logout} className="p-2 hover:bg-red-50 rounded-xl transition-colors text-slate-400 hover:text-red-500">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button onClick={login} className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all">Sign In</button>
              )}
            </div>
          </div>
        </nav>
        <Shop />
      </div>
    );
  }

  if (view === 'templates') {
    return (
      <div className="min-h-screen bg-white">
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                <Printer size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight font-display">PrintCraft <span className="text-indigo-600">Pro</span></span>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => setView('shop')} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-black uppercase tracking-widest hover:bg-indigo-100 transition-all active:scale-95">
                <ShoppingCart size={18} />
                Marketplace
              </button>
              <button 
                onClick={() => {
                  setSelectedTemplate(null);
                  setView('editor');
                }}
                className="px-8 py-2.5 bg-slate-900 text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
              >
                Blank Design
              </button>
              {user && (
                <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                  <img src={user.photoURL || ''} className="w-9 h-9 rounded-full border-2 border-white shadow-md" alt="" />
                </div>
              )}
            </div>
          </div>
        </nav>
        <TemplateGallery onSelect={handleTemplateSelect} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Premium Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setView('landing')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
              <Printer size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight font-display">PrintCraft <span className="text-indigo-600">Pro</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setView('templates')} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Templates</button>
            <button onClick={() => setView('shop')} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Marketplace</button>
            <a href="#" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-none mb-1">{user.displayName?.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Pro Member</p>
                </div>
                <img src={user.photoURL || ''} className="w-9 h-9 rounded-full border-2 border-white shadow-sm" alt="" />
                <button onClick={logout} className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-red-500">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={login}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all hover:shadow-lg active:scale-95"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Split Layout */}
      <main className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <motion.div 
              className="lg:col-span-7"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                <Sparkles size={12} />
                The Future of Print Design
              </div>
              <h1 className="text-7xl md:text-8xl font-bold tracking-tight leading-[0.85] mb-8 font-display text-slate-900">
                Design for <br />
                <span className="text-indigo-600">Precision.</span> <br />
                Print for <br />
                <span className="italic font-light text-slate-400">Perfection.</span>
              </h1>
              <p className="text-xl text-slate-500 mb-12 max-w-xl leading-relaxed font-medium">
                The most advanced layout engine for educational and professional printing. Create exam papers, ruled sheets, and business forms with pixel-perfect accuracy.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setView('templates')}
                  className="group px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center gap-3"
                >
                  Start Designing
                  <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
                <button 
                  onClick={() => setView('shop')}
                  className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-bold text-lg hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  Explore Assets
                </button>
              </div>
              
              <div className="mt-16 flex items-center gap-12">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                    +2k
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-100" />
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  Trusted by <span className="text-slate-900">500+ Schools</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="lg:col-span-5 relative"
              initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            >
              <div className="relative z-10 aspect-[4/5] bg-slate-900 rounded-[48px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[12px] border-white">
                <img 
                  src="https://picsum.photos/seed/printpro/800/1000" 
                  alt="App Preview" 
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/40 to-transparent mix-blend-overlay" />
                
                {/* Floating UI Elements */}
                <div className="absolute top-8 right-8 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl animate-bounce-slow">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Status</p>
                      <p className="text-xs font-bold text-white">Print Ready</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/95 backdrop-blur rounded-3xl shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Editor</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                      <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Mathematics Exam</h3>
                      <p className="text-sm text-slate-500">A4 • Portrait • 300 DPI</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                      <Palette size={24} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Background Glows */}
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-200 rounded-full blur-[100px] opacity-50 -z-10" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-100 rounded-full blur-[100px] opacity-50 -z-10" />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Stats Section */}
      <section className="py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Templates", value: "500+" },
              { label: "Active Users", value: "12k" },
              { label: "Prints Made", value: "1.2M" },
              { label: "Support", value: "24/7" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-bold text-slate-900 mb-2 font-display">{stat.value}</p>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Bento Grid Style */}
      <section className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-20">
            <h2 className="text-5xl font-bold tracking-tight mb-6 font-display text-slate-900">Engineered for <br /><span className="text-indigo-600">Print Excellence.</span></h2>
            <p className="text-xl text-slate-500 leading-relaxed font-medium">We've obsessed over every detail of the printing process so you don't have to. From bleed margins to ink density, we've got you covered.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-12 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Globe className="text-indigo-600" size={32} />
              </div>
              <h3 className="text-3xl font-bold mb-4 font-display">Global Standards</h3>
              <p className="text-lg text-slate-500 leading-relaxed max-w-md">Support for A4, A5, Letter, Legal, and custom sizes. Automatically adjusts margins based on international printing standards.</p>
              <div className="mt-12 flex gap-4">
                <div className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600">ISO 216</div>
                <div className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600">ANSI Support</div>
                <div className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600">Custom Bleed</div>
              </div>
            </div>
            
            <div className="bg-indigo-600 p-12 rounded-[40px] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-3xl font-bold mb-4 font-display">Secure Cloud</h3>
                <p className="text-lg text-indigo-100 leading-relaxed">Your designs are encrypted and synced across all your devices. Never lose a template again.</p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            </div>

            <div className="bg-white p-12 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Zap className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-3xl font-bold mb-4 font-display">Instant PDF</h3>
              <p className="text-lg text-slate-500 leading-relaxed">Export high-resolution 300 DPI PDFs ready for professional offset or home inkjet printing.</p>
            </div>

            <div className="md:col-span-2 bg-slate-900 p-12 rounded-[40px] text-white overflow-hidden relative group">
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-bold mb-4 font-display">Smart Layouts</h3>
                  <p className="text-lg text-slate-400 leading-relaxed">Our AI-assisted layout engine suggests the best spacing and font sizes for maximum legibility.</p>
                  <button onClick={() => setView('templates')} className="mt-8 flex items-center gap-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                    Browse Templates <ArrowUpRight size={18} />
                  </button>
                </div>
                <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-indigo-500"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${30 + i * 20}%` }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Shop CTA */}
      <section className="py-32 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-indigo-600 rounded-[60px] p-16 md:p-24 relative overflow-hidden">
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                  <ShoppingCart size={12} />
                  Design Marketplace
                </div>
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-[0.9] font-display">
                  Unlock the <br />
                  <span className="italic font-light opacity-60">Full Potential.</span>
                </h2>
                <p className="text-xl text-indigo-100 mb-12 leading-relaxed max-w-md font-medium">
                  Get access to exclusive template packs, high-resolution specialty papers, and custom design services.
                </p>
                <button 
                  onClick={() => setView('shop')}
                  className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-xl hover:bg-indigo-50 transition-all shadow-2xl hover:-translate-y-1 active:scale-95"
                >
                  Visit Marketplace
                </button>
              </div>
              
              <div className="relative">
                <div className="grid grid-cols-2 gap-6">
                  <motion.img 
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    src="https://picsum.photos/seed/shop1/400/400" 
                    className="rounded-[32px] shadow-2xl border-4 border-white/20" 
                    alt="" referrerPolicy="no-referrer" 
                  />
                  <motion.img 
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    src="https://picsum.photos/seed/shop2/400/400" 
                    className="rounded-[32px] shadow-2xl border-4 border-white/20 mt-12" 
                    alt="" referrerPolicy="no-referrer" 
                  />
                </div>
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-900/20 rounded-full blur-2xl" />
              </div>
            </div>
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-white pt-32 pb-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                  <Printer size={18} />
                </div>
                <span className="text-xl font-bold tracking-tight font-display">PrintCraft <span className="text-indigo-600">Pro</span></span>
              </div>
              <p className="text-slate-500 max-w-xs leading-relaxed font-medium">
                The world's most advanced layout engine for educational and professional printing.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Product</h4>
              <ul className="space-y-4">
                <li><button onClick={() => setView('templates')} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Templates</button></li>
                <li><button onClick={() => setView('shop')} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Marketplace</button></li>
                <li><a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">About</a></li>
                <li><a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Privacy</a></li>
                <li><a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-slate-100 gap-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2026 PrintCraft Pro. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <Globe size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <ShieldCheck size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
