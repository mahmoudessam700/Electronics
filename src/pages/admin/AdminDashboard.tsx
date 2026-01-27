import { Package, ShoppingCart, DollarSign, Users, TrendingUp, TrendingDown, ArrowUpRight, Clock, Activity, Sparkles } from 'lucide-react';

export function AdminDashboard() {
    const stats = [
        { 
            title: 'Total Revenue', 
            value: 'E£12,345', 
            change: '+20.1%', 
            trend: 'up',
            icon: DollarSign, 
            gradient: 'from-emerald-500 to-teal-600',
            bgLight: 'bg-emerald-50',
            textColor: 'text-emerald-600'
        },
        { 
            title: 'Orders', 
            value: '125', 
            change: '+12.5%', 
            trend: 'up',
            icon: ShoppingCart, 
            gradient: 'from-blue-500 to-indigo-600',
            bgLight: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        { 
            title: 'Products', 
            value: '142', 
            change: '+3.2%', 
            trend: 'up',
            icon: Package, 
            gradient: 'from-violet-500 to-purple-600',
            bgLight: 'bg-violet-50',
            textColor: 'text-violet-600'
        },
        { 
            title: 'Active Users', 
            value: '573', 
            change: '-2.4%', 
            trend: 'down',
            icon: Users, 
            gradient: 'from-orange-500 to-amber-600',
            bgLight: 'bg-orange-50',
            textColor: 'text-orange-600'
        },
    ];

    const recentSales = [
        { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: 1999, initials: 'OM', color: 'from-pink-500 to-rose-500' },
        { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: 39, initials: 'JL', color: 'from-blue-500 to-indigo-500' },
        { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: 299, initials: 'IN', color: 'from-emerald-500 to-teal-500' },
        { name: 'William Kim', email: 'will@email.com', amount: 99, initials: 'WK', color: 'from-violet-500 to-purple-500' },
        { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: 450, initials: 'SD', color: 'from-amber-500 to-orange-500' },
    ];

    const recentOrders = [
        { id: '#ORD-2024', customer: 'John Smith', date: '2 min ago', status: 'Processing', amount: 899 },
        { id: '#ORD-2023', customer: 'Emma Wilson', date: '15 min ago', status: 'Shipped', amount: 1250 },
        { id: '#ORD-2022', customer: 'Michael Brown', date: '1 hour ago', status: 'Delivered', amount: 320 },
        { id: '#ORD-2021', customer: 'Sarah Johnson', date: '3 hours ago', status: 'Pending', amount: 567 },
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Processing': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30';
            case 'Shipped': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30';
            case 'Delivered': return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30';
            case 'Pending': return 'bg-gradient-to-r from-slate-500 to-gray-500 text-white shadow-lg shadow-slate-500/30';
            default: return 'bg-gradient-to-r from-slate-500 to-gray-500 text-white shadow-lg shadow-slate-500/30';
        }
    };

    return (
        <div className="space-y-8">
            {/* Modern Header with gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-white" />
                        <span className="text-sm font-semibold text-white">Dashboard</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-white">Welcome back, Admin!</h1>
                    <p className="text-white/90">Here's what's happening with your store today.</p>
                </div>
            </div>

            {/* Stats Grid with Modern Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div 
                        key={stat.title}
                        className="group relative rounded-2xl p-6 shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-slate-50/50"
                    >
                        {/* Animated gradient background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                        
                        <div className="relative">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ring-4 ring-white/50`}>
                                    <stat.icon className="h-5 w-5 text-white" />
                                </div>
                                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    stat.trend === 'up' 
                                        ? 'bg-emerald-100 text-emerald-700' 
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {stat.trend === 'up' ? (
                                        <TrendingUp className="h-3 w-3" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3" />
                                    )}
                                    <span>{stat.change}</span>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts & Lists Grid */}
            <div className="grid gap-6 lg:grid-cols-7">
                {/* Revenue Chart */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
                            <p className="text-sm text-slate-500">Monthly revenue performance</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200/50">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-sm font-semibold text-emerald-700">Live</span>
                        </div>
                    </div>
                    
                    {/* Chart Visualization */}
                    <div className="h-[240px] flex items-end justify-between gap-2 px-2">
                        {[65, 45, 78, 52, 85, 60, 90, 72, 88, 55, 70, 95].map((height, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                <div 
                                    className="w-full bg-gradient-to-t from-violet-500 via-purple-500 to-indigo-500 rounded-t-xl opacity-70 hover:opacity-100 transition-all cursor-pointer hover:scale-105 shadow-lg"
                                    style={{ height: `${height * 2}px` }}
                                />
                                <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-600 transition-colors">
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Sales */}
                <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Recent Sales</h3>
                            <p className="text-sm text-slate-500">Latest transactions</p>
                        </div>
                        <button className="text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-colors">
                            View all
                            <ArrowUpRight className="h-4 w-4" />
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        {recentSales.map((sale, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent transition-all group">
                                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${sale.color} flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform`}>
                                    {sale.initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">{sale.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{sale.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-900">+E£{sale.amount.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
                        <p className="text-sm text-slate-500">Track and manage your latest orders</p>
                    </div>
                    <button className="text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-colors">
                        View all orders
                        <ArrowUpRight className="h-4 w-4" />
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-slate-100">
                                <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-600">Order ID</th>
                                <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-600">Customer</th>
                                <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-600">Date</th>
                                <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                                <th className="text-right py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-600">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order, index) => (
                                <tr key={index} className="border-b border-slate-50 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-transparent transition-all group">
                                    <td className="py-4 px-4">
                                        <span className="font-mono text-sm font-bold text-violet-600 group-hover:text-violet-700">{order.id}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm font-semibold text-slate-900">{order.customer}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span className="text-sm">{order.date}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <span className="text-sm font-bold text-slate-900">E£{order.amount.toLocaleString()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
