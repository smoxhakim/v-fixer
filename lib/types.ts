export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  price: number;
  discountPrice?: number;
  rating: number;
  images: string[];
  shortDescription: string;
  description: string;
  specs: { label: string; value: string }[];
  stock: number;
}

export interface Order {
  id: string;
  items: any[];
  total: number;
  status: string;
  createdAt: string;
}
