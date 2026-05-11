import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { MapPin, Tag, Phone, MessageSquare, Star, Send, User as UserIcon, Calendar, Info, Share2, Users, BedDouble, Heart, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { getProperty, getComments, postComment, getUserById, likeProperty, followUser, unfollowUser, BACKEND_URL } from '../services/api';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.2, 0, 0, 1] }
  }
};

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [property, setProperty] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [owner, setOwner] = useState(null);
  const [likes, setLikes] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, commentRes] = await Promise.all([
          getProperty(id),
          getComments(id)
        ]);
        setProperty(propRes.data);
        setComments(commentRes.data);
        setLikes(propRes.data.likes || []);
        setIsLiked(user ? propRes.data.likes?.includes(user._id) : false);
        
        const ownerRes = await getUserById(propRes.data.user._id);
        setOwner(ownerRes.data);
        setIsFollowing(user ? ownerRes.data.followers?.includes(user._id) : false);
      } catch (error) {
        showNotification('فشل تحميل تفاصيل العقار', 'error');
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };
    fetchData();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      showNotification('يرجى تسجيل الدخول للإعجاب بالعقار', 'error');
      return;
    }
    try {
      const { data } = await likeProperty(id);
      setLikes(data.likes);
      setIsLiked(data.likes.includes(user._id));
    } catch (error) {
      showNotification('فشل الإعجاب بالعقار', 'error');
    }
  };

  const handleFollow = async () => {
    if (!user) {
      showNotification('يرجى تسجيل الدخول للمتابعة', 'error');
      return;
    }
    try {
      if (isFollowing) {
        await unfollowUser(owner._id);
        setIsFollowing(false);
        showNotification('تم إلغاء المتابعة');
      } else {
        await followUser(owner._id);
        setIsFollowing(true);
        showNotification('تمت المتابعة بنجاح');
      }
    } catch (error) {
      showNotification('فشل تنفيذ العملية', 'error');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: property.title,
      text: property.description,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showNotification('تم نسخ الرابط إلى الحافظة');
      }
    } catch (error) {
      console.error('خطأ في المشاركة', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showNotification('يرجى تسجيل الدخول للتعليق', 'error');
      return;
    }
    try {
      const { data } = await postComment({ propertyId: id, text: commentText, rating });
      setComments([data, ...comments]);
      setCommentText('');
      showNotification('تم إضافة التعليق بنجاح!');
    } catch (error) {
      showNotification('فشل في إضافة التعليق', 'error');
    }
  };

  const averageRating = comments.length > 0 
    ? (comments.reduce((acc, c) => acc + (c.rating || 0), 0) / comments.length).toFixed(1)
    : '0.0';

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full shadow-2xl shadow-primary/20"
      />
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.4em] opacity-40"
      >
        جاري تحميل التفاصيل...
      </motion.span>
    </div>
  );

  if (!property) return null;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto px-4 md:px-0 py-8 md:py-16 space-y-8 md:space-y-14" 
      dir="rtl"
    >
      {/* Post Header: Owner Info */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center justify-between bg-surface p-5 rounded-3xl border border-outline shadow-premium"
      >
        <div className="flex items-center gap-4">
          <Link to={`/profile/${owner?._id}`} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden border border-outline shadow-sm flex-shrink-0 transition-all hover:scale-105 active:scale-95">
            {owner?.avatar ? <img src={owner.avatar.startsWith('http') ? owner.avatar : `${BACKEND_URL}${owner.avatar}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-outline-variant/30 text-on-surface-variant/20"><UserIcon size={20} /></div>}
          </Link>
          <div className="min-w-0">
            <Link to={`/profile/${owner?._id}`} className="font-bold text-on-surface hover:text-primary transition-colors text-base tracking-tight truncate block">{owner?.name}</Link>
            <div className="flex items-center gap-1.5 opacity-60">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">متوفر الآن</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <motion.button 
             whileTap={{ scale: 0.95 }}
             onClick={handleFollow}
             className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border ${isFollowing ? 'bg-surface text-on-surface-variant border-outline' : 'bg-primary text-white border-primary shadow-lg shadow-primary/10 hover:brightness-110'}`}
           >
             {isFollowing ? 'متابع' : 'متابعة'}
           </motion.button>
           <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} className="w-10 h-10 flex items-center justify-center bg-background border border-outline rounded-xl text-on-surface-variant/40 hover:text-primary transition-all"><Share2 size={18} /></motion.button>
        </div>
      </motion.div>

      {/* Hero Image Section */}
      <motion.div 
        variants={itemVariants}
        className="relative group"
      >
          <div className="aspect-[4/3] md:aspect-[16/9] rounded-[2.5rem] overflow-hidden border border-outline/50 shadow-premium relative bg-on-surface/5">
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImageIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                src={property.images[activeImageIndex] ? (property.images[activeImageIndex].startsWith('http') ? property.images[activeImageIndex] : `${BACKEND_URL}${property.images[activeImageIndex]}`) : 'https://via.placeholder.com/1200x800'} 
                className="w-full h-full object-cover cursor-zoom-in" 
                alt={property.title}
                onClick={() => setIsGalleryOpen(true)}
              />
            </AnimatePresence>
            
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none" />
            
            {/* Gallery Navigation */}
            {property.images.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 glass-morphism text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary border border-white/10"
                >
                  <ChevronRight size={24} />
                </button>
                <button 
                  onClick={() => setActiveImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 glass-morphism text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary border border-white/10"
                >
                  <ChevronLeft size={24} />
                </button>
              </>
            )}

            {/* Price Badge Overlay */}
            <div className="absolute bottom-6 right-6 bg-surface/90 backdrop-blur-xl px-8 py-5 rounded-3xl border border-outline shadow-xl flex flex-col items-end scale-90 md:scale-100 origin-bottom-right">
               <span className="text-[9px] text-primary font-bold uppercase tracking-[0.2em] mb-1 opacity-60">شهرياً</span>
               <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight leading-none">{property.price}</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">tnd</span>
               </div>
            </div>

            <div className="absolute top-6 left-6 glass-morphism px-4 py-2 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-white/10">
               <span className="material-symbols-outlined text-sm">photo_library</span>
               {activeImageIndex + 1} / {property.images.length}
            </div>

            <button 
              onClick={() => setIsGalleryOpen(true)}
              className="absolute top-6 right-6 w-10 h-10 glass-morphism text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/10"
            >
              <ZoomIn size={20} />
            </button>
          </div>
      </motion.div>

      {/* Main Post Content */}
      <div className="space-y-8">
         <motion.div 
            variants={itemVariants}
            className="bg-surface p-8 md:p-12 rounded-[2.5rem] border border-outline shadow-sm relative overflow-hidden"
         >
            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-6 opacity-80">
               <Tag size={14} />
               {property.propertyType} • {property.location}
            </div>
            
            <h1 className="text-3xl md:text-6xl font-bold text-on-surface tracking-tight leading-tight mb-6 uppercase">{property.title}</h1>
            
            <p className="text-base md:text-lg text-on-surface-variant font-medium leading-relaxed mb-10 opacity-60 max-w-2xl">
               {property.description}
            </p>

            {/* Interaction Bar */}
            <div className="flex items-center justify-between py-6 border-y border-outline/50">
               <div className="flex items-center gap-8">
                  <motion.button 
                    whileTap={{ scale: 1.2 }}
                    onClick={handleLike}
                    className={`flex items-center gap-2.5 transition-colors ${isLiked ? 'text-primary' : 'text-on-surface-variant/40 hover:text-primary'}`}
                  >
                     <Heart size={24} fill={isLiked ? "currentColor" : "none"} strokeWidth={2.5} />
                     <span className="font-bold text-xl tracking-tight">{likes.length}</span>
                  </motion.button>
                  <div className="flex items-center gap-2.5 text-on-surface-variant/40">
                     <MessageSquare size={24} strokeWidth={2.5} />
                     <span className="font-bold text-xl tracking-tight">{comments.length}</span>
                  </div>
               </div>
               
               <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 text-yellow-500">
                     <Star size={20} fill="currentColor" />
                     <span className="font-bold text-2xl text-on-surface tracking-tight">{averageRating}</span>
                  </div>
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-30">التقييم</span>
               </div>
            </div>

            {/* Property Quick Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 pt-8">
               {[
                  { icon: <BedDouble size={20} />, label: 'نوع الغرف', value: property.roomType || 'S+1' },
                  { icon: <Users size={20} />, label: 'السكان', value: `${property.occupants} أشخاص` },
                  { icon: <Info size={20} />, label: 'المشاركة', value: `${property.tenantsSharing} شركاء` },
                  { icon: <MapPin size={20} />, label: 'الموقع', value: property.location.split(',')[0] }
               ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex flex-col items-center p-5 rounded-2xl border border-outline bg-background/20 text-center"
                  >
                     <div className="text-primary mb-3 p-2.5 bg-primary/5 rounded-xl opacity-80">{item.icon}</div>
                     <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest opacity-30 mb-1">{item.label}</span>
                     <span className="font-bold text-xs md:text-sm text-on-surface">{item.value}</span>
                  </div>
               ))}
            </div>
         </motion.div>

         {/* Features Section */}
         <motion.div 
            variants={itemVariants}
            className="bg-surface p-8 md:p-12 rounded-[2.5rem] border border-outline shadow-sm"
         >
            <h2 className="text-xl md:text-2xl font-bold mb-8 tracking-tight uppercase text-on-surface">المرافق والمميزات</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
               {[
                 { name: 'isFurnished', label: 'مفروش', icon: 'chair' },
                 { name: 'hasWifi', label: 'واي فاي', icon: 'wifi' },
                 { name: 'hasParking', label: 'موقف متاح', icon: 'local_parking' },
                 { name: 'hasAC', label: 'مكيف هواء', icon: 'ac_unit' },
                 { name: 'hasHeating', label: 'تدفئة', icon: 'heat_pump' },
                 { name: 'hasBalcony', label: 'شرفة', icon: 'balcony' }
               ].map(feat => (
                  <div key={feat.name} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${property[feat.name] ? 'bg-primary/5 border-primary/10 text-on-surface' : 'bg-outline-variant/10 border-outline/30 text-on-surface-variant/20'}`}>
                     <span className="material-symbols-outlined text-2xl text-primary opacity-80">{feat.icon}</span>
                     <span className="font-bold text-[10px] md:text-xs uppercase tracking-[0.15em]">{feat.label}</span>
                  </div>
               ))}
            </div>
         </motion.div>

         {/* Map View */}
         {property.latitude && property.longitude && (
            <motion.div 
              variants={itemVariants}
              className="bg-surface rounded-[2.5rem] border border-outline shadow-sm overflow-hidden"
            >
               <div className="p-6 md:p-8 flex items-center justify-between border-b border-outline bg-background/20">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-primary/10 rounded-xl text-primary opacity-80"><MapPin size={20} /></div>
                     <h3 className="font-bold text-lg text-on-surface uppercase tracking-tight">الموقع</h3>
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-30">{property.location}</span>
               </div>
               <div className="h-[350px] md:h-[450px] relative z-0">
                  <MapContainer center={[property.latitude, property.longitude]} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[property.latitude, property.longitude]} />
                  </MapContainer>
               </div>
            </motion.div>
         )}

         {/* Social Action Bar */}
         <motion.div 
            variants={itemVariants}
            className="flex flex-col md:flex-row gap-4 sticky bottom-24 md:static z-40 bg-background/80 backdrop-blur-md p-2 rounded-3xl md:bg-transparent md:p-0"
         >
            <Link to={`/chat/${owner?._id}?propertyId=${property._id}`} className="flex-1 flex items-center justify-center gap-3 py-5 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest">
               <MessageSquare size={24} />
               تحدث مع المالك
            </Link>
            <div className="flex-1 flex items-center justify-between px-8 py-5 bg-surface rounded-2xl border border-outline shadow-sm group">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary border border-outline opacity-80">
                     <Phone size={20} />
                  </div>
                  <div>
                     <span className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest opacity-30 block mb-0.5">رقم الهاتف</span>
                     <span className="font-bold text-xl text-on-surface tracking-widest">{property.phoneNumber}</span>
                  </div>
               </div>
            </div>
         </motion.div>

         {/* Comments Feed */}
         <motion.div 
            variants={itemVariants}
            className="pt-12 space-y-10"
         >
            <div className="flex items-center justify-between px-2">
               <h2 className="text-2xl md:text-4xl font-bold text-on-surface tracking-tight uppercase">التعليقات</h2>
               <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-30">
                  {comments.length} تعليق
               </div>
            </div>

            {user && (
              <form onSubmit={handleCommentSubmit} className="bg-surface p-6 md:p-10 rounded-[2rem] border border-outline shadow-sm space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl overflow-hidden border border-outline">
                          {user.avatar ? <img src={user.avatar.startsWith('http') ? user.avatar : `${BACKEND_URL}${user.avatar}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-outline-variant/30 text-on-surface-variant/20"><UserIcon size={18} /></div>}
                       </div>
                       <span className="font-bold text-base text-on-surface">{user.name}</span>
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(num => (
                        <Star 
                          key={num} 
                          size={20}
                          className={`cursor-pointer transition-all ${num <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-on-surface-variant/20'}`}
                          onClick={() => setRating(num)}
                        />
                      ))}
                    </div>
                 </div>
                 <div className="relative">
                    <textarea 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full p-6 rounded-2xl border border-outline bg-background text-on-surface focus:border-primary/30 outline-none min-h-[140px] transition-all font-medium placeholder:text-on-surface-variant/20 text-base"
                      placeholder="كيف كانت تجربتك؟"
                    ></textarea>
                    <button 
                      type="submit" 
                      className="absolute left-4 bottom-4 bg-primary text-white px-8 py-3 rounded-xl hover:brightness-110 flex items-center justify-center gap-3 font-bold shadow-lg shadow-primary/10 text-xs uppercase tracking-widest"
                    >
                       <Send size={18} />
                       إرسال
                    </button>
                 </div>
              </form>
            )}

            <div className="space-y-6">
               <AnimatePresence initial={false}>
                 {comments.length === 0 ? (
                   <div className="text-center py-20 bg-surface/50 rounded-[2rem] border border-outline border-dashed">
                      <p className="text-on-surface-variant font-bold text-[10px] uppercase tracking-widest opacity-20">لا يوجد تعليقات بعد</p>
                   </div>
                 ) : (
                   comments.map((comment, idx) => (
                     <div 
                       key={comment._id} 
                       className="bg-surface p-6 md:p-8 rounded-[2rem] border border-outline flex flex-col md:flex-row gap-6"
                     >
                        <Link to={`/profile/${comment.user?._id}`} className="w-12 h-12 rounded-xl overflow-hidden bg-outline-variant flex-shrink-0 border border-outline shadow-sm">
                          {comment.user.avatar ? <img src={comment.user.avatar.startsWith('http') ? comment.user.avatar : `${BACKEND_URL}${comment.user.avatar}`} className="w-full h-full object-cover" /> : <UserIcon className="m-auto mt-3 text-on-surface-variant/20" />}
                        </Link>
                        <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                              <div className="space-y-0.5">
                                 <span className="font-bold text-lg text-on-surface block tracking-tight">{comment.user.name}</span>
                                 <div className="flex items-center gap-2 text-[9px] text-on-surface-variant font-bold uppercase tracking-widest opacity-30">
                                    <Calendar size={12} />
                                    {new Date(comment.createdAt).toLocaleDateString('ar-TN')}
                                 </div>
                              </div>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(num => (
                                  <Star key={num} size={14} className={num <= comment.rating ? 'text-yellow-500 fill-yellow-500' : 'text-on-surface-variant/20'} />
                                ))}
                              </div>
                          </div>
                          <p className="text-on-surface-variant leading-relaxed font-medium text-base opacity-60">{comment.text}</p>
                        </div>
                     </div>
                   ))
                 )}
               </AnimatePresence>
            </div>
         </motion.div>
      </div>

      {/* Immersive Gallery Modal */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-on-background/95 backdrop-blur-3xl flex flex-col p-6 md:p-10 overflow-hidden"
          >
             <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                   <h2 className="text-white font-bold text-xl md:text-4xl tracking-tight uppercase leading-none mb-2">{property.title}</h2>
                   <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{activeImageIndex + 1} / {property.images.length}</span>
                </div>
                <button 
                  onClick={() => setIsGalleryOpen(false)}
                  className="w-12 h-12 bg-white/5 hover:bg-primary text-white rounded-xl flex items-center justify-center transition-all border border-white/5"
                >
                  <X size={24} />
                </button>
             </div>

             <div className="flex-1 relative flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeImageIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    src={property.images[activeImageIndex].startsWith('http') ? property.images[activeImageIndex] : `${BACKEND_URL}${property.images[activeImageIndex]}`} 
                    className="max-w-full max-h-full object-contain rounded-3xl" 
                    alt="Fullscreen" 
                  />
                </AnimatePresence>
                
                {property.images.length > 1 && (
                  <>
                    <button 
                      onClick={() => setActiveImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1))}
                      className="absolute right-0 md:right-8 w-16 h-16 bg-white/5 hover:bg-primary text-white rounded-2xl flex items-center justify-center transition-all border border-white/5"
                    >
                      <ChevronRight size={32} />
                    </button>
                    <button 
                      onClick={() => setActiveImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1))}
                      className="absolute left-0 md:left-8 w-16 h-16 bg-white/5 hover:bg-primary text-white rounded-2xl flex items-center justify-center transition-all border border-white/5"
                    >
                      <ChevronLeft size={32} />
                    </button>
                  </>
                )}
             </div>

             <div className="h-24 mt-10 flex items-center justify-center gap-3 overflow-x-auto px-4 custom-scrollbar pb-2">
                {property.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-16 md:w-24 md:h-20 rounded-xl overflow-hidden border transition-all flex-shrink-0 ${activeImageIndex === idx ? 'border-primary' : 'border-white/5 opacity-30'}`}
                  >
                    <img src={img.startsWith('http') ? img : `${BACKEND_URL}${img}`} className="w-full h-full object-cover" />
                  </button>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PropertyDetails;
