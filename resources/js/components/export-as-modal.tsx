import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useSvgContainer } from '@/contexts/svg-container-context';
import { RootState } from '@/stores/store';
import { CanvasItem } from '@/types/customizer/uploaded-items';
import { useSelector } from 'react-redux';
import { ExportCanvas } from '../pages/frontend/customizer/export/canvas-export';
import { Button } from './ui/button';

export function ExportAsModal({
    open,
    setOpenExportAsModal,
}: {
    open: boolean;
    setOpenExportAsModal: (open: boolean) => void;
}) {
    const { svgContainerRef } = useSvgContainer();

    const items = useSelector(
        (state: RootState) => state.canvasItem?.items || [],
    ) as CanvasItem[];

    const SvgTemplateParentMaxSize = useSelector(
        (state: RootState) => state.customizer?.svgTemplateParentMaxSize || 0,
    );

    return (
        <Dialog open={open} onOpenChange={setOpenExportAsModal}>
            <form>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Export as</DialogTitle>
                        <DialogDescription>
                            Choose a format to export your design.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => {
                                ExportCanvas({
                                    svgContainerRef,
                                    format: 'svg',
                                    items,
                                    SvgTemplateParentMaxSize
                                });
                            }}
                        >
                            SVG
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => {
                                ExportCanvas({
                                    svgContainerRef,
                                    format: 'png',
                                    items,
                                    SvgTemplateParentMaxSize
                                });
                            }}
                        >
                            PNG
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => {
                                ExportCanvas({
                                    svgContainerRef,
                                    format: 'jpg',
                                    items,
                                    SvgTemplateParentMaxSize
                                });
                            }}
                        >
                            JPG
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => {
                                ExportCanvas({
                                    svgContainerRef,
                                    format: 'pdf',
                                    items,
                                    SvgTemplateParentMaxSize
                                });
                            }}
                        >
                            PDF
                        </Button>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className="w-full">
                                Cancel
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
