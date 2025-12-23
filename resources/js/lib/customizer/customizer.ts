import { TemplatePart } from '@/types/data';

export const handlePartSelection = () => {
    // TODO: implement part selection
};

export const handlePartColorChange = () => {
    // TODO: implement part color change
};

export const handleClickonSvgContainer = (
    event: React.MouseEvent<HTMLDivElement>,
    parts: TemplatePart[],
    setOpenColorMenu: (value: string) => void,
): void => {
    const target = event.target as HTMLElement;
    const partId = target.getAttribute('part-id');
    if (partId) {
        const matchedPart = parts.find((part) => part.part_id.includes(partId));

        // @ts-ignore
        setOpenColorMenu(matchedPart?.name ?? '');
    }
};
