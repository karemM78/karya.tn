import React, { useEffect, useState } from 'react';
import { getAdminListings, updateAdminListingStatus, deleteAdminListing } from '../services/api';
import { Trash2, CheckCircle, XCircle, ExternalLink, Search, Clock } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const AdminListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showNotification } = useNotification();

  const fetchListings = async () => {
    try {
      const { data } = await getAdminListings();
      setListings(data);
    } catch (error) {
      showNotification('Failed to fetch listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAdminListingStatus(id, newStatus);
      showNotification(`Listing ${newStatus} successfully`);
      fetchListings();
    } catch (error) {
      showNotification('Failed to update listing status', 'error');
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deleteAdminListing(id);
      showNotification('Listing deleted successfully');
      fetchListings();
    } catch (error) {
      showNotification('Failed to delete listing', 'error');
    }
  };

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-1 bg-primary rounded-full opacity-80"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">إدارة المحتوى</span>
           </div>
           <h1 className="text-4xl md:text-6xl font-bold text-on-surface tracking-tight">العقارات المنشورة</h1>
           <p className="text-on-surface-variant font-medium opacity-50 text-lg">مراجعة، قبول أو رفض الإعلانات الجديدة على المنصة.</p>
        </div>
        
        <div className="flex items-center bg-surface border border-outline rounded-2xl px-5 py-3 w-full md:w-96 group focus-within:border-primary/30 transition-all shadow-sm">
          <Search size={20} className="text-on-surface-variant/40" />
          <input 
            type="text" 
            placeholder="بحث بالعنوان أو المالك..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:ring-0 w-full text-sm font-bold pr-4 placeholder:text-on-surface-variant/20" 
          />
        </div>
      </div>

      <div className="bg-surface rounded-[2.5rem] border border-outline shadow-sm overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead>
              <tr className="bg-background/20 border-b border-outline">
                <th className="px-10 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40">العقار</th>
                <th className="px-10 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40">المالك</th>
                <th className="px-10 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40">السعر</th>
                <th className="px-10 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40 text-center">الحالة</th>
                <th className="px-10 py-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/50">
              {loading ? (
                <tr><td colSpan="5" className="py-24 text-center">
                  <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto opacity-20"></div>
                </td></tr>
              ) : filteredListings.length === 0 ? (
                <tr><td colSpan="5" className="py-24 text-center">
                   <p className="text-on-surface-variant font-bold text-sm uppercase tracking-widest opacity-20">لا توجد نتائج مطابقة</p>
                </td></tr>
              ) : filteredListings.map((listing) => (
                <tr key={listing._id} className="hover:bg-background/10 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-outline shadow-sm">
                         <img src={listing.images[0]} className="w-full h-full object-cover" alt="" />
                      </div>
                      <span className="font-bold text-on-surface line-clamp-1">{listing.title}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-on-surface-variant font-medium opacity-60">{listing.user?.name}</td>
                  <td className="px-10 py-6">
                     <span className="font-bold text-on-surface">{listing.price}</span>
                     <span className="text-[9px] font-bold text-primary uppercase mr-1">tnd</span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border ${listing.status === 'approved' ? 'bg-green-500/5 text-green-500 border-green-500/10' : listing.status === 'rejected' ? 'bg-primary/5 text-primary border-primary/10' : 'bg-orange-500/5 text-orange-500 border-orange-500/10'}`}>
                      {listing.status === 'approved' ? 'مقبول' : listing.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => handleStatusChange(listing._id, 'approved')}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${listing.status === 'approved' ? 'text-green-500 bg-green-500/10 border-green-500/10' : 'text-on-surface-variant/40 border-outline hover:text-green-500 hover:border-green-500/20'}`}
                        title="Approve"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleStatusChange(listing._id, 'rejected')}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${listing.status === 'rejected' ? 'text-primary bg-primary/10 border-primary/10' : 'text-on-surface-variant/40 border-outline hover:text-primary hover:border-primary/20'}`}
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteListing(listing._id)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant/20 hover:text-primary hover:bg-primary/5 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminListings;
