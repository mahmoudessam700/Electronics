import { useState, useEffect, useRef } from 'react';
import { User, MapPin, Mail, Phone, Shield, Package, List, ChevronRight, Camera, Loader2, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AccountPageProps {
    onNavigate: (page: string) => void;
}

export function AccountPage({ onNavigate }: AccountPageProps) {
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
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

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleSave = async () => {
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
                setMessage({ type: 'success', text: 'Account details saved successfully!' });
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
            <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <Loader2 className="h-10 w-10 animate-spin text-[#333C4D]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F4F8]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Header */}
            <div className="bg-white">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <h1 className="text-2xl font-bold text-[#000000]">Your Account</h1>
                    <p className="text-[#666666] text-sm mt-1">Control your profile, security, and preferences</p>

                    {/* Navigation Tabs */}
                    <div className="flex gap-6 mt-6 border-b border-[#E5E7EB]">
                        <button
                            onClick={() => onNavigate('orders')}
                            className="pb-3 px-1 border-b-2 border-transparent text-[#666666] hover:text-[#000000] transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <Package className="w-4 h-4" />
                            Orders
                        </button>
                        <button
                            onClick={() => onNavigate('lists')}
                            className="pb-3 px-1 border-b-2 border-transparent text-[#666666] hover:text-[#000000] transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <List className="w-4 h-4" />
                            Lists
                        </button>
                        <button className="pb-3 px-1 border-b-2 border-[#000000] text-[#000000] text-sm font-semibold flex items-center gap-2">
                            A
                        </button>
                    </div>
                </div>
            </div>

            {/* User Info Bar - Navy Slate Background */}
            <div className="bg-[#333C4D]">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#4A5568] rounded-full flex items-center justify-center overflow-hidden">
                            {formData.image ? (
                                <img src={formData.image} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-white" />
                            )}
                        </div>
                        <div>
                            <div className="font-semibold text-white">{formData.name || 'Admin'}</div>
                            <div className="text-sm text-[#B0B3B8]">{formData.email}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <nav className="bg-white rounded-xl overflow-hidden shadow-sm">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all ${activeTab === 'personal'
                                        ? 'bg-white text-[#000000] border-l-4 border-[#333C4D]'
                                        : 'text-[#666666] hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5" />
                                    <span className="font-medium text-sm">Personal Data</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[#999999]" />
                            </button>

                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all border-t border-[#F3F4F6] ${activeTab === 'security'
                                        ? 'bg-white text-[#000000] border-l-4 border-[#333C4D]'
                                        : 'text-[#666666] hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5" />
                                    <span className="font-medium text-sm">Security</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[#999999]" />
                            </button>

                            <button
                                onClick={() => setActiveTab('addresses')}
                                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all border-t border-[#F3F4F6] ${activeTab === 'addresses'
                                        ? 'bg-white text-[#000000] border-l-4 border-[#333C4D]'
                                        : 'text-[#666666] hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5" />
                                    <span className="font-medium text-sm">My Addresses</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[#999999]" />
                            </button>

                            <button
                                onClick={() => setActiveTab('professional')}
                                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all border-t border-[#F3F4F6] ${activeTab === 'professional'
                                        ? 'bg-white text-[#000000] border-l-4 border-[#333C4D]'
                                        : 'text-[#666666] hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5" />
                                    <span className="font-medium text-sm">Professional Profile</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[#999999]" />
                            </button>
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Complete Your Profile - Navy Slate Background */}
                        <div className="bg-[#333C4D] rounded-xl p-6">
                            <h3 className="font-semibold text-lg text-white mb-2">Complete Your Profile</h3>
                            <p className="text-[#B0B3B8] text-sm mb-5">
                                Completing your profile items unlocks premium discounts and faster checkout experiences.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 bg-[#4A5568] rounded-full h-2 overflow-hidden">
                                    <div className="bg-white h-full rounded-full transition-all" style={{ width: '65%' }}></div>
                                </div>
                                <span className="font-bold text-lg text-white">65%</span>
                            </div>
                            <p className="text-sm text-[#B0B3B8] mt-2">Completed</p>
                        </div>

                        {/* Message Alert */}
                        {message && (
                            <div className={`p-4 rounded-xl font-medium text-sm ${message.type === 'success'
                                    ? 'bg-green-50 text-green-800 border border-green-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        {/* Profile Details */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="border-b border-[#F3F4F6] pb-4 mb-6">
                                <h2 className="text-lg font-semibold text-[#000000]">Profile Details</h2>
                                <p className="text-[#666666] text-sm mt-1">Update your public information and avatar</p>
                            </div>

                            <div className="space-y-6">
                                {/* Avatar Upload - Circular with Camera Icon */}
                                <div className="flex flex-col items-center py-4">
                                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        {/* Avatar Container */}
                                        <div className="w-28 h-28 rounded-full overflow-hidden bg-[#E5E7EB] flex items-center justify-center relative">
                                            {formData.image ? (
                                                <img
                                                    src={formData.image}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-14 h-14 text-[#9CA3AF]" />
                                            )}

                                            {/* Loading State */}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Camera Button - Blue Circle */}
                                        <div className="absolute bottom-0 right-0 w-9 h-9 bg-[#4F46E5] rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-[#4338CA] transition-colors">
                                            <Camera className="w-4 h-4 text-white" />
                                        </div>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                            ref={fileInputRef}
                                        />
                                    </div>

                                    {/* Upload Instructions */}
                                    <p className="text-sm text-[#666666] mt-4">Click the camera icon to upload your avatar</p>
                                    <p className="text-xs text-[#9CA3AF]">JPG, PNG or GIF. Max size 5MB</p>
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-[#000000] mb-2">
                                        Full Name
                                    </label>
                                    <div className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg focus-within:ring-2 focus-within:ring-[#4F46E5] focus-within:border-[#4F46E5] transition-all">
                                        <User className="w-5 h-5 text-[#9CA3AF]" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="flex-1 bg-transparent outline-none text-[#000000] text-sm"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>

                                {/* Account Email */}
                                <div>
                                    <label className="block text-sm font-medium text-[#000000] mb-2">
                                        Account Email
                                    </label>
                                    <div className="flex items-center gap-3 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
                                        <Mail className="w-5 h-5 text-[#9CA3AF]" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="flex-1 bg-transparent outline-none text-[#6B7280] text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Phone Connectivity */}
                                <div>
                                    <label className="block text-sm font-medium text-[#000000] mb-2">
                                        Phone Connectivity
                                    </label>
                                    <div className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg focus-within:ring-2 focus-within:ring-[#4F46E5] focus-within:border-[#4F46E5] transition-all">
                                        <Phone className="w-5 h-5 text-[#9CA3AF]" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="flex-1 bg-transparent outline-none text-[#000000] text-sm"
                                            placeholder="+20 123 456 7890"
                                        />
                                    </div>
                                </div>

                                {/* Delivery Location */}
                                <div>
                                    <label className="block text-sm font-medium text-[#000000] mb-2">
                                        Delivery Location
                                    </label>
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleDetectLocation}
                                            disabled={detecting}
                                            className="px-4 py-2.5 bg-[#333C4D] text-white rounded-lg hover:bg-[#2D3748] transition-colors flex items-center gap-2 font-medium text-sm disabled:opacity-50"
                                        >
                                            {detecting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <MapPin className="w-4 h-4" />
                                            )}
                                            Auto-Detect Address
                                        </button>

                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] outline-none resize-none transition-all text-[#000000] text-sm"
                                            rows={3}
                                            placeholder="Detect your address using the button..."
                                        />

                                        {/* Map Placeholder */}
                                        <div className="bg-[#F9FAFB] rounded-xl border-2 border-dashed border-[#E5E7EB] h-64 flex flex-col items-center justify-center overflow-hidden">
                                            {formData.latitude && formData.longitude ? (
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    frameBorder="0"
                                                    scrolling="no"
                                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${formData.longitude - 0.005}%2C${formData.latitude - 0.005}%2C${formData.longitude + 0.005}%2C${formData.latitude + 0.005}&layer=mapnik&marker=${formData.latitude}%2C${formData.longitude}`}
                                                    style={{ border: 0 }}
                                                    className="rounded-lg"
                                                />
                                            ) : (
                                                <div className="text-center p-6">
                                                    <div className="w-14 h-14 bg-[#E5E7EB] rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <MapPin className="w-7 h-7 text-[#9CA3AF]" />
                                                    </div>
                                                    <p className="text-[#6B7280] font-medium">Map Unavailable</p>
                                                    <p className="text-sm text-[#9CA3AF] mt-1">Click detect location to see your address on the map</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="pt-4">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-6 py-3 bg-[#333C4D] text-white rounded-lg hover:bg-[#2D3748] transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        Save Account Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
