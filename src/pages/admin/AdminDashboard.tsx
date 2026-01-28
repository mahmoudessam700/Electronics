import { Package, ShoppingCart, DollarSign, Users, TrendingUp, TrendingDown, ArrowUpRight, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export function AdminDashboard() {
    const { t, formatCurrency, isRTL } = useLanguage();

    const stats = [
        { 
            title: t('admin.totalRevenue'), 
            value: formatCurrency(12345), 
            change: '+20.1%', 
            trend: 'up',
            icon: DollarSign, 
            iconBg: 'bg-[#4A5568]'
        },
        { 
            title: t('admin.totalOrders'), 
            value: '125', 
            change: '+12.5%', 
            trend: 'up',
            icon: ShoppingCart, 
            iconBg: 'bg-[#718096]'
        },
        { 
            title: t('admin.totalProducts'), 
            value: '142', 
            change: '+3.2%', 
            trend: 'up',
            icon: Package, 
            iconBg: 'bg-[#4A5568]'
        },
        { 
            title: t('admin.totalCustomers'), 
            value: '573', 
            change: '-2.4%', 
            trend: 'down',
            icon: Users, 
            iconBg: 'bg-[#718096]'
        },
    ];

    const recentSales = [
        { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: 1999, initials: 'OM' },
        { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: 39, initials: 'JL' },
        { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: 299, initials: 'IN' },
        { name: 'William Kim', email: 'will@email.com', amount: 99, initials: 'WK' },
        { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: 450, initials: 'SD' },
    ];

    const recentOrders = [
        { id: '#ORD-2024', customer: 'John Smith', date: '2 min ago', status: 'Processing', amount: 899 },
        { id: '#ORD-2023', customer: 'Emma Wilson', date: '15 min ago', status: 'Shipped', amount: 1250 },
        { id: '#ORD-2022', customer: 'Michael Brown', date: '1 hour ago', status: 'Delivered', amount: 320 },
        { id: '#ORD-2021', customer: 'Sarah Johnson', date: '3 hours ago', status: 'Pending', amount: 567 },
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Processing': return 'bg-blue-100 text-blue-700';
            case 'Shipped': return 'bg-amber-100 text-amber-700';
            case 'Delivered': return 'bg-emerald-100 text-emerald-700';
            case 'Pending': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-[#4A5568] rounded-xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-white/70 mb-1">{t('admin.salesOverview')}</p>
                    <h1 className="text-2xl font-bold">Welcome back, Admin!</h1>
                    <p className="text-white/80 text-sm mt-1">{t('admin.viewAll')}</p>
                </div>
                <Link 
                    to="/admin/financial" 
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20 transition-all font-medium text-sm self-start md:self-center"
                >
                    <DollarSign className="h-4 w-4" />
                    {t('admin.financial')}
                    <ChevronRight className="h-4 w-4 opacity-50" />
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div 
                        key={stat.title}
                        className="bg-white rounded-xl p-4 md:p-5 border border-gray-200"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
                                <stat.icon className="h-5 w-5 text-white" />
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
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
                        <p className="text-sm text-gray-500">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts & Lists Grid */}
            <div className="grid gap-6 lg:grid-cols-7">
                {/* Revenue Chart */}
                <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
                            <p className="text-sm text-gray-500">Monthly revenue performance</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                            <span className="text-sm font-medium text-emerald-700">Live</span>
                        </div>
                    </div>
                    
                    {/* Chart Visualization */}
                    <div className="h-[200px] md:h-[240px] flex items-end justify-between gap-1 md:gap-2 px-2">
                        {[65, 45, 78, 52, 85, 60, 90, 72, 88, 55, 70, 95].map((height, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                <div 
                                    className="w-full bg-[#4A5568] rounded-t opacity-70 hover:opacity-100 transition-all cursor-pointer hover:bg-[#718096]"
                                    style={{ height: `${height * 2}px` }}
                                />
                                <span className="text-[9px] md:text-[10px] text-gray-400 font-medium">
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Sales */}
                <div className="lg:col-span-3 bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{t('admin.recentActivity')}</h3>
                            <p className="text-sm text-gray-500">{t('admin.viewAll')}</p>
                        </div>
                        <button className="text-sm font-medium text-[#4A5568] hover:text-[#2D3748] flex items-center gap-1">
                            {t('admin.viewAll')}
                            <ArrowUpRight className="h-4 w-4" />
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        {recentSales.map((sale, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-[#4A5568] flex items-center justify-center text-white font-semibold text-sm">
                                    {sale.initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{sale.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{sale.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">+{formatCurrency(sale.amount)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{t('admin.recentOrders')}</h3>
                        <p className="text-sm text-gray-500">{t('admin.viewAll')}</p>
                    </div>
                    <button className="text-sm font-medium text-[#4A5568] hover:text-[#2D3748] flex items-center gap-1">
                        {t('admin.viewAll')}
                        <ArrowUpRight className="h-4 w-4" />
                    </button>
                </div>
                
                <div className="overflow-x-auto -mx-5 px-5">
                    <table className="w-full min-w-[500px]">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.orderId')}</th>
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.customer')}</th>
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.date')}</th>
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.status')}</th>
                                <th className={`${isRTL ? 'text-left' : 'text-right'} py-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.amount')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order, index) => (
                                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-3">
                                        <span className="font-mono text-sm font-semibold text-[#4A5568]">{order.id}</span>
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className="text-sm font-medium text-gray-900">{order.customer}</span>
                                    </td>
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span className="text-sm">{order.date}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                        <span className="text-sm font-bold text-gray-900">{formatCurrency(order.amount)}</span>
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
