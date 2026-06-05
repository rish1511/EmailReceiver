const express = require("express");
const cors = require("cors");

const caseRoutes = require("./routes/case.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", caseRoutes);

module.exports = app;