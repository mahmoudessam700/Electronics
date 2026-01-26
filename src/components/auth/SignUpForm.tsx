import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle, Loader2, Mail, MapPin } from 'lucide-react';

interface SignUpFormProps {
    onSuccess?: () => void;
    onSwitchToSignIn?: () => void;
}

export function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState('');
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [detecting, setDetecting] = useState(false);

    const handleDetectLocation = () => {
        setDetecting(true);
        setError('');

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setDetecting(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude: lat, longitude: lng } = position.coords;
            setLatitude(lat);
            setLongitude(lng);

            try {
                // Reverse geocoding with Nominatim (OSM)
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                const data = await res.json();
                if (data.display_name) {
                    setAddress(data.display_name);
                }
            } catch (err) {
                console.error('Reverse geocoding failed', err);
                // Non-critical error, just keep coordinates
            } finally {
                setDetecting(false);
            }
        }, (err) => {
            console.error('Geolocation error', err);
            setError('Failed to detect your location. Please enter your address manually.');
            setDetecting(false);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, phone, password, address, latitude, longitude }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to sign up');
            }

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="w-full text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-[#0F1111] mb-2">
                    Check your email
                </h2>
                <p className="text-sm text-[#565959] mb-4">
                    We've sent a verification link to <strong>{email}</strong>.
                    Please click the link to verify your account.
                </p>
                <p className="text-xs text-[#888] mb-4">
                    Didn't receive it? Check your spam folder.
                </p>
                <button
                    type="button"
                    onClick={onSwitchToSignIn}
                    className="text-sm font-medium text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer bg-transparent border-none p-0"
                >
                    Back to sign in
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#0F1111]">
                    Create Account
                </h2>
                <p className="mt-1 text-sm text-[#565959]">
                    Join our premium community
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Form Column */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-sm font-medium text-[#0F1111]">
                                Full Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 h-10"
                                placeholder="Mohamed Ahmed"
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone" className="text-sm font-medium text-[#0F1111]">
                                Phone <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="mt-1 h-10"
                                placeholder="+20 123 456 7890"
                            />
                        </div>

                        <div>
                            <Label htmlFor="signup-email" className="text-sm font-medium text-[#0F1111]">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="signup-email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 h-10"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <Label htmlFor="signup-password" className="text-sm font-medium text-[#0F1111]">
                                Password <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="signup-password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 h-10"
                                placeholder="Min. 6 characters"
                                minLength={6}
                            />
                        </div>

                        <div className="relative">
                            <Label htmlFor="address" className="text-sm font-medium text-[#0F1111]">
                                Delivery Address <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    id="address"
                                    type="text"
                                    required
                                    readOnly
                                    value={address}
                                    className="h-10 flex-1 bg-gray-50 cursor-not-allowed"
                                    placeholder="Click the pin to detect your address"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 shrink-0"
                                    onClick={handleDetectLocation}
                                    title="Auto-detect location"
                                    disabled={detecting}
                                >
                                    {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 rounded-lg font-semibold text-[#0F1111] transition-all duration-200 shadow-sm hover:shadow-md"
                        style={{
                            background: 'linear-gradient(180deg, #FFD814 0%, #F7CA00 100%)',
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            'Create account'
                        )}
                    </Button>

                    <p className="text-xs text-[#565959] text-center">
                        By signing up, you agree to our Terms and Privacy Policy.
                    </p>

                    <div className="text-center pt-2">
                        <p className="text-sm text-[#565959]">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={onSwitchToSignIn}
                                className="font-medium text-[#007185] hover:text-[#C7511F] bg-transparent border-none p-0 hover:underline cursor-pointer"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </form>

                {/* Map Column */}
                <div className="h-full min-h-[400px] border rounded-lg bg-gray-50 overflow-hidden relative group">
                    {latitude && longitude ? (
                        <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight={0}
                            marginWidth={0}
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.005}%2C${latitude - 0.005}%2C${longitude + 0.005}%2C${latitude + 0.005}&layer=mapnik&marker=${latitude}%2C${longitude}`}
                            style={{ border: 0 }}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gray-100 italic text-gray-400">
                            <MapPin className="h-12 w-12 mb-4 opacity-20" />
                            <p>Click the location icon to detect your position or enter an address to see it on the map.</p>
                        </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        LIVE MAP PREVIEW
                    </div>
                </div>
            </div>
        </div>
    );
}
