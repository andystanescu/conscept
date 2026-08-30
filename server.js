const http = require("node:http");
const next = require("next");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const hostname = "0.0.0.0";
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((request, response) => handle(request, response)).listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
