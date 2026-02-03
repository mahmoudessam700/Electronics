import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { CalendarDays, Loader2, RefreshCw, Search } from 'lucide-react';

interface ShopOrderItem {
    id: string;
    productId: string;
    productName?: string;
    quantity: number;
    unitPrice: number;
    commissionAmount: number;
    netRevenue: number;
}

interface ShopOrder {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    commissionTotal: number;
    shopPayoutStatus: string;
    shopPayoutId?: string | null;
    createdAt: string;
    items: ShopOrderItem[];
}

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const PAYOUT_STATUS_OPTIONS = ['NOT_REQUESTED', 'QUEUED', 'PAID_OUT', 'WITHHELD'];

export function ShopOrdersPage() {
    const { activeShop, token, hasShopRole } = useAuth();
    const activeShopId = activeShop?.id;
    const [orders, setOrders] = useState<ShopOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [payoutFilter, setPayoutFilter] = useState<string>('ALL');

    const canManageOrders = hasShopRole(['OWNER', 'MANAGER', 'STAFF']);

    const fetchOrders = useCallback(async () => {
        if (!activeShopId) {
            setOrders([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const params = new URLSearchParams({ shopId: activeShopId });
            if (statusFilter !== 'ALL') {
                params.set('status', statusFilter);
            }
            if (payoutFilter !== 'ALL') {
                params.set('payoutStatus', payoutFilter);
            }
            const res = await fetch(`/api/orders?${params.toString()}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (!res.ok) {
                throw new Error('Failed to load orders');
            }
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            toast.error('Unable to load shop orders');
        } finally {
            setLoading(false);
        }
    }, [activeShopId, payoutFilter, statusFilter, token]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesSearch =
                order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                order.items.some((item) => item.productName?.toLowerCase().includes(search.toLowerCase()));
            const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
            const matchesPayout = payoutFilter === 'ALL' || order.shopPayoutStatus === payoutFilter;
            return matchesSearch && matchesStatus && matchesPayout;
        });
    }, [orders, payoutFilter, search, statusFilter]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        if (!token) {
            toast.error('Authentication required');
            return;
        }
        setUpdatingId(orderId);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.error || 'Failed to update order');
            }
            setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)));
            toast.success('Order updated');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to update order');
        } finally {
            setUpdatingId(null);
        }
    };

    if (!activeShop) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Select a shop to view orders</h2>
                <p className="text-slate-500 text-sm">Choose a shop from the selector above to monitor performance.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-500 font-semibold">Orders</p>
                    <h1 className="text-2xl font-bold text-slate-900">Orders for {activeShop.name}</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchOrders} className="border-slate-200 text-slate-600">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search orders or items"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-sm"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['ALL', ...STATUS_OPTIONS].map((status) => (
                        <Button
                            key={status}
                            size="sm"
                            variant={statusFilter === status ? 'default' : 'outline'}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payout status</span>
                <div className="flex gap-2 flex-wrap">
                    {['ALL', ...PAYOUT_STATUS_OPTIONS].map((status) => (
                        <Button
                            key={status}
                            size="sm"
                            variant={payoutFilter === status ? 'default' : 'outline'}
                            onClick={() => setPayoutFilter(status)}
                        >
                            {status === 'ALL' ? 'ALL' : status.replace('_', ' ')}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3">Items</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3">Net Revenue</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Payout</th>
                            <th className="px-4 py-3">Placed</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredOrders.map((order) => {
                            const netRevenue = order.items.reduce((sum, item) => sum + (item.netRevenue || 0), 0);
                            return (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-4">
                                        <div className="font-semibold text-slate-900">{order.orderNumber}</div>
                                        <div className="text-xs text-slate-500">Commission: E£ {order.commissionTotal.toFixed(2)}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="space-y-1 text-xs text-slate-600">
                                            {order.items.map((item) => (
                                                <div key={item.id}>
                                                    {item.productName || item.productId} × {item.quantity}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 font-semibold">E£ {order.totalAmount.toFixed(2)}</td>
                                    <td className="px-4 py-4 text-emerald-600 font-semibold">E£ {netRevenue.toFixed(2)}</td>
                                    <td className="px-4 py-4">
                                        {canManageOrders ? (
                                            <select
                                                className="rounded-lg border border-slate-200 text-xs px-2 py-1"
                                                value={order.status}
                                                onChange={(event) => handleStatusChange(order.id, event.target.value)}
                                                disabled={updatingId === order.id}
                                            >
                                                {STATUS_OPTIONS.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Badge variant="outline">{order.status}</Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col gap-1">
                                            <Badge variant="secondary">{order.shopPayoutStatus || 'NOT_REQUESTED'}</Badge>
                                            {order.shopPayoutId && (
                                                <span className="text-[11px] text-slate-500">ID: {order.shopPayoutId}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <CalendarDays className="h-4 w-4" />
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {!filteredOrders.length && !loading && (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                                    No orders found for this shop yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {loading && (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                        <span className="ml-2 text-sm text-slate-500">Loading orders…</span>
                    </div>
                )}
            </div>
        </div>
    );
}
