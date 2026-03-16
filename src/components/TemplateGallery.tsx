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
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h2 className="text-5xl font-bold tracking-tight mb-4 font-display text-slate-900">Choose a <span className="text-indigo-600">Template</span></h2>
          <p className="text-lg text-slate-500 max-w-xl font-medium">Start with a professionally designed layout and customize it to your needs.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search templates..." 
              className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 w-full sm:w-72 transition-all focus:bg-white"
            />
          </div>
          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  category === cat ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            className="group cursor-pointer"
            onClick={() => onSelect(template)}
          >
            <div className="aspect-[3/4] bg-slate-50 rounded-[2.5rem] overflow-hidden mb-6 relative border border-slate-100 group-hover:border-indigo-200 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-indigo-100 group-hover:-translate-y-2">
              <img 
                src={template.thumbnail} 
                alt={template.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-6 group-hover:translate-y-0 duration-500 shadow-2xl">
                  <ChevronRight className="text-indigo-600" size={28} />
                </div>
              </div>
              {template.isPremium && (
                <div className="absolute top-6 right-6 px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">
                  Premium
                </div>
              )}
            </div>
            <h3 className="font-bold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors font-display">{template.name}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">{template.category}</span>
              <div className="w-1 h-1 rounded-full bg-slate-200" />
              <span className="text-[10px] text-slate-400 font-bold">{template.paperSize}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
