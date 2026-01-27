import { useState, useEffect } from 'react';
import { Loader2, ShoppingBag, Clock, TrendingUp, Package, Truck, CheckCircle2, XCircle, Search, Filter, Calendar } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

interface Order {
    id: string;
    orderNumber: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
    PENDING: { label: 'Pending', icon: Clock, color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' },
    PROCESSING: { label: 'Processing', icon: Package, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    SHIPPED: { label: 'Shipped', icon: Truck, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    DELIVERED: { label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
};

export function AdminOrdersPage() {
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
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <span className="mt-4 text-slate-500">Loading orders...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Orders
                    </h1>
                    <p className="text-slate-500 mt-1">Manage and track customer orders</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50">
                            <ShoppingBag className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Orders</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-50">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Pending</p>
                            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50">
                            <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Processing</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Delivered</p>
                            <p className="text-2xl font-bold text-emerald-600">{stats.delivered}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search orders..."
                        className="pl-10 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                statusFilter === status
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {status === 'ALL' ? 'All' : STATUS_CONFIG[status]?.label || status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Order</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Customer</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Total</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.map((order) => {
                                const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                                const StatusIcon = config.icon;
                                
                                return (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <span className="font-mono text-sm font-bold text-indigo-600">
                                                {order.orderNumber}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                                                    {order.customerEmail[0].toUpperCase()}
                                                </div>
                                                <span className="text-sm text-slate-700">{order.customerEmail}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-slate-500">
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
                                        <td className="py-4 px-6">
                                            <span className="text-base font-bold text-slate-900">
                                                E£{order.totalAmount.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="relative inline-block">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                                    className={`appearance-none pl-3 pr-8 py-2 rounded-xl text-sm font-semibold border cursor-pointer transition-colors ${config.bg} ${config.color} ${config.border} focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="PROCESSING">Processing</option>
                                                    <option value="SHIPPED">Shipped</option>
                                                    <option value="DELIVERED">Delivered</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                </select>
                                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <svg className={`w-4 h-4 ${config.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div className="py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
                            <ShoppingBag className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">No orders found</h3>
                        <p className="text-slate-500">
                            {searchQuery || statusFilter !== 'ALL' 
                                ? 'Try adjusting your filters' 
                                : 'Orders will appear here when customers place them'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
