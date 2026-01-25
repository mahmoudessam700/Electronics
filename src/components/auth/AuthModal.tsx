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
    // If controlled, use props, else local state (though mostly uncontrolled trigger via children)
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
                // Reset view to default when closing, with a slight delay
                setTimeout(() => setView(defaultView), 200);
            }
        }}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px] bg-white text-[#0F1111] p-0 overflow-hidden">
                <VisuallyHidden>
                    <DialogTitle>{view === 'signin' ? 'Sign In' : 'Create Account'}</DialogTitle>
                    <DialogDescription>
                        {view === 'signin' ? 'Sign in to your account' : 'Create a new account'}
                    </DialogDescription>
                </VisuallyHidden>

                <div className="p-8 max-h-[90vh] overflow-y-auto">
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
