import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, FolderOpen, LogOut, Home, Folder, Building2, Users, Zap, ChevronRight, Menu, X, Settings, Bell } from 'lucide-react';
import { useState } from 'react';

export function AdminLayout() {
    const { user, loading, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <span className="text-white/70 text-sm font-medium">Loading admin panel...</span>
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    const navItems = [
        { name: 'Overview', path: '/admin', icon: LayoutDashboard },
        { name: 'Categories', path: '/admin/categories', icon: Folder },
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'Suppliers', path: '/admin/suppliers', icon: Building2 },
        { name: 'Customers', path: '/admin/users', icon: Users },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Files', path: '/admin/files', icon: FolderOpen },
    ];

    const renderSidebarContent = () => (
        <div className="flex flex-col h-full w-full">
            {/* Logo Section */}
            <div className="h-20 flex items-center gap-3 px-6 border-b border-white/10 flex-shrink-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
                    <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="font-bold text-white text-base truncate">Adsolutions</h1>
                    <p className="text-xs text-purple-300 font-medium tracking-wider uppercase">Admin</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-4 overflow-y-auto scrollbar-thin">
                <div className="mb-4">
                    <span className="px-3 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Dashboard</span>
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
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    isActive
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white'}`} />
                                <span className="flex-1 text-left">{item.name}</span>
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-glow" />}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Footer / User Section */}
            <div className="p-4 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user.name || 'Admin User'}</p>
                        <p className="text-[11px] text-white/40 truncate">{user.email}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
                    >
                        <Home className="h-4 w-4" />
                        <span>Store</span>
                    </button>
                    <button
                        onClick={logout}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-all"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Exit</span>
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
                    }
                    .admin-main-content {
                        margin-left: 18rem !important;
                    }
                }
            `}</style>

            {/* Desktop Static Sidebar */}
            <aside className="admin-desktop-sidebar hidden fixed inset-y-0 left-0 bg-[#1e1b4b] flex-col z-[40]">
                {renderSidebarContent()}
            </aside>

            {/* Mobile Sidebar Modal */}
            {isSidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-[100]">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    {/* Drawer */}
                    <aside className="absolute inset-y-0 left-0 w-80 bg-[#1e1b4b] shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute top-5 right-5 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all z-50"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        {renderSidebarContent()}
                    </aside>
                </div>
            )}

            {/* Main Page Layout */}
            <div className="admin-main-content flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Top Mobile Nav Bar */}
                <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-[30]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-lg">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-slate-800 tracking-tight">Admin Dashboard</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </header>

                {/* Content Outlet */}
                <main className="flex-1 p-6 md:p-8 lg:p-10">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

