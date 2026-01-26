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
    const [locationDetected, setLocationDetected] = useState(false);
    const [detecting, setDetecting] = useState(false);
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
            if ((user as any).latitude && (user as any).longitude) {
                setLocationDetected(true);
            }
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
                    setLocationDetected(true);
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-semibold text-gray-900">Your Account</h1>
                    <p className="text-gray-600 mt-1">Control your profile, security, and preferences</p>

                    {/* Navigation Tabs */}
                    <div className="flex gap-6 mt-6 border-b border-gray-200">
                        <button
                            onClick={() => onNavigate('orders')}
                            className="pb-3 px-1 border-b-2 border-transparent text-gray-600 hover:text-gray-900 flex items-center"
                        >
                            <Package className="inline-block w-5 h-5 mr-2" />
                            Orders
                        </button>
                        <button
                            onClick={() => onNavigate('lists')}
                            className="pb-3 px-1 border-b-2 border-transparent text-gray-600 hover:text-gray-900 flex items-center"
                        >
                            <List className="inline-block w-5 h-5 mr-2" />
                            Lists
                        </button>
                        <button className="pb-3 px-1 border-b-2 border-gray-700 text-gray-700 font-medium flex items-center">
                            <User className="inline-block w-5 h-5 mr-2" />
                            Account
                        </button>
                    </div>
                </div>
            </div>

            {/* User Info Bar */}
            <div className="bg-gray-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                            {formData.image ? (
                                <img src={formData.image} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-6 h-6" />
                            )}
                        </div>
                        <div>
                            <div className="font-semibold">{formData.name || 'User'}</div>
                            <div className="text-sm text-gray-300">{formData.email}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <nav className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${activeTab === 'personal' ? 'bg-gray-100 text-gray-800 border-l-4 border-gray-700' : 'text-gray-700'
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
                                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-100 ${activeTab === 'security' ? 'bg-gray-100 text-gray-800 border-l-4 border-gray-700' : 'text-gray-700'
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
                                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-100 ${activeTab === 'addresses' ? 'bg-gray-100 text-gray-800 border-l-4 border-gray-700' : 'text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5" />
                                    <span className="font-medium">My Addresses</span>
                                </div>
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => setActiveTab('professional')}
                                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-100 ${activeTab === 'professional' ? 'bg-gray-100 text-gray-800 border-l-4 border-gray-700' : 'text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5" />
                                    <span className="font-medium">Professional Profile</span>
                                </div>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Profile Completion */}
                        <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg shadow-sm p-6 text-white">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-2">Complete Your Profile</h3>
                                    <p className="text-gray-200 text-sm mb-4">
                                        Completing your profile items unlocks premium discounts and faster checkout experiences.
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                                            <div className="bg-white h-full rounded-full" style={{ width: '65%' }}></div>
                                        </div>
                                        <span className="font-semibold text-lg">65%</span>
                                    </div>
                                    <p className="text-sm text-gray-200 mt-2">Completed</p>
                                </div>
                            </div>
                        </div>

                        {/* Message Alert */}
                        {message && (
                            <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        {/* Profile Details */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="border-b border-gray-200 pb-4 mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Profile Details</h2>
                                <p className="text-gray-600 text-sm mt-1">Update your public information and avatar</p>
                            </div>

                            <div className="space-y-6">
                                {/* Avatar Upload */}
                                <div className="flex flex-col items-center mb-8">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                                            {formData.image ? (
                                                <img
                                                    src={formData.image}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                                    <User className="w-16 h-16 text-gray-500" />
                                                </div>
                                            )}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <label
                                            htmlFor="avatar-upload"
                                            className="absolute bottom-0 right-0 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors shadow-lg border-2 border-white"
                                        >
                                            <Camera className="w-5 h-5 text-white" />
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-3">Click the camera icon to upload your avatar</p>
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                {/* Account Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Email
                                    </label>
                                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="flex-1 bg-transparent outline-none text-gray-600"
                                        />
                                    </div>
                                </div>

                                {/* Phone Connectivity */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Connectivity
                                    </label>
                                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-gray-500 focus-within:border-gray-500">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="flex-1 outline-none"
                                            placeholder="+20 123 456 7890"
                                        />
                                    </div>
                                </div>

                                {/* Delivery Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Delivery Location
                                    </label>
                                    <div className="space-y-3">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleDetectLocation}
                                                disabled={detecting}
                                                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
                                            >
                                                {detecting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <MapPin className="w-4 h-4" />
                                                )}
                                                Auto-Detect Address
                                            </button>
                                        </div>

                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none resize-none"
                                            rows={3}
                                            placeholder="Detect your address using the button..."
                                        />

                                        {/* Map */}
                                        <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 h-64 flex flex-col items-center justify-center overflow-hidden">
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
                                                <div className="text-center">
                                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <MapPin className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium">Map Unavailable</p>
                                                    <p className="text-sm text-gray-400 mt-1">Click detect location to see your address on the map</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
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
