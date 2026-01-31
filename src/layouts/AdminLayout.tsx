import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, FolderOpen, LogOut, Home, Folder, Building2, Users, Zap, ChevronRight, Menu, X, Settings, Bell, DollarSign, Layout, FileText } from 'lucide-react';
import { useState } from 'react';

export function AdminLayout() {
    const { user, loading, logout } = useAuth();
    const { t, isRTL } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <span className="text-white/70 text-sm font-medium">{t('admin.loading')}</span>
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    const navItems = [
        { name: t('admin.overview'), path: '/admin', icon: LayoutDashboard },
        { name: t('admin.categories'), path: '/admin/categories', icon: Folder },
        { name: t('admin.products'), path: '/admin/products', icon: Package },
        { name: t('admin.suppliers'), path: '/admin/suppliers', icon: Building2 },
        { name: t('admin.customers'), path: '/admin/users', icon: Users },
        { name: t('admin.orders'), path: '/admin/orders', icon: ShoppingCart },
        { name: t('admin.financial'), path: '/admin/financial', icon: DollarSign },
        { name: t('admin.homeLayout'), path: '/admin/homepage', icon: Layout },
        { name: t('admin.pageContent') || 'Page Content', path: '/admin/pages', icon: FileText },
        { name: t('admin.files'), path: '/admin/files', icon: FolderOpen },
    ];

    console.log('Admin Nav Items:', navItems);

    const renderSidebarContent = (isMobile = false) => (
        <div className={`flex flex-col h-full w-full bg-white border-slate-200 ${isRTL ? 'border-l' : 'border-r'}`}>
            {/* Logo Section - Hidden on Mobile Drawer to avoid duplication */}
            {!isMobile && (
                <div className={`h-20 flex items-center gap-3 border-b border-slate-100 flex-shrink-0 ${isRTL ? 'pr-6' : 'px-6'}`}>
                    <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: '#0F172A' }}
                    >
                        <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-bold text-slate-900 text-base leading-tight italic">Adsolutions v2.0</h1>
                        <p className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase">{t('admin.liveUpdate')}</p>
                    </div>
                </div>
            )}

            {/* Mobile Header indicator */}
            {isMobile && (
                <div className={`h-16 flex items-center border-b border-slate-100 bg-slate-50/50 ${isRTL ? 'pr-6' : 'px-6'}`}>
                    <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">{t('admin.navMenu')}</span>
                </div>
            )}

            {/* Navigation */}
            <div className="flex-1 py-6 px-4 overflow-y-auto">
                <div className="mb-4">
                    <span className={`text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ${isRTL ? 'pr-3' : 'px-3'}`}>{t('admin.dashboard')}</span>
                </div>
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                                    isActive
                                        ? 'shadow-xl shadow-slate-200'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                                style={isActive ? { backgroundColor: '#0F172A', color: '#FFFFFF' } : {}}
                            >
                                <Icon 
                                    className={`h-5 w-5 transition-colors ${isActive ? '' : 'text-slate-400 group-hover:text-slate-600'}`}
                                    style={isActive ? { color: '#FFFFFF' } : {}}
                                />
                                <span className="flex-1 text-left">{item.name}</span>
                                {isActive && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Footer / User Section */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/30 space-y-3">
                <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <div 
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px]"
                            style={{ backgroundColor: '#0F172A' }}
                        >
                            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-slate-900 truncate">{user.name || 'Admin'}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate px-1 opacity-80" title={user.email}>{user.email}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 py-2 px-3 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all shadow-sm active:scale-95"
                    >
                        <Home className="h-4 w-4" />
                        <span>{t('admin.store')}</span>
                    </button>
                    <button
                        onClick={logout}
                        className="flex items-center justify-center gap-2 py-2 px-3 text-[11px] font-bold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 rounded-xl border border-red-100 transition-all shadow-sm active:scale-95"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>{t('admin.exit')}</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#f8fafc] overflow-hidden">
            {/* Force Sidebar visibility on Desktop via CSS Injection */}
            <style>{`
                @media (min-width: 1024px) {
                    .admin-desktop-sidebar {
                        display: flex !important;
                        width: 18rem !important;
                        background-color: white !important;
                    }
                    .admin-main-content {
                        ${isRTL ? 'margin-right: 18rem !important;' : 'margin-left: 18rem !important;'}
                    }
                }
            `}</style>

            {/* Desktop Static Sidebar */}
            <aside className={`admin-desktop-sidebar hidden fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} bg-white flex-col z-[40]`}>
                {renderSidebarContent()}
            </aside>

            {/* Main Page Layout */}
            <div className="admin-main-content flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-visible">
                {/* Top Mobile Nav Bar - Fixed at top with highest possible layer for header */}
                <header 
                    className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0"
                    style={{ zIndex: 99999 }}
                >
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: '#0F172A' }}
                        >
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-slate-900 tracking-tight">Admin Area</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </header>

                {/* Content Outlet */}
                <main className="flex-1 p-4 md:p-8 lg:p-10 relative z-0">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Modal - Using massive z-index to ensure it is above EVERYTHING */}
            {isSidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0" 
                    style={{ zIndex: 99999999 }}
                >
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsSidebarOpen(false)}
                        style={{ pointerEvents: 'auto' }}
                    />
                    {/* Drawer */}
                    <aside 
                        className={`fixed inset-y-0 ${isRTL ? 'right-0 animate-in slide-in-from-right' : 'left-0 animate-in slide-in-from-left'} w-80 bg-white shadow-2xl flex flex-col duration-300`}
                        style={{ zIndex: 100000000 }}
                    >
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all`}
                            style={{ zIndex: 100000001 }}
                        >
                            <X className="h-6 w-6" />
                        </button>
                        {renderSidebarContent(true)}
                    </aside>
                </div>
            )}
        </div>
    );
}

