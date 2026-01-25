import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle, Loader2, CheckCircle2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SignUpFormProps {
    onSuccess?: () => void;
    onSwitchToSignIn?: () => void;
}

export function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

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
                body: JSON.stringify({ name, email, phone, password }),
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
            <div className="text-center mb-5">
                <h2 className="text-xl font-bold text-[#0F1111]">
                    Create Account
                </h2>
                <p className="mt-1 text-sm text-[#565959]">
                    Join us today
                </p>
            </div>

            <form className="space-y-3" onSubmit={handleSubmit}>
                {error && (
                    <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
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
                            className="mt-1 h-10 rounded-lg border-gray-300 focus:border-[#FFD814] focus:ring-[#FFD814] transition-colors"
                            placeholder="John Doe"
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
                            className="mt-1 h-10 rounded-lg border-gray-300 focus:border-[#FFD814] focus:ring-[#FFD814] transition-colors"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div>
                        <Label htmlFor="phone" className="text-sm font-medium text-[#0F1111]">
                            Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1 h-10 rounded-lg border-gray-300 focus:border-[#FFD814] focus:ring-[#FFD814] transition-colors"
                            placeholder="+20 123 456 7890"
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
                            className="mt-1 h-10 rounded-lg border-gray-300 focus:border-[#FFD814] focus:ring-[#FFD814] transition-colors"
                            placeholder="At least 6 characters"
                            minLength={6}
                        />
                        <p className="text-xs text-[#888] mt-1">
                            Minimum 6 characters
                        </p>
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

                <p className="text-xs text-[#565959] text-center pt-1">
                    By creating an account, you agree to our Terms and Privacy Policy.
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
        </div>
    );
}
