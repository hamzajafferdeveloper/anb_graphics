import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    File,
    FileArchive,
    FileAudio,
    FileCode,
    FileImage,
    FileText,
    FileVideo,
} from 'lucide-react';

interface DownloadButtonProps {
    file: { path: string; extension?: string };
}

const getFileIcon = (extension?: string) => {
    if (!extension) return File;

    const ext = extension.toLowerCase();
    switch (ext) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
            return FileImage;
        case 'mp4':
        case 'mov':
        case 'avi':
        case 'mkv':
            return FileVideo;
        case 'mp3':
        case 'wav':
        case 'ogg':
            return FileAudio;
        case 'zip':
        case 'rar':
        case '7z':
            return FileArchive;
        case 'js':
        case 'ts':
        case 'html':
        case 'css':
        case 'php':
        case 'py':
            return FileCode;
        case 'txt':
        case 'md':
            return FileText;
        default:
            return File;
    }
};

const DownloadButton = ({ file }: DownloadButtonProps) => {
    const Icon = getFileIcon(file.extension);

    return (
        <Button variant="outline" asChild>
            <a
                href={`/storage/${file.path}`}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
            >
                <Icon className="h-4 w-4" />
                Download {file.extension?.toUpperCase() ?? ''}
            </a>
        </Button>
    );
};

export default DownloadButton;

export function DownloadFileModal({
    open,
    setOpenChange,
    product,
}: {
    open: boolean;
    setOpenChange: (open: boolean) => void;
    product: any;
}) {
    console.log('product in modal:', product);
    return (
        <Dialog open={open} onOpenChange={setOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Download</DialogTitle>
                    <DialogDescription>
                        Download your product files.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    {product.productImageFile &&
                    product.productImageFile.length > 0 ? (
                        product.productImageFile.map(
                            (file: any, index: number) => (
                                <DownloadButton key={index} file={file} />
                            ),
                        )
                    ) : (
                        <p>No files available for download.</p>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" className="w-full">
                            Cancel
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
