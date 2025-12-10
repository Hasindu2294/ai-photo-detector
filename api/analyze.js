// api/analyze.js
import { Anthropic } from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  try {
    const { base64, type } = req.body;

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `
Analyze this image and determine if it's likely AI-generated or real. 
Return ONLY JSON in the following format:

{
  "isAI": true/false,
  "confidence": 0-100,
  "reasoning": "short explanation",
  "indicators": ["i1","i2"]
}
`;

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: type,
                data: base64
              }
            },
            {
              type: "text",
              text: prompt
            }
          ]
        }
      ]
    });

    const text = response.content
      .map(item => item.type === "text" ? item.text : "")
      .join("");

    const clean = text.replace(/```json|```/g, "").trim();
    const json = JSON.parse(clean);

    res.status(200).json(json);
  } catch (error) {
    console.log("Server error:", error);
    res.status(500).json({ error: "Server failed to analyze image" });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
