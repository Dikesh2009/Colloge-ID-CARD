const express = require("express");
const path = require("path");

const app = express();

// serve public folder
app.use(express.static(path.join(__dirname, "public")));

// homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// test route
app.get("/test", (req, res) => {
  res.send("Server OK ✅");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on " + PORT);
});
