export type SaleStatus = 'Pending' | 'Paid' | 'Completed' | 'Cancelled';

export interface Sale {
    id?: string;
    customerName: string;
    productName: string;
    quantity: number;
    total: number;
    paymentMethod: string;
    status: SaleStatus;
    createdAt?: unknown;
}
