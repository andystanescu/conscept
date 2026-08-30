const http = require("node:http");
const next = require("next");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const hostname = "0.0.0.0";
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((request, response) => {
    // GoDaddy's proxy can pass its internal listener address as Host. Keep
    // redirects on the public preview/domain by preferring its forwarded host.
    const forwardedHost = request.headers["x-forwarded-host"];
    const forwardedProto = request.headers["x-forwarded-proto"];
    if (typeof forwardedHost === "string" && forwardedHost.trim()) {
      request.headers.host = forwardedHost.split(",")[0].trim();
    }
    if (typeof forwardedProto === "string" && forwardedProto.trim()) {
      request.headers["x-forwarded-proto"] = forwardedProto.split(",")[0].trim();
    }
    return handle(request, response);
  }).listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
