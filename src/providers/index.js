import * as gemini from "./gemini.js";
import * as openai from "./openai.js";
import * as groq from "./groq.js";

export function getProvider(name) {
  switch (name) {
    case "gemini":
      return gemini;
    case "openai":
      return openai;
    case "groq":
      return groq;
    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}
