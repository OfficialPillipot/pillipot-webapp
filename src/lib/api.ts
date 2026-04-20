const isProd = process.env.NODE_ENV === "production";
const API_URL = process.env.NEXT_PUBLIC_API_URL || (isProd ? "https://api.pillipot.com/v1/api" : "http://localhost:3000/v1/api");

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  order: number;
}

export async function getBanners(): Promise<Banner[]> {
  const res = await fetch(`${API_URL}/banners/active`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return res.json();
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

export async function getProducts(categoryId?: string, search?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (categoryId) params.append("categoryId", categoryId);
  if (search) params.append("search", search);
  
  const url = params.toString() 
    ? `${API_URL}/customer/products?${params.toString()}`
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

// Wishlist
export async function fetchWishlist(token: string): Promise<Product[]> {
  const res = await fetch(`${API_URL}/customer/wishlist`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function toggleWishlistApi(token: string, productId: string): Promise<{ status: "added" | "removed" }> {
  const res = await fetch(`${API_URL}/customer/wishlist/toggle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error("Failed to toggle wishlist");
  return res.json();
}

export async function clearWishlistApi(token: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/customer/wishlist/clear`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

// Cart
export interface CartItemApi {
  id: string;
  product: Product;
  quantity: number;
}

export async function fetchCart(token: string): Promise<CartItemApi[]> {
  const res = await fetch(`${API_URL}/customer/cart`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function addToCartApi(token: string, productId: string, quantity: number = 1): Promise<any> {
  const res = await fetch(`${API_URL}/customer/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity }),
  });
  return res.json();
}

export async function updateCartQuantityApi(token: string, productId: string, quantity: number): Promise<any> {
  const res = await fetch(`${API_URL}/customer/cart/quantity`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity }),
  });
  return res.json();
}

export async function clearCartApi(token: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/customer/cart`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}
