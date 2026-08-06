import prisma from "@/config/prisma";

export const dashboardService = async () => {

  const [
    totalUsers,
    totalArtists,
    totalEvents,
    totalOrders,
    pendingOrders,
    paidOrders,
    revenue,
    ticketsSold,
  ] = await Promise.all([

    prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    }),

    prisma.artist.count(),

    prisma.event.count(),

    prisma.order.count(),

    prisma.order.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.order.count({
      where: {
        status: "PAID",
      },
    }),

    prisma.order.aggregate({
      where: {
        status: "PAID",
      },
      _sum: {
        totalPrice: true,
      },
    }),

    prisma.orderItem.aggregate({
      _sum: {
        quantity: true,
      },
    }),

  ]);

  return {
    statusCode: 200,
    success: true,
    data: {
      totalUsers,
      totalArtists,
      totalEvents,
      totalOrders,
      pendingOrders,
      paidOrders,
      totalRevenue: revenue._sum.totalPrice ?? 0,
      ticketsSold: ticketsSold._sum.quantity ?? 0,
    },
  };

};