import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, FolderOpen, LogOut, Home, Folder, Building2, Users, Zap } from 'lucide-react';

export function AdminLayout() {
    const { user, loading, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

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
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Files', path: '/admin/files', icon: FolderOpen },
    ];

    return (
        <div className="min-h-screen flex bg-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col min-h-screen">
                {/* Logo */}
                <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-slate-800">Electronics Store</span>
                </div>

                {/* Navigation */}
                <div className="flex-1 py-4 overflow-y-auto" data-form-type="other" data-lpignore="true">
                    <div className="px-4 mb-2">
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Main Menu</span>
                    </div>
                    <ul className="space-y-1 px-3">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const Icon = item.icon;
                            return (
                                <li key={item.path}>
                                    <button
                                        type="button"
                                        onClick={() => navigate(item.path)}
                                        data-lpignore="true"
                                        data-form-type="other"
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-violet-50 text-violet-700'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                    >
                                        <Icon className={`h-5 w-5 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />
                                        <span>{item.name}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* User Section */}
                <div className="border-t border-slate-200 p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{user.name || 'Admin'}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            data-lpignore="true"
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <Home className="h-4 w-4" />
                            <span>Go to Storefront</span>
                        </button>
                        <button
                            type="button"
                            onClick={logout}
                            data-lpignore="true"
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                        </button>
                    </div>
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
