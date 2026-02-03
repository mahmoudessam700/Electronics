import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { 
    CalendarDays, 
    Loader2, 
    RefreshCw, 
    Search, 
    History, 
    Clock, 
    CheckCircle2, 
    Package, 
    Truck, 
    Home, 
    XCircle 
} from 'lucide-react';

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
    updatedAt: string;
    confirmedAt?: string | null;
    processingAt?: string | null;
    shippedAt?: string | null;
    deliveredAt?: string | null;
    cancelledAt?: string | null;
    items: ShopOrderItem[];
}

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const PAYOUT_STATUS_OPTIONS = ['NOT_REQUESTED', 'QUEUED', 'PAID_OUT', 'WITHHELD'];

export function ShopOrdersPage() {
    const { activeShop, token, hasShopRole } = useAuth();
    const { t, formatCurrency, isRTL } = useLanguage();
    const activeShopId = activeShop?.id;
    const [orders, setOrders] = useState<ShopOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [payoutFilter, setPayoutFilter] = useState<string>('ALL');
    
    // Timeline state
    const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
    const [showTimeline, setShowTimeline] = useState(false);

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
            
            // Refresh orders to get updated timestamps and logs
            fetchOrders();
            toast.success('Order updated');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to update order');
        } finally {
            setUpdatingId(null);
        }
    };

    const openTimeline = (order: ShopOrder) => {
        setSelectedOrder(order);
        setShowTimeline(true);
    };

    if (!activeShop) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">{t('shop.selectShop')}</h2>
                <p className="text-slate-500 text-sm">{t('shop.noActiveShop')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-500 font-semibold">{t('shop.orders')}</p>
                    <h1 className="text-2xl font-bold text-slate-900">{t('shop.orders')} for {activeShop.name}</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchOrders} className="border-slate-200 text-slate-600">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        {t('shop.refresh')}
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder={t('shop.searchOrders')}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className={`w-full rounded-lg border border-slate-200 ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['ALL', ...STATUS_OPTIONS].map((status) => (
                        <Button
                            key={status}
                            size="sm"
                            variant={statusFilter === status ? 'default' : 'outline'}
                            onClick={() => setStatusFilter(status)}
                            className={statusFilter === status ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                        >
                            {status === 'ALL' ? t('header.all') : t(`shop.status.${status}`)}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('shop.payoutStatus')}</span>
                <div className="flex gap-2 flex-wrap">
                    {['ALL', ...PAYOUT_STATUS_OPTIONS].map((status) => (
                        <Button
                            key={status}
                            size="sm"
                            variant={payoutFilter === status ? 'default' : 'outline'}
                            onClick={() => setPayoutFilter(status)}
                            className={payoutFilter === status ? 'bg-slate-800' : ''}
                        >
                            {status === 'ALL' ? t('header.all') : t(`shop.payout.${status}`)}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-left rtl:text-right text-xs uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="px-4 py-3">{t('shop.orderNumber')}</th>
                                <th className="px-4 py-3">{t('shop.items')}</th>
                                <th className="px-4 py-3">{t('shop.total')}</th>
                                <th className="px-4 py-3">{t('shop.netRevenue')}</th>
                                <th className="px-4 py-3">{t('shop.orderStatus')}</th>
                                <th className="px-4 py-3">{t('shop.payoutStatus')}</th>
                                <th className="px-4 py-3">{t('shop.placed')}</th>
                                <th className="px-4 py-3 text-right rtl:text-left">{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.map((order) => {
                                const netRevenue = order.items.reduce((sum, item) => sum + (item.netRevenue || 0), 0);
                                return (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="font-bold text-slate-900">{order.orderNumber}</div>
                                            <div className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase mt-0.5">#{order.id.slice(-8)}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="space-y-1 text-xs text-slate-600 max-w-[150px] truncate">
                                                {order.items.map((item) => (
                                                    <div key={item.id} className="truncate">
                                                        {item.productName || item.productId} × {item.quantity}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 font-semibold text-slate-700">{formatCurrency(order.totalAmount)}</td>
                                        <td className="px-4 py-4 text-emerald-600 font-bold">{formatCurrency(netRevenue)}</td>
                                        <td className="px-4 py-4">
                                            {canManageOrders ? (
                                                <select
                                                    className={`rounded-lg border border-slate-200 text-xs px-2 py-1.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white cursor-pointer ${
                                                        order.status === 'DELIVERED' ? 'text-emerald-700 font-bold' :
                                                        order.status === 'CANCELLED' ? 'text-rose-700 font-bold' :
                                                        'text-slate-700'
                                                    }`}
                                                    value={order.status}
                                                    onChange={(event) => handleStatusChange(order.id, event.target.value)}
                                                    disabled={updatingId === order.id}
                                                >
                                                    {STATUS_OPTIONS.map((status) => (
                                                        <option key={status} value={status}>
                                                            {t(`shop.status.${status}`)}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <Badge variant="outline">{t(`shop.status.${order.status}`)}</Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="secondary" className="w-fit text-[10px] py-0">
                                                    {t(`shop.payout.${order.shopPayoutStatus || 'NOT_REQUESTED'}`)}
                                                </Badge>
                                                {order.shopPayoutId && (
                                                    <span className="text-[10px] text-slate-400 font-mono">ID: {order.shopPayoutId.slice(-6)}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <CalendarDays className="h-3.5 w-3.5 opacity-60" />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right rtl:text-left">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-slate-400 hover:text-slate-700" 
                                                onClick={() => openTimeline(order)}
                                            >
                                                <History className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {!filteredOrders.length && !loading && (
                                <tr>
                                    <td colSpan={8} className="py-20 text-center text-slate-500 text-sm">
                                        {t('shop.noOrdersFound')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {loading && (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                        <span className="ml-2 text-sm text-slate-500">{t('common.loading')}</span>
                    </div>
                )}
            </div>

            {/* Order Timeline Dialog */}
            <Dialog open={showTimeline} onOpenChange={setShowTimeline}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="h-5 w-5 text-slate-500" />
                            Order Tracking: {selectedOrder?.orderNumber}
                        </DialogTitle>
                    </DialogHeader>
                    
                    {selectedOrder && (
                        <div className="mt-6 space-y-8">
                            <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                {/* Order Placed */}
                                <TimelineItem 
                                    icon={<Clock className="h-4 w-4" />}
                                    label="Order Placed"
                                    timestamp={selectedOrder.createdAt}
                                    active={true}
                                />
                                {/* Order Confirmed */}
                                <TimelineItem 
                                    icon={<CheckCircle2 className="h-4 w-4" />}
                                    label="Confirmed"
                                    timestamp={selectedOrder.confirmedAt}
                                    active={!!selectedOrder.confirmedAt}
                                />
                                {/* Processing */}
                                <TimelineItem 
                                    icon={<Package className="h-4 w-4" />}
                                    label="Processing"
                                    timestamp={selectedOrder.processingAt}
                                    active={!!selectedOrder.processingAt}
                                />
                                {/* Shipped */}
                                <TimelineItem 
                                    icon={<Truck className="h-4 w-4" />}
                                    label="Shipped"
                                    timestamp={selectedOrder.shippedAt}
                                    active={!!selectedOrder.shippedAt}
                                />
                                {selectedOrder.status === 'CANCELLED' ? (
                                    <TimelineItem 
                                        icon={<XCircle className="h-4 w-4" />}
                                        label="Cancelled"
                                        timestamp={selectedOrder.cancelledAt}
                                        active={true}
                                        error={true}
                                    />
                                ) : (
                                    <TimelineItem 
                                        icon={<Home className="h-4 w-4" />}
                                        label="Delivered"
                                        timestamp={selectedOrder.deliveredAt}
                                        active={!!selectedOrder.deliveredAt}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function TimelineItem({ icon, label, timestamp, active, error }: { icon: any, label: string, timestamp?: string | null, active: boolean, error?: boolean }) {
    return (
        <div className={`relative flex items-start gap-4 ${active ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`absolute -left-8 p-1.5 rounded-full border-2 ${
                active ? (error ? 'bg-rose-50 border-rose-500 text-rose-500' : 'bg-emerald-50 border-emerald-500 text-emerald-500') : 'bg-white border-slate-200 text-slate-300'
            } z-10`}>
                {icon}
            </div>
            <div className="flex-1">
                <p className={`text-sm font-bold ${active ? 'text-slate-900' : 'text-slate-500'}`}>{label}</p>
                {timestamp ? (
                    <p className="text-xs text-slate-500 mt-1">
                        {new Date(timestamp).toLocaleString()}
                    </p>
                ) : (
                    <p className="text-xs text-slate-400 mt-1 italic">Pending action...</p>
                )}
            </div>
        </div>
    );
}

