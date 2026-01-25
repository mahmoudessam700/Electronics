import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage('Your password has been reset successfully.');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                throw new Error(data.error || 'Something went wrong');
            }
        } catch (err) {
            setStatus('error');
            setMessage(err instanceof Error ? err.message : 'Failed to reset password');
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                    <h2 className="mt-6 text-3xl font-extrabold text-[#0F1111]">Invalid Link</h2>
                    <p className="mt-2 text-sm text-[#565959]">This password reset link is invalid or missing the token.</p>
                    <Link to="/forgot-password" className="text-[#007185] hover:underline">Request a new link</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-[#0F1111]">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-sm text-[#565959]">
                        Enter your new password below.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="rounded-md bg-green-50 p-4 border border-green-200">
                        <div className="flex">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">Success!</h3>
                                <div className="mt-2 text-sm text-green-700">
                                    <p>{message}</p>
                                    <p>Redirecting to login...</p>
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

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1"
                                    placeholder="At least 6 characters"
                                />
                            </div>
                            <div>
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
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
                                        Resetting...
                                    </>
                                ) : (
                                    'Save new password'
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
