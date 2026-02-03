import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export function ShopDashboard() {
    const { activeShop } = useAuth();

    const stats = useMemo(() => ([
        { label: 'Status', value: activeShop?.status || 'Pending Review' },
        { label: 'Default Commission', value: `${activeShop?.defaultCommissionRate ?? 0}%` },
        { label: 'Storefront Slug', value: activeShop?.slug || '—' },
    ]), [activeShop?.status, activeShop?.defaultCommissionRate, activeShop?.slug]);

    if (!activeShop) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Select a shop to continue</h2>
                <p className="text-slate-500 text-sm">You do not have an active shop selected. Please use the selector above.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-500 font-semibold">Shop Overview</p>
                <h1 className="text-2xl font-bold text-slate-900 mt-2">Welcome back, {activeShop.name}</h1>
                <p className="text-sm text-slate-500 mt-1">Track your performance and manage your catalog from this dashboard.</p>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-widest text-slate-500">{stat.label}</p>
                        <p className="text-xl font-semibold text-slate-900 mt-2">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick actions</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Link to="/shop/orders" className="block rounded-2xl border border-slate-100 p-4 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-500 font-semibold">Orders</p>
                        <p className="text-sm text-slate-600 mt-1">Track statuses and net revenue per order.</p>
                    </Link>
                    <Link to="/shop/payouts" className="block rounded-2xl border border-slate-100 p-4 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-500 font-semibold">Payouts</p>
                        <p className="text-sm text-slate-600 mt-1">Request disbursements and view ledger balances.</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
