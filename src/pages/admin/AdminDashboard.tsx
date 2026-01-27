import { Package, ShoppingCart, DollarSign, Users, TrendingUp, TrendingDown, ArrowUpRight, Clock, Activity } from 'lucide-react';

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
            case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Shipped': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Pending': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Dashboard Overview
                </h1>
                <p className="text-slate-500">Welcome back! Here's what's happening with your store today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div 
                        key={stat.title}
                        className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300 overflow-hidden"
                    >
                        {/* Decorative gradient blob */}
                        <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity blur-2xl`} />
                        
                        <div className="flex items-start justify-between relative">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                                <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {stat.trend === 'up' ? (
                                        <TrendingUp className="h-4 w-4" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4" />
                                    )}
                                    <span>{stat.change}</span>
                                    <span className="text-slate-400 font-normal">vs last month</span>
                                </div>
                            </div>
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts & Lists Grid */}
            <div className="grid gap-6 lg:grid-cols-7">
                {/* Revenue Chart */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Revenue Overview</h3>
                            <p className="text-sm text-slate-500">Monthly revenue performance</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
                            <Activity className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-600">Live</span>
                        </div>
                    </div>
                    
                    {/* Chart Visualization */}
                    <div className="h-[240px] flex items-end justify-between gap-2 px-2">
                        {[65, 45, 78, 52, 85, 60, 90, 72, 88, 55, 70, 95].map((height, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div 
                                    className="w-full bg-gradient-to-t from-indigo-500 to-violet-500 rounded-t-lg opacity-80 hover:opacity-100 transition-all cursor-pointer hover:scale-105"
                                    style={{ height: `${height * 2}px` }}
                                />
                                <span className="text-[10px] text-slate-400 font-medium">
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Sales */}
                <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Recent Sales</h3>
                            <p className="text-sm text-slate-500">Latest transactions</p>
                        </div>
                        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                            View all
                            <ArrowUpRight className="h-4 w-4" />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {recentSales.map((sale, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${sale.color} flex items-center justify-center text-white font-semibold text-sm shadow-md`}>
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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
                        <p className="text-sm text-slate-500">Track and manage your latest orders</p>
                    </div>
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        View all orders
                        <ArrowUpRight className="h-4 w-4" />
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Order ID</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Customer</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order, index) => (
                                <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-4">
                                        <span className="font-mono text-sm font-semibold text-indigo-600">{order.id}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm font-medium text-slate-900">{order.customer}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span className="text-sm">{order.date}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(order.status)}`}>
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
