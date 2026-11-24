import api from './api';
import { EventItem, Artist } from '../types';

export const DEFAULT_ARTISTS: Artist[] = [
  {
    id: 'artist-1',
    name: 'Sheila On 7',
    genre: 'Pop Rock',
    photo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    description: 'Band pop legendaris asal Yogyakarta yang selalu dinantikan penggemar di seluruh Indonesia.',
  },
  {
    id: 'artist-2',
    name: 'NOAH',
    genre: 'Pop Rock',
    photo: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    description: 'Band papan atas Indonesia dengan hits monumental dan panggung spektakuler.',
  },
  {
    id: 'artist-3',
    name: 'Tulus',
    genre: 'Pop / Soul',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    description: 'Penyanyi dan penulis lagu dengan lirik puitis dan suara khas menyentuh hati.',
  },
  {
    id: 'artist-4',
    name: 'Pamungkas',
    genre: 'Indie Pop',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    description: 'Musisi independen dengan karya-karya hit global seperti To The Bone.',
  },
  {
    id: 'artist-5',
    name: 'JKT48',
    genre: 'Pop Idol',
    photo: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    description: 'Grup idola wanita ternama dengan penampilan penuh energi dan antusiasme tinggi.',
  },
  {
    id: 'artist-6',
    name: 'Nadin Amizah',
    genre: 'Folk / Indie',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    description: 'Penyanyi muda berbakat dengan lirik mendalam dan estetika musik yang anggun.',
  },
];

export const DEFAULT_CONCERTS: EventItem[] = [
  {
    id: 'concert-1',
    title: 'Sheila On 7 - Tunggu Aku Di Jakarta',
    location: 'GBK Senayan, Jakarta',
    description: 'Konser megah nostalgia Sheila On 7 dengan membawakan lebih dari 20 lagu hits terpopuler sepanjang masa.',
    formattedDate: '8 Januari 2026 - 19.00 WIB',
    formattedPrice: 'Dari Rp250.000',
    rawPrice: 250000,
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'concert-2',
    title: 'NOAH - The Great Journey',
    location: 'Sentul International Convention Center, Bogor',
    description: 'Penampilan istimewa NOAH sebelum masa rehat panjang mereka, menghadirkan tata panggung dan visual megah.',
    formattedDate: '1 Maret 2026 - 20.00 WIB',
    formattedPrice: 'Dari Rp300.000',
    rawPrice: 300000,
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'concert-3',
    title: 'Nadin Amizah - Untuk Dunia, Cinta, dan Kotornya',
    location: 'Stadion Madya, Depok',
    description: 'Konser intim nan magis oleh Nadin Amizah dengan tata panggung teatrikal yang memikat.',
    formattedDate: '15 Agustus 2026 - 19.00 WIB',
    formattedPrice: 'Dari Rp400.000',
    rawPrice: 400000,
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
  },
];

export const formatEventDate = (dateStr?: string): string => {
  if (!dateStr) return 'Segera Hadir';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const dateFormatted = d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeFormatted = d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${dateFormatted} - ${timeFormatted} WIB`;
};

export const formatPrice = (price: number): string => {
  return 'Rp ' + Number(price || 0).toLocaleString('id-ID');
};

export const eventService = {
  getEvents: async (): Promise<EventItem[]> => {
    try {
      const response = await api.get('/events');
      const resData = response.data;
      const rawEvents: any[] = Array.isArray(resData)
        ? resData
        : Array.isArray(resData?.data)
        ? resData.data
        : [];

      if (rawEvents.length > 0) {
        const mappedEvents: EventItem[] = rawEvents.map((evt) => {
          const categories = evt.ticketCategories || evt.ticketTypes || [];
          let minPrice = 250000;
          if (categories.length > 0) {
            const prices = categories
              .map((c: any) => Number(c.price))
              .filter((p: number) => !isNaN(p) && p > 0);
            if (prices.length > 0) {
              minPrice = Math.min(...prices);
            }
          }

          const posterUrl = evt.imageUrl || evt.poster || '';
          const validPoster = posterUrl.startsWith('http')
            ? posterUrl
            : posterUrl.startsWith('/uploads')
            ? `${api.defaults.baseURL?.replace('/api', '')}${posterUrl}`
            : 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&auto=format&fit=crop&q=80';

          return {
            id: evt.id,
            title: evt.title,
            description: evt.description,
            location: evt.location || 'Indonesia',
            eventDate: evt.eventDate || evt.date,
            formattedDate: formatEventDate(evt.eventDate || evt.date),
            formattedPrice: `Dari ${formatPrice(minPrice)}`,
            rawPrice: minPrice,
            imageUrl: validPoster,
            poster: validPoster,
            status: evt.status,
            artist: evt.artist,
            ticketCategories: categories,
            ticketTypes: categories,
          };
        });

        // Gabungkan dengan default concerts agar tampilan tetap kaya jika backend baru memiliki sedikit konser
        const merged = [
          ...mappedEvents,
          ...DEFAULT_CONCERTS.filter(
            (dc) => !mappedEvents.some((me) => me.title.toLowerCase() === dc.title.toLowerCase())
          ),
        ];
        return merged;
      }
    } catch (error) {
      console.warn('Gagal mengambil event dari backend, menggunakan data default:', error);
    }
    return DEFAULT_CONCERTS;
  },

  getEventById: async (id: string): Promise<EventItem> => {
    try {
      const response = await api.get(`/events/${id}`);
      const evt = response.data?.data || response.data;

      if (evt && evt.id) {
        const categories = evt.ticketCategories || evt.ticketTypes || [];
        const posterUrl = evt.imageUrl || evt.poster || '';
        const validPoster = posterUrl.startsWith('http')
          ? posterUrl
          : posterUrl.startsWith('/uploads')
          ? `${api.defaults.baseURL?.replace('/api', '')}${posterUrl}`
          : 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&auto=format&fit=crop&q=80';

        return {
          id: evt.id,
          title: evt.title,
          description: evt.description,
          location: evt.location || 'Indonesia',
          eventDate: evt.eventDate || evt.date,
          formattedDate: formatEventDate(evt.eventDate || evt.date),
          imageUrl: validPoster,
          poster: validPoster,
          status: evt.status,
          artist: evt.artist,
          ticketCategories: categories,
          ticketTypes: categories,
        };
      }
    } catch (e) {
      console.warn(`Gagal mengambil detail event ${id} dari API:`, e);
    }

    // Fallback ke default concert jika cocok id
    const found = DEFAULT_CONCERTS.find((c) => c.id === id);
    if (found) {
      return {
        ...found,
        ticketCategories: [
          { id: `${found.id}-cat-1`, name: 'Festival / Regular', price: found.rawPrice || 250000, quota: 100, remainingQuota: 85 },
          { id: `${found.id}-cat-2`, name: 'VIP Front Row', price: (found.rawPrice || 250000) * 2, quota: 50, remainingQuota: 30 },
          { id: `${found.id}-cat-3`, name: 'VVIP Backstage Experience', price: (found.rawPrice || 250000) * 3.5, quota: 20, remainingQuota: 8 },
        ],
      };
    }

    throw new Error('Konser tidak ditemukan');
  },

  getArtists: async (): Promise<Artist[]> => {
    try {
      const response = await api.get('/artists');
      const resData = response.data;
      const rawArtists: any[] = Array.isArray(resData)
        ? resData
        : Array.isArray(resData?.data)
        ? resData.data
        : [];

      if (rawArtists.length > 0) {
        const mapped: Artist[] = rawArtists.map((a, idx) => ({
          id: a.id,
          name: a.name,
          description: a.description || 'Penyanyi & Musisi ternama',
          genre: 'Pop / Music',
          photo: a.photo
            ? (a.photo.startsWith('http') ? a.photo : `${api.defaults.baseURL?.replace('/api', '')}${a.photo}`)
            : DEFAULT_ARTISTS[idx % DEFAULT_ARTISTS.length].photo,
        }));

        const merged = [
          ...mapped,
          ...DEFAULT_ARTISTS.filter(
            (da) => !mapped.some((m) => m.name.toLowerCase() === da.name.toLowerCase())
          ),
        ];
        return merged;
      }
    } catch (error) {
      console.warn('Gagal mengambil artis dari backend, menggunakan data default:', error);
    }
    return DEFAULT_ARTISTS;
  },
};
