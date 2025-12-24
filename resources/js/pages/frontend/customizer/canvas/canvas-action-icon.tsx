import { Button } from '@/components/ui/button';
import { useCustomizerHistory } from '@/contexts/customizer-history-context';
import { CustomizerHistoryState } from '@/types/customizer/customizer';
import {
    Redo2Icon,
    RotateCcw,
    Undo2Icon,
    ZoomInIcon,
    ZoomOutIcon,
} from 'lucide-react';

const ZoomUndoRedo = () => {
    const { canRedo, canUndo, undo, redo } =
        useCustomizerHistory<CustomizerHistoryState>();
    return (
        <div className="relative z-10 flex h-fit w-full items-center justify-end gap-2 rounded-xl border !bg-white p-1 shadow-xl lg:w-[48px] lg:flex-col">
            <Button className="cursor-pointer" disabled={!canUndo} onClick={undo}>
                <Undo2Icon />
            </Button>
            <Button className="cursor-pointer" disabled={!canRedo} onClick={redo}>
                <Redo2Icon />
            </Button>
            <Button className="">
                <ZoomInIcon />
            </Button>
            <Button className="">
                <ZoomOutIcon />
            </Button>
            <Button className="">
                <RotateCcw />
            </Button>
        </div>
    );
};

export default ZoomUndoRedo;
