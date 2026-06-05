const express = require("express");
const cors = require("cors");

const caseRoutes = require("./routes/case.routes");

const app = express();

app.use(cors({
  origin: [
    "https://email-receiver-wheat.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

app.use("/api", caseRoutes);

module.exports = app;