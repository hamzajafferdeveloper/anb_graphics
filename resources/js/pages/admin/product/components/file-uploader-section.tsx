import { cn } from '@/lib/utils';
import { ProductImage } from '@/types/data';
import { Images, Trash2, Upload } from 'lucide-react';
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from 'react';

interface UploadedFile {
    id: string;
    file: File;
    previewUrl: string | null;
}

const FileUploaderSection = ({ data }: { data?: ProductImage[] }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
    const [dragOver, setDragOver] = useState(false);

    // Load existing images when editing
    useEffect(() => {
        if (data && Array.isArray(data)) {
            setExistingImages(data);
        }
    }, [data]);

    const uid = (): string =>
        Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    // Add new files
    const handleFilesAdded = (fileList: FileList | null) => {
        if (!fileList) return;

        const arr = Array.from(fileList);
        const newFiles: UploadedFile[] = arr.map((file) => ({
            id: uid(),
            file,
            previewUrl: file.type.startsWith('image/')
                ? URL.createObjectURL(file)
                : null,
        }));

        const merged = [...files, ...newFiles];
        setFiles(merged);

        // Update actual <input type="file"> for form submission
        const dt = new DataTransfer();
        merged.forEach((f) => dt.items.add(f.file));
        if (fileInputRef.current) fileInputRef.current.files = dt.files;
    };

    const removeFile = (id: string) => {
        const kept = files.filter((f) => f.id !== id);

        files
            .filter((f) => f.id === id)
            .forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));

        setFiles(kept);

        const dt = new DataTransfer();
        kept.forEach((f) => dt.items.add(f.file));

        if (fileInputRef.current) fileInputRef.current.files = dt.files;
    };

    // Remove existing DB images
    const removeExisting = (id: number) => {
        setExistingImages(existingImages.filter((img) => img.id !== id));
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        handleFilesAdded(e.dataTransfer.files);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleFilesAdded(e.target.files);
    };

    return (
        <div className="flex w-full flex-col gap-2 rounded-md">
            {/* Drag & Drop */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    'group relative flex h-80 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 transition-all',
                    dragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-dashed border-primary/40 bg-muted/30',
                )}
            >
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleChange}
                    name="images[]"
                />

                <Images className="h-20 w-20 text-primary/60 group-hover:text-primary" />

                <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        <Upload className="mr-1 inline h-4 w-4" />
                        Drop your files or{' '}
                        <span className="font-medium text-primary underline underline-offset-2">
                            Browse
                        </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Supported: JPG, PNG, WEBP
                    </p>
                </div>
            </div>

            {/* EXISTING IMAGES FROM DB */}
            {existingImages.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                    {existingImages.map((img) => (
                        <div
                            key={img.id}
                            className="flex items-center justify-between rounded-md border p-2"
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={`/storage/${img.path}`}
                                    alt={img.alt ?? 'Image'}
                                    className="h-20 w-20 rounded-md object-cover"
                                />
                                <div>
                                    <p className="text-sm">{img.path.split('/').pop()}</p>

                                    {img.is_primary && (
                                        <span className="text-xs text-green-600 font-semibold">
                                            ⭐ Primary Image
                                        </span>
                                    )}
                                </div>
                            </div>

                            <button onClick={() => removeExisting(img.id)}>
                                <Trash2 className="h-5 w-5 hover:text-red-500" />
                            </button>

                            {/* Keep IDs for backend */}
                            <input type="hidden" name="existing_images[]" value={img.id} />
                        </div>
                    ))}
                </div>
            )}

            {/* NEW UPLOADED FILES */}
            <div className="mt-2 flex flex-col gap-2">
                {files.map((f) => (
                    <div
                        key={f.id}
                        className="flex w-full items-center justify-between rounded-md border px-3 py-2"
                    >
                        <div className="flex items-center gap-3">
                            {f.previewUrl ? (
                                <img
                                    src={f.previewUrl}
                                    alt={f.file.name}
                                    className="h-20 w-20 rounded-md object-cover"
                                />
                            ) : (
                                <div className="h-20 w-20 bg-gray-100 rounded-md flex items-center justify-center">
                                    File
                                </div>
                            )}
                            <div>
                                <h1 className="text-gray-700">{f.file.name}</h1>
                                <p className="text-sm">{(f.file.size / 1024).toFixed(2)} KB</p>
                            </div>
                        </div>
                        <button onClick={() => removeFile(f.id)}>
                            <Trash2 className="h-5 w-5 hover:text-red-500" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileUploaderSection;
