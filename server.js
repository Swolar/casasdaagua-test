const { execSync } = require("child_process");
const path = require("path");

process.chdir(__dirname);
process.env.NODE_ENV = "production";
process.env.PORT = process.env.PORT || 3000;

require("next/dist/server/lib/start-server")
  .startServer({
    dir: __dirname,
    port: parseInt(process.env.PORT),
    hostname: "0.0.0.0",
    isDev: false,
  })
  .then(() => {
    console.log(`> Ready on port ${process.env.PORT}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
