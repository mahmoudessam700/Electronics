import { useState, useEffect } from 'react';
import { Loader2, Package } from 'lucide-react';

interface Order {
    id: string;
    orderNumber: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    createdAt: string;
}

export function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            if (res.ok) {
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Orders</h2>

            <div className="border rounded-md">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr className="text-left">
                            <th className="p-4 font-medium text-gray-500">Order #</th>
                            <th className="p-4 font-medium text-gray-500">Customer</th>
                            <th className="p-4 font-medium text-gray-500">Date</th>
                            <th className="p-4 font-medium text-gray-500">Total</th>
                            <th className="p-4 font-medium text-gray-500">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="p-4 font-medium">{order.orderNumber}</td>
                                <td className="p-4">{order.customerEmail}</td>
                                <td className="p-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="p-4">${order.totalAmount.toFixed(2)}</td>
                                <td className="p-4">
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                        className="border rounded px-2 py-1 text-sm bg-white"
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="PROCESSING">Processing</option>
                                        <option value="SHIPPED">Shipped</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No orders found.
                    </div>
                )}
            </div>
        </div>
    );
}
