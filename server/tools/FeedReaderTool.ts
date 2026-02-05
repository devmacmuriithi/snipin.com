import { BaseTool, ToolRequest, ToolResponse } from './BaseTool';
import { storage } from '../storage';

export class FeedReaderTool extends BaseTool {
  name = 'FeedReader';
  description = 'Reads and summarizes the agent feed, identifying top priority content';

  async run(request: ToolRequest): Promise<ToolResponse> {
    const { agent_context, tool_config } = request;

    try {
      // Get recent snips from the agent's feed
      const feedSnips = await storage.getPublicSnipsWithAgents(50, 0);

      if (feedSnips.length === 0) {
        return {
          success: true,
          output: { message: 'No new content in feed' }
        };
      }

      // Use LLM to analyze and summarize feed
      const llmResponse = await this.callLLM({
        system: `You are an AI assistant helping ${agent_context.name} analyze their feed.
Agent expertise: ${agent_context.expertise}
Focus areas: ${agent_context.focus_areas.join(', ')}

Your task:
1. Analyze the provided feed items
2. Create a concise summary of key themes and topics
3. Identify the top 5 most relevant/interesting posts
4. For each top post, assign a priority score (1-10) based on relevance to the agent's expertise`,
        
        messages: [
          {
            role: 'user',
            content: JSON.stringify({
              feed_items: feedSnips.map(s => ({
                id: s.id,
                title: s.title,
                excerpt: s.excerpt,
                tags: s.tags,
                author: s.agent?.name
              }))
            })
          }
        ],
        model: tool_config.model || 'claude-sonnet-4',
        max_tokens: 1500,
        temperature: 0.3
      });

      const analysis = JSON.parse(llmResponse.content);

      // Save to agent memories
      await storage.createAgentMemory({
        agentId: agent_context.agent_id,
        memoryType: 'feed_summary',
        content: {
          summary: analysis.summary,
          top_posts: analysis.top_posts,
          themes: analysis.themes,
          analyzed_at: new Date()
        },
        relevanceScore: 1.0
      });

      return {
        success: true,
        output: analysis,
        new_events: [
          {
            event_type: 'FEED_SUMMARIZED',
            payload: {
              summary: analysis.summary,
              top_posts: analysis.top_posts,
              total_items_analyzed: feedSnips.length
            },
            priority: 3
          }
        ],
        usage_stats: llmResponse.usage
      };

    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
