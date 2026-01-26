import { useState, useEffect, useRef } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, Save, Loader2, Package, List as ListIcon, Shield, Camera, UploadCloud, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AccountPageProps {
    onNavigate: (page: string) => void;
}

export function AccountPage({ onNavigate }: AccountPageProps) {
    const { user, token, refreshUser } = useAuth(); // Assuming refreshUser might be added or we just rely on effect
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        image: '',
        latitude: null as number | null,
        longitude: null as number | null,
    });

    const [detecting, setDetecting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: (user as any).phone || '',
                address: (user as any).address || '',
                image: (user as any).image || '',
                latitude: (user as any).latitude || null,
                longitude: (user as any).longitude || null,
            });
            setLoading(false);
        }
    }, [user]);

    const handleDetectLocation = () => {
        setDetecting(true);
        setMessage(null);

        if (!navigator.geolocation) {
            setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' });
            setDetecting(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude: lat, longitude: lng } = position.coords;
            setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));

            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                const data = await res.json();
                if (data.display_name) {
                    setFormData(prev => ({ ...prev, address: data.display_name }));
                }
            } catch (err) {
                console.error('Reverse geocoding failed', err);
            } finally {
                setDetecting(false);
            }
        }, (err) => {
            console.error('Geolocation error', err);
            setMessage({ type: 'error', text: 'Failed to detect location. Please enter address manually.' });
            setDetecting(false);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            if (data.success && data.files?.[0]?.url) {
                setFormData(prev => ({ ...prev, image: data.files[0].url }));
                setMessage({ type: 'success', text: 'Photo uploaded! Don\'t forget to save changes.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to upload image' });
        } finally {
            setUploading(false);
        }
    };

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
                // Optionally trigger auth context refresh here
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
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#718096]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-[#0F1111] tracking-tight">Your Account</h1>
                        <p className="text-[#565959] text-lg font-medium">Control your profile, security, and preferences</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onNavigate('orders')}
                            className="px-6 py-3 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-sm font-bold text-[#0F1111] flex items-center gap-2"
                        >
                            <Package className="h-4 w-4" />
                            Orders
                        </button>
                        <button
                            onClick={() => onNavigate('lists')}
                            className="px-6 py-3 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-sm font-bold text-[#0F1111] flex items-center gap-2"
                        >
                            <ListIcon className="h-4 w-4 text-red-500" />
                            Lists
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Avatar & Card Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
                            <CardContent className="p-10 flex flex-col items-center text-center">
                                <div className="relative group mb-6">
                                    <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-[#FFD814] to-orange-400 relative">
                                        <div className="w-full h-full rounded-full bg-white p-1 overflow-hidden relative">
                                            <Avatar className="w-full h-full">
                                                <AvatarImage src={formData.image} />
                                                <AvatarFallback className="bg-gray-50 text-3xl font-black text-[#0F1111]">
                                                    {formData.name?.[0]?.toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            {uploading && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <Loader2 className="h-10 w-10 animate-spin text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-1 right-1 bg-white p-3 rounded-2xl shadow-xl border border-gray-100 text-[#0F1111] hover:scale-110 active:scale-95 transition-all group-hover:bg-[#FFD814]"
                                    >
                                        <Camera className="h-5 w-5" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>

                                <h2 className="text-2xl font-black text-[#0F1111] line-clamp-1">{formData.name || 'Set your name'}</h2>
                                <p className="text-gray-400 text-sm font-medium mb-8">{formData.email}</p>

                                <nav className="w-full space-y-2">
                                    <button className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-gray-50 text-[#0F1111] font-bold">
                                        <UserIcon className="h-5 w-5" />
                                        Personal Data
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-gray-400 hover:bg-gray-50 hover:text-[#0F1111] font-bold transition-all group">
                                        <Shield className="h-5 w-5 group-hover:text-amber-500" />
                                        Security
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-gray-400 hover:bg-gray-50 hover:text-[#0F1111] font-bold transition-all group">
                                        <MapPin className="h-5 w-5 group-hover:text-blue-500" />
                                        My Addresses
                                    </button>
                                </nav>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-[#2D3748] text-white rounded-[2.5rem] overflow-hidden">
                            <CardContent className="p-8">
                                <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                                    <UploadCloud className="h-6 w-6 text-[#FFD814]" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Professional Profile</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">Completing your profile items unlocks premium discounts and faster checkout experiences.</p>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div className="bg-[#FFD814] h-full w-[65%] rounded-full shadow-[0_0_10px_rgba(255,216,20,0.3)]"></div>
                                </div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-[#FFD814] mt-3">65% Completed</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form Content */}
                    <div className="lg:col-span-8 space-y-8">
                        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="px-10 pt-10 pb-4">
                                <CardTitle className="text-2xl font-black">Profile Details</CardTitle>
                                <CardDescription className="text-base font-medium">Update your public information and avatar</CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 pt-4">
                                <form onSubmit={handleUpdate} className="space-y-8">
                                    {message && (
                                        <div className={`p-5 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                            }`}>
                                            {message.type === 'success' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                                            <span className="font-bold">{message.text}</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-sm font-black text-[#0F1111] uppercase tracking-wider ml-1">Full Name</label>
                                            <div className="group relative">
                                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#FFD814] transition-colors" />
                                                <Input
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="h-14 pl-12 rounded-2xl border-gray-100 bg-gray-50 focus-visible:bg-white focus-visible:ring-offset-0 focus-visible:ring-[#FFD814] focus-visible:border-[#FFD814] transition-all"
                                                    placeholder="Mohamed Ahmed"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-black text-[#0F1111] uppercase tracking-wider ml-1">Account Email</label>
                                            <div className="group relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <Input
                                                    value={formData.email}
                                                    disabled
                                                    className="h-14 pl-12 rounded-2xl border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed italic"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-black text-[#0F1111] uppercase tracking-wider ml-1">Phone Connectivity</label>
                                        <div className="group relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#FFD814] transition-colors" />
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="h-14 pl-12 rounded-2xl border-gray-100 bg-gray-50 focus-visible:bg-white focus-visible:ring-offset-0 focus-visible:ring-[#FFD814] focus-visible:border-[#FFD814] transition-all"
                                                placeholder="+20 123 456 7890"
                                            />
                                        </div>
                                    </div>

                                    {/* Location Section */}
                                    <div className="space-y-6 pt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-black text-[#0F1111] uppercase tracking-wider ml-1">Delivery Location</label>
                                            <Button
                                                type="button"
                                                onClick={handleDetectLocation}
                                                disabled={detecting}
                                                className="bg-gray-50 hover:bg-white hover:shadow-md text-[#007185] font-black h-10 px-6 rounded-xl border border-gray-100 transition-all flex items-center gap-2"
                                            >
                                                {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                                                Auto-Detect Address
                                            </Button>
                                        </div>

                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Detect your address using the button or enter it manually..."
                                            className="w-full min-h-[100px] p-5 rounded-3xl border-gray-100 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD814] focus:bg-white transition-all font-medium leading-relaxed"
                                        />

                                        {/* Live Map Preview */}
                                        <div className="h-64 rounded-3xl border-4 border-white shadow-xl bg-gray-100 overflow-hidden relative group">
                                            {formData.latitude && formData.longitude ? (
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    frameBorder="0"
                                                    scrolling="no"
                                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${formData.longitude - 0.005}%2C${formData.latitude - 0.005}%2C${formData.longitude + 0.005}%2C${formData.latitude + 0.005}&layer=mapnik&marker=${formData.latitude}%2C${formData.longitude}`}
                                                    style={{ border: 0 }}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gray-50 italic text-gray-400">
                                                    <MapPin className="h-10 w-10 mb-2 opacity-20" />
                                                    <p className="text-xs font-bold uppercase tracking-widest opacity-50">Map Unavailable</p>
                                                    <p className="text-xs px-12">Click detect location to see your address on the map</p>
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl text-[10px] font-black tracking-widest uppercase text-[#0F1111]">
                                                Active Preview
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-10">
                                        <Button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full md:w-auto min-w-[240px] h-16 rounded-[1.5rem] bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-black text-lg shadow-[0_15px_40px_-10px_rgba(255,216,20,0.5)] hover:-translate-y-1 active:translate-y-0.5 transition-all flex items-center justify-center gap-3"
                                        >
                                            {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                                            Save Account Details
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
