import midtransClient from "midtrans-client";

export interface MidtransItem {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface MidtransTransactionParams {
  orderId: string;
  grossAmount: number;
  customerDetails: {
    firstName: string;
    email: string;
  };
  items: MidtransItem[];
}

export const createMidtransSnapTransaction = async (
  params: MidtransTransactionParams
): Promise<{ snapToken: string; redirectUrl?: string }> => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  const clientKey = process.env.MIDTRANS_CLIENT_KEY || "";
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

  if (serverKey && !serverKey.includes("YOUR_SERVER_KEY")) {
    try {
      const snap = new midtransClient.Snap({
        isProduction,
        serverKey,
        clientKey,
      });

      const parameter = {
        transaction_details: {
          order_id: params.orderId,
          gross_amount: params.grossAmount,
        },
        customer_details: {
          first_name: params.customerDetails.firstName,
          email: params.customerDetails.email,
        },
        item_details: params.items.map((item) => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          name: item.name.substring(0, 50),
        })),
      };

      const transaction = await snap.createTransaction(parameter);
      return {
        snapToken: transaction.token,
        redirectUrl: transaction.redirect_url,
      };
    } catch (err) {
      console.error(err);
    }
  }

  const fallbackToken = `snap-${params.orderId}-${Date.now()}`;
  return {
    snapToken: fallbackToken,
    redirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${fallbackToken}`,
  };
};

export const getMidtransTransactionStatus = async (
  orderId: string
): Promise<{
  isPaid: boolean;
  status: string;
  transactionStatus: string;
  paymentType?: string;
  grossAmount?: number;
  raw?: any;
}> => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  const clientKey = process.env.MIDTRANS_CLIENT_KEY || "";
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

  if (!serverKey || serverKey.includes("YOUR_SERVER_KEY")) {
    return {
      isPaid: false,
      status: "UNCONFIGURED",
      transactionStatus: "unconfigured",
    };
  }

  try {
    const snap = new midtransClient.Snap({
      isProduction,
      serverKey,
      clientKey,
    });
    const result = await snap.transaction.status(orderId);
    const transactionStatus = String(result.transaction_status || "").toLowerCase();
    const fraudStatus = String(result.fraud_status || "").toLowerCase();
    const isPaid =
      transactionStatus === "settlement" ||
      (transactionStatus === "capture" && fraudStatus === "accept");

    return {
      isPaid,
      status: isPaid ? "PAID" : transactionStatus.toUpperCase(),
      transactionStatus,
      paymentType: result.payment_type,
      grossAmount: Number(result.gross_amount) || 0,
      raw: result,
    };
  } catch (err: any) {
    try {
      const baseUrl = isProduction
        ? "https://api.midtrans.com/v2"
        : "https://api.sandbox.midtrans.com/v2";
      const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
      const response = await fetch(`${baseUrl}/${orderId}/status`, {
        headers: {
          Accept: "application/json",
          Authorization: authHeader,
        },
      });
      const data: any = await response.json();
      const transactionStatus = String(data.transaction_status || "").toLowerCase();
      const fraudStatus = String(data.fraud_status || "").toLowerCase();
      const isPaid =
        transactionStatus === "settlement" ||
        (transactionStatus === "capture" && fraudStatus === "accept");

      return {
        isPaid,
        status: isPaid ? "PAID" : transactionStatus.toUpperCase(),
        transactionStatus,
        paymentType: data.payment_type,
        grossAmount: Number(data.gross_amount) || 0,
        raw: data,
      };
    } catch (fallbackErr) {
      console.error(fallbackErr);
      return {
        isPaid: false,
        status: "NOT_FOUND",
        transactionStatus: "not_found",
      };
    }
  }
};
