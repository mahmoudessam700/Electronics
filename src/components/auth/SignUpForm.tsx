import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface SignUpFormProps {
    onSuccess?: () => void;
    onSwitchToSignIn?: () => void;
}

export function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

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
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to sign up');
            }

            login(data.token, data.user);

            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-[#0F1111]">
                    Create account
                </h2>
                <p className="mt-2 text-sm text-[#565959]">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToSignIn}
                        className="font-medium text-[#007185] hover:text-[#C7511F] bg-transparent border-none p-0 underline cursor-pointer"
                    >
                        Sign in
                    </button>
                    {!onSwitchToSignIn && (
                        <Link
                            to="/login"
                            className="font-medium text-[#007185] hover:text-[#C7511F]"
                        >
                            Sign in
                        </Link>
                    )}
                </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="rounded-md bg-red-50 p-4 border border-red-200">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Your name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1"
                            placeholder="First and last name"
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
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
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1"
                            placeholder="At least 6 characters"
                            minLength={6}
                        />
                        <p className="text-xs text-[#565959] mt-1">
                            Passwords must be at least 6 characters.
                        </p>
                    </div>
                </div>

                <div>
                    <Button
                        type="submit"
                        className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111]"
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
                </div>

                <div className="text-xs text-[#565959] mt-4">
                    By creating an account, you agree to our Conditions of Use and Privacy Notice.
                </div>
            </form>
        </div>
    );
}
