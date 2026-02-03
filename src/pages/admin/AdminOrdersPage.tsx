import { useState, useEffect, useCallback } from 'react';
import { 
    ShoppingBag, 
    Clock, 
    Package, 
    Truck, 
    CheckCircle2, 
    XCircle, 
    Search, 
    Calendar, 
    History, 
    Home, 
    User,
    Shield
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import { useLanguage } from '../../contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

interface OrderLog {
    id: string;
    oldStatus: string;
    newStatus: string;
    createdAt: string;
    userName: string;
    userRole: string;
}

interface Order {
    id: string;
    orderNumber: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    confirmedAt?: string | null;
    processingAt?: string | null;
    shippedAt?: string | null;
    deliveredAt?: string | null;
    cancelledAt?: string | null;
    shopPayoutStatus?: string;
    shopPayoutId?: string | null;
    logs?: OrderLog[];
}

export function AdminOrdersPage() {
    const { t, formatCurrency, isRTL } = useLanguage();

    const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
        PENDING: { label: t('admin.pending'), icon: Clock, color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' },
        CONFIRMED: { label: t('shop.status.CONFIRMED'), icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        PROCESSING: { label: t('admin.processing'), icon: Package, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
        SHIPPED: { label: t('admin.shipped'), icon: Truck, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
        DELIVERED: { label: t('admin.delivered'), icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        CANCELLED: { label: t('admin.cancelled'), icon: XCircle, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    };
    const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    const PAYOUT_STATUS_OPTIONS = ['NOT_REQUESTED', 'QUEUED', 'PAID_OUT', 'WITHHELD'];

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [payoutFilter, setPayoutFilter] = useState<string>('ALL');
    
    // Timeline state
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showTimeline, setShowTimeline] = useState(false);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'ALL') {
                params.set('status', statusFilter);
            }
            if (payoutFilter !== 'ALL') {
                params.set('payoutStatus', payoutFilter);
            }
            const query = params.toString();
            const res = await fetch(query ? `/api/orders?${query}` : '/api/orders');
            const data = await res.json();
            if (res.ok) {
                setOrders(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    }, [payoutFilter, statusFilter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success(t('common.success'));
                fetchOrders(); // Refresh to get logs/timestamps
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to update');
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const openTimeline = (order: Order) => {
        setSelectedOrder(order);
        setShowTimeline(true);
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        const matchesPayout = payoutFilter === 'ALL' || order.shopPayoutStatus === payoutFilter;
        return matchesSearch && matchesStatus && matchesPayout;
    });

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'PENDING').length,
        processing: orders.filter(o => o.status === 'PROCESSING').length,
        delivered: orders.filter(o => o.status === 'DELIVERED').length,
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                <span className="mt-4 text-slate-500">{t('common.loading')}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {t('admin.orders')}
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">{t('admin.totalOrders')}: {orders.length}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={ShoppingBag} label={t('admin.totalOrders')} value={stats.total} color="bg-slate-800" />
                <StatCard icon={Clock} label={t('admin.pending')} value={stats.pending} color="bg-amber-500" />
                <StatCard icon={Package} label={t('admin.processing')} value={stats.processing} color="bg-blue-500" />
                <StatCard icon={CheckCircle2} label={t('admin.delivered')} value={stats.delivered} color="bg-emerald-500" />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400`} />
                    <Input
                        placeholder={t('admin.searchPlaceholder')}
                        className={`${isRTL ? 'pr-10' : 'pl-10'} bg-white border-gray-200 focus:border-slate-800 rounded-lg`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['ALL', ...STATUS_OPTIONS].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                statusFilter === status
                                    ? 'bg-slate-800 text-white shadow-sm'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {status === 'ALL' ? t('header.all') : STATUS_CONFIG[status]?.label || status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('shop.payoutStatus')}</span>
                <div className="flex gap-2 flex-wrap">
                    {['ALL', ...PAYOUT_STATUS_OPTIONS].map((status) => (
                        <button
                            key={status}
                            onClick={() => setPayoutFilter(status)}
                            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                payoutFilter === status
                                    ? 'bg-slate-800 text-white shadow-sm'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {status === 'ALL' ? t('header.all') : t(`shop.payout.${status}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.orderId')}</th>
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden sm:table-cell`}>{t('admin.customer')}</th>
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell`}>{t('admin.date')}</th>
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.amount')}</th>
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500`}>Payout</th>
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.status')}</th>
                                <th className="px-4 py-4 text-right rtl:text-left">{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map((order) => {
                                const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                                
                                return (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-mono text-sm font-bold text-slate-900">
                                                {order.orderNumber}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-mono">#{order.id.slice(-6)}</div>
                                        </td>
                                        <td className="py-3 px-4 hidden sm:table-cell">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                                                    {order.customerEmail[0].toUpperCase()}
                                                </div>
                                                <span className="text-xs text-gray-700 truncate max-w-[150px]">{order.customerEmail}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 hidden md:table-cell">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span className="text-xs">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm font-bold text-gray-900">
                                                {formatCurrency(order.totalAmount)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="secondary" className="w-fit text-[10px] py-0 px-1.5 h-auto font-medium">
                                                    {t(`shop.payout.${order.shopPayoutStatus || 'NOT_REQUESTED'}`)}
                                                </Badge>
                                                {order.shopPayoutId && (
                                                    <span className="text-[9px] text-gray-400 font-mono">ID: {order.shopPayoutId.slice(-6)}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="relative inline-block">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                                    className={`appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${config.bg} ${config.color} ${config.border} focus:outline-none focus:ring-2 focus:ring-slate-800/20`}
                                                >
                                                    {STATUS_OPTIONS.map(status => (
                                                        <option key={status} value={status}>{STATUS_CONFIG[status]?.label || status}</option>
                                                    ))}
                                                </select>
                                                <div className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 pointer-events-none`}>
                                                    <svg className={`w-3 h-3 ${config.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right rtl:text-left">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-gray-400 hover:text-slate-800" 
                                                onClick={() => openTimeline(order)}
                                            >
                                                <History className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="py-12 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gray-100 mb-4">
                            <ShoppingBag className="h-7 w-7 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('admin.noResults')}</h3>
                        <p className="text-gray-500">
                            {searchQuery || statusFilter !== 'ALL' 
                                ? t('admin.noResults') 
                                : t('admin.noRecentOrders')}
                        </p>
                    </div>
                )}
            </div>

            {/* Order Timeline Dialog */}
            <Dialog open={showTimeline} onOpenChange={setShowTimeline}>
                <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="h-5 w-5 text-slate-500" />
                            {t('shop.orderNumber')}: {selectedOrder?.orderNumber}
                        </DialogTitle>
                    </DialogHeader>
                    
                    {selectedOrder && (
                        <div className="space-y-8 mt-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">{t('admin.customer')}</p>
                                    <p className="text-sm font-bold text-slate-800">{selectedOrder.customerEmail}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">{t('admin.amount')}</p>
                                    <p className="text-sm font-bold text-slate-800">{formatCurrency(selectedOrder.totalAmount || 0)}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <History className="h-3.5 w-3.5" />
                                    {t('admin.actions')} Audit Trail
                                </h3>
                                
                                <div className="relative pl-8 space-y-6 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                                    {selectedOrder.logs && selectedOrder.logs.length > 0 ? (
                                        selectedOrder.logs.map((log) => (
                                            <div key={log.id} className="relative">
                                                <div className="absolute -left-8 p-1 rounded-full bg-white border border-slate-300 z-10">
                                                    {log.userRole === 'ADMIN' ? <Shield className="h-3 w-3 text-slate-800" /> : <User className="h-3 w-3 text-slate-500" />}
                                                </div>
                                                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col gap-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-xs font-bold text-slate-900">{log.userName} ({log.userRole})</span>
                                                        <span className="text-[9px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px]">
                                                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-auto font-mono">{log.oldStatus}</Badge>
                                                        <span className="text-slate-400">→</span>
                                                        <Badge className="text-[9px] px-1 py-0 h-auto font-mono bg-emerald-100 text-emerald-800 border-emerald-200">{log.newStatus}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="relative">
                                            <div className="absolute -left-8 p-1 rounded-full bg-white border border-slate-300 z-10">
                                                <Clock className="h-3 w-3 text-slate-400" />
                                            </div>
                                            <div className="text-xs text-slate-400 italic">No logs recorded yet. This order was likely created before tracking was enabled.</div>
                                        </div>
                                    )}

                                    {/* Placed */}
                                    <div className="relative">
                                        <div className="absolute -left-8 p-1 rounded-full bg-slate-800 border border-slate-800 z-10 shadow-sm">
                                            <ShoppingBag className="h-3 w-3 text-white" />
                                        </div>
                                        <div className="text-xs font-bold text-slate-900">Order Placed</div>
                                        <div className="text-[10px] text-slate-500">{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
    return (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-default group">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                    <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-tight">{label}</p>
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
}
