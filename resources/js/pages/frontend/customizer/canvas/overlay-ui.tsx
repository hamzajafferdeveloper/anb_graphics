import { RootState } from '@/stores/store';
import { CanvasItem } from '@/types/customizer/uploaded-items';
import { useSelector } from 'react-redux';
import DisplayItem from './display-item';

const OverlayUI = () => {
    const items = useSelector(
        (state: RootState) => state.canvasItem?.items || [],
    );


    return (
        <div className="pointer-events-none absolute inset-0 z-20">
            {items.map((item: CanvasItem) => (
                <div key={item.id} >
                    <DisplayItem item={item} />
                </div>
            ))}
        </div>
    );
};

export default OverlayUI;
