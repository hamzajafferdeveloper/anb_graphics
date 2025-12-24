import { TemplatePart } from '../data';

export interface CustomizerIconBarData {
    name: string;
    icon: React.ReactNode;
    component: JSX.Element;
}

export interface CustomizerHistoryState {
    parts: TemplatePart[];
    // uploadedItems: CanvasItem[];
}
