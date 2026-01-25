import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Loader2, Trash2, ExternalLink, RefreshCw } from 'lucide-react';

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
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (fileName: string) => {
        if (!confirm(`Are you sure you want to delete ${fileName}? This usage cannot be undone.`)) return;

        setDeleting(fileName);
        try {
            const res = await fetch(`/api/files?name=${fileName}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setFiles(files.filter(f => f.name !== fileName));
            } else {
                alert('Failed to delete file');
            }
        } catch (error) {
            console.error('Failed to delete file', error);
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">File Manager</h2>
                <Button onClick={fetchFiles} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <div className="border rounded-md bg-white">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Preview</th>
                                    <th className="px-6 py-3">Filename</th>
                                    <th className="px-6 py-3">Size</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No files found in upload directory.
                                        </td>
                                    </tr>
                                ) : (
                                    files.map((file) => (
                                        <tr key={file.name} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                {file.type === 'file' && (file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                                                    <img src={file.url} alt={file.name} className="h-12 w-12 object-cover rounded border" />
                                                ) : (
                                                    <div className="h-12 w-12 bg-gray-100 rounded border flex items-center justify-center text-gray-400">
                                                        FILE
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-[200px]" title={file.name}>
                                                {file.name}
                                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="ml-2 inline-block text-blue-500 hover:text-blue-700">
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {formatSize(file.size)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {file.date ? new Date(file.date).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(file.name)}
                                                    disabled={deleting === file.name}
                                                >
                                                    {deleting === file.name ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
