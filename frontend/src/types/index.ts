export interface User {
    id: number
    name: string
    email: string
    role: 'BUYER' | 'GUARD' | 'ADMIN' | 'SUPERADMIN'
  }
  
  export interface TicketCategory {
    id: number
    name: string
    price: number
    quota: number
  }
  
  export interface Event {
    id: number
    title: string
    description: string
    location: string
    date: string
    imageUrl: string
    ticketCategories: TicketCategory[]
  }
  
  export interface Order {
    id: number
    eventId: number
    totalAmount: number
    status: string
    snapToken?: string
  }