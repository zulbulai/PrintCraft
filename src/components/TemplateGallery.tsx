import React from 'react';
import { STARTER_TEMPLATES } from '../constants/templates';
import { Template } from '../types';
import { motion } from 'motion/react';
import { Search, Filter, ChevronRight } from 'lucide-react';

interface TemplateGalleryProps {
  onSelect: (template: Template) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelect }) => {
  const [category, setCategory] = React.useState<string>('All');
  const categories = ['All', 'Education', 'Office', 'Creative'];

  const filteredTemplates = category === 'All' 
    ? STARTER_TEMPLATES 
    : STARTER_TEMPLATES.filter(t => t.category === category);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Choose a Template</h2>
          <p className="text-slate-500">Start with a professionally designed layout and customize it.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search templates..." 
              className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  category === cat ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group cursor-pointer"
            onClick={() => onSelect(template)}
          >
            <div className="aspect-[3/4] bg-slate-100 rounded-3xl overflow-hidden mb-4 relative border border-slate-200 group-hover:border-indigo-300 transition-colors">
              <img 
                src={template.thumbnail} 
                alt={template.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300 shadow-xl">
                  <ChevronRight className="text-indigo-600" />
                </div>
              </div>
              {template.isPremium && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-amber-400 text-amber-950 text-[10px] font-bold rounded uppercase tracking-wider">
                  Premium
                </div>
              )}
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{template.name}</h3>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">{template.category}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
