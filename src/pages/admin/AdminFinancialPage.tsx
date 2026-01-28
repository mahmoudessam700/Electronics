import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Wallet,
  Receipt,
  CreditCard,
  PieChart,
  Loader2
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function AdminFinancialPage() {
    const { t, formatCurrency } = useLanguage();
    const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'payouts' | 'analysis'>('overview');
    const [currentCycle, setCurrentCycle] = useState<any>(null);
    const [previousCycles, setPreviousCycles] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFinancialData();
    }, []);

    const fetchFinancialData = async () => {
        try {
            setLoading(true);
            const [cycleRes, prevRes, expRes] = await Promise.all([
                fetch('/api/financial'),
                fetch('/api/financial?type=cycles'),
                fetch('/api/financial?type=expenses')
            ]);

            const cycleData = await cycleRes.json();
            const prevData = await prevRes.json();
            const expData = await expRes.json();

            setCurrentCycle(cycleData);
            setPreviousCycles(prevData.filter((c: any) => c.id !== cycleData?.id));
            setExpenses(expData);
        } catch (error) {
            console.error('Failed to fetch financial data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 text-[#0F172A] animate-spin" />
                <span className="mt-4 text-slate-500 font-medium">{t('admin.loadingFinancial')}</span>
            </div>
        );
    }

    const cycle = currentCycle || {
        name: t('admin.noActiveCycle'),
        startDate: '-',
        totalRevenue: 0,
        totalExpenses: 0,
        totalTax: 0,
        netProfit: 0,
        margin: '0%'
    };

    const stats = [
        { 
            title: t('admin.currentRevenue'), 
            value: formatCurrency(cycle.totalRevenue || 0), 
            icon: DollarSign, 
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        { 
            title: t('admin.currentExpenses'), 
            value: formatCurrency(cycle.totalExpenses || 0), 
            icon: ArrowDownRight, 
            color: 'text-red-600',
            bg: 'bg-red-50'
        },
        { 
            title: t('admin.estimatedTax'), 
            value: formatCurrency(cycle.totalTax || 0), 
            icon: Receipt, 
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
        { 
            title: t('admin.netProfit'), 
            value: formatCurrency(cycle.netProfit || 0), 
            icon: Wallet, 
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('admin.financialManagement')}</h1>
                    <p className="text-sm text-gray-500">{t('admin.financialSubtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                        <Download className="h-4 w-4" />
                        {t('admin.exportReport')}
                    </button>
                    {!currentCycle && (
                        <button 
                            onClick={async () => {
                                const name = prompt('Enter cycle name (e.g., February 2026):');
                                if (name) {
                                    await fetch('/api/financial?type=cycle', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ name })
                                    });
                                    fetchFinancialData();
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            {t('admin.startNewCycle')}
                        </button>
                    )}
                    {currentCycle && (
                        <button 
                            onClick={async () => {
                                const desc = prompt('Expense description:');
                                const amt = prompt('Amount:');
                                const cat = prompt('Category:');
                                if (desc && amt && cat) {
                                    await fetch('/api/financial?type=expense', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ 
                                            description: desc, 
                                            amount: parseFloat(amt), 
                                            category: cat,
                                            cycleId: currentCycle.id
                                        })
                                    });
                                    fetchFinancialData();
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            {t('admin.newExpense')}
                        </button>
                    )}
                </div>
            </div>

            {/* Current Cycle Overview Card */}
            <div className="bg-[#4A5568] rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <PieChart className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${currentCycle ? 'bg-emerald-500' : 'bg-slate-500'}`}>
                            {currentCycle ? t('admin.activeCycle') : t('admin.noActiveCycle')}
                        </span>
                        <h2 className="text-xl font-bold">{cycle.name}</h2>
                        {currentCycle && <span className="text-white/60 text-sm ml-2">{new Date(cycle.startDate).toLocaleDateString()} {t('admin.toPresent')}</span>}
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                            <p className="text-white/60 text-xs uppercase tracking-widest mb-1 font-semibold">{t('admin.totalRevenue')}</p>
                            <p className="text-3xl font-bold">{formatCurrency(cycle.totalRevenue || 0)}</p>
                        </div>
                        <div>
                            <p className="text-white/60 text-xs uppercase tracking-widest mb-1 font-semibold">{t('admin.netProfit')}</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-emerald-300">{formatCurrency(cycle.netProfit || 0)}</p>
                                <span className="text-xs text-emerald-400 font-medium">({((cycle.netProfit / (cycle.totalRevenue || 1)) * 100).toFixed(1)}% {t('admin.margin')})</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-white/60 text-xs uppercase tracking-widest mb-1 font-semibold">{t('admin.expenses')}</p>
                            <p className="text-3xl font-bold text-red-300">{formatCurrency(cycle.totalExpenses || 0)}</p>
                        </div>
                        <div>
                            <p className="text-white/60 text-xs uppercase tracking-widest mb-1 font-semibold">{t('admin.estimatedTax')} (14%)</p>
                            <p className="text-3xl font-bold text-amber-300">{formatCurrency(cycle.totalTax || 0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.title} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.title}</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex gap-8">
                    {(['overview', 'expenses', 'payouts', 'analysis'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-medium transition-all relative ${
                                activeTab === tab ? 'text-[#0F172A]' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {tab === 'overview' ? t('admin.overview') : 
                             tab === 'expenses' ? t('admin.expenses') : 
                             tab === 'payouts' ? t('admin.payouts') : t('admin.analysis')}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F172A] rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main List Area */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900">{t('admin.recentTransactions')}</h3>
                                <button className="text-xs font-semibold text-slate-500 hover:text-slate-900">{t('admin.viewAllTransactions')}</button>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {expenses.map((expense) => (
                                    <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                                <CreditCard className="h-5 w-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{expense.description}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{expense.category}</span>
                                                    <span className="text-xs text-gray-400">{new Date(expense.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-red-600">-{formatCurrency(expense.amount)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'expenses' && (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                            <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{t('admin.expenseLog')}</h3>
                            <p className="text-slate-500 text-sm mb-6">{t('admin.expenseLogDesc')}</p>
                            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all">
                                {t('admin.loadExpenseDashboard')}
                            </button>
                        </div>
                    )}

                    {activeTab === 'payouts' && (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                            <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{t('admin.supplierPayouts')}</h3>
                            <p className="text-slate-500 text-sm mb-6">{t('admin.supplierPayoutsDesc')}</p>
                            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all">
                                {t('admin.viewPayoutStatus')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar area */}
                <div className="space-y-6">
                    {/* Previous Cycles */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="text-sm font-bold text-gray-900">{t('admin.previousCycles')}</h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {previousCycles.map((cycle) => (
                                <div key={cycle.id} className="p-4 hover:bg-gray-50 transition-all group cursor-pointer">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-bold text-gray-900 group-hover:text-slate-900 transition-colors">{cycle.name}</p>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{cycle.status}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-emerald-600 font-semibold">{t('admin.profit')}: {formatCurrency(cycle.netProfit || 0)}</span>
                                        <span className="text-gray-400">{t('admin.rev')}: {formatCurrency(cycle.totalRevenue || 0)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-gray-50/30 text-center">
                            <button className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">{t('admin.viewAllHistory')}</button>
                        </div>
                    </div>

                    {/* Quick Tools */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white shadow-lg">
                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            {t('admin.cycleControls')}
                        </h3>
                        <div className="space-y-2">
                            {currentCycle && (
                                <button 
                                    onClick={async () => {
                                        if (confirm(`Are you sure you want to close "${currentCycle.name}"?`)) {
                                            await fetch(`/api/financial?id=${currentCycle.id}&action=close`, { method: 'PUT' });
                                            fetchFinancialData();
                                        }
                                    }}
                                    className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-all text-left"
                                >
                                    {t('admin.closeCurrentCycle')}
                                </button>
                            )}
                            <button className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-all text-left">
                                {t('admin.financialProjection')}
                            </button>
                            <button className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-all text-left">
                                {t('admin.manageTaxSlabs')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
