const Case = require("../models/case.model");

const {
  tryRegexParsing,
  tryAiParsing,
  validateData,
} = require("../services/parser.service");
const sendFlaggedEmail = require("../utils/EmailSender");


const ingestEmail = async (req, res) => {
  try {
    const { sender, subject, emailBody } = req.body;

    let extractedData = tryRegexParsing(emailBody);

    let routingPath = "REGEX";
    let status = "SUCCESS";
    let errorMessage = null;

    if (!extractedData) {
      extractedData = await tryAiParsing(emailBody);

      routingPath = "AI";

      if (!extractedData) {
        return res.status(500).json({
          success: false,
          message: "AI Parsing Failed",
        });
      }

      const validation = validateData(extractedData);

     await sendFlaggedEmail({
  ...extractedData,
  errorMessage,
});
    }

    const newCase = await Case.create({
      emailSender: sender,
      emailSubject: subject,
      rawEmailBody: emailBody,
      ...extractedData,
      routingPath,
      status,
      errorMessage,
    });

    res.status(201).json({
      success: true,
      data: newCase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCases = async (req, res) => {
  try {
    const cases = await Case.find().sort({
      createdAt: -1,
    });

    res.json(cases);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMetrics = async (req, res) => {
  try {
    const total = await Case.countDocuments();

    const regexSuccess = await Case.countDocuments({
      routingPath: "REGEX",
    });

    const aiSuccess = await Case.countDocuments({
      routingPath: "AI",
      status: "SUCCESS",
    });

    const flagged = await Case.countDocuments({
      status: "FLAGGED",
    });

    res.json({
      total,
      regexSuccess,
      aiSuccess,
      flagged,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  ingestEmail,
  getCases,
  getMetrics,
};