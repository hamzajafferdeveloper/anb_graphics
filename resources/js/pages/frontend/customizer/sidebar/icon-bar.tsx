import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { btnSideBarLink } from '@/constant/customizer-icon-bar-data';
import { addImage } from '@/stores/customizer/canvasItemSlice';
import { setSelectedSidebar } from '@/stores/customizer/customizerSlice';
import { AppDispatch, RootState } from '@/stores/store';
import { UploadIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const IconBar = () => {
    const uploadedFileRef = useRef<HTMLInputElement>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const dispatch = useDispatch<AppDispatch>();

    const selectedSidebar = useSelector(
        (state: RootState) => state.customizer.selectedSidebar,
    );

    function handleUploadedFile() {
        uploadedFileRef.current?.click();
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create object URL for the uploaded file
        const fileUrl = URL.createObjectURL(file);

        // Create an image to get its actual size
        const img = new Image();
        img.src = fileUrl;
        img.onload = () => {
            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;

            // Maximum dimension
            const maxSize = 200;
            let width = naturalWidth;
            let height = naturalHeight;

            // Scale down if larger than maxSize while preserving aspect ratio
            if (naturalWidth > maxSize || naturalHeight > maxSize) {
                const ratio = naturalWidth / naturalHeight;

                if (ratio > 1) {
                    // width is larger
                    width = maxSize;
                    height = maxSize / ratio;
                } else {
                    // height is larger or square
                    height = maxSize;
                    width = maxSize * ratio;
                }
            }

            // Dispatch the action with scaled dimensions
            dispatch(
                addImage({
                    src: fileUrl,
                    x: 100,
                    y: 100,
                    width,
                    height,
                    originalWidth: naturalWidth,
                    originalHeight: naturalHeight,
                    opacity: 1,
                }),
            );

            // Optional: revoke object URL
            // URL.revokeObjectURL(fileUrl);
        };

        // Clear the file input to allow selecting the same file again
        if (e.target) {
            e.target.value = '';
        }
    }

    return (
        <div>
            <div className="flex h-fit w-full items-center gap-1 rounded-xl border p-1 shadow-2xl lg:h-full lg:w-auto lg:flex-col">
                <input
                    type="file"
                    ref={uploadedFileRef}
                    onChange={(e) => handleFileChange(e)}
                    className="hidden"
                />

                {btnSideBarLink.map((btn, index) => {
                    const isActive = selectedSidebar === btn.name;

                    return (
                        <Tooltip key={index}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={isActive ? 'default' : 'ghost'}
                                    className={`relative !h-8 !w-8 overflow-hidden rounded-md p-2 transition-all duration-300 md:!h-10 md:!w-10 ${
                                        isActive
                                            ? 'border border-white/30 bg-primary shadow-[0_8px_32px_rgba(255,255,255,0.18)] backdrop-blur-2xl'
                                            : 'hover:bg-white/10'
                                    }`}
                                    asChild
                                >
                                    <span
                                        onClick={() =>
                                            dispatch(
                                                setSelectedSidebar(btn.name),
                                            )
                                        }
                                        className="flex h-full w-full items-center justify-center"
                                    >
                                        <btn.icon
                                            className={
                                                isActive
                                                    ? 'text-white'
                                                    : 'text-muted-foreground'
                                            }
                                        />
                                    </span>
                                </Button>
                            </TooltipTrigger>

                            <TooltipContent side="right">
                                <p>{btn.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}

                {/* Upload Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative !h-8 !w-8 rounded-md p-2 transition-all duration-300 hover:bg-white/10 md:!h-10 md:!w-10"
                            asChild
                        >
                            <span
                                onClick={handleUploadedFile}
                                className="flex h-full w-full items-center justify-center"
                            >
                                <UploadIcon className="text-muted-foreground" />
                            </span>
                        </Button>
                    </TooltipTrigger>

                    <TooltipContent side="right">
                        <p>Upload</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
};

export default IconBar;
