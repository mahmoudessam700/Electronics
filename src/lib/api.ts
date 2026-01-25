export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number | null;
    rating: number;
    reviewCount: number;
    image: string;
    isPrime: boolean;
    deliveryDate: string;
    category?: string | null;
    description?: string | null;
    inStock: boolean;
}

export interface OrderItem {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: Product;
}

export interface Order {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    customerName?: string | null;
    customerEmail?: string | null;
    customerPhone?: string | null;
    shippingAddress?: string | null;
    createdAt: string;
    items: OrderItem[];
}

const API_BASE = '/api';

export async function getProducts(options?: {
    category?: string;
    search?: string;
    limit?: number;
}): Promise<Product[]> {
    const params = new URLSearchParams();
    if (options?.category) params.set('category', options.category);
    if (options?.search) params.set('search', options.search);
    if (options?.limit) params.set('limit', options.limit.toString());

    const queryString = params.toString();
    const url = `${API_BASE}/products${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    return response.json();
}

export async function getProduct(id: string): Promise<Product> {
    const response = await fetch(`${API_BASE}/products/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch product');
    }
    return response.json();
}

export async function createOrder(data: {
    items: Array<{ productId: string; quantity: number; price: number }>;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    shippingAddress?: string;
}): Promise<Order> {
    const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to create order');
    }
    return response.json();
}

export async function getOrders(): Promise<Order[]> {
    const response = await fetch(`${API_BASE}/orders`);
    if (!response.ok) {
        throw new Error('Failed to fetch orders');
    }
    return response.json();
}

export interface UploadResult {
    filename: string;
    url: string;
    originalName: string;
}

export interface UploadResponse {
    success: boolean;
    files: UploadResult[];
}

export async function uploadFile(
    file: File,
    onProgress?: (progress: number) => void
): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(error.error || 'Failed to upload file');
    }

    const result: UploadResponse = await response.json();

    if (!result.success || !result.files.length) {
        throw new Error('Upload failed');
    }

    return result.files[0];
}

export async function uploadFiles(
    files: File[],
    onProgress?: (progress: number, currentFile: number, totalFiles: number) => void
): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
        const result = await uploadFile(files[i]);
        results.push(result);
        onProgress?.((i + 1) / files.length * 100, i + 1, files.length);
    }

    return results;
}
