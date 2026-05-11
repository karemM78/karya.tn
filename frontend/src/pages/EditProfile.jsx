import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, uploadAvatar, BACKEND_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { User, MapPin, FileText, Camera, Save } from 'lucide-react';

const EditProfile = () => {
  const { setUser } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    avatar: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getProfile();
        setFormData({
          name: data.name,
          email: data.email,
          bio: data.bio || '',
          location: data.location || '',
          avatar: data.avatar || '',
        });
        setPreviewUrl(data.avatar ? (data.avatar.startsWith('http') ? data.avatar : `${BACKEND_URL}${data.avatar}`) : '');
      } catch (error) {
        showNotification('يرجى تسجيل الدخول للمتابعة', 'error');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('bio', formData.bio);
    submissionData.append('location', formData.location);
    if (imageFile) {
      submissionData.append('image', imageFile);
    }

    try {
      const { data } = await updateProfile(submissionData);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      showNotification('✅ تم تحديث الملف الشخصي بنجاح!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile Update Error:', error);
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : 'فشل تحديث الملف الشخصي';
      showNotification(`❌ ${message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-24" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 md:mb-24">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-1 bg-primary rounded-full opacity-80"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">حسابي الشخصي</span>
           </div>
           <h1 className="text-4xl md:text-7xl font-bold text-on-surface tracking-tight leading-none">تعديل البيانات</h1>
           <p className="text-on-surface-variant font-medium opacity-50 text-base md:text-lg max-w-xl">خصص ملفك الشخصي لزيادة المصداقية وتسهيل التواصل مع الآخرين.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface p-10 md:p-16 rounded-[3rem] border border-outline shadow-sm space-y-16 animate-in fade-in duration-700 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 blur-[120px] -z-10 group-hover:bg-primary/10 transition-colors duration-1000"></div>
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-8">
           <div 
             onClick={() => document.getElementById('avatar-input').click()}
             className="relative w-48 h-48 rounded-[2.5rem] overflow-hidden border-4 border-outline shadow-xl group cursor-pointer ring-[12px] ring-primary/5 hover:ring-primary/10 transition-all duration-500"
           >
              {previewUrl ? (
                <img src={previewUrl.startsWith('blob:') || previewUrl.startsWith('http') ? previewUrl : `${BACKEND_URL}${previewUrl}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="الملف الشخصي" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-background text-on-surface-variant/20">
                   <User size={64} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                 <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-3">
                    <Camera size={24} />
                 </div>
                 <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">تغيير الصورة</span>
              </div>
           </div>
           <input 
             id="avatar-input"
             type="file"
             accept="image/*"
             onChange={handleImageSelect}
             className="hidden"
           />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] pr-2 opacity-40">الاسم بالكامل</label>
            <div className="relative group/input">
               <User className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within/input:text-primary transition-colors" size={20} />
               <input 
                 required 
                 name="name" 
                 value={formData.name} 
                 onChange={handleChange} 
                 placeholder="محمد بن علي"
                 className="w-full h-16 md:h-20 pr-16 pl-8 rounded-2xl border border-outline bg-background/50 text-on-surface focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-lg" 
               />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] pr-2 opacity-40">البريد الإلكتروني</label>
            <div className="relative">
              <input disabled value={formData.email} className="w-full h-16 md:h-20 px-8 rounded-2xl border border-outline bg-background/20 text-on-surface-variant/40 cursor-not-allowed font-bold text-lg" />
            </div>
          </div>

          <div className="space-y-3 md:col-span-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] pr-2 opacity-40">الموقع الحالي</label>
            <div className="relative group/input">
              <MapPin className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within/input:text-primary transition-colors" size={20} />
              <input 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                className="w-full h-16 md:h-20 pr-16 pl-8 rounded-2xl border border-outline bg-background/50 text-on-surface focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-lg" 
                placeholder="تونس، سوسة، نابل..."
              />
            </div>
          </div>

          <div className="space-y-3 md:col-span-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] pr-2 opacity-40">النبذة التعريفية</label>
            <div className="relative group/input">
              <FileText className="absolute right-6 top-7 text-on-surface-variant/20 group-focus-within/input:text-primary transition-colors" size={20} />
              <textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                className="w-full h-48 pr-16 pl-8 pt-7 rounded-3xl border border-outline bg-background/50 text-on-surface focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none font-medium text-lg transition-all resize-none placeholder:opacity-20 leading-relaxed" 
                placeholder="تحدث عن نفسك، هواياتك، وما تبحث عنه في شريك السكن..."
              ></textarea>
            </div>
          </div>
        </div>

        <button 
          disabled={loading}
          type="submit" 
          className="btn-primary w-full py-6 text-xl font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-4 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {loading ? (
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Save size={24} />
              <span>حفظ البيانات</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
