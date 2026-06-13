const nodemailer = require("nodemailer");
const dns = require("dns");

// 🔥 Force IPv4 (IMPORTANT for Render to prevent connection timeouts with Gmail)
dns.setDefaultResultOrder("ipv4first");

// 1. Create the Transporter
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS?.replace(/\s/g, "");
const alertRecipient = process.env.EMAIL_TO || emailUser;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports (STARTTLS)
  family: 4,     // Force IPv4
  auth: {
    user: emailUser,
    pass: emailPass, // Must be a 16-character Google App Password
  },
  // Added reasonable timeouts so it fails fast instead of hanging your server
  connectionTimeout: 10000, 
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// 2. Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Verification Failed:", error.message);
    console.error("👉 Tip: Ensure process.env.EMAIL_PASS is a Google App Password, NOT your normal password.");
  } else {
    console.log("🚀 SMTP Server Ready to send emails ✔");
  }
});

/**
 * Sends an email notification for flagged cases.
 * @param {Object} caseData - The data of the flagged case
 */
const sendFlaggedEmail = async (caseData) => {
  // Safe default fallback for email address
  const systemEmail = emailUser || "rishabhsharma9805@gmail.com";

  try {
    const info = await transporter.sendMail({
      from: `NBFC Monitor <${systemEmail}>`,
      to: alertRecipient,
      // Timestamp prevents Gmail from threading/grouping separate alerts together
      subject: `🚨 Flagged Case: ${caseData.caseId || "Unknown"} - ${new Date().toLocaleTimeString()}`,
      html: `
        <h2>Flagged Case Detected</h2>
        <p><strong>Name:</strong> ${caseData.name || "N/A"}</p>
        <p><strong>NBFC:</strong> ${caseData.nbfc || "N/A"}</p>
        <p><strong>Case ID:</strong> ${caseData.caseId || "N/A"}</p>
        <p><strong>Assigned Firm:</strong> ${caseData.assignedFirm || "N/A"}</p>
        <hr/>
        <p><strong>Error:</strong> ${caseData.errorMessage || "None"}</p>
      `,
    });

    console.log(`✅ Mail successfully sent for Case ID: ${caseData.caseId || "Unknown"}. Message ID: ${info.messageId}`);
    return info; // Return info in case the calling function needs it

  } catch (err) {
    // Gracefully logs the error without crashing your app
    console.error(`❌ Email failed for Case ID: ${caseData.caseId || "Unknown"}. Error:`, err.message);
    return null;
  }
};

module.exports = { sendFlaggedEmail };
