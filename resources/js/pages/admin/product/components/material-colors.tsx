import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { ChevronsUpDownIcon, X } from 'lucide-react';
import { ChromePicker } from 'react-color';

const materials = ['Leather', 'Cotton', 'Nylon', 'Other'];

type Props = {
    material: string | null | undefined;
    setMaterial: (m: any) => void;
    pickerColor: string;
    setPickerColor: (c: string) => void;
    showPicker: boolean;
    setShowPicker: (b: boolean) => void;
    colors: string[];
    setColors: (c: string[]) => void;
    removeColor: (color: string) => void;
    errors?: any;
};

export default function MaterialColors({
    material,
    setMaterial,
    pickerColor,
    setPickerColor,
    showPicker,
    setShowPicker,
    colors,
    setColors,
    removeColor,
    errors,
}: Props) {
    return (
        <div className="flex flex-col gap-6">
            {/* MATERIAL */}
            <div className="flex w-full flex-col gap-2">
                <Label htmlFor="material">Material</Label>

                <input
                    hidden
                    id="material"
                    name="material"
                    value={material || ''}
                    onChange={(e) => setMaterial(e.target.value)}
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="flex w-full items-center justify-between"
                        >
                            {material || 'Select Material'}
                            <ChevronsUpDownIcon className="h-4 w-4 opacity-60" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56">
                        {materials.map((mat) => (
                            <DropdownMenuItem
                                key={mat}
                                className="capitalize"
                                onClick={() => setMaterial(mat.toLowerCase())}
                            >
                                {mat}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <InputError message={errors?.material} />
            </div>

            {/* COLORS */}
            <div className="flex flex-col gap-3">
                <Label>Colors</Label>

                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPicker(!showPicker)}
                        className="flex items-center gap-2"
                    >
                        <div
                            className="h-4 w-4 rounded border"
                            style={{ background: pickerColor }}
                        />
                        Pick Color
                    </Button>

                    <Button
                        type="button"
                        variant="default"
                        className="px-4"
                        onClick={() => {
                            if (!colors.includes(pickerColor)) {
                                setColors([...colors, pickerColor]);
                            }
                        }}
                    >
                        Add Color
                    </Button>
                </div>

                {showPicker && (
                    <div className="w-fit rounded-xl border bg-white p-3 shadow-md">
                        <ChromePicker
                            color={pickerColor}
                            onChange={(color) => setPickerColor(color.hex)}
                        />
                    </div>
                )}

                {colors.map((c, i) => (
                    <input key={i} type="hidden" name="colors[]" value={c} />
                ))}

                <div className="mt-1 flex flex-wrap gap-2">
                    {colors.map((color) => (
                        <Badge
                            key={color}
                            className="flex items-center gap-2 px-3 py-1"
                        >
                            <div
                                className="h-4 w-4 rounded border"
                                style={{ backgroundColor: color }}
                            />
                            <span>{color}</span>

                            <button
                                type="button"
                                onClick={() => removeColor(color)}
                            >
                                <X className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100" />
                            </button>
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    );
}
