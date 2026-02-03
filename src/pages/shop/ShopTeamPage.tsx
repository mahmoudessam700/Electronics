import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { 
    Users, 
    UserPlus, 
    Mail, 
    Shield, 
    Trash2, 
    X, 
    Loader2, 
    CheckCircle2, 
    Clock,
    UserCheck,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface Member {
    id: string;
    role: string;
    status: string;
    user: {
        name: string;
        email: string;
        image: string | null;
    };
}

interface Invitation {
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
}

export function ShopTeamPage() {
    const { user, token, activeShopId } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('STAFF');
    const [isInviting, setIsInviting] = useState(false);

    useEffect(() => {
        if (activeShopId && token) {
            fetchTeam();
        }
    }, [activeShopId, token]);

    const fetchTeam = async () => {
        try {
            const res = await fetch(`/api/shops?action=members&shopId=${activeShopId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setMembers(data.members || []);
                setInvitations(data.invitations || []);
            }
        } catch (error) {
            console.error('Failed to fetch team', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        try {
            const res = await fetch('/api/shops?action=members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shopId: activeShopId,
                    email: inviteEmail,
                    role: inviteRole
                })
            });

            if (res.ok) {
                toast.success('Invitation sent successfully');
                setShowInviteModal(false);
                setInviteEmail('');
                fetchTeam();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to send invitation');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;
        try {
            const res = await fetch(`/api/shops?action=members&memberId=${memberId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Member removed');
                fetchTeam();
            }
        } catch (error) {
            toast.error('Failed to remove member');
        }
    };

    const handleRevokeInvite = async (inviteId: string) => {
        try {
            const res = await fetch(`/api/shops?action=members&invitationId=${inviteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Invitation revoked');
                fetchTeam();
            }
        } catch (error) {
            toast.error('Failed to revoke invitation');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Team</h1>
                    <p className="text-slate-500">Add and manage staff members for your shop</p>
                </div>
                <Button 
                    onClick={() => setShowInviteModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                >
                    <UserPlus className="h-4 w-4" />
                    Invite Member
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Members List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Active Members ({members.length})
                    </h2>
                    <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-50">
                        {members.map((member) => (
                            <div key={member.id} className="p-4 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                        {member.user.image ? (
                                            <img src={member.user.image} alt={member.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Users className="h-5 w-5 text-slate-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{member.user.name || 'Unnamed User'}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Mail className="h-3 w-3" />
                                            {member.user.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                        member.role === 'OWNER' ? 'bg-purple-50 text-purple-700' : 
                                        member.role === 'MANAGER' ? 'bg-blue-50 text-blue-700' : 
                                        'bg-slate-50 text-slate-700'
                                    }`}>
                                        {member.role}
                                    </span>
                                    {member.userId !== user?.id && (
                                        <button 
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Invitations List */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Pending Invitations ({invitations.length})
                    </h2>
                    <div className="space-y-3">
                        {invitations.length === 0 ? (
                            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-xs text-slate-400">No pending invitations</p>
                            </div>
                        ) : (
                            invitations.map((invite) => (
                                <div key={invite.id} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-slate-900 truncate pr-2">{invite.email}</span>
                                        <button 
                                            onClick={() => handleRevokeInvite(invite.id)}
                                            className="text-slate-400 hover:text-red-500 p-1"
                                            title="Revoke"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-500">{new Date(invite.createdAt).toLocaleDateString()}</span>
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                                            {invite.role}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
                    <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between font-bold text-slate-900">
                            <h3>Invite Team Member</h3>
                            <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSendInvite} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input 
                                        type="email" 
                                        required
                                        className="w-full h-11 pl-10 pr-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                        placeholder="colleague@example.com"
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Role</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['STAFF', 'MANAGER', 'FINANCE'].map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setInviteRole(role)}
                                            className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                                                inviteRole === role 
                                                ? 'bg-slate-900 text-white border-slate-900' 
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl flex gap-2 border border-slate-100 mt-2">
                                    <Shield className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                        {inviteRole === 'STAFF' && 'Can manage basic store content and view orders.'}
                                        {inviteRole === 'MANAGER' && 'Full access to products, orders, and team settings.'}
                                        {inviteRole === 'FINANCE' && 'Access to payouts and financial reporting.'}
                                    </p>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                disabled={isInviting}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-white font-bold rounded-xl mt-4"
                            >
                                {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Invitation'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
