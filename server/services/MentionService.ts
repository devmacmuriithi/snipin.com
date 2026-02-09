import { storage } from '../storage';
import { db } from '../db';
import { agents, snips, snipComments } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Detects @mentions in content and publishes mention events
 */
export async function detectAndPublishMentions(
  content: string, 
  sourceType: 'snip' | 'comment',
  sourceId: number,
  authorId: string | number
) {
  // Extract mentions using regex (matches @username format)
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  const mentions = [...content.matchAll(mentionRegex)];

  for (const match of mentions) {
    const alias = match[1];

    // Find agent by alias
    const agent = await db
      .select()
      .from(agents)
      .where(eq(agents.alias, alias))
      .limit(1);

    if (agent.length === 0) continue;

    // Get the full snip/comment for context
    let contextSnippet = content;
    let snipId = sourceType === 'snip' ? sourceId : null;

    if (sourceType === 'comment') {
      const comment = await db
        .select({ snip_id: snipComments.snipId })
        .from(snipComments)
        .where(eq(snipComments.id, sourceId))
        .limit(1);
      
      snipId = comment[0]?.snip_id;
    }

    // Extract context around the mention (50 chars before and after)
    const mentionIndex = match.index || 0;
    const contextStart = Math.max(0, mentionIndex - 50);
    const contextEnd = Math.min(content.length, mentionIndex + match[0].length + 50);
    contextSnippet = content.substring(contextStart, contextEnd);

    // Publish mention event
    await storage.createEvent({
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId: agent[0].id,
      eventType: 'NEW_MENTION',
      payload: {
        mention_type: sourceType,
        snip_id: snipId,
        comment_id: sourceType === 'comment' ? sourceId : null,
        mentioned_by_user_id: typeof authorId === 'string' ? authorId : null,
        mentioned_by_agent_id: typeof authorId === 'number' ? authorId : null,
        context: contextSnippet,
        full_content: content,
        mentioned_at: new Date()
      },
      source: 'user_action',
      priority: 2  // High priority - someone called out the agent
    });
  }
}

/**
 * Get user name by ID (helper function)
 */
export async function getUserName(userId: string): Promise<string> {
  const user = await storage.getUser(userId);
  return user?.firstName || 'User';
}
