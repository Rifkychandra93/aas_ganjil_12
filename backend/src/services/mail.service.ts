import nodemailer from "nodemailer";

export const sendMail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Tiket Konser" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error("Gagal mengirim email SMTP:", error);
    return false;
  }
};

export const sendInviteMail = async (to: string, role: string, temporaryPassword?: string): Promise<boolean> => {
  const loginUrl = "http://localhost:5173";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 8px;">
      <h2 style="color: #2563eb;">Undangan Bergabung ke Portal Tiket Konser</h2>
      <p>Halo,</p>
      <p>Anda telah diundang untuk bergabung sebagai <strong>${role}</strong> di sistem manajemen tiket konser.</p>
      ${temporaryPassword ? `<p>Password sementara Anda: <code>${temporaryPassword}</code></p>` : ""}
      <p>Silakan klik tautan di bawah ini untuk mengakses sistem:</p>
      <a href="${loginUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Masuk ke Portal</a>
      <p style="margin-top: 24px; color: #6b7280; font-size: 12px;">Email ini dikirim secara otomatis oleh sistem.</p>
    </div>
  `;
  return sendMail(to, `Undangan Bergabung sebagai ${role}`, html);
};

export const sendTicketReceiptMail = async (to: string, customerName: string, eventTitle: string, ticketCode: string, qrCodeDataUrl: string): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 8px;">
      <h2 style="color: #16a34a;">Pembayaran Berhasil - E-Tiket Anda</h2>
      <p>Hai <strong>${customerName}</strong>,</p>
      <p>Terima kasih telah melakukan pembelian tiket untuk konser <strong>${eventTitle}</strong>.</p>
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">KODE TIKET ANDA</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #111827; margin: 0;">${ticketCode}</p>
        <div style="margin-top: 16px;">
          <img src="${qrCodeDataUrl}" alt="QR Barcode Tiket" style="width: 200px; height: 200px;" />
        </div>
      </div>
      <p>Tunjukkan QR Code / Barcode ini kepada petugas saat memasuki venue acara.</p>
      <p style="margin-top: 24px; color: #6b7280; font-size: 12px;">Tiket Konser Official</p>
    </div>
  `;
  return sendMail(to, `E-Tiket: ${eventTitle} (${ticketCode})`, html);
};
