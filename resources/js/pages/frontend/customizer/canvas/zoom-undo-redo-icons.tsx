import { Button } from '@/components/ui/button';
import { useCustomizerHistory } from '@/contexts/customizer-history-context';
import { setZoom } from '@/stores/customizer/customizerSlice';
import { RootState } from '@/stores/store';
import { CustomizerHistoryState } from '@/types/customizer/customizer';
import {
    Redo2Icon,
    RotateCcw,
    Undo2Icon,
    ZoomInIcon,
    ZoomOutIcon,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

const ZoomUndoRedo = () => {
    const dispatch = useDispatch();
    const zoom = useSelector((state: RootState) => state.customizer.zoom);
    const { canRedo, canUndo, undo, redo } =
        useCustomizerHistory<CustomizerHistoryState>();

    const handleZoomIn = () => {
        dispatch(setZoom(Math.min(zoom + 0.1, 3)));
    };

    const handleZoomOut = () => {
        dispatch(setZoom(Math.max(zoom - 0.1, 0.5)));
    };

    const handleReset = () => {
        dispatch(setZoom(1));
    };

    return (
        <div className="relative z-10 flex h-fit w-full items-center justify-end gap-2 rounded-xl border !bg-white p-1 shadow-xl lg:w-[48px] lg:flex-col">
            <Button className="cursor-pointer" disabled={!canUndo} onClick={undo}>
                <Undo2Icon />
            </Button>
            <Button className="cursor-pointer" disabled={!canRedo} onClick={redo}>
                <Redo2Icon />
            </Button>
            <Button className="cursor-pointer" onClick={handleZoomIn} disabled={zoom >= 3}>
                <ZoomInIcon />
            </Button>
            <Button className="cursor-pointer" onClick={handleZoomOut} disabled={zoom <= 0.5}>
                <ZoomOutIcon />
            </Button>
            <Button className="cursor-pointer" onClick={handleReset}>
                <RotateCcw />
            </Button>
        </div>
    );
};

export default ZoomUndoRedo;
