import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Trash2, Loader2, Star, Search, CheckCircle, XCircle, MessageSquare, History, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { toast } from 'sonner';

interface ReviewData {
    id: string;
    rating: number;
    comment: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
    userName: string;
    productName: string;
    createdAt: string;
}

interface ReviewLog {
    id: string;
    oldStatus: string;
    newStatus: string;
    adminName: string;
    reason: string | null;
    createdAt: string;
}

export function AdminReviewsPage() {
    const { token } = useAuth();
    const { t } = useLanguage();
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    
    // Logs state
    const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);
    const [logs, setLogs] = useState<ReviewLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [showLogs, setShowLogs] = useState(false);

    // Status Update Dialog
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [pendingStatusChange, setPendingStatusChange] = useState<{id: string, status: string} | null>(null);
    const [statusReason, setStatusReason] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (token) {
            fetchReviews();
        }
    }, [token]);

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/products?resource=reviews', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setReviews(data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async (review: ReviewData) => {
        setSelectedReview(review);
        setShowLogs(true);
        setLogsLoading(true);
        try {
            const res = await fetch(`/api/products?resource=reviews&logs=true&reviewId=${review.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setLogs(data);
            }
        } catch (error) {
            toast.error('Failed to fetch logs');
        } finally {
            setLogsLoading(false);
        }
    };

    const initiateStatusChange = (id: string, status: string) => {
        if (status === 'APPROVED') {
            updateStatus(id, status);
        } else {
            setPendingStatusChange({ id, status });
            setStatusReason('');
            setShowStatusDialog(true);
        }
    };

    const updateStatus = async (id: string, status: string, reason?: string) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/products?resource=reviews&id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, reason })
            });

            if (res.ok) {
                toast.success(`Review ${status.toLowerCase()}`);
                setShowStatusDialog(false);
                fetchReviews();
            }
        } catch (error) {
            toast.error('Failed to update review status');
        } finally {
            setUpdating(false);
        }
    };

    const deleteReview = async (id: string) => {
        if (!confirm('Delete this review?')) return;
        try {
            const res = await fetch(`/api/products?resource=reviews&id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success('Review deleted');
                setReviews(reviews.filter(r => r.id !== id));
            }
        } catch (error) {
            toast.error('Failed to delete review');
        }
    };

    const filteredReviews = reviews.filter(r => {
        const matchesSearch = r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.comment?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#4A5568]/30 border-t-[#4A5568] rounded-full animate-spin" />
                <span className="mt-4 text-slate-500">{t('admin.loading')}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('admin.reviewModeration')}</h1>
                <p className="text-gray-500 mt-1 text-sm">{t('admin.reviews')}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder={t('admin.searchPlaceholder')}
                        className="pl-10 bg-white border-gray-200"
                        value={searchQuery}
                        onChange={(e: any) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                statusFilter === s ? 'bg-[#4A5568] text-white' : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                        >
                            {s === 'ALL' ? t('header.all') : 
                             s === 'PENDING' ? t('admin.reviewPending') : 
                             s === 'APPROVED' ? t('admin.reviewApproved') : 
                             t('admin.reviewRejected')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-slate-700">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left rtl:text-right py-3 px-4 font-semibold text-gray-500">{t('admin.customer')}</th>
                            <th className="text-left rtl:text-right py-3 px-4 font-semibold text-gray-500">{t('admin.products')}</th>
                            <th className="text-left rtl:text-right py-3 px-4 font-semibold text-gray-500">{t('product.customerReviews')}</th>
                            <th className="text-left rtl:text-right py-3 px-4 font-semibold text-gray-500">{t('admin.status')}</th>
                            <th className="text-right rtl:text-left py-3 px-4 font-semibold text-gray-500">{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredReviews.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4 font-medium">{r.userName}</td>
                                <td className="py-4 px-4 text-slate-600 font-medium">{r.productName}</td>
                                <td className="py-4 px-4 max-w-xs">
                                    <div className="flex items-center gap-1 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                    <p className="text-gray-500 line-clamp-2 italic">{r.comment || 'No comment'}</p>
                                </td>
                                <td className="py-4 px-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        r.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                        r.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                        'bg-rose-100 text-rose-700'
                                    }`}>
                                        {r.status === 'PENDING' ? t('admin.reviewPending') : 
                                         r.status === 'APPROVED' ? t('admin.reviewApproved') : 
                                         t('admin.reviewRejected')}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-right rtl:text-left">
                                    <div className="flex justify-end rtl:flex-row-reverse gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:bg-gray-100" onClick={() => fetchLogs(r)} title="Moderation History">
                                            <History className="h-4 w-4" />
                                        </Button>
                                        {r.status === 'PENDING' && (
                                            <>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" onClick={() => initiateStatusChange(r.id, 'APPROVED')} title={t('admin.approveReview')}>
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-600 hover:bg-rose-50" onClick={() => initiateStatusChange(r.id, 'REJECTED')} title={t('admin.rejectReview')}>
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:bg-gray-100" onClick={() => deleteReview(r.id)} title={t('admin.delete')}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredReviews.length === 0 && (
                    <div className="py-12 text-center text-gray-400 font-medium">
                        {t('admin.noResults')}
                    </div>
                )}
            </div>

            {/* Status Change Reason Dialog */}
            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {pendingStatusChange?.status === 'REJECTED' ? 'Reject Review' : 'Update Review Status'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Reason for {pendingStatusChange?.status.toLowerCase()}</label>
                            <textarea
                                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-100 outline-none text-sm min-h-[100px]"
                                placeholder="E.g., Profanity, irrelevant content, spam..."
                                value={statusReason}
                                onChange={(e) => setStatusReason(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>Cancel</Button>
                            <Button 
                                disabled={updating || !statusReason.trim()}
                                onClick={() => updateStatus(pendingStatusChange!.id, pendingStatusChange!.status, statusReason)}
                                className={pendingStatusChange?.status === 'REJECTED' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900'}
                            >
                                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Moderation History Dialog */}
            <Dialog open={showLogs} onOpenChange={setShowLogs}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="h-5 w-5 text-slate-500" />
                            Moderation History
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                        {logsLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                No history found for this review.
                            </div>
                        ) : (
                            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                                {logs.map((log) => (
                                    <div key={log.id} className="relative">
                                        <div className="absolute -left-[22px] top-1 h-3 w-3 rounded-full bg-white border-2 border-slate-300" />
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-900">{log.adminName}</span>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-slate-400 line-through">{log.oldStatus}</span>
                                                <span className="text-slate-400">→</span>
                                                <span className={`font-bold ${
                                                    log.newStatus === 'APPROVED' ? 'text-emerald-600' :
                                                    log.newStatus === 'REJECTED' ? 'text-rose-600' : 'text-amber-600'
                                                }`}>
                                                    {log.newStatus}
                                                </span>
                                            </div>
                                            {log.reason && (
                                                <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 italic">
                                                    "{log.reason}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Input({ className, ...props }: any) {
  return <input className={`h-11 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 w-full ${className}`} {...props} />;
}
