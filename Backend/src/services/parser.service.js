const { OpenAI } = require("openai");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Email Parser PoC",
  },
});

// Layer 1: Fast Regex Path
function tryRegexParsing(emailBody) {
  const nameMatch = emailBody.match(/Name:\s*([^\n\r]+)/i);
  const nbfcMatch = emailBody.match(/NBFC:\s*([^\n\r]+)/i);
  const caseIdMatch = emailBody.match(/Case ID:\s*([^\n\r]+)/i);
  const firmMatch = emailBody.match(/Assigned Firm:\s*([^\n\r]+)/i);

  if (nameMatch && nbfcMatch && caseIdMatch && firmMatch) {
    return {
      name: nameMatch[1].trim(),
      nbfc: nbfcMatch[1].trim(),
      caseId: caseIdMatch[1].trim(),
      assignedFirm: firmMatch[1].trim(),
    };
  }

  return null;
}

// Layer 2: AI Fallback
async function tryAiParsing(emailBody) {
  const prompt = `
Extract exactly these 4 fields:
- name
- nbfc
- caseId
- assignedFirm

Return ONLY valid JSON.

Example:
{
  "name": "Rishabh Sharma",
  "nbfc": "Bajaj Finance",
  "caseId": "8821A",
  "assignedFirm": "Legal Associates"
}

Email:
${emailBody}
`;

  const models = [
    "google/gemini-2.5-flash",
    "deepseek/deepseek-chat-v3-0324:free",
    "mistralai/mistral-small-3.2-24b-instruct:free",
    "meta-llama/llama-3.3-70b-instruct:free",
  ];

  for (const model of models) {
    try {
      console.log(`🤖 Trying model: ${model}`);

      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a data extraction engine. Return ONLY valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0,
        max_tokens: 200,
      });

      const rawContent = response.choices[0].message.content;

      console.log(`✅ Success with model: ${model}`);
      console.log(rawContent);

      let jsonStr = rawContent
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(jsonStr);
    } catch (error) {
      console.log(`❌ Model failed: ${model}`);
      console.log(error.message);

      continue;
    }
  }

  console.error("❌ All AI models failed");

  return null;
}
// Layer 3: Validation
function validateData(data) {
  const caseIdPattern = /^\d{4}[A-Z]$/;

  if (!data.caseId || !caseIdPattern.test(data.caseId)) {
    return {
      isValid: false,
      reason: `Invalid Case ID format: ${data.caseId}`,
    };
  }

  const validInstitutions = [
    "Bajaj Finance",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "Tata Capital",
    "Mahindra Finance",
    "Shriram Finance",
    "L&T Finance",
    "Muthoot Finance",
  ];

  const matchedInstitution = validInstitutions.find(
    (institution) =>
      institution.toLowerCase() === data.nbfc?.toLowerCase()
  );

  if (!matchedInstitution) {
    return {
      isValid: false,
      reason: `Unknown Institution: ${data.nbfc}`,
    };
  }

  return {
    isValid: true,
  };
}

module.exports = {
  tryRegexParsing,
  tryAiParsing,
  validateData,
};