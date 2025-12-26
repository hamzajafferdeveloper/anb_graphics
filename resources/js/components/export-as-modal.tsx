import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
export function ExportAsModal({
    open,
    setOpenExportAsModal,
}: {
    open: boolean;
    setOpenExportAsModal: (open: boolean) => void;
}) {
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
                        <Button variant="outline">
                            SVG
                        </Button>
                        <Button variant="outline">
                            PNG
                        </Button>
                        <Button variant="outline">
                            JPG
                        </Button>
                        <Button variant="outline">
                            PDF
                        </Button>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" className='w-full'>Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
