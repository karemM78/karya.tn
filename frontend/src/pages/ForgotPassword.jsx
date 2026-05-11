import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Mail, Loader2, ArrowRight, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (resendTimer > 0) return;

    setLoading(true);
    try {
      const { data } = await forgotPassword(email);
      showNotification(data.message || '✅ تم إرسال رابط إعادة تعيين كلمة المرور.');
      setSubmitted(true);
      startResendTimer();
    } catch (error) {
      const message = error.response?.data?.message || '❌ فشل إرسال الطلب، تأكد من البريد الإلكتروني';
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
            <Mail size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter uppercase">إعادة تعيين</h1>
          <p className="text-on-surface-variant font-bold opacity-60 leading-relaxed max-w-xs mx-auto">أدخل بريدك الإلكتروني وسنرسل لك تعليمات استعادة الوصول إلى حسابك.</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-8 pt-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pr-4 opacity-50">البريد الإلكتروني المسجل</label>
              <div className="relative">
                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={20} />
                <input 
                  required 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@example.com" 
                  className="input-field pr-14 font-bold" 
                />
              </div>
            </div>

            <button 
              disabled={loading || resendTimer > 0}
              type="submit" 
              className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50 py-5 text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/30"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'إرسال الرابط'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-8 pt-6">
            <div className="bg-primary/5 border border-primary/20 text-on-surface p-6 rounded-3xl space-y-2">
              <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mb-2">
                <CheckCircle size={14} />
                تحقق من بريدك
              </div>
              <p className="font-bold text-sm opacity-80">تم إرسال الرابط بنجاح. يرجى التحقق من صندوق الوارد (أو البريد العشوائي) لإكمال العملية.</p>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={() => handleSubmit()}
                disabled={loading || resendTimer > 0}
                className="text-sm font-black text-primary hover:brightness-110 disabled:text-on-surface-variant disabled:opacity-40 transition-all uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
              >
                {resendTimer > 0 ? `إعادة الإرسال بعد ${resendTimer} ثانية` : 'لم يصلك البريد؟ إعادة الإرسال'}
              </button>

              <Link to="/login" className="btn-primary bg-background border border-outline text-on-surface hover:bg-surface w-full flex items-center justify-center gap-3 py-4 font-black uppercase tracking-widest transition-all">
                <ArrowRight size={20} className="rotate-180" />
                العودة للدخول
              </Link>
            </div>
          </div>
        )}

        {!submitted && (
          <div className="text-center pt-8 border-t border-outline/50 mt-8">
            <p className="text-sm text-on-surface-variant font-bold opacity-60 uppercase tracking-tight">
              تذكرت كلمة المرور؟ <Link to="/login" className="text-primary font-black hover:brightness-110 transition-all">دخول</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
