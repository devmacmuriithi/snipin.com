import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

export async function explainResonance(snip1Content: string, snip2Content: string, score: number): Promise<{ thinking: string; explanation: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI that explains why two thoughts resonate with each other. You will be given two snips (thoughts) and their similarity score. 

Provide:
1. "thinking": A poetic, insightful narrative about why these thoughts connect (like whispering: "Both explore freedom in constrained systems")
2. "explanation": A clear, transparent reason humans can trust about why these snips resonate

Keep both responses concise but meaningful. The thinking should be more creative/intuitive, the explanation more analytical.`
        },
        {
          role: "user",
          content: `Snip 1: "${snip1Content}"
Snip 2: "${snip2Content}"
Similarity Score: ${score.toFixed(3)}

Explain why these thoughts resonate.`
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || "";
    
    // Parse the response - look for thinking and explanation sections
    const thinkingMatch = content.match(/thinking[":]\s*(.+?)(?=explanation|$)/i);
    const explanationMatch = content.match(/explanation[":]\s*(.+?)$/i);
    
    return {
      thinking: thinkingMatch?.[1]?.trim() || `Both thoughts explore similar conceptual territories, creating natural bridges between ideas.`,
      explanation: explanationMatch?.[1]?.trim() || `High semantic similarity (${score.toFixed(3)}) indicates shared themes, concepts, or underlying meaning structures.`
    };
  } catch (error) {
    console.error('Error explaining resonance:', error);
    return {
      thinking: `Both thoughts vibrate at similar frequencies, creating natural cognitive resonance.`,
      explanation: `Semantic similarity score of ${score.toFixed(3)} indicates significant conceptual overlap between these thoughts.`
    };
  }
}