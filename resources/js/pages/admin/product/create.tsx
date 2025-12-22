import InputError from '@/components/input-error';
import CustomTextEditor from '@/components/text-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { BreadcrumbItem } from '@/types';
import {
    ProductBrand,
    ProductCategory,
    ProductColor,
    ProductType,
} from '@/types/data';
import { Form, Head } from '@inertiajs/react';
import { format, isBefore, isPast } from 'date-fns';
import { CalendarIcon, ChevronsUpDownIcon, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import FileUploaderSection from './components/file-uploader-section';
import MaterialColors from './components/material-colors';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create New Product',
        href: admin.product.create().url,
    },
];

type Props = {
    categories: ProductCategory[];
    types: ProductType[];
    brands: ProductBrand[];
    all_colors: ProductColor[];
};

const CreateProduct = ({ categories, types, brands, all_colors }: Props) => {
    const [hasSalePrice, setHaSalePrice] = useState<boolean>(false);
    const [saleStartDate, setSaleStartDate] = useState<Date | undefined>(
        new Date(),
    );
    const [saleEndDate, setSaleEndDate] = useState<Date | undefined>(
        new Date(),
    );
    const [startError, setStartError] = useState<string | null>(null);
    const [endError, setEndError] = useState<string | null>(null);

    const [description, setDescription] = useState<string>('');

    // Validate start date (cannot be in past)
    useEffect(() => {
        if (saleStartDate && isPast(saleStartDate)) {
            setStartError('Sale start date cannot be in the past.');
            setSaleStartDate(undefined);
        } else {
            setStartError(null);
        }

        // Reset end date if it's before start date
        if (
            saleEndDate &&
            saleStartDate &&
            isBefore(saleEndDate, saleStartDate)
        ) {
            setEndError('Sale end date cannot be before sale start date.');
            setSaleEndDate(undefined);
        } else {
            setEndError(null);
        }
    }, [saleStartDate, saleEndDate]);

    // STATE for comboboxes
    const [selectedCategory, setSelectedCategory] =
        useState<ProductCategory | null>(null);
    const [openCategory, setOpenCategory] = useState(false);

    const [selectedBrand, setSelectedBrand] = useState<ProductBrand | null>(
        null,
    );
    const [openBrand, setOpenBrand] = useState(false);

    const [selectedType, setSelectedType] = useState<ProductType | null>(null);
    const [openType, setOpenType] = useState(false);

    // MATERIAL
    const [material, setMaterial] = useState<'leather' | 'cotton' | 'other'>(
        'other',
    );

    // COLORS
    const [selectedColor, setSelectedColor] = useState<ProductColor | null>(
        null,
    );
    // COLORS
    const [colors, setColors] = useState<string[]>([]);
    const [colorInput, setColorInput] = useState('');
    const [pickerColor, setPickerColor] = useState('#000000');
    const [showPicker, setShowPicker] = useState(false);

    // KEYWORDS (TAGS)
    const [keywords, setKeywords] = useState<string[]>([]);
    const [keywordInput, setKeywordInput] = useState<string>('');

    // Add color on Enter
    const handleColorKeyDown = (e: any) => {
        if (e.key === 'Enter' && colorInput.trim() !== '') {
            e.preventDefault();
            if (!colors.includes(colorInput.trim())) {
                setColors([...colors, colorInput.trim()]);
            }
            setColorInput('');
        }
    };

    // Add keyword on Enter
    const handleKeywordKeyDown = (e: any) => {
        if (e.key === 'Enter' && keywordInput.trim() !== '') {
            e.preventDefault();
            if (!keywords.includes(keywordInput.trim())) {
                setKeywords([...keywords, keywordInput.trim()]);
            }
            setKeywordInput('');
        }
    };

    // Add selected HEX color
    const addColor = (hex: string) => {
        if (!colors.includes(hex)) {
            setColors([...colors, hex]);
        }
    };
    // Remove items
    const removeColor = (color: string) => {
        setColors(colors.filter((c) => c !== color));
    };

    const removeKeyword = (word: string) => {
        setKeywords(keywords.filter((w) => w !== word));
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Type" />
            <section className="flex flex-col gap-4 p-4">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 rounded-xl border p-4">
                    <h1 className="text-2xl">Create New Product</h1>

                    <Form action={admin.product.store()} method="post">
                        {({ errors, processing }) => (
                            <div className="flex flex-col gap-4">
                                <div className="flex w-full gap-5">
                                    <div className="flex w-full flex-col gap-2 border p-3">
                                        <div>
                                            <FileUploaderSection />
                                            <InputError
                                                message={errors.images}
                                            />
                                        </div>
                                        <div className="mt-2 flex flex-col gap-2 border-t border-dashed border-primary py-3">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="meta_title">
                                                    Meta Title
                                                </Label>
                                                <Input
                                                    id="meta_title"
                                                    name="meta_title"
                                                    placeholder="Navy Blue Snaker Shoe"
                                                    className="w-full"
                                                />
                                                <InputError
                                                    message={errors.meta_title}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="meta_description">
                                                    Meta Description
                                                </Label>
                                                <Textarea
                                                    id="meta_description"
                                                    name="meta_description"
                                                    placeholder="Navy Blue Snaker Shoe"
                                                    className="w-full"
                                                />
                                                <InputError
                                                    message={
                                                        errors.meta_description
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex w-full flex-col gap-4 rounded-md border p-3">
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="name">
                                                Product Name
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="Navy Blue Snaker Shoe"
                                                className="w-full"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Label>Category</Label>

                                            {/* Hidden input for Laravel */}
                                            {selectedCategory && (
                                                <input
                                                    type="hidden"
                                                    name="category_id"
                                                    value={selectedCategory.id}
                                                />
                                            )}

                                            <Popover
                                                open={openCategory}
                                                onOpenChange={setOpenCategory}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="justify-between"
                                                    >
                                                        {selectedCategory
                                                            ? selectedCategory.name
                                                            : 'Select Category'}
                                                        <ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>

                                                <PopoverContent className="w-56 p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search category..." />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                No category
                                                                found.
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {categories.map(
                                                                    (cat) => (
                                                                        <CommandItem
                                                                            key={
                                                                                cat.id
                                                                            }
                                                                            value={
                                                                                cat.name
                                                                            }
                                                                            onSelect={() => {
                                                                                setSelectedCategory(
                                                                                    cat,
                                                                                );
                                                                                setOpenCategory(
                                                                                    false,
                                                                                );
                                                                            }}
                                                                        >
                                                                            {
                                                                                cat.name
                                                                            }
                                                                        </CommandItem>
                                                                    ),
                                                                )}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>

                                            <InputError
                                                message={errors.category_id}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Label>Brand</Label>

                                            {selectedBrand && (
                                                <input
                                                    type="hidden"
                                                    name="brand_id"
                                                    value={selectedBrand.id}
                                                />
                                            )}

                                            <Popover
                                                open={openBrand}
                                                onOpenChange={setOpenBrand}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="justify-between"
                                                    >
                                                        {selectedBrand
                                                            ? selectedBrand.name
                                                            : 'Select Brand'}
                                                        <ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>

                                                <PopoverContent className="w-56 p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search brand..." />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                No brand found.
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {brands.map(
                                                                    (brand) => (
                                                                        <CommandItem
                                                                            key={
                                                                                brand.id
                                                                            }
                                                                            value={
                                                                                brand.name
                                                                            }
                                                                            onSelect={() => {
                                                                                setSelectedBrand(
                                                                                    brand,
                                                                                );
                                                                                setOpenBrand(
                                                                                    false,
                                                                                );
                                                                            }}
                                                                        >
                                                                            {
                                                                                brand.name
                                                                            }
                                                                        </CommandItem>
                                                                    ),
                                                                )}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>

                                            <InputError
                                                message={errors.brand_id}
                                            />
                                        </div>

                                        <div className="flex w-full gap-2">
                                            <div className="flex w-full flex-col gap-2">
                                                <Label htmlFor="price">
                                                    Price
                                                </Label>
                                                <Input
                                                    id="price"
                                                    name="price"
                                                    placeholder="175"
                                                    className="w-full"
                                                />
                                                <InputError
                                                    message={errors.price}
                                                />
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        onCheckedChange={() =>
                                                            setHaSalePrice(
                                                                !hasSalePrice,
                                                            )
                                                        }
                                                    />
                                                    <p className="text-sm text-gray-700 dark:text-gray-100">
                                                        Has Sale Price
                                                    </p>
                                                </div>
                                            </div>
                                            {hasSalePrice && (
                                                <div className="flex w-full flex-col gap-2 transition-all">
                                                    <Label htmlFor="sale_price">
                                                        Sale Price
                                                    </Label>
                                                    <Input
                                                        id="sale_price"
                                                        name="sale_price"
                                                        placeholder="150"
                                                        className="w-full"
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.sale_price
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {hasSalePrice && (
                                            <div className="flex w-full gap-2 transition-all">
                                                <div className="flex w-full flex-col gap-2">
                                                    <Label htmlFor="sale_start_at">
                                                        Sale Started At
                                                    </Label>
                                                    <input
                                                        type="hidden"
                                                        id="sale_start_at"
                                                        name="sale_start_at"
                                                        className="w-full"
                                                        // @ts-ignore
                                                        value={
                                                            saleStartDate
                                                                ? saleStartDate.toISOString()
                                                                : ''
                                                        }
                                                    />
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                data-empty={
                                                                    !saleStartDate
                                                                }
                                                                className="w-[280px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                                                            >
                                                                <CalendarIcon />
                                                                {saleStartDate ? (
                                                                    format(
                                                                        saleStartDate,
                                                                        'PPP',
                                                                    )
                                                                ) : (
                                                                    <span>
                                                                        Pick a
                                                                        date
                                                                    </span>
                                                                )}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar
                                                                mode="single"
                                                                selected={
                                                                    saleStartDate
                                                                }
                                                                onSelect={
                                                                    setSaleStartDate
                                                                }
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <InputError
                                                        message={
                                                            startError ||
                                                            errors?.sale_start_at
                                                        }
                                                    />
                                                </div>
                                                <div className="flex w-full flex-col gap-2">
                                                    <Label htmlFor="sale_end_at">
                                                        Sale End At
                                                    </Label>
                                                    <input
                                                        type="hidden"
                                                        id="sale_end_at"
                                                        name="sale_end_at"
                                                        className="w-full"
                                                        // @ts-ignore
                                                        value={
                                                            saleEndDate
                                                                ? saleEndDate.toISOString()
                                                                : ''
                                                        }
                                                    />
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                data-empty={
                                                                    !saleEndDate
                                                                }
                                                                className="w-[280px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                                                            >
                                                                <CalendarIcon />
                                                                {saleEndDate ? (
                                                                    format(
                                                                        saleEndDate,
                                                                        'PPP',
                                                                    )
                                                                ) : (
                                                                    <span>
                                                                        Pick a
                                                                        date
                                                                    </span>
                                                                )}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar
                                                                mode="single"
                                                                selected={
                                                                    saleEndDate
                                                                }
                                                                onSelect={
                                                                    setSaleEndDate
                                                                }
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <InputError
                                                        message={
                                                            endError ||
                                                            errors?.sale_end_at
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-2">
                                            <Label>Type</Label>

                                            {selectedType && (
                                                <input
                                                    type="hidden"
                                                    name="type_id"
                                                    value={selectedType.id}
                                                />
                                            )}

                                            <Popover
                                                open={openType}
                                                onOpenChange={setOpenType}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="justify-between"
                                                    >
                                                        {selectedType
                                                            ? selectedType.name
                                                            : 'Select Type'}
                                                        <ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>

                                                <PopoverContent className="w-56 p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search type..." />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                No type found.
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {types.map(
                                                                    (t) => (
                                                                        <CommandItem
                                                                            key={
                                                                                t.id
                                                                            }
                                                                            value={
                                                                                t.name
                                                                            }
                                                                            onSelect={() => {
                                                                                setSelectedType(
                                                                                    t,
                                                                                );
                                                                                setOpenType(
                                                                                    false,
                                                                                );
                                                                            }}
                                                                        >
                                                                            {
                                                                                t.name
                                                                            }
                                                                        </CommandItem>
                                                                    ),
                                                                )}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>

                                            <InputError
                                                message={errors.type_id}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="description">
                                                Descripton
                                            </Label>
                                            <input
                                                type="hidden"
                                                name="description"
                                                value={description}
                                            />
                                            <CustomTextEditor
                                                onChange={(decs) =>
                                                    setDescription(decs)
                                                }
                                            />
                                            <InputError
                                                message={errors.description}
                                            />
                                        </div>

                                        <MaterialColors
                                            material={material}
                                            setMaterial={setMaterial}
                                            pickerColor={pickerColor}
                                            setPickerColor={setPickerColor}
                                            showPicker={showPicker}
                                            setShowPicker={setShowPicker}
                                            colors={colors}
                                            setColors={setColors}
                                            removeColor={removeColor}
                                            errors={errors}
                                        />

                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="keywords">
                                                Keywords
                                            </Label>

                                            {/* Hidden inputs for Laravel */}
                                            {keywords.map((k, i) => (
                                                <input
                                                    key={i}
                                                    type="hidden"
                                                    name="keywords[]"
                                                    value={k}
                                                />
                                            ))}

                                            <Input
                                                id="keywords"
                                                value={keywordInput}
                                                onChange={(e) =>
                                                    setKeywordInput(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={handleKeywordKeyDown}
                                                placeholder="Press Enter to add keyword..."
                                            />

                                            <div className="mt-1 flex flex-wrap gap-2">
                                                {keywords.map((word, index) => (
                                                    <Badge
                                                        key={index}
                                                        className="flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary"
                                                    >
                                                        {word}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeKeyword(
                                                                    word,
                                                                )
                                                            }
                                                        >
                                                            <X className="h-[12px] w-[12px] cursor-pointer hover:h-[15px] hover:w-[15px]" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>

                                            <InputError
                                                message={errors.keywords}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex w-full justify-end">
                                    <Button type="submit" disabled={processing}>
                                        {processing && <Spinner />} Save
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Form>
                </div>
            </section>
        </AppLayout>
    );
};

export default CreateProduct;
