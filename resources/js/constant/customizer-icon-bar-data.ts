import ColorSideBar from '@/pages/frontend/customizer/sidebar/color-sidebar';
import LayerSideBar from '@/pages/frontend/customizer/sidebar/layer-bar';
import TextSideBar from '@/pages/frontend/customizer/sidebar/text-sibebar';
import { Layers, PaintBucket, Text } from 'lucide-react';

export const btnSideBarLink = [
    {
        name: 'Color',
        icon: PaintBucket,
        component: ColorSideBar,
    },
    {
        name: 'Text',
        icon: Text,
        component: TextSideBar
    },
    {
        name: 'Layer',
        icon: Layers,
        component: LayerSideBar
    },
];
