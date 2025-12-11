export interface ProductCategory {
    id: number;
    name: string;
    slug: string;
    image?: string;
    created_at: string;
    updated_at: string;
}

export interface ProductBrand {
    id: number;
    name: string;
    slug: string;
    image?: string;
    created_at: string;
    updated_at: string;
}

export interface ProductType {
    id: number;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
}

export interface ProductColor {
    id: number;
    name: string;
    slug: string;
    code: string;
    created_at: string;
    updated_at: string;
}

export interface ProductImage {
    id: number;
    product_id: number;
    path: string;
    alt?: string;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    sale_price: number;
    sale_start_at: any;
    sale_end_at: any;
    product_type_id: number;
    product_brand_id: number;
    product_category_id: number;
    brand: ProductBrand;
    category: ProductCategory;
    type: ProductType;
    material: string;
    status: string;
    colors: string[];
    keywords: string[];
    meta: Meta;
    created_at: string;
    updated_at: string;
    category: any;
    type: any;
    brand: any;
    images: ProductImage[];
}
