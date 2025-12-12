import React from 'react';
import { router } from '@inertiajs/react';
import admin from '@/routes/admin';
import TemplateEditor, { SelectedPart } from './template-editor';
import { Product, SvgTemplate } from '@/types/data';

const EditTemplateSection = ({ product, template }: { product: Product; template: SvgTemplate }) => {
    const handleSubmit = (payload: { product_id: number; name: string; svg: string; parts: SelectedPart[] }) => {
        router.put(admin.product.svgTemplate.update(template.id), payload);
    };

    return (
        <TemplateEditor
            product={product}
            initialSvgContent={template.template}
            // @ts-ignore template.parts shape should match SelectedPart[] — keep backward compat
            initialSelectedParts={template.parts}
            initialTemplateName={template.name}
            onSubmit={handleSubmit}
        />
    );
};

export default EditTemplateSection;
