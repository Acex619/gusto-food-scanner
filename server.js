const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

// ⚙️ Permissions-Policy Header
app.use((req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  next();
});

// 📦 Serve static files from "dist"
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
