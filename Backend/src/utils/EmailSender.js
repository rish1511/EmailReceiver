const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendFlaggedEmail = async (caseData) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `🚨 Flagged Case: ${caseData.caseId || "Unknown"}`,
    html: `
      <h2>Flagged Case Detected</h2>

      <p><strong>Name:</strong> ${caseData.name}</p>
      <p><strong>NBFC:</strong> ${caseData.nbfc}</p>
      <p><strong>Case ID:</strong> ${caseData.caseId}</p>
      <p><strong>Assigned Firm:</strong> ${caseData.assignedFirm}</p>

      <hr/>

      <p><strong>Error:</strong> ${caseData.errorMessage}</p>
    `,
  });
};

module.exports = { sendFlaggedEmail };