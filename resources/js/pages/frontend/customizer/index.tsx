import {
    CustomizerHistoryProvider,
    useCustomizerHistory,
} from '@/contexts/customizer-history-context';
import {
    SvgContainerProvider,
    useSvgContainer,
} from '@/contexts/svg-container-context';
import { handleClickonSvgContainer } from '@/lib/customizer/customizer';
import { setParts } from '@/stores/customizer/customizerSlice';
import { AppDispatch } from '@/stores/store';
import { TemplatePart } from '@/types/data';
import { CustomizerPageProps } from '@/types/page-props';
import { ReactNode, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'sonner';
import Canvas from './canvas';
import Sidebar from './sidebar/sidebar';

type EditorState = {
    parts: TemplatePart[];
    // uploadedItems: CanvasItem[];
};

// Wrapper component to provide the history context
const CustomizerWithHistory = ({ template, product }: CustomizerPageProps) => {
    return (
        <CustomizerHistoryProvider
            initialValue={{
                parts: template.parts,
                // uploadedItems: [],
            }}
        >
            <SvgContainerProvider>
                <CustomizerComponent template={template} product={product} />
            </SvgContainerProvider>
        </CustomizerHistoryProvider>
    );
};

// Main component that uses the history context
const CustomizerComponent = ({
    template,
    product,
}: CustomizerPageProps): ReactNode => {
    const dispatch = useDispatch<AppDispatch>();
    const { svgContainerRef } = useSvgContainer();

    const { present, canUndo, canRedo } = useCustomizerHistory<EditorState>();

    const [actionPerformed, setActionPerformed] = useState<boolean>(false);

    useEffect(() => {
        if (!template) return;

        if (svgContainerRef.current) {
            svgContainerRef.current.innerHTML = template.template;
        }

        dispatch(setParts(template.parts));
    }, [template, dispatch, svgContainerRef]);

    // Convenient derived getters/setters that operate on the combined state
    const parts = present.parts;
    // const uploadedItems = present.uploadedItems;

    const handleSvgContainerClick = (
        event: React.MouseEvent<HTMLDivElement>,
    ) => {
        handleClickonSvgContainer(event, parts, dispatch, svgContainerRef);
    };

    useEffect(() => {
        const hasActions = canUndo || canRedo;
        setActionPerformed(hasActions);
    }, [canUndo, canRedo]);

    return (
        <section className="flex h-screen flex-col xl:flex-row">
            <Canvas
                className="order-1 xl:order-2"
                svgContainerRef={svgContainerRef}
                handleSvgContainerClick={handleSvgContainerClick}
            />
            <Sidebar className="order-2 xl:order-1" />
            <Toaster richColors position="top-right" />
        </section>
    );
};

export default CustomizerWithHistory;
