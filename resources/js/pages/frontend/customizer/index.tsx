import {
    CustomizerHistoryProvider,
    useCustomizerHistory,
} from '@/contexts/customizer-history-context';
import {
    SvgContainerProvider,
    useSvgContainer,
} from '@/contexts/svg-container-context';
import { handleClickonSvgContainer, handlePaintPart } from '@/lib/customizer/customizer';
import { setParts } from '@/stores/customizer/customizerSlice';
import { AppDispatch } from '@/stores/store';
import { CustomizerHistoryState } from '@/types/customizer/customizer';
import { CustomizerPageProps } from '@/types/page-props';
import { ReactNode, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'sonner';
import Canvas from './canvas';
import Sidebar from './sidebar/sidebar';

// Wrapper component to provide the history context
const CustomizerWithHistory = ({ template, product }: CustomizerPageProps) => {
    return (
        <CustomizerHistoryProvider
            initialValue={{
                parts: template.parts,
                uploadedItems: [],
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

    const { present, undo, redo } =
        useCustomizerHistory<CustomizerHistoryState>();

    useEffect(() => {
        if (!template) return;

        if (svgContainerRef.current) {
            svgContainerRef.current.innerHTML = template.template;
        }

        dispatch(setParts(template.parts));
    }, [template, dispatch, svgContainerRef]);

    // Convenient derived getters/setters that operate on the combined state
    const parts = present.parts;
    const uploadedItems = present.uploadedItems;

    const handleSvgContainerClick = (
        event: React.MouseEvent<HTMLDivElement>,
    ) => {
        handleClickonSvgContainer(event, parts, dispatch);
    };

    // Keyboard shortcuts for undo / redo
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().includes('MAC');
            const mod = isMac ? e.metaKey : e.ctrlKey;

            if (!mod) return;

            // Undo: Ctrl/Cmd+Z
            if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
                return;
            }
            // Redo: Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y
            if (
                (e.key.toLowerCase() === 'z' && e.shiftKey) ||
                e.key.toLowerCase() === 'y'
            ) {
                e.preventDefault();
                redo();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [undo, redo]);

    // Update Redux and SVG when present.parts changes
    useEffect(() => {
        if (!present.parts) return;

        // Update Redux
        dispatch(setParts(present.parts));

        // Update SVG
        if (svgContainerRef.current) {
            present.parts.forEach((part) => {
                if (part.color && svgContainerRef.current) {
                    // @ts-ignore
                    handlePaintPart(
                        part,
                        part.color,
                        svgContainerRef.current,
                    );
                }
            });
        }
    }, [present.parts, dispatch, svgContainerRef]);

    // Sync uploadedItems from history into Redux so undo/redo affects canvas items
    useEffect(() => {
        if (!present.uploadedItems) return;

        // Lazy import to avoid circular issues
        dispatch({ type: 'canvas/setItems', payload: present.uploadedItems });
    }, [present.uploadedItems, dispatch]);

    // Initial setup
    useEffect(() => {
        if (!template) return;
        if (svgContainerRef.current) {
            svgContainerRef.current.innerHTML = template.template;
        }
    }, [template, svgContainerRef]);

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
