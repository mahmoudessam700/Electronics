import { useState, useEffect } from 'react';
import { Loader2, ShoppingBag, Clock, TrendingUp, Package, Truck, CheckCircle2, XCircle, Search, Filter, Calendar } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useLanguage } from '../../contexts/LanguageContext';

interface Order {
    id: string;
    orderNumber: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    createdAt: string;
}

export function AdminOrdersPage() {
    const { t, formatCurrency, isRTL } = useLanguage();

    const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
        PENDING: { label: t('admin.pending'), icon: Clock, color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' },
        PROCESSING: { label: t('admin.processing'), icon: Package, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
        SHIPPED: { label: t('admin.shipped'), icon: Truck, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
        DELIVERED: { label: t('admin.delivered'), icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        CANCELLED: { label: t('admin.cancelled'), icon: XCircle, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    };

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            if (res.ok) {
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
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
                <div className="w-12 h-12 border-4 border-[#FFD814]/30 border-t-[#FFD814] rounded-full animate-spin" />
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
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#4A5568]">
                            <ShoppingBag className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('admin.totalOrders')}</p>
                            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('admin.pending')}</p>
                            <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                            <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('admin.processing')}</p>
                            <p className="text-xl font-bold text-blue-600">{stats.processing}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('admin.delivered')}</p>
                            <p className="text-xl font-bold text-emerald-600">{stats.delivered}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400`} />
                    <Input
                        placeholder={t('admin.searchPlaceholder')}
                        className={`${isRTL ? 'pr-10' : 'pl-10'} bg-white border-gray-200 focus:border-[#4A5568] rounded-lg`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                statusFilter === status
                                    ? 'bg-[#4A5568] text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {status === 'ALL' ? 'All' : STATUS_CONFIG[status]?.label || status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.orderId')}</th>
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden sm:table-cell`}>{t('admin.customer')}</th>
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell`}>{t('admin.date')}</th>
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.amount')}</th>
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map((order) => {
                                const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                                const StatusIcon = config.icon;
                                
                                return (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <span className="font-mono text-sm font-semibold text-[#4A5568]">
                                                {order.orderNumber}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 hidden sm:table-cell">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-[#4A5568] flex items-center justify-center text-white font-semibold text-xs">
                                                    {order.customerEmail[0].toUpperCase()}
                                                </div>
                                                <span className="text-sm text-gray-700 truncate max-w-[150px]">{order.customerEmail}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 hidden md:table-cell">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-sm">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm font-bold text-gray-900">
                                                {formatCurrency(order.totalAmount)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="relative inline-block">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                                    className={`appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${config.bg} ${config.color} ${config.border} focus:outline-none focus:ring-2 focus:ring-[#4A5568]/20`}
                                                >
                                                    <option value="PENDING">{t('admin.pending')}</option>
                                                    <option value="PROCESSING">{t('admin.processing')}</option>
                                                    <option value="SHIPPED">{t('admin.shipped')}</option>
                                                    <option value="DELIVERED">{t('admin.delivered')}</option>
                                                    <option value="CANCELLED">{t('admin.cancelled')}</option>
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <svg className={`w-3 h-3 ${config.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
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
        </div>
    );
}
