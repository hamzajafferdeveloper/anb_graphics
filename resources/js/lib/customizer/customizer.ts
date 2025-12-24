import { BackendPart } from '@/pages/frontend/customizer/sidebar/color-sidebar';
import {
    setSelectedSidebar,
    setSelectedSvgPart,
} from '@/stores/customizer/customizerSlice';
import { AppDispatch } from '@/stores/store';
import { TemplatePart } from '@/types/data';
import { toast } from 'sonner';

export const handlePartSelection = () => {
    // TODO: implement part selection
};

export const handlePaintPart = (
    part: BackendPart,
    color: string,
    svgContainer: HTMLDivElement,
    allParts: BackendPart[] = [],
) => {
    // If it's a group, find all parts with the same name
    const partsToUpdate =
        part.is_group === 1
            ? allParts.filter((p) => p.name === part.name)
            : [part];

    console.log(svgContainer);

    partsToUpdate.forEach((partToUpdate) => {
        const partIds = Array.isArray(partToUpdate.part_id)
            ? partToUpdate.part_id
            : [partToUpdate.part_id];

        partIds.forEach((id) => {
            const el = svgContainer.querySelector(
                `[part-id="${id}"], [id="${id}"]`,
            ) as SVGElement | null;

            if (el) {
                // Prefer setting both fill attributes and style
                el.setAttribute('fill', color);
                el.setAttribute('stroke', color); // optional fallback

                // Handle inline style
                if (el.style) {
                    el.style.fill = color;
                }
            } else {
                console.warn(`❌ Element not found for id/part-id: ${id}`);
            }
        });
    });
};

export const handleClickonSvgContainer = (
    event: React.MouseEvent<HTMLDivElement>,
    parts: TemplatePart[],
    dispatch: AppDispatch,
    svgContainerRef: React.RefObject<HTMLDivElement | null>,
): void => {
    const target = event.target as HTMLElement;
    const partId = target.getAttribute('part-id');
    if (partId) {
        const matchedPart = parts.find((part) => part.part_id.includes(partId));

        if (!matchedPart) {
            toast.error('Part not found');
            return;
        }

        dispatch(setSelectedSvgPart(matchedPart?.part_id ?? ''));
        dispatch(setSelectedSidebar('Color'));
    }
};
