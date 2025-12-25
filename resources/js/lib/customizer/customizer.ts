import {
    setSelectedSidebar,
    setSelectedSvgPart,
} from '@/stores/customizer/customizerSlice';
import { AppDispatch } from '@/stores/store';
import { TemplatePart } from '@/types/data';
import { toast } from 'sonner';

// Paint Part of SvgTemplate
export const handlePaintPart = (
    part: TemplatePart,
    color: string,
    svgContainer: HTMLDivElement,
) => {
    const partIds = Array.isArray(part.part_id) ? part.part_id : [part.part_id];

    partIds.forEach((id) => {
        const el = svgContainer.querySelector(
            `[part-id="${id}"]`,
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
};

export const handleClickonSvgContainer = (
    event: React.MouseEvent<HTMLDivElement>,
    parts: TemplatePart[],
    dispatch: AppDispatch,
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
