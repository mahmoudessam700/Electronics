import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Loader2, Trash2, ExternalLink, RefreshCw, File, HardDrive, Search, Grid, List, Calendar, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';

interface FileItem {
    name: string;
    size: number;
    date: string | null;
    url: string;
    type: string;
}

export function AdminFilesPage() {
    const { t, isRTL } = useLanguage();
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/files');
            const data = await res.json();
            if (res.ok) {
                setFiles(data);
            }
        } catch (error) {
            console.error('Failed to fetch files', error);
            toast.error(t('admin.fileLoadFailedToast') || 'Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (fileName: string) => {
        if (!confirm(t('admin.deleteFileConfirm') || `Are you sure you want to delete ${fileName}? This action cannot be undone.`)) return;

        setDeleting(fileName);
        try {
            const res = await fetch(`/api/files?name=${fileName}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success(t('admin.fileDeletedToast') || 'File deleted');
                setFiles(files.filter(f => f.name !== fileName));
            } else {
                toast.error(t('admin.fileDeleteFailedToast') || 'Failed to delete file');
            }
        } catch (error) {
            console.error('Failed to delete file', error);
            toast.error(t('admin.fileDeleteFailedToast') || 'Failed to delete file');
        } finally {
            setDeleting(null);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const isImage = (fileName: string) => fileName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const imageCount = files.filter(f => isImage(f.name)).length;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#4A5568]/30 border-t-[#4A5568] rounded-full animate-spin" />
                <span className="mt-4 text-gray-500">{t('admin.loadingFiles')}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {t('admin.fileManager')}
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">{t('admin.fileManagerSubtitle')}</p>
                </div>
                <Button
                    onClick={fetchFiles}
                    variant="outline"
                    className="rounded-lg border-gray-200 hover:bg-gray-50"
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('admin.refresh')}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#4A5568]">
                            <File className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('admin.totalFiles')}</p>
                            <p className="text-xl font-bold text-gray-900">{files.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#718096]">
                            <ImageIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('admin.images')}</p>
                            <p className="text-xl font-bold text-gray-900">{imageCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#2D3748]">
                            <HardDrive className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('admin.totalSize')}</p>
                            <p className="text-xl font-bold text-gray-900">{formatSize(totalSize)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder={t('admin.searchFilesPlaceholder')}
                        className="pl-10 bg-white border-gray-200 focus:border-[#4A5568] focus:ring-[#4A5568]/20 rounded-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 bg-white border border-gray-200 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#4A5568] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Grid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#4A5568] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Files */}
            {filteredFiles.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gray-100 mb-4">
                        <File className="h-7 w-7 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {searchQuery ? t('admin.noFilesFound') : t('admin.noFilesUploaded')}
                    </h3>
                    <p className="text-gray-500">
                        {searchQuery ? t('admin.tryAdjustingSearch') : t('admin.uploadThroughForm')}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                // Grid View
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredFiles.map((file) => (
                        <div
                            key={file.name}
                            className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 overflow-hidden"
                        >
                            {/* Preview */}
                            <div className="aspect-square bg-gray-50 relative overflow-hidden">
                                {isImage(file.name) ? (
                                    <img
                                        src={file.url}
                                        alt={file.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <File className="h-12 w-12 text-gray-300" />
                                    </div>
                                )}

                                {/* Overlay actions */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 py-2 bg-white/90 rounded-md text-center text-sm font-medium text-gray-700 hover:bg-white transition-colors"
                                        >
                                            <ExternalLink className="h-4 w-4 inline mr-1" />
                                            {t('admin.view')}
                                        </a>
                                        <button
                                            onClick={() => handleDelete(file.name)}
                                            disabled={deleting === file.name}
                                            className="p-2 bg-red-500/90 rounded-md text-white hover:bg-red-600 transition-colors"
                                        >
                                            {deleting === file.name ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* File info */}
                            <div className="p-3">
                                <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                                    {file.name}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-500">{formatSize(file.size)}</span>
                                    {file.date && (
                                        <span className="text-xs text-gray-400">
                                            {new Date(file.date).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // List View
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.preview')}</th>
                                    <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.fileName')}</th>
                                    <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden sm:table-cell`}>{t('admin.fileSize')}</th>
                                    <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell`}>{t('admin.uploadDate')}</th>
                                    <th className={`${isRTL ? 'text-left' : 'text-right'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredFiles.map((file) => (
                                    <tr key={file.name} className="hover:bg-gray-50 transition-colors group">
                                        <td className="py-3 px-4">
                                            {isImage(file.name) ? (
                                                <img
                                                    src={file.url}
                                                    alt={file.name}
                                                    className="h-12 w-12 object-cover rounded-lg border border-gray-100"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <File className="h-5 w-5 text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-gray-900 truncate max-w-[150px] sm:max-w-[200px]" title={file.name}>
                                                {file.name}
                                            </p>
                                            <a
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-[#4A5568] hover:text-[#2D3748] flex items-center gap-1 mt-1"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                {t('admin.viewFile')}
                                            </a>
                                        </td>
                                        <td className="py-3 px-4 hidden sm:table-cell">
                                            <span className="px-2 py-1 bg-gray-100 rounded-md text-sm text-gray-600">
                                                {formatSize(file.size)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 hidden md:table-cell">
                                            {file.date ? (
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(file.date).toLocaleDateString()}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-md text-red-500 hover:bg-red-50 hover:text-red-600"
                                                    onClick={() => handleDelete(file.name)}
                                                    disabled={deleting === file.name}
                                                >
                                                    {deleting === file.name ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
