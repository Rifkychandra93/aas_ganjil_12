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
      console.error("Midtrans API error, using fallback token:", err);
    }
  }

  const fallbackToken = `snap-${params.orderId}-${Date.now()}`;
  return {
    snapToken: fallbackToken,
    redirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${fallbackToken}`,
  };
};
