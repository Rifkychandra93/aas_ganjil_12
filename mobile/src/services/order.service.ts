import api from './api';
import { TicketOrder } from '../types';

export const orderService = {
  createOrder: async (payload: {
    eventId: string;
    categoryId: string;
    quantity: number;
    paymentMethod?: string;
  }): Promise<{ order: any; snapToken?: string; ticketCode: string }> => {
    const response = await api.post('/orders', {
      eventId: payload.eventId,
      categoryId: payload.categoryId,
      quantity: payload.quantity,
      paymentMethod: payload.paymentMethod || 'MIDTRANS',
    });

    const resData = response.data;
    if (!resData.success && resData.statusCode >= 400) {
      throw new Error(resData.message || 'Gagal membuat pesanan');
    }

    const orderData = resData.data || resData;
    const snapToken = resData.snapToken || orderData.snapToken;
    const ticketCode = orderData.ticketCode || resData.ticketCode;

    return {
      order: orderData,
      snapToken,
      ticketCode,
    };
  },

  getMyOrders: async (): Promise<TicketOrder[]> => {
    try {
      const response = await api.get('/tickets/my');
      const resData = response.data;
      const data: any[] = Array.isArray(resData)
        ? resData
        : Array.isArray(resData?.data)
        ? resData.data
        : [];

      return data.map((t) => ({
        id: t.id || t.orderId,
        orderId: t.orderId || t.id,
        ticketCode: t.ticketCode || 'TIK-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        eventTitle: t.eventTitle || 'Konser Musik',
        artistName: t.artistName || '',
        eventDate: t.eventDate,
        location: t.location || 'Indonesia Arena',
        poster: t.poster || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&auto=format&fit=crop&q=80',
        categoryName: t.categoryName || 'Standard',
        qrCode: t.qrCode,
        barcode: t.barcode,
        isUsed: !!t.isUsed || t.status === 'USED',
        status: t.status || 'PENDING',
        totalPrice: t.totalPrice || 0,
        quantity: t.quantity || 1,
        snapToken: t.snapToken,
        paidAt: t.paidAt,
        createdAt: t.createdAt,
      }));
    } catch (e: any) {
      console.warn('Gagal memuat tiket saya:', e.message);
      return [];
    }
  },

  verifyPayment: async (ticketCodeOrId: string) => {
    const response = await api.post('/orders/verify', { ticketCode: ticketCodeOrId });
    return response.data;
  },

  simulateSandboxPayment: async (ticketCodeOrId: string) => {
    const response = await api.post('/orders/simulate-sandbox', { ticketCode: ticketCodeOrId });
    return response.data;
  },

  scanTicket: async (code: string) => {
    const response = await api.post('/orders/scan', { qrCode: code, ticketCode: code });
    return response.data;
  },
};
