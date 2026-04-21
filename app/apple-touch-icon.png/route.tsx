import AppleIcon, { contentType, size } from "../apple-icon";

export { contentType, size };

export async function GET() {
  return AppleIcon();
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Content-Type": contentType,
    },
  });
}
