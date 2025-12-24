import { useCustomizerHistory } from '@/contexts/customizer-history-context';
import { useSvgContainer } from '@/contexts/svg-container-context';
import { handlePaintPart } from '@/lib/customizer/customizer';
import { RootState } from '@/stores/store';
import { ProductColor, TemplatePart } from '@/types/data';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

export type BackendPart = {
    id: number;
    part_id: string;
    name: string;
    type: string;
    color: string;
    is_group: number;
};

const ColorDisplay = ({
    colors,
    part,
    allParts,
}: {
    colors: ProductColor[];
    part: BackendPart;
    allParts: BackendPart[];
}) => {
    const { svgContainerRef } = useSvgContainer();
    const { setAndCommit } = useCustomizerHistory<{ parts: TemplatePart[] }>();

    // Paint part: update state + DOM immediately
    const paintPart = (partToPaint: TemplatePart, colorCode: string) => {
        // Update the state
        setAndCommit((prev) => ({
            ...prev,
            parts: prev.parts.map((p) =>
                p.part_id === partToPaint.part_id
                    ? { ...p, color: colorCode }
                    : p,
            ),
        }));

        // Update the DOM
        if (svgContainerRef?.current) {
            // @ts-ignore
            handlePaintPart(
                partToPaint,
                colorCode,
                svgContainerRef.current,
                allParts,
            );
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
                <div
                    key={color.id}
                    title={color.name}
                    onClick={(e) => {
                        e.stopPropagation();
                        // @ts-ignore
                        paintPart(part, color.code);
                    }}
                    className="h-5 w-5 cursor-pointer rounded-md transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2"
                    style={{
                        backgroundColor: color.code,
                        border: '1px solid rgba(0,0,0,0.1)',
                    }}
                />
            ))}
        </div>
    );
};

const ColorSideBar = () => {
    const parts = useSelector((state: RootState) => state.customizer.parts);
    const selectedSvgPart = useSelector(
        (state: RootState) => state.customizer.selectedSvgPart,
    );
    const [selectedPart, setSelectedPart] = useState<string>('');
    const [colors, setColors] = useState<ProductColor[]>([]);

    /**
     * Show:
     * - ALL non-group parts
     * - ONLY ONE per name for grouped parts
     */
    const visibleParts = useMemo(() => {
        const seenNames = new Set<string>();

        return parts.filter((part: BackendPart) => {
            if (part.is_group === 1) {
                if (seenNames.has(part.name)) return false;
                seenNames.add(part.name);
            }
            return true;
        });
    }, [parts]);

    const effectiveSelectedPartId = useMemo(() => {
        if (!selectedPart) return '';

        // 1️⃣ If selected part is directly visible, use it
        const directMatch = visibleParts.find(
            (p: BackendPart) => p.part_id === selectedPart,
        );
        if (directMatch) return directMatch.part_id;

        // 2️⃣ Otherwise, find its group representative by name
        const actualPart = parts.find(
            (p: BackendPart) => p.part_id === selectedPart,
        );
        if (!actualPart) return '';

        const groupRepresentative = visibleParts.find(
            (p: BackendPart) => p.is_group === 1 && p.name === actualPart.name,
        );

        return groupRepresentative?.part_id ?? '';
    }, [selectedPart, parts, visibleParts]);

    useEffect(() => {
        const loadColors = async () => {
            try {
                const res = await fetch('/user/colors-for-customizer');
                const data = await res.json();
                setColors(data);
            } catch (err) {
                // TODO: handle error
            }
        };

        loadColors();
    }, []);

    useEffect(() => {
        setSelectedPart(selectedSvgPart);
    }, [selectedSvgPart]);

    const leatherColors = useMemo(
        () => colors.filter((c) => !c.is_protection),
        [colors],
    );

    return (
        <aside className="w-full rounded-lg p-4">
            <h1 className="mb-4 text-lg font-semibold">Colors</h1>

            <div className="flex flex-col gap-2">
                {visibleParts.map((part: BackendPart) => {
                    const isActive = effectiveSelectedPartId === part.part_id;

                    return (
                        <div key={`${part.name}-${part.id}`}>
                            <button
                                onClick={() => setSelectedPart(part.part_id)}
                                className={`flex w-full items-center gap-3 rounded-md border p-2 text-left transition ${
                                    isActive
                                        ? 'border-primary bg-primary/10'
                                        : 'border-transparent hover:bg-muted'
                                }`}
                            >
                                <span
                                    className="h-5 w-5 rounded-sm"
                                    style={{ backgroundColor: part.color }}
                                />
                                <span className="text-sm font-medium">
                                    {part.name}
                                </span>
                            </button>

                            {isActive && (
                                <div className="relative mt-3 ml-4 flex gap-3">
                                    {/* Vertical thread line */}
                                    <div className="relative flex">
                                        <div className="absolute top-0 left-0 h-full w-px bg-primary/40" />
                                    </div>

                                    {/* Threaded content */}
                                    <div className="flex-1">
                                        {part.type === 'leather' ? (
                                            <ColorDisplay
                                                colors={leatherColors}
                                                part={part}
                                                allParts={parts}
                                            />
                                        ) : (
                                            <ColorDisplay
                                                colors={colors}
                                                part={part}
                                                allParts={parts}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default ColorSideBar;
