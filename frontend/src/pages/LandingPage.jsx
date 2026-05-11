import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProperties } from '../services/api';
import { Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import PropertySkeleton from '../components/PropertySkeleton';
import { useAuth } from '../context/AuthContext';
import { SearchSystem } from '../components/SearchSystem';
import { Search } from 'lucide-react';

const LandingPage = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data } = await getProperties();
        setProperties(data);
        setFilteredProperties(data);
      } catch (error) {
        console.error('Failed to fetch properties', error);
      } finally {
        // Artificial delay for smooth skeleton transition
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchProperties();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      dir="rtl" 
      className="bg-background min-h-screen selection:bg-primary/20 selection:text-primary"
    >
      {/* Hero Section */}
      <section className="relative min-h-[700px] md:min-h-[850px] flex items-center justify-center overflow-hidden pt-32 pb-24">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Luxury Tunisia Real Estate" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-6xl w-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 glass-morphism rounded-full border border-white/10 mb-10 shadow-xl"
          >
             <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_12px_rgba(220,20,60,0.8)]"></span>
             <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em] opacity-90">النخبة العقارية في تونس</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-6xl md:text-8xl lg:text-[10rem] font-bold text-white mb-8 leading-[0.9] tracking-tight drop-shadow-2xl"
          >
            وجهتك الفاخرة <br className="hidden md:block" /> <span className="text-primary drop-shadow-[0_0_30px_rgba(220,20,60,0.2)]">للسكن المشترك</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="text-lg md:text-xl text-white mb-16 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md"
          >
            نحن نغير الطريقة التي تجد بها منزلك وشركاء سكنك في تونس. <br className="hidden sm:block" /> تجربة بحث سلسة، آمنة، وراقية تناسب تطلعاتك.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <SearchSystem properties={properties} onResultsUpdate={setFilteredProperties} />
          </motion.div>
        </div>
      </section>

      {/* Properties Grid Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 md:mb-24 px-2">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
               <div className="w-12 h-1 bg-primary rounded-full opacity-80"></div>
               <span className="text-[11px] font-bold text-primary uppercase tracking-[0.4em]">استكشف الآن</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-on-surface tracking-tight leading-none">
              {filteredProperties.length !== properties.length ? 'نتائج البحث' : 'أرقى الإعلانات'}
            </h2>
          </div>
          <div className="glass-morphism border border-outline/30 px-8 py-4 rounded-2xl shadow-sm">
             <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
               {filteredProperties.length} عقار متوفر
             </span>
          </div>
        </div>

        <div className="min-h-[600px]">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <PropertySkeleton key={n} />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredProperties.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-40 px-8 bg-surface/20 rounded-[3rem] border border-outline border-dashed"
                >
                   <div className="w-24 h-24 bg-surface rounded-3xl flex items-center justify-center mb-8 shadow-sm border border-outline">
                      <Search className="text-on-surface-variant/10" size={40} />
                   </div>
                   <h3 className="text-3xl md:text-4xl font-bold text-on-surface mb-4 tracking-tight">لم نعثر على نتائج</h3>
                   <p className="text-base text-on-surface-variant mb-10 opacity-40 font-medium max-w-sm text-center">حاول تغيير معايير البحث أو تصفح كافة الإعلانات المتاحة حالياً.</p>
                   <button 
                     onClick={() => setFilteredProperties(properties)}
                     className="btn-primary"
                   >
                     عرض كافة العقارات
                   </button>
                </motion.div>
              ) : (
                <motion.div 
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12"
                >
                  {filteredProperties.map((property, index) => (
                    <PropertyCard key={property._id} property={property} index={index} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Social Call to Action */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
         <motion.div 
            whileHover={{ y: -5 }}
            className="bg-on-surface text-surface rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-2xl group"
         >
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all duration-1000"></div>
            <div className="relative z-10 max-w-3xl space-y-8">
               <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95]">شارك مسكنك <br /> وابدأ رحلتك اليوم</h2>
               <p className="text-lg font-medium opacity-60 leading-relaxed max-w-lg">انضم إلى أكبر مجتمع للسكن المشترك في تونس. تجربة بحث ومشاركة لم يسبق لها مثيل.</p>
               <div className="flex flex-wrap gap-4 pt-4">
                  {(!user || user.role === 'owner' || user.role === 'admin') ? (
                    <Link to="/post-ad" className="btn-primary !px-8 !py-4 !text-xs">أنشر إعلانك مجاناً</Link>
                  ) : (
                    <Link to="/" className="btn-primary !px-8 !py-4 !text-xs">ابدأ البحث الآن</Link>
                  )}
                  <Link to="/how-it-works" className="btn-secondary !bg-transparent !text-surface !border-surface/20 hover:!bg-white/5 !px-8 !py-4 !text-xs">اكتشف المزيد</Link>
               </div>
            </div>
         </motion.div>
      </section>
    </motion.div>

  );
};

export default LandingPage;
