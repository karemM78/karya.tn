import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Heart, Users, BedDouble, Info, MessageCircle, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { likeProperty, BACKEND_URL } from '../services/api';

const PropertyCard = ({ property, index }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [likes, setLikes] = useState(property.likes || []);
  const [isLiked, setIsLiked] = useState(user ? likes.includes(user._id) : false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const city = property.location.split(',')[0].trim();
  const pricePerMonth = property.price;

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showNotification('يرجى تسجيل الدخول للإعجاب بالعقار', 'error');
      return;
    }
    try {
      const { data } = await likeProperty(property._id);
      setLikes(data.likes);
      setIsLiked(data.likes.includes(user._id));
    } catch (error) {
      showNotification('فشل الإعجاب بالعقار', 'error');
    }
  };

  const typeTranslations = {
    apartment: 'شقة',
    studio: 'ستوديو',
    room: 'غرفة',
    villa: 'فيلا',
    single: 'فردية',
    double: 'زوجية',
    shared: 'مشتركة'
  };

  const translate = (val) => typeTranslations[val?.toLowerCase()] || val;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.05,
        ease: [0.2, 0, 0, 1] 
      }}
      whileHover={{ y: -10 }}
      whileTap={{ scale: 0.98 }}
      className="bg-surface rounded-3xl overflow-hidden border border-outline hover:border-primary/30 transition-all duration-500 group flex flex-col h-full relative cursor-pointer shadow-premium hover:shadow-elevated"
    >
      <Link to={`/property/${property._id}`} className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-on-surface/5">
          <motion.img 
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 1.05 }}
            transition={{ duration: 0.8 }}
            onLoad={() => setImageLoaded(true)}
            src={property.images[0] ? (property.images[0].startsWith('http') ? property.images[0] : `${BACKEND_URL}${property.images[0]}`) : 'https://via.placeholder.com/400x300'} 
            alt={property.title} 
            className="w-full h-full object-cover z-0 transition-transform duration-1000 ease-out group-hover:scale-110"
          />
          
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-background/40 via-transparent to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-20">
            <div className="flex flex-col gap-2">
              <div className="bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[9px] font-bold shadow-sm uppercase tracking-[0.2em] border border-white/20">
                {translate(property.propertyType)}
              </div>
              <div className="bg-surface/90 backdrop-blur-md text-on-surface px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 border border-outline/50 shadow-sm">
                 <BedDouble size={14} className="text-primary opacity-80" />
                 {translate(property.roomType)}
              </div>
            </div>
            
            <motion.button 
              onClick={handleLike}
              whileTap={{ scale: 1.2 }}
              className={`p-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center border backdrop-blur-md ${isLiked ? 'bg-primary text-white border-primary' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
            >
               <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            </motion.button>
          </div>

          <div className="absolute bottom-5 right-5 z-20 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-bold text-on-surface border border-outline/50 shadow-sm uppercase tracking-[0.2em]">
             {city}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-7 flex-1 flex flex-col bg-surface transition-colors duration-300">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-lg font-bold text-on-surface line-clamp-2 leading-tight tracking-tight group-hover:text-primary transition-colors duration-300 flex-1">
                {property.title}
              </h3>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 rounded-lg text-primary border border-primary/10">
                <span className="text-[10px] font-bold">{likes.length}</span>
                <Heart size={10} fill="currentColor" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 opacity-60">
               <MapPin size={12} className="text-primary" />
               <span className="truncate font-bold text-[9px] uppercase tracking-[0.2em] text-on-surface-variant">{property.location}</span>
            </div>
          </div>

          {/* Social Stats Preview */}
          <div className="flex items-center gap-5 mb-8">
             <div className="flex items-center gap-1.5 text-on-surface-variant/40 hover:text-primary transition-colors cursor-default">
                <MessageCircle size={14} />
                <span className="text-[10px] font-bold tracking-widest">24</span>
             </div>
             <div className="flex items-center gap-1.5 text-on-surface-variant/40 hover:text-primary transition-colors cursor-default">
                <Users size={14} />
                <span className="text-[10px] font-bold tracking-widest">{property.occupants}</span>
             </div>
             <div className="ml-auto text-on-surface-variant/30 hover:text-primary transition-colors">
                <Share2 size={14} />
             </div>
          </div>

          {/* Action Area */}
          <div className="mt-auto pt-6 border-t border-outline/30 flex items-center justify-between gap-4">
            <div className="flex flex-col">
               <span className="text-[8px] text-on-surface-variant font-bold uppercase tracking-[0.3em] opacity-40 mb-1">شهرياً</span>
               <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-bold text-on-surface tracking-tighter">
                   {pricePerMonth}
                 </span>
                 <span className="text-[10px] font-bold text-primary uppercase tracking-widest">د.ت</span>
               </div>
            </div>
            
            <div className="h-11 px-6 bg-primary text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-primary/20 flex items-center justify-center transition-all duration-300 group-hover:shadow-primary/40 group-hover:-translate-y-0.5">
               التفاصيل
            </div>
          </div>
        </div>
      </Link>
    </motion.div>

  );
};

export default PropertyCard;
