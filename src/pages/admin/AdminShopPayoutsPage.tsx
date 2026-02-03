import { Fragment, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Plus, Filter, CalendarDays, ShieldCheck } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useLanguage } from '../../contexts/LanguageContext';

interface ShopSummary {
    id: string;
    name: string;
    slug?: string;
}

interface AdminPayout {
    id: string;
    shopId: string;
    amount: number;
    currency: string;
    status: string;
    scheduledFor?: string;
    processedAt?: string;
    reference?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    shopName?: string;
    shopSlug?: string;
    orderCount?: number;
    orderTotal?: number;
}

interface AdminPayoutOrder {
    id: string;
    orderNumber: string;
    status: string;
    shopPayoutStatus?: string;
    totalAmount: number;
    createdAt: string;
}

const STATUS_OPTIONS = ['PENDING', 'SCHEDULED', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED'];
const CREATION_STATUSES = ['PENDING', 'SCHEDULED', 'PROCESSING', 'PAID'];

interface CreateFormState {
    shopId: string;
    amount: string;
    status: string;
    scheduledFor?: string;
    reference?: string;
    notes?: string;
}

export function AdminShopPayoutsPage() {
    const { t } = useLanguage();
    const [shops, setShops] = useState<ShopSummary[]>([]);
    const [payouts, setPayouts] = useState<AdminPayout[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ shopId: '', status: 'ALL' });
    const [form, setForm] = useState<CreateFormState>({ shopId: '', amount: '', status: 'PENDING' });
    const [saving, setSaving] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [expandedPayoutId, setExpandedPayoutId] = useState<string | null>(null);
    const [payoutOrderMap, setPayoutOrderMap] = useState<Record<string, { loading: boolean; data: AdminPayoutOrder[] }>>({});

    const selectedShop = useMemo(() => shops.find((shop) => shop.id === filters.shopId), [shops, filters.shopId]);

    useEffect(() => {
        fetchShops();
    }, []);

    useEffect(() => {
        if (shops.length && !form.shopId) {
            setForm((prev) => ({ ...prev, shopId: shops[0].id }));
            setFilters((prev) => ({ ...prev, shopId: shops[0].id }));
        }
    }, [shops, form.shopId]);

    useEffect(() => {
        if (filters.shopId) {
            fetchPayouts();
        }
    }, [filters.shopId, filters.status]);

    const fetchShops = async () => {
        try {
            const res = await fetch('/api/shops');
            if (!res.ok) {
                throw new Error('Failed to load shops');
            }
            const data = await res.json();
            const options = Array.isArray(data)
                ? data.map((shop: any) => ({ id: shop.id, name: shop.name, slug: shop.slug }))
                : [];
            setShops(options);
        } catch (error) {
            console.error(error);
            toast.error('Unable to load shops');
        }
    };

    const fetchPayouts = async () => {
        if (!filters.shopId) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ resource: 'shop-payouts', shopId: filters.shopId });
            if (filters.status !== 'ALL') {
                params.set('status', filters.status);
            }
            const res = await fetch(`/api/admin?${params.toString()}`);
            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload.error || 'Failed to load payouts');
            }
            const data = await res.json();
            setPayouts(Array.isArray(data.payouts) ? data.payouts : []);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : 'Unable to load payouts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!form.shopId || !form.amount) {
            toast.error('Shop and amount are required');
            return;
        }
        const numericAmount = Number(form.amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            toast.error('Enter a valid amount');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch('/api/admin?resource=shop-payouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopId: form.shopId,
                    amount: numericAmount,
                    status: form.status,
                    scheduledFor: form.scheduledFor || undefined,
                    reference: form.reference?.trim() || undefined,
                    notes: form.notes?.trim() || undefined,
                }),
            });
            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload.error || 'Failed to create payout');
            }
            toast.success('Payout queued');
            setForm((prev) => ({ ...prev, amount: '', reference: '', notes: '' }));
            await fetchPayouts();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to create payout');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (payoutId: string, newStatus: string) => {
        setUpdatingId(payoutId);
        try {
            const res = await fetch(`/api/admin?resource=shop-payouts&id=${payoutId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload.error || 'Failed to update payout');
            }
            toast.success('Payout updated');
            await fetchPayouts();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to update payout');
        } finally {
            setUpdatingId(null);
        }
    };

    const formatAmount = (value: number) => `EGP ${value.toFixed(2)}`;

    const loadPayoutOrders = async (payoutId: string) => {
        setPayoutOrderMap((prev) => ({
            ...prev,
            [payoutId]: { loading: true, data: prev[payoutId]?.data || [] },
        }));
        try {
            const params = new URLSearchParams({ shopPayoutId: payoutId });
            if (filters.shopId) {
                params.set('shopId', filters.shopId);
            }
            const res = await fetch(`/api/orders?${params.toString()}`);
            if (!res.ok) {
                throw new Error('Failed to load payout orders');
            }
            const data = await res.json();
            setPayoutOrderMap((prev) => ({
                ...prev,
                [payoutId]: {
                    loading: false,
                    data: Array.isArray(data) ? data : [],
                },
            }));
        } catch (error) {
            console.error(error);
            toast.error('Unable to load payout orders');
            setPayoutOrderMap((prev) => ({
                ...prev,
                [payoutId]: { loading: false, data: prev[payoutId]?.data || [] },
            }));
        }
    };

    const togglePayoutOrders = async (payoutId: string) => {
        if (expandedPayoutId === payoutId) {
            setExpandedPayoutId(null);
            return;
        }
        setExpandedPayoutId(payoutId);
        if (!payoutOrderMap[payoutId]?.data?.length) {
            await loadPayoutOrders(payoutId);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Finance
                    </p>
                    <h1 className="text-2xl font-bold text-slate-900">Shop payouts</h1>
                    {selectedShop && (
                        <p className="text-sm text-slate-500">Currently viewing {selectedShop.name}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchPayouts} className="border-slate-200 text-slate-600">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        {t('admin.refresh') || 'Refresh'}
                    </Button>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap gap-4 items-center">
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-500">Shop</label>
                    <select
                        value={filters.shopId}
                        onChange={(event) => setFilters((prev) => ({ ...prev, shopId: event.target.value }))}
                        className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                        {shops.map((shop) => (
                            <option key={shop.id} value={shop.id}>{shop.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Filter className="h-3 w-3" /> Status
                    </label>
                    <select
                        value={filters.status}
                        onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
                        className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                        {['ALL', ...STATUS_OPTIONS].map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <div className="ml-auto text-right">
                    <p className="text-xs uppercase text-slate-500">Total records</p>
                    <p className="text-2xl font-semibold text-slate-900">{payouts.length}</p>
                </div>
            </div>

            <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <Plus className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-lg font-semibold text-slate-900">Create payout</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Shop</label>
                        <select
                            value={form.shopId}
                            onChange={(event) => setForm((prev) => ({ ...prev, shopId: event.target.value }))}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                            {shops.map((shop) => (
                                <option key={shop.id} value={shop.id}>{shop.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Amount (EGP)</label>
                        <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={form.amount}
                            onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Status</label>
                        <select
                            value={form.status}
                            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                            {CREATION_STATUSES.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Reference</label>
                        <Input
                            value={form.reference || ''}
                            onChange={(event) => setForm((prev) => ({ ...prev, reference: event.target.value }))}
                            placeholder="Optional ref"
                        />
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Schedule date</label>
                        <Input
                            type="date"
                            value={form.scheduledFor || ''}
                            onChange={(event) => setForm((prev) => ({ ...prev, scheduledFor: event.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Notes</label>
                        <Input
                            value={form.notes || ''}
                            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                            placeholder="Internal note"
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Create payout'}
                    </Button>
                </div>
            </form>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Recent payouts</h3>
                    <Badge variant="outline">{payouts.length} entries</Badge>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Reference</th>
                                <th className="px-4 py-3">Shop</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Orders</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Schedule</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payouts.map((payout) => {
                                const expanded = expandedPayoutId === payout.id;
                                const ordersState = payoutOrderMap[payout.id];
                                const rawTotal = typeof payout.orderTotal === 'undefined' || payout.orderTotal === null ? payout.amount : payout.orderTotal;
                                const queuedTotal = Number(rawTotal) || 0;
                                return (
                                    <Fragment key={payout.id}>
                                        <tr className="hover:bg-slate-50">
                                            <td className="px-4 py-4">
                                                <div className="font-semibold text-slate-900">{payout.reference || '—'}</div>
                                                <div className="text-xs text-slate-500">Created {new Date(payout.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm font-medium text-slate-900">{payout.shopName || selectedShop?.name || payout.shopId}</div>
                                                {payout.shopSlug && (
                                                    <div className="text-xs text-slate-500">{payout.shopSlug}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 font-semibold">{formatAmount(payout.amount)}</td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                <div>{payout.orderCount ?? 0} orders</div>
                                                <div className="text-xs text-slate-500">Queued: E£ {queuedTotal.toFixed(2)}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant="outline">{payout.status}</Badge>
                                            </td>
                                            <td className="px-4 py-4">
                                                {payout.scheduledFor ? (
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <CalendarDays className="h-4 w-4" />
                                                        {new Date(payout.scheduledFor).toLocaleDateString()}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-2">
                                                    <select
                                                        value={payout.status}
                                                        onChange={(event) => handleStatusChange(payout.id, event.target.value)}
                                                        disabled={updatingId === payout.id}
                                                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                                                    >
                                                        {STATUS_OPTIONS.map((status) => (
                                                            <option key={status} value={status}>{status}</option>
                                                        ))}
                                                    </select>
                                                    <Button variant="outline" size="sm" onClick={() => togglePayoutOrders(payout.id)}>
                                                        {expanded ? 'Hide orders' : 'View orders'}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expanded && (
                                            <tr>
                                                <td colSpan={7} className="bg-slate-50 px-4 py-3 text-xs">
                                                    {ordersState?.loading ? (
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                                            <span>Loading orders…</span>
                                                        </div>
                                                    ) : ordersState?.data?.length ? (
                                                        <div className="space-y-2">
                                                            {ordersState.data.map((order) => (
                                                                <div key={order.id} className="flex flex-wrap justify-between gap-2 border-b border-slate-200 pb-2 last:pb-0 last:border-b-0">
                                                                    <div>
                                                                        <p className="font-semibold text-slate-800">{order.orderNumber}</p>
                                                                        <p className="text-[11px] text-slate-500">{order.status}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-semibold text-slate-900">E£ {order.totalAmount.toFixed(2)}</p>
                                                                        <p className="text-[11px] text-slate-500">{order.shopPayoutStatus || '—'}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-slate-500">No orders linked to this payout.</p>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                            {!payouts.length && !loading && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-500 text-sm">
                                        No payouts recorded yet for this shop.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {loading && (
                    <div className="flex items-center justify-center py-6 text-sm text-slate-500">
                        Loading payouts…
                    </div>
                )}
            </div>
        </div>
    );
}
