import { router } from '@inertiajs/react';
import React from 'react';
import admin from '@/routes/admin';
import TemplateEditor, { SelectedPart } from './template-editor';
import { Product } from '@/types/data';

const AddTemplateSection = ({ product }: { product: Product }) => {
    const handleSubmit = (payload: { product_id: number; name: string; svg: string; parts: SelectedPart[] }) => {
        router.post(admin.product.svgTemplate.store(product.slug), payload);
    };

    return <TemplateEditor product={product} onSubmit={handleSubmit} />;
};

export default AddTemplateSection;
