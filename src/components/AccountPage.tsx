import { useState, useEffect, useRef } from 'react';
import { User, MapPin, Mail, Phone, Package, List, Camera, Loader2, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AccountPageProps {
    onNavigate: (page: string) => void;
}

export function AccountPage({ onNavigate }: AccountPageProps) {
    const { user, token } = useAuth();
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
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
            }}>
                <Loader2 style={{ width: 40, height: 40, animation: 'spin 1s linear infinite', color: '#374151' }} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            {/* Header */}
            <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 0' }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#000000', margin: 0 }}>Your Account</h1>
                    <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Control your profile, security, and preferences</p>

                    {/* Navigation Tabs */}
                    <div style={{ display: 'flex', gap: 24, marginTop: 24, borderBottom: '1px solid #e5e7eb' }}>
                        <button
                            onClick={() => onNavigate('orders')}
                            style={{
                                padding: '12px 4px',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}
                        >
                            <Package style={{ width: 16, height: 16 }} />
                            Orders
                        </button>
                        <button
                            onClick={() => onNavigate('lists')}
                            style={{
                                padding: '12px 4px',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}
                        >
                            <List style={{ width: 16, height: 16 }} />
                            Lists
                        </button>
                        <button
                            style={{
                                padding: '12px 4px',
                                border: 'none',
                                borderBottom: '2px solid #000000',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#000000',
                                marginBottom: -1
                            }}
                        >
                            A
                        </button>
                    </div>
                </div>
            </div>

            {/* User Info Bar - Dark Navy */}
            <div style={{ backgroundColor: '#374151' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        backgroundColor: '#4b5563',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        {formData.image ? (
                            <img src={formData.image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User style={{ width: 20, height: 20, color: '#ffffff' }} />
                        )}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: '#ffffff', fontSize: 14 }}>{formData.name || 'Admin'}</div>
                        <div style={{ fontSize: 13, color: '#9ca3af' }}>{formData.email}</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    {/* Main Content Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Complete Your Profile - Dark Card */}
                        <div style={{
                            backgroundColor: '#374151',
                            borderRadius: 12,
                            padding: 24,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <h3 style={{ fontWeight: 600, fontSize: 18, color: '#ffffff', margin: 0, marginBottom: 8 }}>Complete Your Profile</h3>
                            <p style={{ fontSize: 14, color: '#9ca3af', margin: 0, marginBottom: 20 }}>
                                Completing your profile items unlocks premium discounts and faster checkout experiences.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ flex: 1, backgroundColor: '#4b5563', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                                    <div style={{ backgroundColor: '#ffffff', height: '100%', width: '65%', borderRadius: 999 }}></div>
                                </div>
                                <span style={{ fontWeight: 700, fontSize: 18, color: '#ffffff' }}>65%</span>
                            </div>
                            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0, marginTop: 8 }}>Completed</p>
                        </div>

                        {/* Message Alert */}
                        {message && (
                            <div style={{
                                padding: 16,
                                borderRadius: 12,
                                fontWeight: 500,
                                fontSize: 14,
                                backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                                color: message.type === 'success' ? '#065f46' : '#991b1b',
                                border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                            }}>
                                {message.text}
                            </div>
                        )}

                        {/* Profile Details */}
                        <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 16, marginBottom: 24 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#000000', margin: 0 }}>Profile Details</h2>
                                <p style={{ fontSize: 14, color: '#6b7280', margin: 0, marginTop: 4 }}>Update your public information and avatar</p>
                            </div>

                            {/* Avatar Upload */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, paddingBottom: 32 }}>
                                <div
                                    style={{ position: 'relative', cursor: 'pointer' }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div style={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: '50%',
                                        backgroundColor: '#e5e7eb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {formData.image ? (
                                            <img src={formData.image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <User style={{ width: 48, height: 48, color: '#9ca3af' }} />
                                        )}
                                        {uploading && (
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '50%'
                                            }}>
                                                <Loader2 style={{ width: 32, height: 32, color: '#ffffff', animation: 'spin 1s linear infinite' }} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Camera Button */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        width: 32,
                                        height: 32,
                                        backgroundColor: '#374151',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid #ffffff',
                                        cursor: 'pointer'
                                    }}>
                                        <Camera style={{ width: 14, height: 14, color: '#ffffff' }} />
                                    </div>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        style={{ display: 'none' }}
                                        ref={fileInputRef}
                                    />
                                </div>

                                <p style={{ fontSize: 14, color: '#6b7280', marginTop: 16, marginBottom: 0 }}>Click the camera icon to upload your avatar</p>
                            </div>

                            {/* Form Fields */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {/* Full Name */}
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#000000', marginBottom: 8 }}>
                                        Full Name
                                    </label>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '12px 16px',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 8
                                    }}>
                                        <User style={{ width: 20, height: 20, color: '#9ca3af' }} />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter your full name"
                                            style={{
                                                flex: 1,
                                                border: 'none',
                                                outline: 'none',
                                                fontSize: 14,
                                                color: '#000000',
                                                backgroundColor: 'transparent'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Account Email */}
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#000000', marginBottom: 8 }}>
                                        Account Email
                                    </label>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '12px 16px',
                                        backgroundColor: '#f9fafb',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 8
                                    }}>
                                        <Mail style={{ width: 20, height: 20, color: '#9ca3af' }} />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            style={{
                                                flex: 1,
                                                border: 'none',
                                                outline: 'none',
                                                fontSize: 14,
                                                color: '#6b7280',
                                                backgroundColor: 'transparent'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#000000', marginBottom: 8 }}>
                                        Phone Connectivity
                                    </label>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '12px 16px',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 8
                                    }}>
                                        <Phone style={{ width: 20, height: 20, color: '#9ca3af' }} />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+20 123 456 7890"
                                            style={{
                                                flex: 1,
                                                border: 'none',
                                                outline: 'none',
                                                fontSize: 14,
                                                color: '#000000',
                                                backgroundColor: 'transparent'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Delivery Location */}
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#000000', marginBottom: 8 }}>
                                        Delivery Location
                                    </label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <button
                                            onClick={handleDetectLocation}
                                            disabled={detecting}
                                            style={{
                                                padding: '10px 16px',
                                                backgroundColor: '#374151',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: 8,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                fontWeight: 500,
                                                fontSize: 14,
                                                width: 'fit-content',
                                                opacity: detecting ? 0.5 : 1
                                            }}
                                        >
                                            {detecting ? (
                                                <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                                            ) : (
                                                <MapPin style={{ width: 16, height: 16 }} />
                                            )}
                                            Auto-Detect Address
                                        </button>

                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Detect your address using the button..."
                                            rows={3}
                                            style={{
                                                padding: 16,
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: 8,
                                                resize: 'none',
                                                outline: 'none',
                                                fontSize: 14,
                                                color: '#000000',
                                                fontFamily: 'inherit'
                                            }}
                                        />

                                        {/* Map Placeholder */}
                                        <div style={{
                                            backgroundColor: '#f9fafb',
                                            borderRadius: 12,
                                            border: '2px dashed #e5e7eb',
                                            height: 240,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}>
                                            {formData.latitude && formData.longitude ? (
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    frameBorder="0"
                                                    scrolling="no"
                                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${formData.longitude - 0.005}%2C${formData.latitude - 0.005}%2C${formData.longitude + 0.005}%2C${formData.latitude + 0.005}&layer=mapnik&marker=${formData.latitude}%2C${formData.longitude}`}
                                                    style={{ border: 0, borderRadius: 10 }}
                                                />
                                            ) : (
                                                <div style={{ textAlign: 'center', padding: 24 }}>
                                                    <div style={{
                                                        width: 56,
                                                        height: 56,
                                                        backgroundColor: '#e5e7eb',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        margin: '0 auto 12px'
                                                    }}>
                                                        <MapPin style={{ width: 28, height: 28, color: '#9ca3af' }} />
                                                    </div>
                                                    <p style={{ fontWeight: 500, color: '#6b7280', margin: 0 }}>Map Unavailable</p>
                                                    <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>Click detect location to see your address on the map</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div style={{ paddingTop: 16 }}>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        style={{
                                            padding: '12px 24px',
                                            backgroundColor: '#374151',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: 8,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            fontWeight: 500,
                                            fontSize: 14,
                                            opacity: saving ? 0.5 : 1
                                        }}
                                    >
                                        {saving ? (
                                            <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                                        ) : (
                                            <Save style={{ width: 16, height: 16 }} />
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
