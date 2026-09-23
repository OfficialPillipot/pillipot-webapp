export interface Product {
  id: string;
  name: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  image?: string; // mapping from backend imageUrl
  imageUrl?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  videoUrl?: string;
  description: string;
  brand?: string;
  isAssured?: boolean;
  stockQuantity?: number;
  preparationDays?: number;
  allowPhotoUpload?: boolean;
  allowTextInput?: boolean;
  customTextPrompt?: string;
  customTextLimit?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}
