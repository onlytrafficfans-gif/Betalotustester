/**
 * Groq Provider
 * 
 * Handles communication with Groq's API for fast inference.
 */

import { AIProvider, AIRequest, AIResponse } from "./genericProvider";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

export class GroqProvider implements AIProvider {
  name = "Groq";
  models = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
  ];

  constructor(private apiKey: string) {}

  async sendMessage(request: AIRequest): Promise<AIResponse> {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model || "llama-3.3-70b-versatile",
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      model: data.model,
    };
  }

  async streamMessage(
    request: AIRequest,
    onChunk: (chunk: string) => void
  ): Promise<AIResponse> {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model || "llama-3.3-70b-versatile",
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    let fullContent = "";
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || "";
            fullContent += content;
            onChunk(content);
          } catch {
            // Ignore parse errors
          }
        }
      }
    }

    return {
      content: fullContent,
      model: request.model || "llama-3.3-70b-versatile",
    };
  }
}
