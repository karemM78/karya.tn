import React, { useEffect, useState } from 'react';
import { getAdminStats } from '../services/api';
import { 
  Users, 
  Home, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
  <div className="bg-surface p-8 rounded-[2.5rem] border border-outline shadow-sm hover:border-primary/20 transition-all group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10 group-hover:bg-primary/10 transition-colors"></div>
    <div className="flex justify-between items-start mb-8">
      <div className="p-4 rounded-2xl bg-background border border-outline text-primary group-hover:scale-110 transition-transform shadow-sm">
        {icon}
      </div>
      <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${trend === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trendValue}
      </div>
    </div>
    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2 opacity-40">{title}</p>
    <h3 className="text-3xl font-bold text-on-surface tracking-tight">{value}</h3>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 900 },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-6">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-xl shadow-primary/20"></div>
      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.4em] animate-pulse">جاري التحميل...</span>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-1 bg-primary rounded-full opacity-80"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">مدير المنصة</span>
           </div>
           <h1 className="text-4xl md:text-6xl font-bold text-on-surface tracking-tight">نظرة عامة</h1>
           <p className="text-on-surface-variant font-medium opacity-50 text-lg">مرحباً بك مجدداً، إليك آخر الإحصائيات العامة للمنصة.</p>
        </div>
        <button className="btn-primary flex items-center gap-3 py-5 px-10 shadow-xl shadow-primary/20 text-xs tracking-widest uppercase font-bold">
          <TrendingUp size={18} />
          إنشاء تقرير
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="المستخدمين" 
          value={stats?.totalUsers || 0} 
          icon={<Users size={24} />} 
          trend="up"
          trendValue="+12%"
        />
        <StatCard 
          title="العقارات" 
          value={stats?.totalListings || 0} 
          icon={<Home size={24} />} 
          trend="up"
          trendValue="+8%"
        />
        <StatCard 
          title="المقبولة" 
          value={stats?.approvedListings || 0} 
          icon={<CheckCircle2 size={24} />} 
          trend="up"
          trendValue="+5%"
        />
        <StatCard 
          title="قيد الانتظار" 
          value={stats?.pendingListings || 0} 
          icon={<Clock size={24} />} 
          trend="down"
          trendValue="-2%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Growth Chart */}
        <div className="bg-surface p-10 rounded-[3rem] border border-outline shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] -z-10"></div>
          <h3 className="text-sm font-bold mb-12 text-on-surface tracking-[0.2em] uppercase opacity-40">تحليلات النمو</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline)" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--on-surface-variant)', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--on-surface-variant)', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{backgroundColor: 'var(--surface)', border: '1px solid var(--outline)', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)'}}
                  itemStyle={{color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px'}}
                  labelStyle={{color: 'var(--on-surface-variant)', fontWeight: 'bold', marginBottom: '6px', opacity: 0.5}}
                />
                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-surface p-10 rounded-[3rem] border border-outline shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[120px] -z-10"></div>
          <h3 className="text-sm font-bold mb-12 text-on-surface tracking-[0.2em] uppercase opacity-40">أحدث النشاطات</h3>
          <div className="flex-1 space-y-5">
            {stats?.recentListings.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-background/30 border border-outline hover:border-primary/20 transition-all group">
                <div className="flex items-center gap-5">
                  <div className={`p-3 rounded-xl transition-all ${item.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
                    {item.status === 'approved' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{item.title}</p>
                    <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40">{new Date(item.createdAt).toLocaleDateString('ar-TN')}</p>
                  </div>
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl border ${item.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/10' : 'bg-primary/10 text-primary border-primary/10'}`}>
                  {item.status === 'approved' ? 'مقبول' : 'قيد الانتظار'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
