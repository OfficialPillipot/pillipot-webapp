const isProd = process.env.NODE_ENV === "production";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || (isProd ? "https://api.pillipot.com/v1/api" : "http://localhost:3000/v1/api");

type PublicFetchOptions = {
  revalidate?: number;
  tags?: string[];
};

type ApiErrorShape = {
  message?: string | string[];
  error?: string;
};

async function fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function fetchPublicJson<T>(path: string, options: PublicFetchOptions = {}): Promise<T> {
  const { revalidate = 60, tags = [] } = options;
  return fetchJson<T>(path, {
    next: { revalidate, tags },
  });
}

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
  try {
    return await fetchPublicJson<Banner[]>("/banners/active", {
      revalidate: 300,
      tags: ["banners"],
    });
  } catch {
    return [];
  }
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
  reviewsCount?: number;
  originalPrice?: number;
  discount?: number;
}

export interface ProductOffer {
  id: string;
  productId: string;
  title: string;
  description?: string;
  code?: string;
  minQuantity: number;
  discountPercentage: number;
  isActive: boolean;
}

export async function getCategories(): Promise<Category[]> {
  try {
    return await fetchPublicJson<Category[]>("/customer/categories", {
      revalidate: 3600,
      tags: ["categories"],
    });
  } catch {
    return [];
  }
}

export async function getSubcategories(categoryId: string): Promise<Category[]> {
  try {
    return await fetchPublicJson<Category[]>(`/customer/categories/${categoryId}/subcategories`, {
      revalidate: 3600,
      tags: ["categories", `category:${categoryId}`, `subcategories:${categoryId}`],
    });
  } catch {
    return [];
  }
}

export async function getProducts(
  categoryId?: string, 
  search?: string, 
  subcategoryId?: string,
  minPrice?: number,
  maxPrice?: number,
  minRating?: number,
  sort?: string
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (categoryId) params.append("categoryId", categoryId);
  if (subcategoryId) params.append("subcategoryId", subcategoryId);
  if (search) params.append("search", search);
  if (minPrice) params.append("minPrice", minPrice.toString());
  if (maxPrice) params.append("maxPrice", maxPrice.toString());
  if (minRating) params.append("minRating", minRating.toString());
  if (sort) params.append("sort", sort);
  
  const query = params.toString();
  const path = query ? `/customer/products?${query}` : "/customer/products";

  const tags = ["products"];
  if (categoryId) tags.push(`category:${categoryId}`);
  if (subcategoryId) tags.push(`subcategory:${subcategoryId}`);
  if (search) tags.push(`search:${search.toLowerCase()}`);

  try {
    return await fetchPublicJson<Product[]>(path, {
      revalidate: search ? 60 : 300,
      tags,
    });
  } catch {
    return [];
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    return await fetchPublicJson<Product>(`/customer/products/${id}`, {
      revalidate: 300,
      tags: ["products", `product:${id}`],
    });
  } catch {
    return null;
  }
}

export async function getProductOffers(productId: string): Promise<ProductOffer[]> {
  try {
    return await fetchPublicJson<ProductOffer[]>(`/customer/offers/product/${productId}`, {
      revalidate: 300,
      tags: ["offers", `productOffers:${productId}`],
    });
  } catch {
    return [];
  }
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

export type RegisterDto = Record<string, string>;

export async function login(username: string, password: string): Promise<{ accessToken: string; user: User } | null> {
  try {
    return await fetchJson<{ accessToken: string; user: User }>("/auth/customer/login", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    return null;
  }
}

export async function register(dto: RegisterDto): Promise<{ accessToken: string; user: User } | null> {
  try {
    return await fetchJson<{ accessToken: string; user: User }>("/auth/customer/register", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
  } catch {
    return null;
  }
}

export async function getMe(token: string): Promise<User | null> {
  try {
    return await fetchJson<User>("/auth/me", {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return null;
  }
}

// Wishlist
export async function fetchWishlist(token: string): Promise<Product[]> {
  try {
    return await fetchJson<Product[]>("/customer/wishlist", {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return [];
  }
}

export async function toggleWishlistApi(token: string, productId: string): Promise<{ status: "added" | "removed" }> {
  return fetchJson<{ status: "added" | "removed" }>("/customer/wishlist/toggle", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId }),
  });
}

export async function clearWishlistApi(token: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/customer/wishlist/clear`, {
    method: "DELETE",
    cache: "no-store",
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
  try {
    return await fetchJson<CartItemApi[]>("/customer/cart", {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return [];
  }
}

export type CartMutationResponse = {
  success?: boolean;
  message?: string;
};

export async function addToCartApi(token: string, productId: string, quantity: number = 1): Promise<CartMutationResponse> {
  return fetchJson<CartMutationResponse>("/customer/cart", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateCartQuantityApi(token: string, productId: string, quantity: number): Promise<CartMutationResponse> {
  return fetchJson<CartMutationResponse>("/customer/cart/quantity", {
    method: "PATCH",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function clearCartApi(token: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/customer/cart`, {
    method: "DELETE",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}
export interface CustomerAddress {
  id: string;
  customerName: string;
  deliveryAddress: string;
  phone: string;
  secondaryPhone?: string;
  pincode: string;
  postOffice: string;
  email?: string;
  state: string;
  district: string;
  isDefault: boolean;
  addressType: string;
}

export async function getAddresses(token: string): Promise<CustomerAddress[]> {
  try {
    return await fetchJson<CustomerAddress[]>("/customer/addresses", {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return [];
  }
}

export async function addAddress(token: string, data: Partial<CustomerAddress>): Promise<CustomerAddress | null> {
  try {
    return await fetchJson<CustomerAddress>("/customer/addresses", {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch {
    return null;
  }
}

export type AutofillAddressResponse = Partial<CustomerAddress> & {
  found?: boolean;
};

export async function autofillAddress(phone: string): Promise<AutofillAddressResponse | null> {
  try {
    return await fetchJson<AutofillAddressResponse>(`/customer/autofill?phone=${encodeURIComponent(phone)}`, {
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

export type CheckoutCartItem = {
  id: string;
  cartQuantity?: number;
  quantity?: number;
  price: number;
  name?: string;
};

export type CheckoutCustomerInfo = Partial<CustomerAddress> & {
  email?: string;
  paymentMethod?: string;
};

export async function checkout(cart: CheckoutCartItem[], customerInfo: CheckoutCustomerInfo, appliedOffer?: any): Promise<{
  orderId: string;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayAmount?: number;
  razorpayKeyId?: string;
  currency?: string;
}> {
  const res = await fetch(`${API_URL}/orders/checkout`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart, customerInfo, appliedOffer }),
  });
  if (!res.ok) {
    let msg = "Something went wrong. Please try again.";
    try {
      const data = (await res.json()) as ApiErrorShape;
      if (data.message) {
        msg = Array.isArray(data.message) ? data.message[0] : data.message;
      } else if (data.error) {
        msg = data.error;
      }
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function verifyPayment(body: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/orders/verify-payment`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = "Payment verification failed";
    try {
      const data = (await res.json()) as ApiErrorShape;
      if (data.message) {
        msg = Array.isArray(data.message) ? data.message[0] : data.message;
      }
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function failPayment(body: {
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  errorCode?: string;
  errorDescription?: string;
}): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/orders/fail-payment`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    return { success: false };
  }
  return res.json();
}

export async function deleteAddress(token: string, id: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/customer/addresses/${id}`, {
    method: "DELETE",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

export async function setDefaultAddress(token: string, id: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/customer/addresses/${id}/default`, {
    method: "POST",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

export async function updateAddress(token: string, id: string, data: Partial<CustomerAddress>): Promise<CustomerAddress | null> {
  try {
    return await fetchJson<CustomerAddress>(`/customer/addresses/${id}`, {
      method: "PATCH",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch {
    return null;
  }
}

export type OrderApiItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  sellingAmount: number;
  imageUrl?: string;
  deliveryFee?: number;
};

export type OrderApiSummary = {
  orderId: string;
  createdAt: string;
  total: number;
  customerName?: string;
  status: string;
  trackingId?: string | null;
  items: OrderApiItem[];
  paymentMethod?: string;
  paymentStatus?: string;
};

export async function getMyOrders(token: string): Promise<OrderApiSummary[]> {
  try {
    return await fetchJson<OrderApiSummary[]>("/orders/my-orders", {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return [];
  }
}

export type OrderApiDetail = OrderApiSummary & {
  deliveryAddress?: string;
  phone?: string;
  currentStep: number;
  statusSteps: string[];
  grandTotal: number;
  orderType: string;
  postOffice: string;
  district: string;
  state: string;
  pincode: string;
  trackingId?: string | null;
  paymentMethod?: string;
  paymentStatus?: string;
};

export async function getOrderDetails(token: string, orderId: string): Promise<OrderApiDetail | null> {
  try {
    return await fetchJson<OrderApiDetail>(`/orders/track/${orderId}`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return null;
  }
}

export async function downloadInvoice(token: string, orderId: string) {
  const res = await fetch(`${API_URL}/orders/${orderId}/invoice`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return;
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${orderId}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}

export async function cancelOrderApi(token: string, orderId: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
    method: "POST",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

export type Review = {
  id: string;
  productId: string;
  customerId: string;
  orderId: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: {
    customerName: string;
  };
};

export async function submitReview(
  token: string, 
  productId: string, 
  rating: number, 
  orderId: string, 
  comment?: string
): Promise<any> {
  const res = await fetch(`${API_URL}/customer/reviews`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, rating, orderId, comment }),
  });

  if (!res.ok) {
    let msg = "Failed to submit review";
    try {
      const data = await res.json();
      if (data.message) {
        msg = Array.isArray(data.message) ? data.message[0] : data.message;
      } else if (data.error) {
        msg = data.error;
      }
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    return await fetchJson<Review[]>(`/customer/reviews/${productId}`, {
      cache: "no-store",
    });
  } catch {
    return [];
  }
}

export async function registerVendor(data: any): Promise<{ message: string; vendorId: string }> {
  const res = await fetch(`${API_URL}/vendor/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let msg = "Registration failed";
    try {
      const errorData = await res.json();
      msg = errorData.message || (Array.isArray(errorData.message) ? errorData.message[0] : errorData.message) || msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}
