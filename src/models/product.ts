export interface Product {
    id?: string;
    name: string;
    price: number;
    quantity: number;
    category: string;      // 例如 "Phones", "Laptops", "Accessories"
    description: string;
    imageUrl?: string;
    createdAt?: any;
}

export interface CartItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    subtotal: number;
}