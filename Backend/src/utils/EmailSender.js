const nodemailer = require("nodemailer");
const dns = require("dns");

// 🔥 Force IPv4 (IMPORTANT for Render)
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  family: 4, // Force IPv4
  auth: {
    user: process.env.EMAIL_USER || "rishabhsharma9805@gmail.com",
    pass: process.env.EMAIL_PASS || "fizx htqw omeb kdvh",
  },
  // connectionTimeout: 10000,
  // greetingTimeout: 10000,
  // socketTimeout: 15000,
});

// optional: verify once at startup
transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP Error:", error);
  } else {
    console.log("SMTP Ready ✔");
  }
});

const sendFlaggedEmail = async (caseData) => {
  try {
    const info = await transporter.sendMail({
      from: `NBFC Monitor <${process.env.EMAIL_USER || "rishabhsharma9805@gmail.com"}>`,
      to: process.env.EMAIL_USER || "rishabhsharma9805@gmail.com",
      // Subject mein timestamp daal diya taaki Gmail unhe group na kare
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
    
    console.log(`✅ Mail successfully sent for Case ID: ${caseData.caseId}. Message ID: ${info.messageId}`);


    console.log("Email sent ✔");
  } catch (err) {
    console.error("Email failed:", err);
  }
};

module.exports = { sendFlaggedEmail };