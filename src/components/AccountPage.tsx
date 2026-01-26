import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, Loader2, Package, List as ListIcon, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

interface AccountPageProps {
    onNavigate: (page: string) => void;
}

export function AccountPage({ onNavigate }: AccountPageProps) {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: (user as any).phone || '',
                address: (user as any).address || ''
            });
            setLoading(false);
        }
    }, [user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/auth/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#718096]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EAEDED] py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#0F1111] mb-2">Your Account</h1>
                    <p className="text-[#565959]">Manage your profile and settings</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sidebar Nav */}
                    <div className="space-y-4">
                        <Card className="border-none shadow-sm">
                            <CardContent className="p-2">
                                <button
                                    className="w-full text-left px-4 py-3 rounded-lg bg-[#FFD814]/10 text-[#0F1111] font-bold flex items-center gap-3"
                                >
                                    <User className="h-5 w-5" />
                                    Profile Information
                                </button>
                                <button
                                    onClick={() => onNavigate('orders')}
                                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-[#565959] hover:text-[#0F1111] transition-all flex items-center gap-3"
                                >
                                    <Package className="h-5 w-5" />
                                    Your Orders
                                </button>
                                <button
                                    onClick={() => onNavigate('lists')}
                                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-[#565959] hover:text-[#0F1111] transition-all flex items-center gap-3"
                                >
                                    <ListIcon className="h-5 w-5" />
                                    Your Lists
                                </button>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-gradient-to-br from-[#4A5568] to-[#2D3748] text-white">
                            <CardContent className="p-6 space-y-4">
                                <Shield className="h-8 w-8 text-[#FFD814]" />
                                <h3 className="font-bold text-lg">Security & Privacy</h3>
                                <p className="text-sm text-gray-300">Your data is secured with enterprise-grade encryption.</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Profile Form */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="border-none shadow-md overflow-hidden">
                            <CardHeader className="bg-white border-b border-gray-100 p-6">
                                <CardTitle className="text-xl">Profile Details</CardTitle>
                                <CardDescription>Update your personal information</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleUpdate} className="space-y-6">
                                    {message && (
                                        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                            }`}>
                                            {message.text}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#0F1111] flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                Full Name
                                            </label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Mohamed Ahmed"
                                                className="h-11 border-gray-300 focus-visible:ring-[#FFD814]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[#0F1111] flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                Email Address
                                            </label>
                                            <Input
                                                value={formData.email}
                                                disabled
                                                className="h-11 bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#0F1111] flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            Phone Number
                                        </label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="01234567890"
                                            className="h-11 border-gray-300 focus-visible:ring-[#FFD814]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#0F1111] flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            Shipping Address
                                        </label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Enter your full delivery address..."
                                            className="w-full min-h-[120px] p-4 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            disabled={saving}
                                            className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] h-12 px-10 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2"
                                        >
                                            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
