require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const { connectDB } = require("./src/config/db");
const { initSocket } = require("./src/socket");

const galleryRoutes = require("./src/routes/gallery");
const videosRoutes = require("./src/routes/videos");
const inventoryRoutes = require("./src/routes/inventory");
const bookRoutes = require("./src/routes/book");
const interestRoutes = require("./src/routes/interest");

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

async function main() {
  await connectDB();

  const app = express();
  app.use(cors({ origin: CORS_ORIGIN }));
  app.use(express.json());

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: CORS_ORIGIN, methods: ["GET", "POST"] },
  });

  // Routes that need to broadcast (e.g. /book) read io off the app.
  app.set("io", io);

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/gallery", galleryRoutes);
  app.use("/videos", videosRoutes);
  app.use("/inventory", inventoryRoutes);
  app.use("/book", bookRoutes);
  app.use("/interest", interestRoutes);

  // Fallback error handler for anything that slips past route-level
  // try/catch, so the client always gets JSON, never a raw stack trace.
  app.use((err, req, res, next) => {
    console.error("[server] unhandled error:", err);
    res.status(500).json({ message: "Unexpected server error" });
  });

  initSocket(io);

  server.listen(PORT, () => {
    console.log(`[server] listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});
