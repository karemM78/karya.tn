import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createProperty, getProperty, updateProperty, uploadImages, BACKEND_URL } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  CheckCircle2, 
  Wifi, 
  Wind, 
  Flame, 
  Layout, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Mail, 
  MessageSquare,
  Home
} from 'lucide-react';

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

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const PostAdForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    location: '',
    propertyType: 'شقة',
    images: [],
    contactMethod: 'اتصال هاتفي فقط',
    phoneNumber: '',
    countryCode: '+216',
    currency: 'TND',
    latitude: 34.7398, // Default to Sfax, Tunisia
    longitude: 10.7600,
    isFurnished: false,
    hasParking: false,
    hasWifi: false,
    hasAC: false,
    hasHeating: false,
    hasBalcony: false,
    roomType: 'S+1',
    occupants: 0,
    tenantsSharing: 1,
    requiredCapacity: 1
  });

  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const [markerPosition, setMarkerPosition] = useState({ lat: 34.7398, lng: 10.7600 });

  const pricePerMonth = formData.price;

  useEffect(() => {
    if (id) {
      const fetchProperty = async () => {
        try {
          const { data } = await getProperty(id);
          setFormData({
            ...data,
            countryCode: data.phoneNumber?.split(' ')[0] || '+216',
            phoneNumber: data.phoneNumber?.split(' ')[1] || ''
          });
          if (data.latitude && data.longitude) {
            setMarkerPosition({ lat: data.latitude, lng: data.longitude });
          }
        } catch (error) {
          showNotification('Failed to fetch property details', 'error');
        }
      };
      fetchProperty();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value) 
    });
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadData = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadData.append('images', files[i]);
    }

    setUploading(true);
    try {
      const { data } = await uploadImages(uploadData);
      setFormData({ ...formData, images: [...formData.images, ...data] });
      showNotification('تم رفع الصور بنجاح');
    } catch (error) {
      const message = error.response?.data?.message || 'فشل في رفع الصور';
      showNotification(message, 'error');
    } finally {
      setUploading(false);
    }
  };


  const removeImage = (index) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Step 1 Validation
    if (step === 1) {
      if (formData.requiredCapacity <= 0) {
        showNotification('عدد المستأجرين يجب أن يكون أكبر من صفر', 'error');
        return;
      }
      setStep(2);
      return;
    }

    // Step 2 Validation
    if (formData.images.length === 0) {
      showNotification('يرجى إضافة صورة واحدة على الأقل', 'error');
      return;
    }

    setLoading(true);
    try {
      const submissionData = {
        ...formData,
        phoneNumber: `${formData.countryCode} ${formData.phoneNumber.trim()}`
      };

      if (id) {
        await updateProperty(id, submissionData);
        showNotification('تم تحديث الإعلان بنجاح!');
      } else {
        await createProperty(submissionData);
        showNotification('تم نشر الإعلان بنجاح!');
      }
      navigate('/dashboard');
    } catch (error) {
      showNotification(error.response?.data?.message || 'فشل في نشر الإعلان', 'error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="max-w-4xl mx-auto px-6 py-12 md:py-24" dir="rtl">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-12 md:gap-16 mb-20 relative">
        <div className="flex flex-col items-center gap-4 group">
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-500 ${step >= 1 ? 'bg-primary text-white rotate-0' : 'bg-surface border border-outline text-on-surface-variant'}`}>
            {step > 1 ? <CheckCircle2 size={24} /> : <span className="text-xl font-bold">1</span>}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${step >= 1 ? 'text-primary' : 'text-on-surface-variant opacity-40'}`}>معلومات العقار</span>
        </div>
        
        <div className="w-20 md:w-32 h-[2px] bg-outline absolute left-1/2 -translate-x-1/2 top-6 md:top-7 -z-10">
           <div className={`h-full bg-primary transition-all duration-700 ease-out ${step > 1 ? 'w-full' : 'w-0'}`}></div>
        </div>

        <div className="flex flex-col items-center gap-4 group">
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-500 ${step === 2 ? 'bg-primary text-white rotate-0' : 'bg-surface border border-outline text-on-surface-variant'}`}>
            <span className="text-xl font-bold">2</span>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${step === 2 ? 'text-primary' : 'text-on-surface-variant opacity-40'}`}>الصور والتواصل</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-16">
        {step === 1 ? (
          <section className="space-y-12 animate-in fade-in duration-500 slide-in-from-bottom-4">
             <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-1 bg-primary rounded-full opacity-80"></div>
                 <span className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">الخطوة الأولى</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight">تفاصيل العقار</h2>
              <p className="text-on-surface-variant font-medium opacity-50 text-lg">أدخل المعلومات الأساسية حول العقار الذي تريد تأجيره.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-10 bg-surface p-8 md:p-12 rounded-[3rem] border border-outline shadow-sm">
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40 pr-2">عنوان الإعلان</label>
                <input required name="title" value={formData.title} onChange={handleChange} className="w-full h-16 md:h-20 px-8 rounded-2xl border border-outline bg-background/50 text-on-surface focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-xl placeholder:opacity-20" placeholder="مثلاً: شقة فاخرة قريبة من الجامعة..." />
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40 pr-2">نوع العقار</label>
                <div className="flex flex-wrap gap-3">
                   {['شقة', 'ستوديو', 'غرفة', 'فيلا'].map(type => (
                      <button 
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, propertyType: type})}
                        className={`px-8 py-4 rounded-xl font-bold transition-all border-2 text-sm ${formData.propertyType === type ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-background/50 text-on-surface-variant border-outline hover:border-primary/30'}`}
                      >
                         {type}
                      </button>
                   ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40 pr-2">وصف العقار</label>
                <textarea 
                  required 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="w-full min-h-[200px] px-8 py-6 rounded-3xl border border-outline bg-background/50 text-on-surface focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-medium text-lg resize-none placeholder:opacity-20 leading-relaxed" 
                  placeholder="اكتب وصفاً مفصلاً للعقار ومواصفاته..."
                />
              </div>

              <div className="space-y-6">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40 pr-2">مميزات العقار</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {[
                     { name: 'isFurnished', label: 'مفروش', icon: <Home size={22} /> },
                     { name: 'hasParking', label: 'موقف سيارات', icon: <CheckCircle2 size={22} /> },
                     { name: 'hasWifi', label: 'واي فاي', icon: <Wifi size={22} /> },
                     { name: 'hasAC', label: 'مكيف هواء', icon: <Wind size={22} /> },
                     { name: 'hasHeating', label: 'تدفئة', icon: <Flame size={22} /> },
                     { name: 'hasBalcony', label: 'شرفة', icon: <Layout size={22} /> }
                   ].map(feature => (
                     <label key={feature.name} className={`flex flex-col gap-4 p-6 rounded-3xl border-2 transition-all cursor-pointer ${formData[feature.name] ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-outline hover:border-primary/20 bg-background/30'}`}>
                        <div className="flex items-center justify-between">
                           <div className={`${formData[feature.name] ? 'text-primary' : 'text-on-surface-variant opacity-30'}`}>
                              {feature.icon}
                           </div>
                           <input type="checkbox" name={feature.name} checked={formData[feature.name]} onChange={handleChange} className="hidden" />
                           <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData[feature.name] ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'border-outline'}`}>
                              {formData[feature.name] && <CheckCircle2 size={14} strokeWidth={3} />}
                           </div>
                        </div>
                        <span className="font-bold text-sm">{feature.label}</span>
                     </label>
                   ))}
                </div>
              </div>

              {/* Room Type */}
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40 pr-2">نوع الغرف</label>
                <div className="flex flex-wrap gap-3">
                   {['S+0', 'S+1', 'S+2', 'S+3', 'S+4+'].map(type => (
                      <button 
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, roomType: type})}
                        className={`px-8 py-4 rounded-xl font-bold transition-all border-2 text-sm ${formData.roomType === type ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-background/50 text-on-surface-variant border-outline hover:border-primary/30'}`}
                      >
                         {type}
                      </button>
                   ))}
                </div>
              </div>

              {/* Required Capacity */}
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40 pr-2">السعة المطلوبة</label>
                <input required type="number" name="requiredCapacity" value={formData.requiredCapacity || ''} onChange={handleChange} min="1" className="w-full h-16 md:h-20 px-8 rounded-2xl border border-outline bg-background/50 text-on-surface outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary font-bold text-xl" placeholder="1" />
              </div>

              {/* More Options Toggle */}
              <div className="pt-4 border-t border-outline/50">
                <button 
                  type="button"
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="flex items-center gap-3 text-primary font-bold text-[11px] uppercase tracking-[0.2em] hover:opacity-80 transition-all group"
                >
                  <ChevronDown size={18} className={`transition-transform duration-500 ${showMoreOptions ? 'rotate-180' : 'rotate-0'}`} />
                  {showMoreOptions ? 'خيارات أقل' : 'خيارات إضافية'}
                </button>
              </div>

              {/* Occupants & Rent (Conditional) */}
              <AnimatePresence>
                {showMoreOptions && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                       <div className="space-y-3">
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40 pr-2">السكان الحاليين</label>
                          <input type="number" name="occupants" value={formData.occupants || ''} onChange={handleChange} min="0" className="w-full h-16 rounded-2xl border border-outline bg-background/50 text-on-surface outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary font-bold text-lg" placeholder="0" />
                       </div>
                       <div className="space-y-3">
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40 pr-2">المقاعد المتاحة</label>
                          <input type="number" name="tenantsSharing" value={formData.tenantsSharing || ''} onChange={handleChange} min="1" className="w-full h-16 rounded-2xl border border-outline bg-background/50 text-on-surface outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary font-bold text-lg" placeholder="1" />
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Price & Calculation */}
              <div className="p-8 md:p-10 rounded-[2.5rem] bg-outline-variant/30 border border-outline space-y-8">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex-1 w-full space-y-3">
                       <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40 pr-2">الإيجار الإجمالي (شهرياً)</label>
                       <div className="flex gap-3">
                          <input required type="number" name="price" value={formData.price || ''} onChange={handleChange} className="flex-1 h-16 md:h-20 px-8 rounded-2xl border border-outline bg-surface text-on-surface outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary font-bold text-3xl" placeholder="0.00" />
                          <div className="h-16 md:h-20 px-8 bg-surface border border-outline rounded-2xl flex items-center font-bold text-primary text-sm uppercase tracking-widest">tnd</div>
                       </div>
                    </div>
                    
                    <div className="w-full md:w-auto flex flex-col items-center px-10 py-7 bg-surface rounded-[2rem] shadow-sm border border-outline relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                       <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mb-2 opacity-40">السعر الشهري</span>
                       <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-primary tracking-tight">{pricePerMonth}</span>
                          <span className="text-xs font-bold text-primary uppercase">tnd</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40 pr-2">الموقع (نصي)</label>
                <input required name="location" value={formData.location} onChange={handleChange} className="w-full h-16 md:h-20 px-8 rounded-2xl border border-outline bg-background/50 text-on-surface outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary font-bold text-lg" placeholder="مثلاً: تونس، حي النصر" />
              </div>
              
              {/* Map Section */}
              <div className="space-y-6">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40 pr-2">حدد الموقع على الخريطة</label>
                <div className="h-[300px] md:h-[400px] rounded-[2.5rem] overflow-hidden border border-outline z-0 shadow-sm relative">
                  <MapContainer center={[formData.latitude, formData.longitude]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationMarker 
                      position={markerPosition} 
                      setPosition={(pos) => {
                        setMarkerPosition(pos);
                        setFormData({ ...formData, latitude: pos.lat, longitude: pos.lng });
                      }} 
                    />
                  </MapContainer>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-6 py-2 rounded-full border border-outline shadow-xl z-[1000]">
                     <p className="text-[9px] text-on-surface font-bold uppercase tracking-[0.2em]">انقر لتحديد الموقع بدقة</p>
                  </div>
                </div>
              </div>

            </div>
          </section>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-500 slide-in-from-bottom-4">
             <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-1 bg-primary rounded-full opacity-80"></div>
                 <span className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">الخطوة الثانية</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight">الصور والتواصل</h2>
              <p className="text-on-surface-variant font-medium opacity-50 text-lg">أضف صوراً جذابة وكيفية تواصل المهتمين معك.</p>
            </div>

            {/* Photos Section */}
            <section className="bg-surface p-8 md:p-12 rounded-[3rem] border border-outline shadow-sm space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                   <h3 className="text-2xl font-bold text-on-surface tracking-tight">معرض الصور</h3>
                   <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] opacity-40">يُنصح برفع 3 صور على الأقل للمكان.</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                   <Plus size={24} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Upload Trigger */}
                <div 
                  className="aspect-square rounded-3xl border-2 border-dashed border-outline bg-background/30 flex flex-col items-center justify-center hover:border-primary transition-all cursor-pointer group relative overflow-hidden"
                >
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleImageUpload} 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    accept="image/*"
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">جاري الرفع</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-surface border border-outline flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                         <Plus size={24} className="text-primary" />
                      </div>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40">رفع صور</span>
                    </>
                  )}
                </div>

                {/* Images */}
                {formData.images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-3xl overflow-hidden shadow-sm group border border-outline">
                    <img src={img.startsWith('http') ? img : `${BACKEND_URL}${img}`} alt="Property" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-xl p-2 text-primary opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:bg-primary hover:text-white"
                    >
                      <Trash2 size={16} />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-0 w-full bg-primary/90 backdrop-blur text-white text-center py-2 text-[8px] font-bold tracking-[0.3em] uppercase">
                        صورة الغلاف
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
 
            {/* Contact Section */}
            <section className="p-8 md:p-12 rounded-[3rem] bg-zinc-900 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10"></div>
              
              <div className="flex items-center justify-between mb-12">
                <div className="flex flex-col gap-2 text-white">
                  <h3 className="text-2xl font-bold tracking-tight">معلومات التواصل</h3>
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">سيتم عرض هذه المعلومات للمهتمين فقط.</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                   <Mail size={24} />
                </div>
              </div>

              <div className="space-y-12">
                <div className="space-y-6">
                  <label className="block text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] pr-2">طريقة التواصل المفضلة</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {[
                       { id: 'اتصال هاتفي فقط', label: 'اتصال فقط', icon: <Mail size={18} /> },
                       { id: 'واتساب فقط', label: 'واتساب فقط', icon: <MessageSquare size={18} /> },
                       { id: 'اتصال وواتساب', label: 'الكل', icon: <CheckCircle2 size={18} /> }
                     ].map(method => (
                        <button 
                          key={method.id}
                          type="button"
                          onClick={() => setFormData({...formData, contactMethod: method.id})}
                          className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-bold transition-all border-2 text-sm ${formData.contactMethod === method.id ? 'bg-white text-zinc-900 border-white shadow-xl' : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'}`}
                        >
                           {method.icon}
                           {method.label}
                        </button>
                     ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="block text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] pr-2">رقم الهاتف</label>
                  <div className="flex items-center h-20 bg-white/5 border border-white/5 rounded-[1.5rem] px-8 gap-6 focus-within:border-primary/30 transition-all shadow-inner">
                    <select 
                      name="countryCode" 
                      value={formData.countryCode} 
                      onChange={handleChange}
                      className="bg-transparent border-none focus:ring-0 text-white font-bold text-xl outline-none appearance-none cursor-pointer"
                    >
                      <option value="+216" className="bg-zinc-900 text-white font-bold">+216</option>
                      <option value="+966" className="bg-zinc-900 text-white font-bold">+966</option>
                    </select>
                    <div className="w-[1px] h-8 bg-white/10"></div>
                    <input 
                      dir="ltr"
                      required
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="flex-1 border-none focus:ring-0 text-white bg-transparent text-2xl font-bold placeholder:text-white/5 tracking-widest"
                      type="tel" 
                      placeholder="XX XXX XXX"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Buttons */}
        <div className="pt-10 flex flex-col gap-5">
          <button 
            disabled={loading}
            type="submit"
            className="w-full py-6 bg-primary text-white rounded-[2rem] font-bold text-xl shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 group"
          >
            {loading ? (
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="tracking-tight">{step === 1 ? 'الخطوة التالية' : (id ? 'تحديث الإعلان' : 'نشر الإعلان الآن')}</span>
                <ChevronLeft size={24} className={`transition-transform group-hover:-translate-x-1 ${step === 1 ? 'rotate-0' : 'rotate-90'}`} />
              </>
            )}
          </button>
          
          {step === 2 && (
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-5 rounded-[2rem] border border-outline text-on-surface font-bold text-base hover:bg-background/50 transition-all flex items-center justify-center gap-3 opacity-60 hover:opacity-100"
            >
              <ChevronRight size={20} />
              <span>العودة لتعديل البيانات</span>
            </button>
          )}
        </div>
      </form>
    </main>
  );
};

export default PostAdForm;
