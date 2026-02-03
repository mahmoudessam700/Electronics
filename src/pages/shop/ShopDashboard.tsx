import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { 
    Package, 
    ShoppingCart, 
    DollarSign, 
    Wallet, 
    TrendingUp, 
    BarChart3, 
    Clock, 
    ChevronRight, 
    ArrowUpRight,
    Loader2,
    Settings,
    Users
} from 'lucide-react';

export function ShopDashboard() {
    const { activeShop, token } = useAuth();
    const { t, formatCurrency, isRTL } = useLanguage();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!activeShop || !token) return;
            setLoading(true);
            try {
                const res = await fetch(`/api/shops?action=stats&shopId=${activeShop.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error('Failed to fetch shop stats', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [activeShop?.id, token]);

    if (!activeShop) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">{t('shop.selectShop')}</h2>
                <p className="text-slate-500 text-sm">{t('shop.noActiveShop')}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    const statCards = [
        { 
            label: t('shop.totalRevenue'), 
            value: formatCurrency(stats?.totalRevenue || 0), 
            icon: DollarSign, 
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        { 
            label: t('shop.totalOrders'), 
            value: stats?.totalOrders || 0, 
            icon: ShoppingCart, 
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        { 
            label: t('shop.totalProducts'), 
            value: stats?.totalProducts || 0, 
            icon: Package, 
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        { 
            label: t('shop.ledgerBalance'), 
            value: formatCurrency(stats?.ledgerBalance || 0), 
            icon: Wallet, 
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
    ];

    const revenueTrend = stats?.revenueTrend || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-500 font-semibold">{t('shop.overview')}</p>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{t('shop.welcomeBack')}, {activeShop.name}</h1>
                        <p className="text-sm text-slate-500 mt-1">{t('shop.trackPerformance')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            activeShop.status === 'ACTIVE' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                            {activeShop.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <div 
                        key={stat.label}
                        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                        <p className="text-xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Performance Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{t('shop.revenueTrend')}</h3>
                            <p className="text-sm text-slate-500">{t('shop.performance')}</p>
                        </div>
                        <BarChart3 className="h-5 w-5 text-slate-400" />
                    </div>

                    <div className="h-[240px] flex items-end justify-between gap-2 px-2">
                        {revenueTrend.length > 0 ? revenueTrend.map((item: any, index: number) => {
                            const maxRev = Math.max(...revenueTrend.map((i: any) => i.revenue), 1);
                            const height = (item.revenue / maxRev) * 100;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center gap-3 group">
                                    <div 
                                        className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 rounded-t-lg transition-all cursor-pointer relative"
                                        style={{ height: `${Math.max(height, 5)}%` }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-10 pointer-events-none">
                                            {formatCurrency(item.revenue)}
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full opacity-50" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {item.month}
                                    </span>
                                </div>
                            );
                        }) : (
                            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic">
                                No data available yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                        {t('shop.quickActions')}
                    </h3>
                    <div className="space-y-3">
                        <Link to="/shop/orders" className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 hover:bg-slate-50 hover:border-slate-100 transition-all group">
                            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                                <ShoppingCart className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">{t('shop.viewOrders')}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{stats?.pendingOrders || 0} {t('shop.pendingOrders')}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </Link>

                        <Link to="/shop/products" className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 hover:bg-slate-50 hover:border-slate-100 transition-all group">
                            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                                <Package className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">{t('shop.manageProducts')}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{stats?.totalProducts || 0} items listed</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </Link>

                        <Link to="/shop/payouts" className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 hover:bg-slate-50 hover:border-slate-100 transition-all group">
                            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">{t('shop.payoutRequests')}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{formatCurrency(stats?.ledgerBalance || 0)} available</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </Link>

                        <Link to="/shop/settings" className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 hover:bg-slate-50 hover:border-slate-100 transition-all group">
                            <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-slate-100 transition-colors">
                                <Settings className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">{t('shop.shopSettings')}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Profile, logo & schedule</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
