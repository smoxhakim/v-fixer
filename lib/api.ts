export type Category = any;
export type Product = any;

export interface Order {
  id: string;
  items: any[];
  total: number;
  status: string;
  createdAt: string;
}

const API_URL = "http://localhost:8000/api";

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/categories/`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return res.json();
}

export async function getProducts(params?: { category?: string; featured?: boolean; trending?: boolean }): Promise<Product[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.append("category", params.category);
  if (params?.featured) searchParams.append("featured", "true");
  if (params?.trending) searchParams.append("trending", "true");
  
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const res = await fetch(`${API_URL}/products/${queryString}`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return res.json();
}

export async function getProduct(slug: string): Promise<Product | null> {
  const res = await fetch(`${API_URL}/products/${slug}/`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export async function getOrders(token: string): Promise<Order[]> {
  const res = await fetch(`${API_URL}/orders/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function login(credentials: any): Promise<{ access: string }> {
  const res = await fetch(`${API_URL}/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function createOrder(orderData: any): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error("Order creation failed");
  return res.json();
}

export async function createProduct(data: any, token: string): Promise<Product> {
  const res = await fetch(`${API_URL}/products/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

export async function createCategory(data: any, token: string): Promise<Category> {
  const res = await fetch(`${API_URL}/categories/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create category");
  return res.json();
}

export async function updateOrderStatus(id: string, status: string, token: string): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update order status");
  return res.json();
}
