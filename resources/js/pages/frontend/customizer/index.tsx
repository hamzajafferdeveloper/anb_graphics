import {
    CustomizerHistoryProvider,
    useCustomizerHistory,
} from '@/contexts/CustomizerHistoryContext';
import { handleClickonSvgContainer } from '@/lib/customizer/customizer';
import { setParts } from '@/stores/customizer/customizerSlice';
import { AppDispatch, RootState } from '@/stores/store';
import { TemplatePart } from '@/types/data';
import { CustomizerPageProps } from '@/types/page-props';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
            <CustomizerComponent template={template} product={product} />
        </CustomizerHistoryProvider>
    );
};

// Main component that uses the history context
const CustomizerComponent = ({
    template,
    product,
}: CustomizerPageProps): ReactNode => {
    const dispatch = useDispatch<AppDispatch>();

    const templateParts = useSelector(
        (state: RootState) => state.customizer.parts,
    );

    const {
        present,
        setLive,
        setAndCommit,
        undo,
        redo,
        canUndo,
        canRedo,
        resetHistory,
        commit,
    } = useCustomizerHistory<EditorState>();

    const svgContainerRef = useRef<HTMLDivElement | null>(null);
    const [actionPerformed, setActionPerformed] = useState<boolean>(false);

    useEffect(() => {
        if (!template) return;

        if (svgContainerRef.current) {
            svgContainerRef.current.innerHTML = template.template;
        }

        dispatch(setParts(template.parts));
    }, [template, dispatch]);

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
