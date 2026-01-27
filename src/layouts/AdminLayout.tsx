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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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

    const handleNavClick = (path: string) => {
        navigate(path);
        setIsSidebarOpen(false);
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full w-full overflow-hidden">
            {/* Logo Section */}
            <div className="h-20 flex items-center gap-3 px-6 border-b border-white/10 flex-shrink-0">
                <div className="relative">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #a855f7, #3b82f6)' }}>
                        <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="font-bold text-white text-base truncate">Adsolutions</h1>
                    <p className="text-xs text-purple-300 font-medium">Admin Panel</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-4 overflow-y-auto overflow-x-hidden">
                <div className="mb-4">
                    <span className="px-3 text-[11px] font-bold text-white/40 uppercase tracking-wider">Navigation</span>
                </div>
                <nav className="space-y-1.5">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNavClick(item.path)}
                                className={`w-full group flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                                    isActive
                                        ? 'bg-white/90 text-gray-900 shadow-md'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${
                                    isActive ? 'scale-110' : 'group-hover:scale-110'
                                }`} />
                                <span className="flex-1 text-left truncate">{item.name}</span>
                                {isActive && (
                                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* User Section */}
            <div className="border-t border-white/10 p-4 flex-shrink-0">
                {/* User Card */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/10 mb-3">
                    <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg" style={{ background: 'linear-gradient(to bottom right, #a855f7, #3b82f6)' }}>
                            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user.name || 'Admin'}</p>
                        <p className="text-xs text-white/50 truncate">{user.email}</p>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
                        <Settings className="h-4 w-4 text-white/60 hover:text-white transition-colors" />
                    </button>
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 border border-white/10"
                    >
                        <Home className="h-4 w-4" />
                        <span>Store</span>
                    </button>
                    <button
                        onClick={logout}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all duration-200 border border-red-500/20"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile Header - fixed at top with gradient */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-[9999] h-16 flex items-center justify-between px-4 shadow-xl border-b border-white/10 bg-slate-900">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #a855f7, #3b82f6)' }}>
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-white text-base">Admin Panel</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2.5 text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </header>

            {/* Mobile Sidebar - only render when open */}
            {isSidebarOpen && (
                <>
                    {/* Overlay with blur effect */}
                    <div 
                        className="lg:hidden fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    {/* Sidebar with slide-in animation */}
                    <aside className="lg:hidden fixed top-0 left-0 bottom-0 w-72 flex flex-col z-[9999] shadow-2xl overflow-hidden bg-[#1e1b4b]">
                        <SidebarContent />
                    </aside>
                </>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col flex-shrink-0 fixed top-0 left-0 h-screen shadow-2xl z-[100] overflow-hidden bg-[#1e1b4b]">
                <SidebarContent />
            </aside>

            {/* Main Content Area */}
            <main className="min-h-screen pt-16 lg:pt-0 lg:ml-72 bg-gray-100 relative">
                <div className="p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
