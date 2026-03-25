import QRCode from "qrcode";

/**
 * Generates a QR code base64 image from a PIX EMV code string.
 * Used to render the QR code returned by PagouAi API.
 */
export async function generatePixQRCode(pixCode: string): Promise<string> {
  const base64 = await QRCode.toDataURL(pixCode, {
    width: 300,
    margin: 2,
    color: { dark: "#002A47", light: "#FFFFFF" },
  });
  return base64;
}
