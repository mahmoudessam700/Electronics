import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

export interface ShopProductFormValues {
    name: string;
    price: string;
    image: string;
    description: string;
    inStock: boolean;
    commissionRate: string;
}

interface ShopProductFormModalProps {
    open: boolean;
    mode: 'create' | 'edit';
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: ShopProductFormValues) => Promise<void>;
    initialValues?: Partial<ShopProductFormValues>;
    loading?: boolean;
}

const defaultValues: ShopProductFormValues = {
    name: '',
    price: '',
    image: '',
    description: '',
    inStock: true,
    commissionRate: '',
};

export function ShopProductFormModal({
    open,
    mode,
    onOpenChange,
    onSubmit,
    initialValues,
    loading = false,
}: ShopProductFormModalProps) {
    const mergedDefaults = useMemo(() => ({
        ...defaultValues,
        ...initialValues,
    }), [initialValues]);

    const [formValues, setFormValues] = useState<ShopProductFormValues>(mergedDefaults);

    useEffect(() => {
        setFormValues(mergedDefaults);
    }, [mergedDefaults, open]);

    const handleChange = (field: keyof ShopProductFormValues, value: string | boolean) => {
        setFormValues((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        await onSubmit(formValues);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Add Product' : 'Edit Product'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create' ? 'Create a new product for your shop' : 'Update product details'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="product-name">Product Name *</Label>
                        <Input
                            id="product-name"
                            value={formValues.name}
                            onChange={(event) => handleChange('name', event.target.value)}
                            required
                            placeholder="e.g., Wireless Mouse"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="product-price">Base Price (E£) *</Label>
                        <Input
                            id="product-price"
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            value={formValues.price}
                            onChange={(event) => handleChange('price', event.target.value)}
                            required
                            placeholder="0.00"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="commission">Commission Override (%)</Label>
                        <Input
                            id="commission"
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            value={formValues.commissionRate}
                            onChange={(event) => handleChange('commissionRate', event.target.value)}
                            placeholder="Leave blank to use shop default"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="product-image">Image URL *</Label>
                        <Input
                            id="product-image"
                            value={formValues.image}
                            onChange={(event) => handleChange('image', event.target.value)}
                            required
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="product-description">Description</Label>
                        <textarea
                            id="product-description"
                            className="w-full min-h-[120px] rounded-lg border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
                            value={formValues.description}
                            onChange={(event) => handleChange('description', event.target.value)}
                            placeholder="Add product details, specifications, or selling points"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                        <div>
                            <p className="text-sm font-medium text-slate-900">In Stock</p>
                            <p className="text-xs text-slate-500">Toggle visibility in the storefront</p>
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                            <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={formValues.inStock}
                                onChange={(event) => handleChange('inStock', event.target.checked)}
                            />
                            {formValues.inStock ? 'Available' : 'Hidden'}
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : mode === 'create' ? 'Add Product' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
