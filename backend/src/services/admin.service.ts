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
    recentOrders,
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
    prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        items: {
          include: {
            ticketCategory: {
              include: {
                event: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const transactions = recentOrders.map((order) => {
    const firstItem = order.items[0];
    const totalQty = order.items.reduce((acc, curr) => acc + curr.quantity, 0);

    return {
      id: order.id,
      buyerName: order.user?.name || "Customer",
      eventTitle: firstItem?.ticketCategory?.event?.title || "Konser Musik",
      categoryName: firstItem?.ticketCategory?.name || "Standard",
      quantity: totalQty || 1,
      totalAmount: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    };
  });

  const stats = {
    totalRevenue: revenue._sum.totalPrice ?? 0,
    totalTicketsSold: ticketsSold._sum.quantity ?? 0,
    totalEvents,
    totalUsers,
    totalArtists,
    totalOrders,
    pendingOrders,
    paidOrders,
  };

  return {
    statusCode: 200,
    success: true,
    stats,
    transactions,
    data: {
      stats,
      transactions,
    },
  };
};