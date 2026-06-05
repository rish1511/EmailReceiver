const express = require("express");

const router = express.Router();

const {
  ingestEmail,
  getCases,
  getMetrics,
} = require("../controllers/case.controller");

router.post("/ingest-email", ingestEmail);

router.get("/cases", getCases);

router.get("/metrics", getMetrics);

module.exports = router;