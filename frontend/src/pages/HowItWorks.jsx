import React from 'react';
import { Search, PlusCircle, MessageSquare, ShieldCheck, MapPin, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HowItWorks = () => {
  const { user } = useAuth();
  const steps = [
    {
      title: 'ابحث عن عقارك',
      description: 'استخدم محرك البحث المتطور والخرائط التفاعلية للعثور على العقار المثالي في الموقع الذي تفضله.',
      icon: <Search className="w-10 h-10" />,
      color: 'bg-primary/10 text-primary'
    },
    {
      title: 'أضف إعلانك بسهولة',
      description: 'سواء كنت مالكاً أو وكيلاً، يمكنك إضافة عقارك في دقائق مع صور عالية الجودة وتحديد دقيق للموقع.',
      icon: <PlusCircle className="w-10 h-10" />,
      color: 'bg-primary/10 text-primary'
    },
    {
      title: 'تواصل مباشرة',
      description: 'تواصل مع أصحاب العقارات عبر الرسائل الداخلية أو واتساب أو الاتصال الهاتفي مباشرة.',
      icon: <MessageSquare className="w-10 h-10" />,
      color: 'bg-primary/10 text-primary'
    }
  ];

  const features = [
    {
      title: 'تحديد دقيق للموقع',
      description: 'نظام خرائط متطور يتيح لك اختيار الموقع بدقة متناهية.',
      icon: <MapPin size={24} />
    },
    {
      title: 'أمان وموثوقية',
      description: 'نحن نتحقق من الحسابات لضمان تجربة آمنة لجميع المستخدمين.',
      icon: <ShieldCheck size={24} />
    },
    {
      title: 'سرعة وكفاءة',
      description: 'منصة سريعة الاستجابة توفر لك أفضل تجربة تصفح.',
      icon: <Zap size={24} />
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      {/* Hero Section */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-morphism rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-xl">
            <ShieldCheck size={14} className="text-primary" />
            موثوق وآمن بنسبة 100%
          </div>
          <h1 className="text-5xl md:text-8xl font-bold mb-6 leading-none tracking-tight text-on-surface uppercase">
            كيف تبدأ مع <span className="text-primary">karya.tn</span>؟
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant font-medium max-w-2xl mx-auto opacity-60 leading-relaxed">
            نحن هنا لنجعل رحلة البحث عن عقار أو كراءه تجربة ممتعة وسهلة. 
            اكتشف الخطوات البسيطة للبدء اليوم في أكبر منصة عقارية بتونس.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            {!user ? (
              <Link to="/signup" className="btn-primary px-10 py-5 text-lg shadow-xl shadow-primary/10 w-full sm:w-auto">
                ابدأ الآن مجاناً
              </Link>
            ) : (
              <Link to={user.role === 'client' ? '/' : '/dashboard'} className="btn-primary px-10 py-5 text-lg shadow-xl shadow-primary/10 w-full sm:w-auto">
                اذهب إلى {user.role === 'client' ? 'الرئيسية' : 'لوحة التحكم'}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="max-w-7xl mx-auto py-24 px-6">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-6xl font-bold text-on-surface tracking-tight uppercase">ثلاث خطوات بسيطة</h2>
          <p className="text-on-surface-variant font-bold opacity-30 uppercase tracking-widest text-[10px]">عملية سهلة وسريعة للجميع</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {steps.map((step, index) => (
            <div key={index} className="bg-surface p-10 rounded-[2.5rem] shadow-sm border border-outline hover:border-primary/20 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10 group-hover:bg-primary/10 transition-colors"></div>
              <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm border border-primary/5`}>
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-4 tracking-tight">{step.title}</h3>
              <p className="text-on-surface-variant font-medium leading-relaxed opacity-50 text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-surface/30 backdrop-blur-sm border-y border-outline/50 py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center gap-6">
                <div className="bg-surface p-4 rounded-xl shadow-sm text-primary border border-outline">
                  {feature.icon}
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-on-surface uppercase tracking-tight">{feature.title}</h4>
                  <p className="text-on-surface-variant font-medium opacity-50 leading-relaxed text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto py-24 px-6">
        <div className="bg-on-surface text-surface rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px]"></div>
          <h2 className="text-4xl md:text-7xl font-bold mb-6 relative z-10 text-white tracking-tight uppercase">هل أنت مستعد لنشر عقارك؟</h2>
          <p className="text-lg md:text-xl text-white font-medium mb-12 max-w-2xl mx-auto relative z-10 opacity-60 leading-relaxed">
            انضم إلى آلاف المستخدمين الذين يثقون في منصتنا لبيع وتأجير عقاراتهم بأفضل الأسعار وأسرع وقت في السوق التونسية.
          </p>
          <Link to="/post-ad" className="btn-primary px-10 py-5 text-xl shadow-xl shadow-primary/20 relative z-10 inline-block uppercase tracking-widest">
            أنشر أول إعلان لك الآن
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
