import React, { useState } from 'react';
import { ShoppingBag, Star, Check, ArrowRight, Zap, Shield, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  features: string[];
  isPopular?: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: 'premium-pack-1',
    name: 'Premium Template Mega Pack',
    description: 'Over 500+ professional templates for exams, planners, and business forms.',
    price: 499,
    image: 'https://picsum.photos/seed/pack1/400/300',
    features: ['500+ Templates', 'Lifetime Updates', 'Commercial License', 'Priority Support'],
    isPopular: true
  },
  {
    id: 'specialty-paper',
    name: 'Specialty Paper Bundle',
    description: 'High-quality textures and patterns for your digital and physical prints.',
    price: 299,
    image: 'https://picsum.photos/seed/paper/400/300',
    features: ['50+ Textures', 'High Resolution', 'Print Ready', 'Multiple Formats']
  },
  {
    id: 'custom-design',
    name: 'Custom Design Service',
    description: 'Get a custom template designed specifically for your school or office needs.',
    price: 999,
    image: 'https://picsum.photos/seed/design/400/300',
    features: ['1-on-1 Consultation', '3 Revisions', 'Source Files Included', '24h Delivery']
  }
];

export const Shop: React.FC = () => {
  const [purchased, setPurchased] = useState<string | null>(null);

  const handlePurchase = (product: Product) => {
    // Simulate purchase
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4f46e5', '#10b981', '#f59e0b']
    });
    setPurchased(product.id);
    setTimeout(() => setPurchased(null), 5000);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 py-24 mb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
          >
            <ShoppingBag size={14} />
            The Marketplace
          </motion.div>
          <h1 className="text-6xl font-bold tracking-tight text-slate-900 mb-6 font-display">Upgrade Your <span className="text-indigo-600">Design Game</span></h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Get access to premium assets, specialty papers, and professional services to make your prints stand out.
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10">
          {PRODUCTS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -12 }}
              className={`bg-white rounded-[2.5rem] overflow-hidden border transition-all duration-500 ${
                product.isPopular ? 'border-indigo-200 shadow-2xl shadow-indigo-100' : 'border-slate-100 shadow-xl shadow-slate-200/50'
              }`}
            >
              <div className="relative h-56 overflow-hidden group">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                {product.isPopular && (
                  <div className="absolute top-6 right-6 px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">
                    Best Seller
                  </div>
                )}
              </div>
              
              <div className="p-10">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight font-display">{product.name}</h3>
                  <div className="text-3xl font-black text-indigo-600 tracking-tighter">₹{product.price}</div>
                </div>
                
                <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
                  {product.description}
                </p>
                
                <div className="space-y-4 mb-10">
                  {product.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <div className="w-6 h-6 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handlePurchase(product)}
                  disabled={purchased === product.id}
                  className={`w-full py-4.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 active:scale-95 ${
                    purchased === product.id
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                      : product.isPopular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200'
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200'
                  }`}
                >
                  {purchased === product.id ? (
                    <>
                      <Star size={18} fill="currentColor" />
                      Purchased!
                    </>
                  ) : (
                    <>
                      Buy Now
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-32 grid grid-cols-2 lg:grid-cols-4 gap-12 border-t border-slate-200 pt-20">
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform duration-500">
              <Zap size={28} />
            </div>
            <h4 className="font-bold text-lg mb-2 font-display">Instant Access</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[180px]">Download immediately after purchase</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform duration-500">
              <Shield size={28} />
            </div>
            <h4 className="font-bold text-lg mb-2 font-display">Secure Payment</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[180px]">100% encrypted and safe transactions</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform duration-500">
              <Star size={28} />
            </div>
            <h4 className="font-bold text-lg mb-2 font-display">Premium Quality</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[180px]">Curated by professional designers</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform duration-500">
              <CreditCard size={28} />
            </div>
            <h4 className="font-bold text-lg mb-2 font-display">Easy Refunds</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[180px]">7-day money back guarantee</p>
          </div>
        </div>
      </div>
    </div>
  );
};
