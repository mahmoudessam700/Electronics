import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../ui/button';

export function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || searchParams.get('t');
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email…');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Verification token missing.');
                return;
            }
            try {
                const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
                if (res.redirected) {
                    window.location.href = res.url;
                    return;
                }
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Invalid verification token');
                }
                setStatus('success');
                setMessage('Email verified! Redirecting you to sign in…');
                setTimeout(() => navigate('/sign-in?verified=true'), 1500);
            } catch (error) {
                setStatus('error');
                setMessage(error instanceof Error ? error.message : 'Verification failed');
            }
        };
        verify();
    }, [navigate, token]);

    return (
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
            {status === 'loading' && <Loader2 className="h-10 w-10 text-amber-500 mx-auto animate-spin" />}
            {status === 'success' && <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />}
            {status === 'error' && <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />}
            <h1 className="text-2xl font-semibold text-slate-900">Email Verification</h1>
            <p className="text-slate-600 text-sm">{message}</p>
            {status === 'error' && (
                <Button onClick={() => navigate('/sign-in')} variant="outline">
                    Back to sign in
                </Button>
            )}
        </div>
    );
}
