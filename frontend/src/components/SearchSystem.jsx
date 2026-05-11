import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, DollarSign, Home, Bed, Filter, X, ChevronDown, ArrowUpDown, Calendar, Check } from 'lucide-react';
import PropertyCard from './PropertyCard';

// Utility for fuzzy matching (basic typo correction)
const fuzzyMatch = (str, query) => {
  if (!query) return true;
  str = str.toLowerCase();
  query = query.toLowerCase();
  if (str.includes(query)) return true;
  
  let distance = 0;
  let i = 0, j = 0;
  while (i < str.length && j < query.length) {
    if (str[i] === query[j]) {
      i++; j++;
    } else {
      distance++;
      i++;
    }
  }
  return distance <= 2;
};

export const SearchBar = ({ onSearch, suggestions }) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = useMemo(() => {
    if (!input) return [];
    return suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase())).slice(0, 5);
  }, [input, suggestions]);

  return (
    <div className="relative w-full group">
      <div className="flex-1 flex items-center px-8 gap-5 bg-surface rounded-2xl border border-outline/50 shadow-sm focus-within:ring-[6px] focus-within:ring-primary/5 focus-within:border-primary/50 transition-all duration-700 overflow-hidden">
        <Search className="text-on-surface-variant/20 group-focus-within:text-primary transition-colors" size={20} />
        <input 
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            onSearch(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="w-full py-6 bg-transparent focus:outline-none text-on-surface font-bold text-base placeholder:text-on-surface-variant/20" 
          placeholder="ابحث بالمدينة، الحي، أو نوع العقار..." 
        />
        {input && (
          <button 
            onClick={() => { setInput(''); onSearch(''); }} 
            className="p-2 hover:bg-primary/5 rounded-xl text-primary/50 hover:text-primary transition-all"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-4 bg-surface rounded-2xl shadow-2xl z-[100] py-2 overflow-hidden border border-outline/50 backdrop-blur-3xl"
          >
            {filteredSuggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(s);
                  onSearch(s);
                  setShowSuggestions(false);
                }}
                className="w-full text-right px-6 py-4 hover:bg-on-surface/5 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-on-surface/5 flex items-center justify-center text-on-surface-variant/40 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                     <MapPin size={18} />
                   </div>
                   <span className="text-on-surface font-bold text-sm tracking-tight opacity-80">{s}</span>
                </div>
                <ChevronDown className="opacity-0 group-hover:opacity-40 -rotate-90 transition-all" size={14} />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FiltersPanel = ({ filters, setFilters, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const filterSections = (
    <>
      {/* Price Range */}
      <div className="space-y-5">
        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em] flex items-center gap-2 px-1 opacity-40">
          <DollarSign size={14} className="text-primary" /> نطاق السعر (بالدينار)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative group">
            <input 
              type="number" 
              placeholder="من"
              value={filters.minPrice}
              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
              className="w-full bg-on-surface/5 border border-outline/30 px-6 py-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-sm font-bold transition-all placeholder:text-on-surface-variant/20"
            />
          </div>
          <div className="relative group">
            <input 
              type="number" 
              placeholder="إلى"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              className="w-full bg-on-surface/5 border border-outline/30 px-6 py-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-sm font-bold transition-all placeholder:text-on-surface-variant/20"
            />
          </div>
        </div>
      </div>

      {/* Property Type */}
      <div className="space-y-5">
        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em] flex items-center gap-2 px-1 opacity-40">
          <Home size={14} className="text-primary" /> نوع العقار
        </label>
        <div className="relative group">
          <select 
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="w-full bg-on-surface/5 border border-outline/30 px-6 py-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-sm font-bold appearance-none cursor-pointer pr-12 transition-all"
          >
            <option value="">الكل</option>
            <option value="apartment">شقة</option>
            <option value="studio">ستوديو</option>
            <option value="room">غرفة</option>
            <option value="villa">فيلا</option>
          </select>
          <ChevronDown className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/30 pointer-events-none group-focus-within:text-primary transition-colors" size={18} />
        </div>
      </div>

      {/* Rooms */}
      <div className="space-y-5">
        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em] flex items-center gap-2 px-1 opacity-40">
          <Bed size={14} className="text-primary" /> عدد الغرف
        </label>
        <div className="flex gap-2 p-2 bg-on-surface/5 rounded-2xl border border-outline/30">
          {[1, 2, 3, '4+'].map(num => (
            <button
              key={num}
              onClick={() => setFilters({...filters, rooms: num === filters.rooms ? '' : num})}
              className={`flex-1 py-3.5 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest ${filters.rooms === num ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-on-surface-variant/40 hover:bg-surface hover:text-primary'}`}
            >
              {num === '4+' ? '4+' : num}
            </button>
          ))}
        </div>
      </div>

      {/* Additional Options */}
      <div className="space-y-5">
        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em] flex items-center gap-2 px-1 opacity-40">
          <Filter size={14} className="text-primary" /> خيارات إضافية
        </label>
        <div className="flex gap-3">
           <button 
             onClick={() => setFilters({...filters, furnished: !filters.furnished})}
             className={`flex-1 py-4 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em] ${filters.furnished ? 'bg-primary/10 text-primary border-primary/20' : 'bg-on-surface/5 border-outline/30 text-on-surface-variant/40 hover:border-primary/30'}`}
           >
             {filters.furnished && <Check size={14} />}
             مفروش
           </button>
           <button 
             onClick={() => setFilters({...filters, sort: filters.sort === 'price_asc' ? 'price_desc' : 'price_asc'})}
             className="flex-1 py-4 bg-on-surface/5 border border-outline/30 rounded-xl text-[10px] font-bold text-on-surface-variant/40 flex items-center justify-center gap-2 hover:border-primary/30 transition-all active:scale-95 uppercase tracking-[0.2em]"
           >
             <ArrowUpDown size={16} className={filters.sort.includes('price') ? 'text-primary' : ''} />
             السعر
           </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200]">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-on-background/60 backdrop-blur-md"
            />
            
            {/* Sidebar Container */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 35, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 w-full md:max-w-md bg-surface shadow-2xl flex flex-col h-full overflow-hidden border-l border-outline/20"
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-10 py-10 border-b border-outline/10 bg-surface/80 backdrop-blur-xl">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold uppercase tracking-[0.3em] text-on-surface">تصفية البحث</h2>
                  <p className="text-[10px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em] mt-2">خصص تفضيلاتك العقارية</p>
                </div>
                <button 
                  onClick={onClose} 
                  className="w-11 h-11 flex items-center justify-center bg-on-surface/5 rounded-xl active:scale-90 transition-all hover:text-primary group border border-outline/30"
                >
                  <X size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar pb-36">
                {filterSections}
              </div>

              {/* Footer */}
              <div className="p-10 bg-surface/90 backdrop-blur-3xl border-t border-outline/10 absolute bottom-0 left-0 right-0 flex gap-4">
                <button 
                  onClick={() => setFilters({ minPrice: '', maxPrice: '', type: '', rooms: '', furnished: false, sort: 'newest' })} 
                  className="flex-1 py-5 border border-outline/30 rounded-xl text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all"
                >
                  إعادة ضبط
                </button>
                <button 
                  onClick={onClose}
                  className="flex-[2] py-5 bg-primary text-white rounded-xl font-bold text-xs shadow-xl shadow-primary/20 uppercase tracking-[0.2em] hover:brightness-110 transition-all hover:-translate-y-0.5"
                >
                  تطبيق الفلاتر
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export const SearchSystem = ({ properties, onResultsUpdate }) => {
  const [query, setQuery] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    type: '',
    rooms: '',
    furnished: false,
    sort: 'newest'
  });

  const locations = useMemo(() => {
    const locs = properties.map(p => p.location.split(',')[0].trim());
    return [...new Set(locs)];
  }, [properties]);

  useEffect(() => {
    let results = [...properties];

    if (query) {
      results = results.filter(p => 
        fuzzyMatch(p.title, query) || 
        fuzzyMatch(p.location, query) || 
        fuzzyMatch(p.propertyType, query)
      );
    }

    if (filters.minPrice) results = results.filter(p => p.price >= Number(filters.minPrice));
    if (filters.maxPrice) results = results.filter(p => p.maxPrice ? p.maxPrice <= Number(filters.maxPrice) : p.price <= Number(filters.maxPrice));
    if (filters.type) results = results.filter(p => p.propertyType.toLowerCase() === filters.type.toLowerCase());
    if (filters.rooms) {
      const roomNum = parseInt(filters.rooms);
      if (filters.rooms === '4+') results = results.filter(p => p.rooms >= 4);
      else results = results.filter(p => p.rooms === roomNum);
    }
    if (filters.furnished) results = results.filter(p => p.isFurnished);

    if (filters.sort === 'price_asc') results.sort((a, b) => a.price - b.price);
    else if (filters.sort === 'price_desc') results.sort((a, b) => b.price - a.price);
    else results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    onResultsUpdate(results);
  }, [query, filters, properties]);

  return (
    <div className="w-full relative group/system">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <SearchBar onSearch={setQuery} suggestions={locations} />
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFiltersOpen(true)}
          className={`h-[66px] px-8 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3 border ${isFiltersOpen ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-surface text-on-surface border-outline hover:border-primary/30'}`}
        >
          <SlidersHorizontal size={20} />
          <span className="font-bold text-[10px] uppercase tracking-widest hidden sm:inline">الفلاتر</span>
        </motion.button>
      </div>
      
      <FiltersPanel 
        isOpen={isFiltersOpen} 
        onClose={() => setIsFiltersOpen(false)} 
        filters={filters} 
        setFilters={setFilters} 
      />
    </div>
  );
};

