import QRCode from "qrcode";
import fs from "fs";
import path from "path";

export const generateQRCode = async (
  ticketCode: string
) => {

  const folder = path.join(
    process.cwd(),
    "uploads",
    "qrcodes"
  );

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, {
      recursive: true,
    });
  }

  const fileName = `${ticketCode}.png`;

  const filePath = path.join(folder, fileName);

  await QRCode.toFile(filePath, ticketCode);

  return fileName;

};