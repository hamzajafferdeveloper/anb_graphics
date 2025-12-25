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
        setUploadedFile(e.target.files?.[0] ?? null);
        if (!uploadedFile) return;

        dispatch(
            addImage({
                src: URL.createObjectURL(uploadedFile),
                x: 100,
                y: 100,
                width: 300,
                height: 200,
                originalWidth: 1920,
                originalHeight: 1080,
                opacity: 1,
            }),
        );
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
