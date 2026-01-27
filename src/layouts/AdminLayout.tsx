import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, FolderOpen, LogOut, Home, Folder, Building2, Users, Zap, ChevronRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function AdminLayout() {
    const { user, loading, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#4A5568]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-white/70 text-sm">Loading admin panel...</span>
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
        <>
            {/* Logo */}
            <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
                <div className="w-9 h-9 rounded-lg bg-[#718096] flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-white text-sm">Adsolutions</h1>
                    <p className="text-[10px] text-white/60">Admin Panel</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-4 px-3 overflow-y-auto">
                <div className="mb-3">
                    <span className="px-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Menu</span>
                </div>
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.path}
                                role="link"
                                tabIndex={0}
                                onClick={() => handleNavClick(item.path)}
                                onKeyDown={(e) => e.key === 'Enter' && handleNavClick(item.path)}
                                className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
                                    isActive
                                        ? 'bg-[#718096] text-white'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <div className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-white/20 text-white' 
                                        : 'bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white'
                                }`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <span className="flex-1 text-left">{item.name}</span>
                                {isActive && (
                                    <ChevronRight className="h-4 w-4 text-white/70" />
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* User Section */}
            <div className="border-t border-white/10 p-3">
                {/* User Card */}
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 mb-2">
                    <div className="w-9 h-9 rounded-full bg-[#718096] flex items-center justify-center text-white font-semibold text-sm">
                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user.name || 'Admin'}</p>
                        <p className="text-xs text-white/50 truncate">{user.email}</p>
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate('/')}
                        onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 cursor-pointer select-none"
                    >
                        <Home className="h-4 w-4" />
                        <span>Store</span>
                    </div>
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={logout}
                        onKeyDown={(e) => e.key === 'Enter' && logout()}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all duration-200 cursor-pointer select-none"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#4A5568] h-14 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#718096] flex items-center justify-center">
                        <Zap className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-white text-sm">Admin Panel</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                    {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0 z-40 bg-black/50"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Desktop (static in flex layout) */}
            <aside className="hidden lg:flex w-64 bg-[#4A5568] flex-col min-h-screen flex-shrink-0">
                <SidebarContent />
            </aside>

            {/* Sidebar - Mobile (fixed overlay) */}
            <aside className={`lg:hidden fixed left-0 top-14 bottom-0 w-64 bg-[#4A5568] flex flex-col z-50 transform transition-transform duration-300 ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen pt-14 lg:pt-0">
                <div className="p-4 md:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
