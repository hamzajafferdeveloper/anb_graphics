import { CustomizerPageProps } from '@/types/page-props';
import { useState } from 'react';
import Canvas from './canvas';
import Sidebar from './sidebar/sidebar';

const Customizer = ({ template, product }: CustomizerPageProps) => {
    const [svgTemplate, setSvgTemplate] = useState<string>(template.template);
    return (
        <section className="flex h-screen flex-col xl:flex-row">
            <Canvas className='order-1 xl:order-2' svgTemplate={svgTemplate} />
            <Sidebar  className='order-2 xl:order-1' />
        </section>
    );
};

export default Customizer;
