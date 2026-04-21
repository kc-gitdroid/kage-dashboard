import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import { join, normalize } from "node:path";

const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT || 3003);
const BACKEND_HOST = process.env.BACKEND_HOST || "127.0.0.1";
const BACKEND_PORT = Number(process.env.BACKEND_PORT || 3002);
const STATIC_ROOT = join(process.cwd(), ".next-kage", "static");

const mimeTypes = {
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".map": "application/json; charset=UTF-8",
  ".txt": "text/plain; charset=UTF-8",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

function getMimeType(pathname) {
  const extension = Object.keys(mimeTypes).find((value) => pathname.endsWith(value));
  return extension ? mimeTypes[extension] : "application/octet-stream";
}

function sendNotFound(response) {
  response.writeHead(404, { "Content-Type": "text/plain; charset=UTF-8" });
  response.end("Not Found");
}

function serveStatic(pathname, response) {
  const relativePath = pathname.replace(/^\/_next\/static\//, "");
  const resolvedPath = normalize(join(STATIC_ROOT, relativePath));

  if (!resolvedPath.startsWith(STATIC_ROOT)) {
    sendNotFound(response);
    return;
  }

  if (!existsSync(resolvedPath) || !statSync(resolvedPath).isFile()) {
    sendNotFound(response);
    return;
  }

  response.writeHead(200, {
    "Content-Type": getMimeType(resolvedPath),
    "Cache-Control": "public, max-age=31536000, immutable",
  });

  createReadStream(resolvedPath).pipe(response);
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || `${HOST}:${PORT}`}`);

  if (requestUrl.pathname.startsWith("/_next/static/")) {
    serveStatic(requestUrl.pathname, response);
    return;
  }

  const proxyRequest = http.request(
    {
      host: BACKEND_HOST,
      port: BACKEND_PORT,
      method: request.method,
      path: `${requestUrl.pathname}${requestUrl.search}`,
      headers: {
        ...request.headers,
        host: `${BACKEND_HOST}:${BACKEND_PORT}`,
      },
    },
    (proxyResponse) => {
      response.writeHead(proxyResponse.statusCode || 500, proxyResponse.headers);
      proxyResponse.pipe(response);
    },
  );

  proxyRequest.on("error", (error) => {
    response.writeHead(502, { "Content-Type": "text/plain; charset=UTF-8" });
    response.end(`Proxy error: ${error.message}`);
  });

  request.pipe(proxyRequest);
});

server.listen(PORT, HOST, () => {
  console.log(`Proxy ready on http://${HOST}:${PORT} -> http://${BACKEND_HOST}:${BACKEND_PORT}`);
});
