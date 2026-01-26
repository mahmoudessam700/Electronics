import { SignUpForm } from './SignUpForm';

export function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <SignUpForm />
            </div>
        </div>
    );
}
