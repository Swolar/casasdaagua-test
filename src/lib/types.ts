export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  description: string;
  specifications: Record<string, string>;
  images: string[];
  price: number;
  priceFrom?: number;
  discount?: number;
  installments?: {
    count: number;
    value: number;
  };
  pixDiscount?: number;
  sku: string;
  inStock: boolean;
  isSustainable?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface Category {
  name: string;
  slug: string;
  image: string;
  productCount: number;
  subcategories?: { name: string; slug: string }[];
}

export interface Banner {
  id: string;
  image: string;
  imageMobile?: string;
  alt: string;
  link?: string;
}
