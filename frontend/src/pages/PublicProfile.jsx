import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserById, getProperties, followUser, unfollowUser, getSocialStats, BACKEND_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { MapPin, MessageSquare, UserPlus, UserMinus, Grid, Users, UserCircle } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';

const PublicProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();

  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({ followersCount: 0, followingCount: 0, isFollowing: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, propRes, statsRes] = await Promise.all([
          getUserById(id),
          getProperties(id),
          getSocialStats(id)
        ]);
        setUser(userRes.data);
        setProperties(propRes.data);
        setStats(statsRes.data);
      } catch (error) {
        showNotification('فشل تحميل الملف الشخصي', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFollow = async () => {
    if (!currentUser) {
      showNotification('يرجى تسجيل الدخول للمتابعة', 'error');
      return;
    }
    try {
      if (stats.isFollowing) {
        await unfollowUser(id);
        setStats({ ...stats, followersCount: stats.followersCount - 1, isFollowing: false });
        showNotification('تم إلغاء المتابعة');
      } else {
        await followUser(id);
        setStats({ ...stats, followersCount: stats.followersCount + 1, isFollowing: true });
        showNotification('تمت المتابعة');
      }
    } catch (error) {
      showNotification('فشل الإجراء', 'error');
    }
  };

  if (loading) return <div className="flex justify-center py-20 font-black text-on-surface-variant opacity-40 uppercase tracking-[0.2em]">جاري التحميل...</div>;
  if (!user) return <div className="text-center py-20 font-black text-on-surface-variant opacity-40 uppercase tracking-[0.2em]">المستخدم غير موجود</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-24" dir="rtl">
      {/* Profile Header */}
      <div className="bg-surface rounded-[3.5rem] p-8 md:p-16 shadow-sm border border-outline flex flex-col lg:flex-row items-center lg:items-end gap-12 mb-24 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] -z-10 group-hover:bg-primary/10 transition-colors duration-1000"></div>
        
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-[3rem] overflow-hidden bg-background border-4 border-outline shadow-xl relative group/avatar shrink-0 ring-[12px] ring-primary/5">
           {user.avatar ? (
             <img src={user.avatar.startsWith('http') ? user.avatar : `${BACKEND_URL}${user.avatar}`} className="w-full h-full object-cover transition-transform duration-1000 group-hover/avatar:scale-110" alt={user.name} />
           ) : (
             <div className="w-full h-full flex items-center justify-center bg-background text-on-surface-variant/20">
                <Users size={80} />
             </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity"></div>
        </div>
        
        <div className="flex-1 text-center lg:text-right space-y-8">
           <div className="space-y-4">
              <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6">
                 <h1 className="text-4xl md:text-7xl font-bold text-on-surface tracking-tight leading-none">{user.name}</h1>
                 <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-primary text-[10px] font-bold uppercase tracking-[0.2em] border border-primary/10 mb-2">
                    <MapPin size={14} />
                    <span>{user.location || 'تونس'}</span>
                 </div>
              </div>
              <p className="text-on-surface-variant font-medium text-lg md:text-xl opacity-50 leading-relaxed max-w-3xl">{user.bio || 'لا توجد نبذة تعريفية حالياً لهذا المستخدم.'}</p>
           </div>
           
           <div className="flex items-center justify-center lg:justify-start gap-12 py-8 border-y border-outline/30 w-full lg:w-fit">
              <div className="text-center group cursor-pointer">
                 <span className="block font-bold text-4xl text-on-surface tracking-tight group-hover:text-primary transition-colors">{properties.length}</span>
                 <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.4em] opacity-30">إعلان</span>
              </div>
              <div className="text-center group cursor-pointer">
                 <span className="block font-bold text-4xl text-on-surface tracking-tight group-hover:text-primary transition-colors">{stats.followersCount}</span>
                 <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.4em] opacity-30">متابع</span>
              </div>
              <div className="text-center group cursor-pointer">
                 <span className="block font-bold text-4xl text-on-surface tracking-tight group-hover:text-primary transition-colors">{stats.followingCount}</span>
                 <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.4em] opacity-30">يتابع</span>
              </div>
           </div>
        </div>

        <div className="flex flex-col gap-4 w-full lg:w-[280px] shrink-0">
           {currentUser?._id !== id && (
             <>
               <button 
                 onClick={handleFollow}
                 className={`w-full py-5 rounded-[2rem] font-bold text-base transition-all flex items-center justify-center gap-3 shadow-xl ${
                   stats.isFollowing 
                   ? 'bg-surface border-2 border-primary text-primary hover:bg-primary/5' 
                   : 'bg-primary text-white hover:brightness-110 shadow-primary/20'
                 }`}
               >
                 {stats.isFollowing ? <UserMinus size={20} /> : <UserPlus size={20} />}
                 <span>{stats.isFollowing ? 'إلغاء المتابعة' : 'متابعة'}</span>
               </button>
               <Link to={`/chat/${id}`} className="w-full py-5 rounded-[2rem] bg-surface border border-outline text-on-surface hover:bg-background transition-all font-bold text-base flex items-center justify-center gap-3 shadow-sm">
                 <MessageSquare size={20} />
                 <span>مراسلة</span>
               </Link>
             </>
           )}
           {currentUser?._id === id && (
             <Link to="/edit-profile" className="w-full py-5 rounded-[2rem] bg-primary text-white hover:brightness-110 transition-all font-bold text-base flex items-center justify-center gap-3 shadow-xl shadow-primary/20">
               <UserCircle size={20} />
               <span>تعديل الملف الشخصي</span>
             </Link>
           )}
        </div>
      </div>

      {/* Tabs / Content */}
      <div className="space-y-16">
         <div className="flex items-center gap-6 border-b border-outline pb-10">
            <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] text-primary flex items-center justify-center border border-primary/10 shadow-sm">
               <Grid size={28} />
            </div>
            <div className="space-y-1">
               <h2 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight uppercase">العقارات المنشورة</h2>
               <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.4em] opacity-40">استكشف جميع الإعلانات ({properties.length})</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12">
            {properties.map(property => (
               <PropertyCard key={property._id} property={property} />
            ))}
         </div>

         {properties.length === 0 && (
            <div className="py-24 flex flex-col items-center gap-6 bg-surface/50 border border-dashed border-outline rounded-[3rem]">
               <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center text-on-surface-variant/20">
                  <Grid size={32} />
               </div>
               <p className="text-on-surface-variant font-bold text-lg opacity-40 uppercase tracking-widest">لا توجد عقارات منشورة حالياً</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default PublicProfile;
