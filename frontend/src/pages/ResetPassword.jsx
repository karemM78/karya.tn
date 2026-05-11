import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Lock, Loader2, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const startCountdown = () => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return showNotification('❌ كلمة المرور غير متطابقة', 'error');
    }

    if (password.length < 6) {
      return showNotification('❌ يجب أن تكون كلمة المرور 6 أحرف على الأقل', 'error');
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      showNotification('✅ تم تغيير كلمة المرور بنجاح!');
      setSuccess(true);
      startCountdown();
    } catch (error) {
      const message = error.response?.data?.message || '❌ فشل إعادة تعيين كلمة المرور، قد يكون الرابط منتهياً';
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background py-16 px-6 transition-theme" dir="rtl">
      <div className="max-w-[500px] w-full bg-surface p-10 md:p-14 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-outline relative overflow-hidden transition-theme group animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10"></div>
        
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary border border-primary/20 shadow-lg">
            <Lock size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter uppercase">تأمين الحساب</h1>
          <p className="text-on-surface-variant font-bold opacity-60 leading-relaxed max-w-xs mx-auto">أدخل كلمة المرور الجديدة والقوية لحماية حسابك.</p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-8 pt-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pr-4 opacity-50">كلمة المرور الجديدة</label>
                <div className="relative">
                  <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={20} />
                  <input 
                    required 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className="input-field pr-14 font-bold" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pr-4 opacity-50">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={20} />
                  <input 
                    required 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className="input-field pr-14 font-bold" 
                  />
                </div>
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50 py-5 text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/30"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'تحديث كلمة المرور'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-8 pt-6">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 border border-green-500/20 animate-bounce">
                <CheckCircle size={48} />
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 text-on-surface p-6 rounded-3xl space-y-2">
              <p className="font-black text-primary uppercase tracking-widest text-xs mb-1">تم التغيير بنجاح</p>
              <p className="font-bold text-sm opacity-80">تم تحديث كلمة المرور الخاصة بك. سيتم توجيهك تلقائياً إلى صفحة الدخول.</p>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-40">توجيه خلال {countdown} ثانية...</p>
              <Link to="/login" className="btn-primary w-full py-5 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 block">
                دخول الآن
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
