import { useState, useEffect, useRef } from 'react';
import { User, MapPin, Mail, Phone, Shield, Package, List, ChevronRight, Camera, Loader2, Save, Upload } from 'lucide-react';
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
            <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <Loader2 className="h-10 w-10 animate-spin text-[#333333]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Header */}
            <div className="bg-white border-b border-[#E0E0E0]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-[#000000]">Your Account</h1>
                    <p className="text-[#666666] mt-1">Control your profile, security, and preferences</p>

                    {/* Navigation Tabs */}
                    <div className="flex gap-8 mt-8">
                        <button
                            onClick={() => onNavigate('orders')}
                            className="pb-4 px-1 border-b-2 border-transparent text-[#666666] hover:text-[#000000] transition-colors font-medium"
                        >
                            <Package className="inline-block w-5 h-5 mr-2" />
                            Orders
                        </button>
                        <button
                            onClick={() => onNavigate('lists')}
                            className="pb-4 px-1 border-b-2 border-transparent text-[#666666] hover:text-[#000000] transition-colors font-medium"
                        >
                            <List className="inline-block w-5 h-5 mr-2" />
                            Lists
                        </button>
                        <button className="pb-4 px-1 border-b-2 border-[#000000] text-[#000000] font-semibold">
                            <User className="inline-block w-5 h-5 mr-2" />
                            Account
                        </button>
                    </div>
                </div>
            </div>

            {/* User Info Bar - Greyish Background */}
            <div className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#E0E0E0] rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                            {formData.image ? (
                                <img src={formData.image} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-7 h-7 text-[#666666]" />
                            )}
                        </div>
                        <div>
                            <div className="font-semibold text-lg text-[#000000]">{formData.name || 'User'}</div>
                            <div className="text-sm text-[#666666]">{formData.email}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <nav className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`w-full flex items-center justify-between px-5 py-4 text-left transition-all ${activeTab === 'personal'
                                        ? 'bg-[#F9F9F9] text-[#000000] border-l-4 border-[#333333]'
                                        : 'text-[#666666] hover:bg-[#F9F9F9]'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5" />
                                    <span className="font-medium">Personal Data</span>
                                </div>
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center justify-between px-5 py-4 text-left transition-all border-t border-[#E0E0E0] ${activeTab === 'security'
                                        ? 'bg-[#F9F9F9] text-[#000000] border-l-4 border-[#333333]'
                                        : 'text-[#666666] hover:bg-[#F9F9F9]'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5" />
                                    <span className="font-medium">Security</span>
                                </div>
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => setActiveTab('addresses')}
                                className={`w-full flex items-center justify-between px-5 py-4 text-left transition-all border-t border-[#E0E0E0] ${activeTab === 'addresses'
                                        ? 'bg-[#F9F9F9] text-[#000000] border-l-4 border-[#333333]'
                                        : 'text-[#666666] hover:bg-[#F9F9F9]'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5" />
                                    <span className="font-medium">My Addresses</span>
                                </div>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </nav>

                        {/* Sign Up Banner */}
                        <div className="mt-6 bg-[#4C3BD9] rounded-xl p-6 text-white">
                            <h4 className="font-semibold text-lg mb-2">Unlock Premium</h4>
                            <p className="text-sm text-white/80 mb-4">Get exclusive discounts and early access to new products.</p>
                            <button className="w-full bg-white text-[#4C3BD9] py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors">
                                Learn More
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Profile Completion - Greyish Background */}
                        <div className="bg-[#F5F5F5] rounded-xl p-8 border border-[#E0E0E0]">
                            <h3 className="font-semibold text-xl text-[#000000] mb-3">Complete Your Profile</h3>
                            <p className="text-[#666666] text-sm mb-6">
                                Completing your profile items unlocks premium discounts and faster checkout experiences.
                            </p>
                            <div className="flex items-center gap-6">
                                <div className="flex-1 bg-[#E0E0E0] rounded-full h-3 overflow-hidden">
                                    <div className="bg-[#333333] h-full rounded-full transition-all" style={{ width: '65%' }}></div>
                                </div>
                                <span className="font-bold text-2xl text-[#000000]">65%</span>
                            </div>
                            <p className="text-sm text-[#666666] mt-3">Completed</p>
                        </div>

                        {/* Message Alert */}
                        {message && (
                            <div className={`p-5 rounded-xl font-medium ${message.type === 'success'
                                    ? 'bg-green-50 text-green-800 border border-green-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        {/* Profile Details */}
                        <div className="bg-white rounded-xl border border-[#E0E0E0] p-8">
                            <div className="border-b border-[#E0E0E0] pb-6 mb-8">
                                <h2 className="text-2xl font-bold text-[#000000]">Profile Details</h2>
                                <p className="text-[#666666] mt-1">Update your public information and avatar</p>
                            </div>

                            <div className="space-y-8">
                                {/* Avatar Upload - Facebook Style with Greyish Background */}
                                <div className="bg-[#F5F5F5] rounded-xl p-8 border border-[#E0E0E0]">
                                    <div className="flex flex-col items-center">
                                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                            {/* Avatar Container */}
                                            <div className="w-40 h-40 rounded-full overflow-hidden bg-[#E0E0E0] border-4 border-white shadow-xl relative">
                                                {formData.image ? (
                                                    <img
                                                        src={formData.image}
                                                        alt="Avatar"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-[#D0D0D0]">
                                                        <User className="w-20 h-20 text-[#888888]" />
                                                    </div>
                                                )}

                                                {/* Hover Overlay - Facebook Style */}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                                    <Camera className="w-8 h-8 text-white mb-2" />
                                                    <span className="text-white text-sm font-medium">Update Photo</span>
                                                </div>

                                                {/* Loading State */}
                                                {uploading && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Camera Badge */}
                                            <div className="absolute bottom-2 right-2 w-12 h-12 bg-[#333333] rounded-full flex items-center justify-center shadow-lg border-3 border-white group-hover:bg-[#000000] transition-colors">
                                                <Camera className="w-6 h-6 text-white" />
                                            </div>

                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                className="hidden"
                                                ref={fileInputRef}
                                            />
                                        </div>

                                        {/* Upload Instructions with Icon */}
                                        <div className="mt-6 flex items-center gap-3 text-[#666666]">
                                            <div className="w-10 h-10 bg-[#E0E0E0] rounded-full flex items-center justify-center">
                                                <Upload className="w-5 h-5 text-[#666666]" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-[#000000]">Click to upload your avatar</p>
                                                <p className="text-sm text-[#888888]">JPG, PNG or GIF. Max size 5MB</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-bold text-[#000000] mb-3">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-5 py-3 bg-[#F9F9F9] border border-[#E0E0E0] rounded-xl focus:ring-2 focus:ring-[#333333] focus:border-[#333333] outline-none transition-all text-[#000000]"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                {/* Account Email */}
                                <div>
                                    <label className="block text-sm font-bold text-[#000000] mb-3">
                                        Account Email
                                    </label>
                                    <div className="flex items-center gap-3 px-5 py-3 bg-[#F9F9F9] border border-[#E0E0E0] rounded-xl">
                                        <Mail className="w-5 h-5 text-[#666666]" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="flex-1 bg-transparent outline-none text-[#666666]"
                                        />
                                    </div>
                                </div>

                                {/* Phone Connectivity */}
                                <div>
                                    <label className="block text-sm font-bold text-[#000000] mb-3">
                                        Phone Connectivity
                                    </label>
                                    <div className="flex items-center gap-3 px-5 py-3 bg-[#F9F9F9] border border-[#E0E0E0] rounded-xl focus-within:ring-2 focus-within:ring-[#333333] focus-within:border-[#333333] transition-all">
                                        <Phone className="w-5 h-5 text-[#666666]" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="flex-1 bg-transparent outline-none text-[#000000]"
                                            placeholder="+20 123 456 7890"
                                        />
                                    </div>
                                </div>

                                {/* Delivery Location */}
                                <div>
                                    <label className="block text-sm font-bold text-[#000000] mb-3">
                                        Delivery Location
                                    </label>
                                    <div className="space-y-4">
                                        <button
                                            onClick={handleDetectLocation}
                                            disabled={detecting}
                                            className="px-6 py-3 bg-[#333333] text-white rounded-xl hover:bg-[#000000] transition-colors flex items-center gap-2 font-semibold disabled:opacity-50"
                                        >
                                            {detecting ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <MapPin className="w-5 h-5" />
                                            )}
                                            Auto-Detect Address
                                        </button>

                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-5 py-4 bg-[#F9F9F9] border border-[#E0E0E0] rounded-xl focus:ring-2 focus:ring-[#333333] focus:border-[#333333] outline-none resize-none transition-all text-[#000000]"
                                            rows={3}
                                            placeholder="Detect your address using the button..."
                                        />

                                        {/* Map */}
                                        <div className="bg-[#F5F5F5] rounded-xl border-2 border-dashed border-[#E0E0E0] h-72 flex flex-col items-center justify-center overflow-hidden">
                                            {formData.latitude && formData.longitude ? (
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    frameBorder="0"
                                                    scrolling="no"
                                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${formData.longitude - 0.005}%2C${formData.latitude - 0.005}%2C${formData.longitude + 0.005}%2C${formData.latitude + 0.005}&layer=mapnik&marker=${formData.latitude}%2C${formData.longitude}`}
                                                    style={{ border: 0 }}
                                                    className="rounded-xl"
                                                />
                                            ) : (
                                                <div className="text-center p-8">
                                                    <div className="w-20 h-20 bg-[#E0E0E0] rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <MapPin className="w-10 h-10 text-[#666666]" />
                                                    </div>
                                                    <p className="text-[#666666] font-semibold text-lg">Map Unavailable</p>
                                                    <p className="text-sm text-[#999999] mt-2">Click detect location to see your address on the map</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Changes Button - At the End */}
                        <div className="bg-[#F5F5F5] rounded-xl p-6 border border-[#E0E0E0] flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-[#000000]">Ready to save your changes?</p>
                                <p className="text-sm text-[#666666]">Make sure all information is correct before saving.</p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-10 py-4 bg-[#333333] text-white rounded-xl hover:bg-[#000000] transition-colors font-semibold flex items-center gap-3 disabled:opacity-50 text-lg shadow-lg hover:shadow-xl"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
