import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle, Loader2, CheckCircle2, Mail } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

interface SignInFormProps {
    onSuccess?: () => void;
    onSwitchToSignUp?: () => void;
}

export function SignInForm({ onSuccess, onSwitchToSignUp }: SignInFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            setVerified(true);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to sign in');
            }

            login(data.token, data.user);

            if (onSuccess) {
                onSuccess();
            } else {
                // Check if user was redirected from checkout
                const checkoutRedirect = localStorage.getItem('checkout_redirect');
                if (checkoutRedirect === 'true') {
                    localStorage.removeItem('checkout_redirect');
                    navigate('/checkout');
                } else if (data.user.role === 'ADMIN') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-[#0F1111]">
                    Welcome Back
                </h2>
                <p className="mt-1 text-sm text-[#565959]">
                    Sign in to your account
                </p>
            </div>

            {verified && (
                <div className="rounded-lg bg-green-50 p-3 border border-green-200 mb-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <p className="text-sm text-green-800">Email verified! You can now sign in.</p>
                    </div>
                </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                    <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                        <div className="flex items-start gap-2">
                            {error.includes('verify') ? (
                                <Mail className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            )}
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <div>
                        <Label htmlFor="email" className="text-sm font-medium text-[#0F1111]">
                            Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 h-10 rounded-lg border-gray-300 focus:border-[#FFD814] focus:ring-[#FFD814] transition-colors"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium text-[#0F1111]">
                                Password <span className="text-red-500">*</span>
                            </Label>
                            <Link to="/forgot-password" onClick={onSuccess} className="text-xs font-medium text-[#007185] hover:text-[#C7511F] hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 h-10 rounded-lg border-gray-300 focus:border-[#FFD814] focus:ring-[#FFD814] transition-colors"
                            placeholder="••••••••"
                        />
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
                            Signing in...
                        </>
                    ) : (
                        'Sign in'
                    )}
                </Button>

                <div className="text-center pt-2">
                    <p className="text-sm text-[#565959]">
                        New customer?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToSignUp}
                            className="font-medium text-[#007185] hover:text-[#C7511F] bg-transparent border-none p-0 hover:underline cursor-pointer"
                        >
                            Create account
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
}
