import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, FolderOpen, LogOut, Home, Folder, Building2, User, Zap, ChevronRight } from 'lucide-react';

export function AdminLayout() {
    const { user, loading, logout } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="text-slate-400 text-sm">Loading admin panel...</span>
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
        { name: 'Users', path: '/admin/users', icon: User },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Files', path: '/admin/files', icon: FolderOpen },
    ];

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
            {/* Modern Sidebar */}
            <aside className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col shadow-2xl">
                {/* Logo Area */}
                <div className="p-6 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight">Admin Panel</h1>
                            <p className="text-xs text-slate-400">Electronics Store</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                    <div className="px-3 py-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Main Menu</span>
                    </div>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white shadow-lg shadow-indigo-500/10 border border-indigo-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700/50 group-hover:bg-slate-600/50'}`}>
                                    <item.icon className="h-4 w-4" />
                                </div>
                                <span className="flex-1">{item.name}</span>
                                {isActive && <ChevronRight className="h-4 w-4 text-indigo-400" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Actions */}
                <div className="p-4 border-t border-slate-700/50 space-y-3">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.name || 'Admin'}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                    </div>
                    <Link 
                        to="/" 
                        className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-colors"
                    >
                        <Home className="h-4 w-4" />
                        <span className="text-sm font-medium">Go to Storefront</span>
                    </Link>
                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                        onClick={logout}
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
