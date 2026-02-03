import OpenAI from "openai";

const schema = {
  type: "json_schema",
  json_schema: {
    name: "job_extraction",
    strict: true,
    schema: {
      type: "object",
      properties: {
        jobs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              company: { type: "string" },
              url: { type: "string" },
              deadline: { type: "string" },
            },
            required: ["title", "company", "url", "deadline"],
            additionalProperties: false,
          },
        },
      },
      required: ["jobs"],
      additionalProperties: false,
    },
  },
};

export async function parseJobs(apiKey, text, sourceUrl) {
  const openai = new OpenAI({ apiKey });

  const prompt = `
    Extract all job postings from the text (Markdown).
    Source URL: ${sourceUrl}.
    Look for [Link Text](URL) to find the Job URL.
    If a field is missing, use an empty string "".
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: text.substring(0, 30000) },
      ],
      response_format: schema,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    const jobs = result.jobs || [];

    return jobs.map((j) => ({
      title: j.title,
      company: j.company,
      url: j.url || sourceUrl,
      deadline: j.deadline,
    }));
  } catch (error) {
    if (error.status === 429) {
      throw new Error("Rate limit exceeded (OpenAI)");
    }
    throw new Error(error.message.split("\n")[0].substring(0, 100));
  }
}
