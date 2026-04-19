const isProd = process.env.NODE_ENV === "production";
const API_URL = process.env.NEXT_PUBLIC_API_URL || (isProd ? "https://api.pillipot.com/v1/api" : "http://localhost:3000/v1/api");

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  productCode?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  videoUrl?: string;
  categoryId?: string;
  categoryName?: string;
  sku?: string;
  price: number;
  stockQuantity: number;
  brand?: string;
  rating?: number;
  reviews?: number;
  originalPrice?: number;
  discount?: number;
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/customer/categories`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return res.json();
}

export async function getProducts(categoryId?: string): Promise<Product[]> {
  const url = categoryId 
    ? `${API_URL}/customer/products?categoryId=${categoryId}`
    : `${API_URL}/customer/products`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return res.json();
}

export async function getProduct(id: string): Promise<Product | null> {
  const res = await fetch(`${API_URL}/customer/products/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}
export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

export async function login(username: string, password: string): Promise<{ accessToken: string; user: User } | null> {
  const res = await fetch(`${API_URL}/auth/customer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function register(dto: any): Promise<{ accessToken: string; user: User } | null> {
  const res = await fetch(`${API_URL}/auth/customer/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getMe(token: string): Promise<User | null> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}
