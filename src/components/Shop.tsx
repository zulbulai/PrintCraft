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
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b py-16 mb-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4"
          >
            <ShoppingBag size={14} />
            PrintCraft Marketplace
          </motion.div>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-4">Upgrade Your Design Game</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Get access to premium assets, specialty papers, and professional services to make your prints stand out.
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {PRODUCTS.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -8 }}
              className={`bg-white rounded-[32px] overflow-hidden border-2 transition-all ${
                product.isPopular ? 'border-indigo-600 shadow-xl shadow-indigo-100' : 'border-slate-100 shadow-sm'
              }`}
            >
              <div className="relative h-48">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {product.isPopular && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                    Best Seller
                  </div>
                )}
              </div>
              
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">{product.name}</h3>
                  <div className="text-2xl font-black text-indigo-600">₹{product.price}</div>
                </div>
                
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  {product.description}
                </p>
                
                <div className="space-y-3 mb-8">
                  {product.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handlePurchase(product)}
                  disabled={purchased === product.id}
                  className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                    purchased === product.id
                      ? 'bg-emerald-500 text-white'
                      : product.isPopular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
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
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t pt-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-indigo-600">
              <Zap size={24} />
            </div>
            <h4 className="font-bold text-sm mb-1">Instant Access</h4>
            <p className="text-[10px] text-slate-500">Download immediately after purchase</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-indigo-600">
              <Shield size={24} />
            </div>
            <h4 className="font-bold text-sm mb-1">Secure Payment</h4>
            <p className="text-[10px] text-slate-500">100% encrypted and safe transactions</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-indigo-600">
              <Star size={24} />
            </div>
            <h4 className="font-bold text-sm mb-1">Premium Quality</h4>
            <p className="text-[10px] text-slate-500">Curated by professional designers</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-indigo-600">
              <CreditCard size={24} />
            </div>
            <h4 className="font-bold text-sm mb-1">Easy Refunds</h4>
            <p className="text-[10px] text-slate-500">7-day money back guarantee</p>
          </div>
        </div>
      </div>
    </div>
  );
};
