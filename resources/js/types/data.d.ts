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
