import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProperties, deleteProperty } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Edit, Trash2, Plus } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';


const Dashboard = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchUserProperties = async () => {
      try {
        const { data } = await getProperties(user._id);
        setProperties(data);
      } catch (error) {
        showNotification('فشل جلب الإعلانات', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchUserProperties();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      try {
        await deleteProperty(id);
        setProperties(properties.filter(p => p._id !== id));
        showNotification('تم حذف الإعلان بنجاح');
      } catch (error) {
        showNotification('فشل حذف الإعلان', 'error');
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full shadow-2xl shadow-primary/20"
      />
      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.4em] animate-pulse">جاري التحميل...</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-24" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 md:mb-24">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-1 bg-primary rounded-full opacity-80"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">لوحة التحكم</span>
           </div>
           <h1 className="text-4xl md:text-7xl font-bold text-on-surface tracking-tight leading-none">إعلاناتي العقارية</h1>
           <p className="text-on-surface-variant font-medium opacity-60 text-base md:text-lg max-w-xl">إدارة وتعديل العقارات التي قمت بنشرها على منصة karya.tn.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Link to="/post-ad" className="btn-primary flex-1 md:flex-none flex items-center justify-center gap-3 py-5 px-10 shadow-xl shadow-primary/20">
            <Plus size={22} />
            إضافة إعلان جديد
          </Link>
        </div>
      </div>

      {properties.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 md:py-48 px-8 bg-surface/30 rounded-[3rem] border border-outline border-dashed"
        >
          <div className="w-20 h-20 bg-surface rounded-2xl flex items-center justify-center mb-10 shadow-sm border border-outline">
             <Plus size={32} className="text-on-surface-variant/20" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-on-surface mb-4 tracking-tight">لا توجد إعلانات بعد</h3>
          <p className="text-base text-on-surface-variant mb-12 opacity-40 font-medium max-w-sm text-center">ابدأ بنشر أول إعلان لك الآن للوصول إلى آلاف الباحثين عن سكن مشترك في تونس.</p>
          <Link to="/post-ad" className="btn-primary py-5 px-12">انشر إعلانك الأول مجاناً</Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
          {properties.map((property) => (
            <div key={property._id} className="relative group">
              <PropertyCard property={property} />
              
              {/* Management Overlay */}
              <div className="absolute top-6 left-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 translate-x-4 group-hover:translate-x-0">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(property._id);
                  }} 
                  className="w-12 h-12 bg-white text-primary shadow-2xl hover:bg-primary hover:text-white transition-all border border-outline rounded-xl flex items-center justify-center"
                  title="حذف الإعلان"
                >
                  <Trash2 size={20} />
                </button>
                <Link 
                  to={`/edit-ad/${property._id}`} 
                  onClick={(e) => e.stopPropagation()}
                  className="w-12 h-12 bg-white text-on-surface shadow-2xl hover:bg-on-surface hover:text-surface transition-all border border-outline rounded-xl flex items-center justify-center"
                  title="تعديل الإعلان"
                >
                  <Edit size={20} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export default Dashboard;
