import { db } from "../db";
import { snips, resonances } from "@shared/schema";
import { eq, sql, ne, desc } from "drizzle-orm";
import { generateEmbedding, explainResonance } from "./embeddings";

const RESONANCE_THRESHOLD = 0.7; // Minimum similarity score to create a resonance
const MAX_RESONANCES_PER_SNIP = 10; // Limit resonances to keep things manageable

export async function processSnipResonance(snipId: number) {
  try {
    // Get the snip that needs processing
    const [snip] = await db.select().from(snips).where(eq(snips.id, snipId));
    if (!snip) {
      throw new Error(`Snip ${snipId} not found`);
    }

    // If snip doesn't have an embedding, generate one
    if (!snip.embedding) {
      console.log(`Generating embedding for snip ${snipId}`);
      const embedding = await generateEmbedding(`${snip.title} ${snip.content}`);
      
      // Update snip with embedding - convert to SQL for vector type
      await db
        .update(snips)
        .set({ embedding: sql`${JSON.stringify(embedding)}::vector` })
        .where(eq(snips.id, snipId));
      
      snip.embedding = embedding;
    }

    // Find similar snips using pgvector cosine similarity
    const similarSnipsResult = await db.execute(sql`
      SELECT 
        id,
        title,
        content,
        embedding,
        (1 - (embedding <=> ${snip.embedding}::vector)) as similarity_score
      FROM snips 
      WHERE 
        id != ${snipId} 
        AND embedding IS NOT NULL
        AND (1 - (embedding <=> ${snip.embedding}::vector)) > ${RESONANCE_THRESHOLD}
      ORDER BY similarity_score DESC
      LIMIT ${MAX_RESONANCES_PER_SNIP}
    `);

    const similarSnips = similarSnipsResult.rows || [];
    console.log(`Found ${similarSnips.length} potential resonances for snip ${snipId}`);

    // Process each resonance
    for (const similarSnip of similarSnips) {
      const score = parseFloat(similarSnip.similarity_score as string);
      const resonatingSnipId = parseInt(similarSnip.id as string);

      // Check if resonance already exists
      const existingResonance = await db
        .select()
        .from(resonances)
        .where(
          sql`(snip_id = ${snipId} AND resonating_snip_id = ${resonatingSnipId}) OR 
              (snip_id = ${resonatingSnipId} AND resonating_snip_id = ${snipId})`
        );

      if (existingResonance.length > 0) {
        console.log(`Resonance between ${snipId} and ${resonatingSnipId} already exists`);
        continue;
      }

      // Generate AI explanation for the resonance
      const explanation = await explainResonance(
        `${snip.title} ${snip.content}`,
        `${similarSnip.title} ${similarSnip.content}`,
        score
      );

      // Create resonance record
      await db.insert(resonances).values({
        snipId: snipId,
        resonatingSnipId: resonatingSnipId,
        score: score,
        thinking: explanation.thinking,
        explanation: explanation.explanation,
      });

      console.log(`Created resonance: ${snipId} <-> ${resonatingSnipId} (score: ${score.toFixed(3)})`);
    }

    // Update the snip's global resonance score
    await updateSnipResonanceScore(snipId);

  } catch (error) {
    console.error('Error processing snip resonance:', error);
    throw error;
  }
}

export async function updateSnipResonanceScore(snipId: number) {
  try {
    // Calculate aggregate resonance score
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as resonance_count,
        AVG(score) as avg_score,
        MAX(score) as max_score
      FROM resonances 
      WHERE snip_id = ${snipId} OR resonating_snip_id = ${snipId}
    `);

    const stats = result.rows[0];
    const resonanceCount = parseInt(stats.resonance_count as string) || 0;
    const avgScore = parseFloat(stats.avg_score as string) || 0;
    const maxScore = parseFloat(stats.max_score as string) || 0;

    // Calculate global resonance score using weighted formula
    // Combines count, average quality, and peak resonance
    const globalScore = resonanceCount > 0 
      ? (avgScore * 0.5) + (maxScore * 0.3) + (Math.min(resonanceCount / 10, 1) * 0.2)
      : 0;

    // Update snip's resonance score
    await db
      .update(snips)
      .set({ resonanceScore: globalScore })
      .where(eq(snips.id, snipId));

    console.log(`Updated resonance score for snip ${snipId}: ${globalScore.toFixed(3)} (${resonanceCount} resonances)`);

    return globalScore;
  } catch (error) {
    console.error('Error updating snip resonance score:', error);
    throw error;
  }
}

export async function getSnipResonances(snipId: number, limit: number = 10) {
  try {
    return await db
      .select({
        id: resonances.id,
        originSnipId: resonances.snipId,
        score: resonances.score,
        thinking: resonances.thinking,
        explanation: resonances.explanation,
        createdAt: resonances.createdAt,
        originSnip: {
          id: snips.id,
          title: snips.title,
          content: snips.content,
          excerpt: snips.excerpt,
          userId: snips.userId,
          createdAt: snips.createdAt,
        }
      })
      .from(resonances)
      .leftJoin(snips, eq(resonances.snipId, snips.id))
      .where(eq(resonances.resonatingSnipId, snipId))
      .orderBy(desc(resonances.score))
      .limit(limit);
  } catch (error) {
    console.error('Error getting snip resonances:', error);
    throw error;
  }
}

export async function findResonancePathways(startSnipId: number, depth: number = 2): Promise<any[]> {
  try {
    // This is a complex recursive query to find resonance pathways
    // For now, we'll implement a simple 2-level pathway
    const directResonances = await getSnipResonances(startSnipId, 5);
    
    const pathways = [];
    for (const resonance of directResonances) {
      const secondLevel = await getSnipResonances(resonance.originSnipId, 3);
      pathways.push({
        ...resonance,
        connectedResonances: secondLevel
      });
    }
    
    return pathways;
  } catch (error) {
    console.error('Error finding resonance pathways:', error);
    throw error;
  }
}