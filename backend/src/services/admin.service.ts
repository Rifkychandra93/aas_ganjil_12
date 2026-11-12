import prisma from "@/config/prisma";

export const dashboardService = async () => {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);

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
    yearlyOrders,
    ticketCategories,
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
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfYear,
        },
      },
      include: {
        items: true,
      },
    }),
    prisma.ticketCategory.findMany({
      select: {
        name: true,
        quota: true,
        remainingQuota: true,
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

  const dayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  const weeklyStats = dayNames.map((day) => ({
    day,
    revenue: 0,
    tickets: 0,
  }));

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const monthlyStats = monthNames.map((month) => ({
    month,
    revenue: 0,
    tickets: 0,
  }));

  yearlyOrders.forEach((order) => {
    const dayIdx = (order.createdAt.getDay() + 6) % 7;
    const monthIdx = order.createdAt.getMonth();
    const qty = order.items.reduce((acc, curr) => acc + curr.quantity, 0);

    weeklyStats[dayIdx].tickets += qty;
    monthlyStats[monthIdx].tickets += qty;

    if (order.status === "PAID") {
      weeklyStats[dayIdx].revenue += order.totalPrice;
      monthlyStats[monthIdx].revenue += order.totalPrice;
    }
  });

  const totalSoldAll = ticketCategories.reduce(
    (acc, curr) => acc + Math.max(0, curr.quota - curr.remainingQuota),
    0
  );

  const categoryDistribution = ticketCategories.slice(0, 5).map((cat) => {
    const sold = Math.max(0, cat.quota - cat.remainingQuota);
    const percentage = totalSoldAll > 0 ? Math.round((sold / totalSoldAll) * 100) : 0;
    return {
      name: cat.name,
      sold,
      quota: cat.quota,
      percentage,
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
    weeklyStats,
    monthlyStats,
    categoryDistribution,
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
