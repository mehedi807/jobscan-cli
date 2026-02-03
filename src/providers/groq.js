import Groq from "groq-sdk";

export async function parseJobs(apiKey, text, sourceUrl) {
  const groq = new Groq({ apiKey });

  const prompt = `
    Extract job postings from the following career page content (Markdown formatted).
    Return a JSON object with a single key "jobs" containing an array of job objects.
    
    Each job object must have:
    - title: Job title (string)
    - company: Company name (string, infer from text or use "Unknown")
    - url: Job link (string). Look for [Title](URL) patterns. Extract the URL. Only use value from the markdown link.
    - deadline: Application deadline (string or null)

    If no jobs are found, return { "jobs": [] }.

    Content:
    ${text.substring(0, 25000)}
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return [];

    const result = JSON.parse(content);
    const jobs = result.jobs || [];

    return jobs.map((j) => ({
      title: j.title,
      company: j.company,
      url: j.url || sourceUrl,
      deadline: j.deadline,
    }));
  } catch (error) {
    if (error.status === 429) {
      throw new Error("Rate limit exceeded (Groq)");
    }
    throw new Error(error.message.split("\n")[0].substring(0, 100));
  }
}
