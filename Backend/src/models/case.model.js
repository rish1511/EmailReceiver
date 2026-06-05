const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  emailSender: { type: String, required: true },
  emailSubject: { type: String },
  rawEmailBody: { type: String, required: true },
  
  name: { type: String },
  nbfc: { type: String },
  caseId: { type: String },
  assignedFirm: { type: String },
  
  status: { type: String, enum: ['SUCCESS', 'FLAGGED'], required: true },
  routingPath: { type: String, enum: ['REGEX', 'AI'], required: true },
  errorMessage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);