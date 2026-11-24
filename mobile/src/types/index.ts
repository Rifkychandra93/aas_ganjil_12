export type Role = 'SUPERADMIN' | 'ADMIN' | 'CUSTOMER' | 'GUARD';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface Artist {
  id: string;
  name: string;
  description?: string | null;
  photo?: string | null;
  genre?: string;
}

export interface TicketCategory {
  id: string;
  eventId?: string;
  name: string;
  price: number;
  quota: number;
  remainingQuota?: number;
}

export interface EventItem {
  id: string;
  artistId?: string;
  title: string;
  description?: string;
  location: string;
  poster?: string | null;
  imageUrl?: string | null;
  date?: string;
  eventDate?: string;
  formattedDate?: string;
  formattedPrice?: string;
  rawPrice?: number;
  status?: 'OPEN' | 'CLOSED';
  artist?: Artist;
  ticketTypes?: TicketCategory[];
  ticketCategories?: TicketCategory[];
}

export type OrderStatus = 'PENDING' | 'PAID' | 'USED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  ticketCategoryId: string;
  quantity: number;
  price: number;
  subtotal: number;
  ticketCategory?: TicketCategory;
}

export interface TicketOrder {
  id: string;
  orderId?: string;
  userId?: string;
  ticketCode: string;
  eventTitle: string;
  artistName?: string;
  eventDate?: string;
  location?: string;
  poster?: string;
  categoryName: string;
  qrCode?: string;
  barcode?: string;
  isUsed: boolean;
  status: OrderStatus;
  totalPrice: number;
  quantity: number;
  snapToken?: string;
  paymentMethod?: string;
  paidAt?: string | null;
  usedAt?: string | null;
  createdAt?: string;
  items?: OrderItem[];
}
