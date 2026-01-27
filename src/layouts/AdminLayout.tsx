import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, FolderOpen, LogOut, Home, Folder, Building2, Users, Zap, ChevronRight } from 'lucide-react';

export function AdminLayout() {
    const { user, loading, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
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
        <div className="min-h-screen flex bg-slate-50">
            {/* Modern Glass Sidebar */}
            <aside className="w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col min-h-screen relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                
                {/* Logo */}
                <div className="relative h-20 flex items-center gap-3 px-6 border-b border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-white">Electronics</h1>
                        <p className="text-[11px] text-slate-400">Admin Dashboard</p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="relative flex-1 py-6 px-4 overflow-y-auto" data-form-type="other" data-lpignore="true">
                    <div className="mb-4">
                        <span className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Navigation</span>
                    </div>
                    <ul className="space-y-1">
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
                                        className={`w-full group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                            isActive
                                                ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/10 text-white border border-violet-500/20 shadow-lg shadow-violet-500/5'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <div className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
                                            isActive 
                                                ? 'bg-violet-500/20 text-violet-400' 
                                                : 'bg-slate-800/50 text-slate-500 group-hover:bg-slate-700/50 group-hover:text-slate-300'
                                        }`}>
                                            <Icon className="h-[18px] w-[18px]" />
                                        </div>
                                        <span className="flex-1 text-left">{item.name}</span>
                                        {isActive && (
                                            <ChevronRight className="h-4 w-4 text-violet-400" />
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* User Section */}
                <div className="relative border-t border-white/5 p-4">
                    {/* User Card */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-semibold shadow-lg">
                            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user.name || 'Admin'}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            data-lpignore="true"
                            className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200"
                        >
                            <Home className="h-4 w-4" />
                            <span>Store</span>
                        </button>
                        <button
                            type="button"
                            onClick={logout}
                            data-lpignore="true"
                            className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-slate-50">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
