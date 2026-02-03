import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../components/ProductCard';

type UserRole = 'ADMIN' | 'CUSTOMER' | 'SHOP_OWNER' | 'SHOP_STAFF';

interface ShopSummary {
    id: string;
    name: string;
    slug?: string;
    status?: string;
    defaultCommissionRate?: number;
}

type ShopMemberRole = 'OWNER' | 'MANAGER' | 'STAFF' | 'FINANCE';

interface ShopMembership {
    id: string;
    shopId: string;
    role: ShopMemberRole;
    createdAt?: string;
    updatedAt?: string;
    shop?: ShopSummary;
}

interface User {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
    shopMemberships?: ShopMembership[];
}

export interface CartItem {
    product: Product;
    quantity: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAdmin: boolean;
    isShopUser: boolean;
    token: string | null;
    shopMemberships: ShopMembership[];
    activeShopId: string | null;
    activeShop: ShopSummary | null;
    selectActiveShop: (shopId: string) => void;
    hasShopRole: (roles: ShopMemberRole | ShopMemberRole[]) => boolean;
    // Cart functionality
    cartItems: CartItem[];
    cartLoading: boolean;
    addToCart: (product: Product, quantity: number) => Promise<void>;
    updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    syncCartFromLocal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
    const [activeShopId, setActiveShopId] = useState<string | null>(localStorage.getItem('active_shop_id'));
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartLoading, setCartLoading] = useState(false);
    const memberships = user?.shopMemberships || [];

    // Load cart from localStorage for guests
    const loadLocalCart = useCallback(() => {
        try {
            const localCart = localStorage.getItem('guest_cart');
            if (localCart) {
                setCartItems(JSON.parse(localCart));
            }
        } catch (e) {
            console.error('Failed to load local cart:', e);
        }
    }, []);

    // Save cart to localStorage for guests
    const saveLocalCart = useCallback((items: CartItem[]) => {
        try {
            localStorage.setItem('guest_cart', JSON.stringify(items));
        } catch (e) {
            console.error('Failed to save local cart:', e);
        }
    }, []);

    // Fetch cart from database for logged-in users
    const fetchCart = useCallback(async (authToken: string) => {
        try {
            setCartLoading(true);
            const res = await fetch('/api/cart', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCartItems(data);
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setCartLoading(false);
        }
    }, []);

    // Sync local cart to database when user logs in
    const syncCartFromLocal = useCallback(async () => {
        const localCart = localStorage.getItem('guest_cart');
        const authToken = localStorage.getItem('auth_token');
        
        if (!localCart || !authToken) return;
        
        try {
            const items: CartItem[] = JSON.parse(localCart);
            for (const item of items) {
                await fetch('/api/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ productId: item.product.id, quantity: item.quantity })
                });
            }
            // Clear local cart after sync
            localStorage.removeItem('guest_cart');
            // Refresh cart from database
            await fetchCart(authToken);
        } catch (error) {
            console.error('Failed to sync cart:', error);
        }
    }, [fetchCart]);

    const ensureActiveShopSelection = useCallback((shopList: ShopMembership[]) => {
        if (!shopList || shopList.length === 0) {
            setActiveShopId(null);
            localStorage.removeItem('active_shop_id');
            return;
        }

        const stored = localStorage.getItem('active_shop_id');
        const storedExists = stored && shopList.some((membership) => membership.shopId === stored);
        const nextShopId = storedExists ? stored! : shopList[0].shopId;

        setActiveShopId(nextShopId);
        localStorage.setItem('active_shop_id', nextShopId);
    }, []);

    useEffect(() => {
        checkUser();
    }, []);

    // Load cart based on auth state
    useEffect(() => {
        if (!loading) {
            if (user && token) {
                fetchCart(token);
            } else {
                loadLocalCart();
            }
        }
    }, [user, token, loading, fetchCart, loadLocalCart]);

    useEffect(() => {
        if (memberships.length > 0) {
            ensureActiveShopSelection(memberships);
        } else {
            setActiveShopId(null);
            localStorage.removeItem('active_shop_id');
        }
    }, [memberships, ensureActiveShopSelection]);

    async function checkUser() {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setLoading(false);
                return;
            }

            const res = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                localStorage.removeItem('auth_token');
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    const login = (token: string, userData: User) => {
        localStorage.setItem('auth_token', token);
        setToken(token);
        setUser(userData);
        if (userData.shopMemberships?.length) {
            ensureActiveShopSelection(userData.shopMemberships);
        } else {
            setActiveShopId(null);
            localStorage.removeItem('active_shop_id');
        }
        // Sync local cart to database after login
        setTimeout(() => syncCartFromLocal(), 100);
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('active_shop_id');
        setToken(null);
        setUser(null);
        setCartItems([]);
        setActiveShopId(null);
        navigate('/');
    };

    const selectActiveShop = useCallback((shopId: string) => {
        if (!shopId) return;
        if (!memberships.some((membership) => membership.shopId === shopId)) {
            return;
        }
        setActiveShopId(shopId);
        localStorage.setItem('active_shop_id', shopId);
    }, [memberships]);

    const hasShopRole = useCallback((roles: ShopMemberRole | ShopMemberRole[]) => {
        const roleList = Array.isArray(roles) ? roles : [roles];
        return memberships.some((membership) => roleList.includes(membership.role));
    }, [memberships]);

    // Cart operations
    const addToCart = async (product: Product, quantity: number) => {
        if (user && token) {
            // Logged in - use API
            try {
                await fetch('/api/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ productId: product.id, quantity })
                });
                await fetchCart(token);
            } catch (error) {
                console.error('Failed to add to cart:', error);
            }
        } else {
            // Guest - use localStorage
            setCartItems(prev => {
                const existing = prev.find(item => item.product.id === product.id);
                let newItems: CartItem[];
                if (existing) {
                    newItems = prev.map(item =>
                        item.product.id === product.id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                } else {
                    newItems = [...prev, { product, quantity }];
                }
                saveLocalCart(newItems);
                return newItems;
            });
        }
    };

    const updateCartQuantity = async (productId: string, quantity: number) => {
        if (user && token) {
            try {
                await fetch('/api/cart', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ productId, quantity })
                });
                await fetchCart(token);
            } catch (error) {
                console.error('Failed to update cart:', error);
            }
        } else {
            setCartItems(prev => {
                const newItems = prev.map(item =>
                    item.product.id === productId
                        ? { ...item, quantity }
                        : item
                );
                saveLocalCart(newItems);
                return newItems;
            });
        }
    };

    const removeFromCart = async (productId: string) => {
        if (user && token) {
            try {
                await fetch(`/api/cart?productId=${productId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                await fetchCart(token);
            } catch (error) {
                console.error('Failed to remove from cart:', error);
            }
        } else {
            setCartItems(prev => {
                const newItems = prev.filter(item => item.product.id !== productId);
                saveLocalCart(newItems);
                return newItems;
            });
        }
    };

    const clearCart = async () => {
        if (user && token) {
            try {
                await fetch('/api/cart?clearAll=true', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCartItems([]);
            } catch (error) {
                console.error('Failed to clear cart:', error);
            }
        } else {
            setCartItems([]);
            localStorage.removeItem('guest_cart');
        }
    };

    const activeShop = memberships.find((membership) => membership.shopId === activeShopId)?.shop || null;
    const isAdmin = user?.role === 'ADMIN';
    const isShopRole = user?.role === 'SHOP_OWNER' || user?.role === 'SHOP_STAFF';

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            isAdmin: Boolean(isAdmin),
            isShopUser: Boolean(isShopRole || memberships.length > 0),
            token,
            shopMemberships: memberships,
            activeShopId,
            activeShop,
            selectActiveShop,
            hasShopRole,
            cartItems,
            cartLoading,
            addToCart,
            updateCartQuantity,
            removeFromCart,
            clearCart,
            syncCartFromLocal
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
