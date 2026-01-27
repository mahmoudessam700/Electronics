import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Loader2, Trash2, ExternalLink, RefreshCw, FileImage, File, HardDrive, Search, Grid, List, Download, Calendar, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface FileItem {
    name: string;
    size: number;
    date: string | null;
    url: string;
    type: string;
}

export function AdminFilesPage() {
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
            toast.error('Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (fileName: string) => {
        if (!confirm(`Are you sure you want to delete ${fileName}? This action cannot be undone.`)) return;

        setDeleting(fileName);
        try {
            const res = await fetch(`/api/files?name=${fileName}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success('File deleted');
                setFiles(files.filter(f => f.name !== fileName));
            } else {
                toast.error('Failed to delete file');
            }
        } catch (error) {
            console.error('Failed to delete file', error);
            toast.error('Failed to delete file');
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
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <span className="mt-4 text-slate-500">Loading files...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        File Manager
                    </h1>
                    <p className="text-slate-500 mt-1">Manage uploaded files and media</p>
                </div>
                <Button 
                    onClick={fetchFiles} 
                    variant="outline" 
                    className="rounded-xl border-slate-200 hover:bg-slate-50"
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50">
                            <File className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Files</p>
                            <p className="text-2xl font-bold text-slate-900">{files.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50">
                            <ImageIcon className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Images</p>
                            <p className="text-2xl font-bold text-emerald-600">{imageCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-50">
                            <HardDrive className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Size</p>
                            <p className="text-2xl font-bold text-purple-600">{formatSize(totalSize)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search files..."
                        className="pl-10 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 bg-white border border-slate-200 rounded-xl p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Grid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Files */}
            {filteredFiles.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
                        <File className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {searchQuery ? 'No files found' : 'No files uploaded'}
                    </h3>
                    <p className="text-slate-500">
                        {searchQuery ? 'Try adjusting your search' : 'Upload files through the product form'}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                // Grid View
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredFiles.map((file) => (
                        <div 
                            key={file.name}
                            className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                        >
                            {/* Preview */}
                            <div className="aspect-square bg-slate-50 relative overflow-hidden">
                                {isImage(file.name) ? (
                                    <img 
                                        src={file.url} 
                                        alt={file.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <File className="h-16 w-16 text-slate-300" />
                                    </div>
                                )}
                                
                                {/* Overlay actions */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-center text-sm font-medium text-slate-700 hover:bg-white transition-colors"
                                        >
                                            <ExternalLink className="h-4 w-4 inline mr-1" />
                                            View
                                        </a>
                                        <button
                                            onClick={() => handleDelete(file.name)}
                                            disabled={deleting === file.name}
                                            className="p-2 bg-red-500/90 backdrop-blur-sm rounded-lg text-white hover:bg-red-600 transition-colors"
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
                                <p className="text-sm font-medium text-slate-900 truncate" title={file.name}>
                                    {file.name}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-slate-500">{formatSize(file.size)}</span>
                                    {file.date && (
                                        <span className="text-xs text-slate-400">
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
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Preview</th>
                                    <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Filename</th>
                                    <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Size</th>
                                    <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                                    <th className="text-right py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredFiles.map((file) => (
                                    <tr key={file.name} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            {isImage(file.name) ? (
                                                <img 
                                                    src={file.url} 
                                                    alt={file.name} 
                                                    className="h-14 w-14 object-cover rounded-xl border border-slate-100 shadow-sm group-hover:shadow-md transition-shadow" 
                                                />
                                            ) : (
                                                <div className="h-14 w-14 bg-slate-100 rounded-xl flex items-center justify-center">
                                                    <File className="h-6 w-6 text-slate-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="font-medium text-slate-900 truncate max-w-[200px]" title={file.name}>
                                                {file.name}
                                            </p>
                                            <a 
                                                href={file.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-1"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                View file
                                            </a>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-sm text-slate-600">
                                                {formatSize(file.size)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {file.date ? (
                                                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(file.date).toLocaleDateString()}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
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
