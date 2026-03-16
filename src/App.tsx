import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Editor } from './components/Editor';
import { TemplateGallery } from './components/TemplateGallery';
import { PaperSize, Template } from './types';
import { Layout, FileText, Settings, LogIn, LogOut, User as UserIcon, Palette, Printer, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [view, setView] = useState<'landing' | 'templates' | 'editor'>('landing');
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
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (view === 'editor') {
    return (
      <div className="h-screen flex flex-col">
        <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('templates')}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
              <Printer className="text-indigo-600" size={24} />
              <h1 className="text-lg font-bold tracking-tight">PrintCraft Pro</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-4">
              Editing: {selectedTemplate?.name || 'Untitled Design'}
            </div>
            <select 
              value={paperSize} 
              onChange={(e) => setPaperSize(e.target.value as PaperSize)}
              className="bg-slate-50 border rounded-md px-3 py-1.5 text-sm font-medium"
            >
              <option value="A4">A4 Paper</option>
              <option value="A5">A5 Paper</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
            <select 
              value={orientation} 
              onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
              className="bg-slate-50 border rounded-md px-3 py-1.5 text-sm font-medium"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
            <div className="w-px h-6 bg-slate-200" />
            {user ? (
              <div className="flex items-center gap-2">
                <img src={user.photoURL || ''} className="w-8 h-8 rounded-full border" alt="" />
                <button onClick={logout} className="text-sm font-medium text-slate-600 hover:text-slate-900">Sign Out</button>
              </div>
            ) : (
              <button onClick={login} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Sign In</button>
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

  if (view === 'templates') {
    return (
      <div className="min-h-screen bg-white">
        <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <Printer className="text-indigo-600" size={32} />
            <span className="text-2xl font-bold tracking-tighter">PrintCraft Pro</span>
          </div>
          <button 
            onClick={() => {
              setSelectedTemplate(null);
              setView('editor');
            }}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
          >
            Create Blank Design
          </button>
        </nav>
        <TemplateGallery onSelect={handleTemplateSelect} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Printer className="text-indigo-600" size={32} />
          <span className="text-2xl font-bold tracking-tighter">PrintCraft Pro</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900">Templates</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900">Pricing</a>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-900">Hi, {user.displayName?.split(' ')[0]}</span>
              <button onClick={logout} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <LogOut size={20} className="text-slate-600" />
              </button>
            </div>
          ) : (
            <button 
              onClick={login}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              <LogIn size={18} />
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
              <Palette size={14} />
              Professional Print Layouts
            </div>
            <h1 className="text-7xl font-bold tracking-tight leading-[0.9] mb-8">
              Create Print-Ready <br />
              <span className="text-indigo-600 italic">Papers</span> in Seconds.
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed">
              The ultimate tool for teachers, students, and offices. Design exam papers, ruled sheets, letterheads, and more with professional precision.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setView('templates')}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:-translate-y-1"
              >
                Start Designing Free
              </button>
              <button 
                onClick={() => setView('templates')}
                className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-bold text-lg hover:border-slate-300 transition-all"
              >
                Browse Templates
              </button>
            </div>
            
            <div className="mt-12 flex items-center gap-8 grayscale opacity-50">
              <div className="flex items-center gap-2 font-bold text-sm">A4 / A5 Support</div>
              <div className="flex items-center gap-2 font-bold text-sm">PDF Export</div>
              <div className="flex items-center gap-2 font-bold text-sm">Cloud Save</div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-slate-100 rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://picsum.photos/seed/print/800/1000" 
                alt="App Preview" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/90 backdrop-blur rounded-3xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">Exam Paper Template</h3>
                    <p className="text-sm text-slate-500 italic">Education Category</p>
                  </div>
                  <div className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">PRO</div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl rotate-12">
              <span className="font-bold text-center leading-tight">300<br/>DPI</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="bg-slate-50 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Everything you need for print.</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">From simple ruled paper to complex exam formats, PrintCraft Pro handles it all with ease.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <FileText className="text-indigo-600" />, title: "Standard Sizes", desc: "A4, A5, Letter, Legal and custom sizes supported out of the box." },
              { icon: <Layout className="text-indigo-600" />, title: "Smart Templates", desc: "Choose from hundreds of pre-designed layouts for school, office, and home." },
              { icon: <Settings className="text-indigo-600" />, title: "Precision Controls", desc: "Set margins, bleed, and grid snapping for pixel-perfect print results." }
            ].map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Printer className="text-indigo-600" size={24} />
            <span className="font-bold tracking-tighter">PrintCraft Pro</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 PrintCraft Pro. Follow @jitendrauno for updates.</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-slate-500 hover:text-slate-900">Privacy</a>
            <a href="#" className="text-sm text-slate-500 hover:text-slate-900">Terms</a>
            <a href="#" className="text-sm text-slate-500 hover:text-slate-900">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
