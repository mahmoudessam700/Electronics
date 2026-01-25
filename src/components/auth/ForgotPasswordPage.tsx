import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage('If an account exists with that email, we have sent a password reset link.');
            } else {
                throw new Error(data.error || 'Something went wrong');
            }
        } catch (err) {
            setStatus('error');
            setMessage(err instanceof Error ? err.message : 'Failed to send reset email');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-[#0F1111]">
                        Password assistance
                    </h2>
                    <p className="mt-2 text-sm text-[#565959]">
                        Enter the email address associated with your account.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="rounded-md bg-green-50 p-4 border border-green-200">
                        <div className="flex">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">Check your email</h3>
                                <div className="mt-2 text-sm text-green-700">
                                    <p>{message}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {status === 'error' && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                <div className="flex">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">{message}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111]"
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Continue'
                                )}
                            </Button>
                        </div>
                    </form>
                )}

                <div className="text-center">
                    <Link to="/login" className="flex items-center justify-center text-sm font-medium text-[#007185] hover:text-[#C7511F]">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
