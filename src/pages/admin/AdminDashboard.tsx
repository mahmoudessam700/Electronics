import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Package, ShoppingCart, DollarSign, Users } from 'lucide-react';

export function AdminDashboard() {
    // This would fetch real stats from an API in a real app
    const stats = [
        { title: 'Total Revenue', value: '$12,345', icon: DollarSign, color: 'text-green-600' },
        { title: 'Orders', value: '+25', icon: ShoppingCart, color: 'text-blue-600' },
        { title: 'Products', value: '142', icon: Package, color: 'text-purple-600' },
        { title: 'Active Users', value: '+573', icon: Users, color: 'text-orange-600' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                +20.1% from last month
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-gray-400 bg-gray-50 rounded">
                            Chart Placeholder
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-100 items-center justify-center">
                                    <span className="text-xs font-bold">OM</span>
                                </span>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Olivia Martin</p>
                                    <p className="text-xs text-muted-foreground">olivia.martin@email.com</p>
                                </div>
                                <div className="ml-auto font-medium">+$1,999.00</div>
                            </div>
                            <div className="flex items-center">
                                <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-100 items-center justify-center">
                                    <span className="text-xs font-bold">JL</span>
                                </span>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Jackson Lee</p>
                                    <p className="text-xs text-muted-foreground">jackson.lee@email.com</p>
                                </div>
                                <div className="ml-auto font-medium">+$39.00</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
