import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { useLanguage } from '../../contexts/LanguageContext';

export interface ShopProductFormValues {
    name: string;
    price: string;
    image: string;
    description: string;
    inStock: boolean;
    commissionRate: string;
    tracksInventory: boolean;
    inventoryQuantity: string;
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
    tracksInventory: false,
    inventoryQuantity: '0',
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
    const { t } = useLanguage();

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
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? t('admin.addProduct') : t('admin.editProduct')}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create' ? t('sell.createInMinutes') : t('admin.editProduct')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="product-name">{t('admin.productName')} *</Label>
                            <Input
                                id="product-name"
                                value={formValues.name}
                                onChange={(event) => handleChange('name', event.target.value)}
                                required
                                placeholder="e.g., Wireless Mouse"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product-price">{t('product.price')} (E£) *</Label>
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
                            <Label htmlFor="commission">{t('sell.perItemSold')} (%)</Label>
                            <Input
                                id="commission"
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                value={formValues.commissionRate}
                                onChange={(event) => handleChange('commissionRate', event.target.value)}
                                placeholder="Auto"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="product-image">{t('admin.productImage')} *</Label>
                        <Input
                            id="product-image"
                            value={formValues.image}
                            onChange={(event) => handleChange('image', event.target.value)}
                            required
                            placeholder="https://..."
                        />
                    </div>

                    {/* Inventory Section */}
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{t('shop.inventoryManagement')}</p>
                                <p className="text-xs text-slate-500">{t('admin.productStock')}</p>
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    checked={formValues.tracksInventory}
                                    onChange={(event) => handleChange('tracksInventory', event.target.checked)}
                                />
                                <span>{t('shop.tracksInventory')}</span>
                            </label>
                        </div>

                        {formValues.tracksInventory && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                <Label htmlFor="inventory-qty">{t('shop.inventoryQuantity')}</Label>
                                <Input
                                    id="inventory-qty"
                                    type="number"
                                    value={formValues.inventoryQuantity}
                                    onChange={(event) => handleChange('inventoryQuantity', event.target.value)}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="product-description">{t('product.description')}</Label>
                        <textarea
                            id="product-description"
                            className="w-full min-h-[100px] rounded-lg border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
                            value={formValues.description}
                            onChange={(event) => handleChange('description', event.target.value)}
                            placeholder="Add product details..."
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                        <div>
                            <p className="text-sm font-medium text-slate-900">{t('admin.visibilityControl')}</p>
                            <p className="text-xs text-slate-500">{t('product.inStock')}</p>
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                checked={formValues.inStock}
                                onChange={(event) => handleChange('inStock', event.target.checked)}
                            />
                            {formValues.inStock ? t('admin.visible') : t('admin.hidden')}
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-slate-900 hover:bg-slate-800 text-white">
                            {loading ? t('common.loading') : mode === 'create' ? t('admin.addProduct') : t('common.save')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
