import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Loader2, Plus, RefreshCw } from 'lucide-react';

interface ShopPayout {
    id: string;
    amount: number;
    currency: string;
    status: string;
    scheduledFor?: string;
    processedAt?: string;
    reference?: string;
    notes?: string;
    createdAt: string;
    orderCount?: number;
    orderTotal?: number;
}

interface CreatePayoutPayload {
    notes?: string;
    scheduledFor?: string;
    reference?: string;
}

interface EligibleOrderSummary {
    count: number;
    amount: number;
}

interface PayoutOrderSummary {
    id: string;
    orderNumber: string;
    status: string;
    shopPayoutStatus?: string;
    totalAmount: number;
    createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
    PROCESSING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    FAILED: 'bg-red-50 text-red-600 border-red-200',
    CANCELLED: 'bg-slate-50 text-slate-600 border-slate-200',
};

export function ShopPayoutsPage() {
    const { activeShop, token, hasShopRole } = useAuth();
    const activeShopId = activeShop?.id;
    const [payouts, setPayouts] = useState<ShopPayout[]>([]);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<CreatePayoutPayload>({});
    const [saving, setSaving] = useState(false);
    const [eligibleOrders, setEligibleOrders] = useState<EligibleOrderSummary>({ count: 0, amount: 0 });
    const [expandedPayoutId, setExpandedPayoutId] = useState<string | null>(null);
    const [payoutOrderMap, setPayoutOrderMap] = useState<Record<string, { loading: boolean; data: PayoutOrderSummary[] }>>({});

    const canRequestPayouts = hasShopRole(['OWNER', 'MANAGER', 'FINANCE']);

    const fetchPayouts = async () => {
        if (!activeShopId) {
            setPayouts([]);
            setEligibleOrders({ count: 0, amount: 0 });
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const params = new URLSearchParams({ shopId: activeShopId });
            const res = await fetch(`/api/shops?action=payouts&${params.toString()}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (!res.ok) {
                throw new Error('Failed to load payouts');
            }
            const data = await res.json();
            setPayouts(data.payouts || []);
            setBalance(data.balance || 0);
            setEligibleOrders(data.eligibleOrders || { count: 0, amount: 0 });
        } catch (error) {
            console.error(error);
            toast.error('Unable to load payouts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeShopId]);

    const handleChange = (field: keyof CreatePayoutPayload, value: string | number) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const canSubmit = useMemo(() => {
        return eligibleOrders.amount > 0 && balance > 0;
    }, [eligibleOrders.amount, balance]);

    const availablePayoutAmount = eligibleOrders.amount || 0;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!activeShopId || !token) {
            toast.error('Authentication required');
            return;
        }
        if (!canRequestPayouts) {
            toast.error('You do not have permission to request payouts');
            return;
        }
        if (!canSubmit) {
            toast.error('No delivered orders are ready for payout yet');
            return;
        }

        setSaving(true);
        try {
            const payoutAmount = eligibleOrders.amount;
            const res = await fetch('/api/shops?action=payouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: payoutAmount,
                    notes: form.notes || undefined,
                    scheduledFor: form.scheduledFor || undefined,
                    reference: form.reference || undefined,
                    shopId: activeShopId,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.error || 'Failed to request payout');
            }
            toast.success('Payout requested');
            setForm({});
            await fetchPayouts();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to request payout');
        } finally {
            setSaving(false);
        }
    };

    const loadPayoutOrders = async (payoutId: string) => {
        if (!activeShopId) return;
        setPayoutOrderMap((prev) => ({
            ...prev,
            [payoutId]: { loading: true, data: prev[payoutId]?.data || [] },
        }));
        try {
            const params = new URLSearchParams({ shopId: activeShopId, shopPayoutId: payoutId });
            const res = await fetch(`/api/orders?${params.toString()}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
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

    if (!activeShop) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Select a shop to view payouts</h2>
                <p className="text-slate-500 text-sm">Choose a shop from the selector above to manage finances.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-500 font-semibold">Payouts</p>
                    <h1 className="text-2xl font-bold text-slate-900">Payouts for {activeShop.name}</h1>
                    <p className="text-sm text-slate-500">Available balance: <span className="text-emerald-600 font-semibold">E£ {balance.toFixed(2)}</span></p>
                    <p className="text-xs text-slate-500 mt-1">
                        Delivered orders awaiting payout: <span className="font-semibold text-slate-700">{eligibleOrders.count}</span> ·
                        Ready amount <span className="font-semibold text-slate-700">E£ {availablePayoutAmount.toFixed(2)}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchPayouts} className="border-slate-200 text-slate-600">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {canRequestPayouts && (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Plus className="h-5 w-5 text-emerald-600" />
                        <h2 className="text-lg font-semibold text-slate-900">Request a payout</h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Ready amount (E£)</label>
                            <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 bg-slate-50">
                                E£ {availablePayoutAmount.toFixed(2)}
                            </div>
                            <p className="text-xs text-slate-500">{eligibleOrders.count} delivered order(s) will be included.</p>
                            <p className="text-xs text-slate-400">We release up to your ledger balance (E£ {balance.toFixed(2)}).</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Schedule</label>
                            <Input
                                type="date"
                                value={form.scheduledFor || ''}
                                onChange={(event) => handleChange('scheduledFor', event.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Reference</label>
                            <Input
                                value={form.reference || ''}
                                onChange={(event) => handleChange('reference', event.target.value)}
                                placeholder="Optional reference (e.g., INV-2026-02)"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Notes</label>
                            <Input
                                value={form.notes || ''}
                                onChange={(event) => handleChange('notes', event.target.value)}
                                placeholder="Internal notes"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="submit" disabled={saving || !canSubmit}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Request'}
                        </Button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Recent payouts</h3>
                    <Badge variant="outline">{payouts.length} records</Badge>
                </div>
                <div className="divide-y divide-slate-50">
                    {payouts.map((payout) => {
                        const ordersState = payoutOrderMap[payout.id];
                        const expanded = expandedPayoutId === payout.id;
                        const rawTotal = typeof payout.orderTotal === 'undefined' || payout.orderTotal === null ? payout.amount : payout.orderTotal;
                        const queuedTotal = Number(rawTotal) || 0;
                        return (
                            <div key={payout.id} className="p-4 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">E£ {payout.amount.toFixed(2)}</p>
                                        <div className="text-xs text-slate-500 flex gap-2 flex-wrap">
                                            <span>Reference: {payout.reference || '—'}</span>
                                            {payout.scheduledFor && <span>Scheduled: {new Date(payout.scheduledFor).toLocaleDateString()}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className={STATUS_COLORS[payout.status] || 'bg-slate-50 text-slate-600 border-slate-200'}>
                                            {payout.status}
                                        </Badge>
                                        <span className="text-xs text-slate-500">
                                            {new Date(payout.createdAt).toLocaleDateString()}
                                        </span>
                                        <Button variant="outline" size="sm" onClick={() => togglePayoutOrders(payout.id)}>
                                            {expanded ? 'Hide orders' : 'View orders'}
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 flex flex-wrap gap-4">
                                    <span>{payout.orderCount ?? 0} orders queued</span>
                                    <span>Queued total: E£ {queuedTotal.toFixed(2)}</span>
                                </div>
                                {expanded && (
                                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
                                        {ordersState?.loading ? (
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Loading orders…</span>
                                            </div>
                                        ) : ordersState?.data?.length ? (
                                            <div className="space-y-2">
                                                {ordersState.data.map((order) => (
                                                    <div key={order.id} className="flex flex-wrap justify-between gap-2 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
                                                        <div>
                                                            <p className="font-semibold text-slate-800">{order.orderNumber}</p>
                                                            <p className="text-[11px] text-slate-500">Placed {new Date(order.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-slate-900">E£ {order.totalAmount.toFixed(2)}</p>
                                                            <p className="text-[11px] text-slate-500">{order.shopPayoutStatus || order.status}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-slate-500">No orders attached to this payout yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {!payouts.length && !loading && (
                        <div className="py-12 text-center text-slate-500 text-sm">
                            No payout history yet.
                        </div>
                    )}
                </div>
                {loading && (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                        <span className="ml-2 text-sm text-slate-500">Loading payouts…</span>
                    </div>
                )}
            </div>
        </div>
    );
}
