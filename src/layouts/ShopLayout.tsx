import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useMemo } from 'react';
import { Store, Package, LogOut, Home, ChevronDown, CreditCard, Wallet, Settings, Users, FolderOpen } from 'lucide-react';

export function ShopLayout() {
    const { user, loading, shopMemberships, activeShopId, selectActiveShop, activeShop, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = useMemo(() => ([
        { name: 'Overview', path: '/shop', icon: Store },
        { name: 'Categories', path: '/shop/categories', icon: FolderOpen },
        { name: 'Products', path: '/shop/products', icon: Package },
        { name: 'Orders', path: '/shop/orders', icon: CreditCard },
        { name: 'Team', path: '/shop/team', icon: Users },
        { name: 'Payouts', path: '/shop/payouts', icon: Wallet },
        { name: 'Settings', path: '/shop/settings', icon: Settings },
    ]), []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    <span className="text-white/70 text-sm font-medium">{t('admin.loading')}</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!shopMemberships.length) {
        return <Navigate to="/" replace />;
    }

    const activePath = location.pathname;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                            {(activeShop?.name || 'Shop')[0]}
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-widest">{t('header.sell')}</p>
                            <h1 className="text-xl font-bold text-slate-900">{activeShop?.name || 'Shop Dashboard'}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <select
                                value={activeShopId || shopMemberships[0]?.shopId || ''}
                                onChange={(event) => selectActiveShop(event.target.value)}
                                className="appearance-none bg-slate-100 border border-slate-200 rounded-lg py-2 pl-3 pr-8 text-sm font-medium text-slate-700"
                            >
                                {shopMemberships.map((membership) => (
                                    <option key={membership.id} value={membership.shopId}>
                                        {membership.shop?.name || membership.shopId}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="h-4 w-4 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            <Home className="h-4 w-4 mr-2" />
                            {t('admin.store')}
                        </button>
                        <button
                            onClick={logout}
                            className="inline-flex items-center px-3 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            {t('admin.exit')}
                        </button>
                    </div>
                </div>
            </header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-6">
                <aside className="w-full lg:w-64 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = item.path === '/shop' ? activePath === '/shop' : activePath.startsWith(item.path);
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>
                <main className="flex-1">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
