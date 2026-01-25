import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '../ui/dialog';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface AuthModalProps {
    children?: React.ReactNode;
    defaultView?: 'signin' | 'signup';
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AuthModal({ children, defaultView = 'signin', isOpen, onOpenChange }: AuthModalProps) {
    const [view, setView] = useState<'signin' | 'signup'>(defaultView);
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = isOpen !== undefined;
    const open = isControlled ? isOpen : internalOpen;
    const setOpen = isControlled ? onOpenChange! : setInternalOpen;

    const handleSwitchToSignUp = () => setView('signup');
    const handleSwitchToSignIn = () => setView('signin');

    const handleSuccess = () => {
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                setTimeout(() => setView(defaultView), 200);
            }
        }}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent
                className="sm:max-w-[360px] bg-white text-[#0F1111] p-0 overflow-hidden rounded-xl shadow-2xl border-0"
                style={{
                    background: 'linear-gradient(180deg, #f7f8fa 0%, #ffffff 100%)',
                }}
            >
                <VisuallyHidden>
                    <DialogTitle>{view === 'signin' ? 'Sign In' : 'Create Account'}</DialogTitle>
                    <DialogDescription>
                        {view === 'signin' ? 'Sign in to your account' : 'Create a new account'}
                    </DialogDescription>
                </VisuallyHidden>

                {/* Modern Header Accent */}
                <div
                    className="h-1.5 w-full"
                    style={{
                        background: 'linear-gradient(90deg, #FFD814 0%, #F7CA00 50%, #ff9900 100%)',
                    }}
                />

                <div className="p-6 max-h-[85vh] overflow-y-auto">
                    {view === 'signin' ? (
                        <SignInForm onSuccess={handleSuccess} onSwitchToSignUp={handleSwitchToSignUp} />
                    ) : (
                        <SignUpForm onSuccess={handleSuccess} onSwitchToSignIn={handleSwitchToSignIn} />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
