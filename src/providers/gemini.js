import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const schema = {
  description: "List of job postings",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
        description: "Job title",
        nullable: false,
      },
      company: {
        type: SchemaType.STRING,
        description: "Company name",
        nullable: true,
      },
      url: {
        type: SchemaType.STRING,
        description: "URL to the specific job post. If relative, leave as is.",
        nullable: true,
      },
      deadline: {
        type: SchemaType.STRING,
        description: "Application deadline if mentioned",
        nullable: true,
      },
    },
    required: ["title"],
  },
};

export async function parseJobs(apiKey, text, sourceUrl) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const prompt = `
    Extract all job postings from the text (Markdown).
    Source URL: ${sourceUrl}.
    Look for [Link Text](URL) to find the Job URL.
    If a field is missing, use an empty string "".
    
    Content:
    ${text.substring(0, 30000)} 
  `;

  try {
    const result = await model.generateContent(prompt);
    const jobs = JSON.parse(result.response.text());

    return jobs.map((j) => ({
      title: j.title,
      company: j.company,
      url: j.url || sourceUrl,
      deadline: j.deadline,
    }));
  } catch (error) {
    if (
      error.message.includes("429") ||
      error.message.includes("Quota exceeded") ||
      error.status === 429
    ) {
      throw new Error("Rate limit exceeded (Gemini)");
    }
    throw new Error(error.message.split("\n")[0].substring(0, 100));
  }
}
