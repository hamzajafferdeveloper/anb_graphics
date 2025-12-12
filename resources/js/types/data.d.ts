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
    template: SvgTemplate;
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

export interface SvgTemplate {
  id: number
  name: string
  product_id: number
  template: string
  parts: TemplatePart[]
  created_at: string
  updated_at: string
}

export interface TemplatePart {
  id: number
  part_id: number
  template_id: number
  type: string
  color: string
  created_at: string
  updated_at: string
}

export interface Coupon {
    id: number;
    coupon: string;
    discount?: number | null;
    limit?: number | null;
    status?: number | null;
    expires_in?: number; // unix timestamp in seconds
    created_at: string;
    updated_at: string;
}
