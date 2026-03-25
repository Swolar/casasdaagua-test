const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const app = next({ dir: __dirname, dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const port = process.env.PORT || 3000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`> Ready on port ${port}`);
  });
});
