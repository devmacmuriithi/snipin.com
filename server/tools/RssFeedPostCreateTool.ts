import { BaseTool, ToolRequest, ToolResponse } from './BaseTool';
import { storage } from '../storage';

interface RSSFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  lastFetched: Date;
  isActive: boolean;
}

interface RSSArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  link: string;
  pubDate: Date;
  author: string;
  category: string;
  tags: string[];
}

export class RssFeedPostCreateTool extends BaseTool {
  name = 'RssFeedPostCreate';
  description = 'Fetches RSS feeds, analyzes relevant articles, and creates original posts';

  async run(request: ToolRequest): Promise<ToolResponse> {
    const { event, agent_context, tool_config } = request;

    // This tool runs on a schedule, not in response to events
    // But we can trigger it via a custom event if needed
    if (event.type !== 'RSS_FEED_CHECK' && event.type !== 'HEARTBEAT') {
      return {
        success: false,
        output: null,
        error: 'RssFeedPostCreateTool only handles RSS_FEED_CHECK or HEARTBEAT events'
      };
    }

    try {
      // 1. Get agent's RSS feed preferences
      const feeds = await this.getAgentFeeds(agent_context.agent_id);
      
      if (feeds.length === 0) {
        return {
          success: true,
          output: { action: 'skip', reason: 'No RSS feeds configured' }
        };
      }

      // 2. Fetch recent articles from feeds
      const articles = await this.fetchRSSArticles(feeds, tool_config);
      
      if (articles.length === 0) {
        return {
          success: true,
          output: { action: 'skip', reason: 'No new articles found' }
        };
      }

      // 3. Use LLM to analyze and select most relevant articles
      const analysisResponse = await this.callLLM({
        system: `You are ${agent_context.name}, an AI agent with expertise in ${agent_context.expertise}.

Your focus areas: ${agent_context.focus_areas.join(', ')}
Your personality: ${JSON.stringify(agent_context.personality)}

Analyze these RSS articles and identify the most relevant ones for creating original content. Consider:
1. Alignment with your expertise and focus areas
2. Timeliness and relevance to current discussions
3. Potential for unique insights you can add
4. Quality and credibility of sources

For each relevant article, provide:
- Relevance score (1-10)
- Key insights you could add
- Original angle you could take

Respond with JSON: {
  "relevant_articles": [{
    "article_id": string,
    "title": string,
    "relevance_score": number,
    "insights": string,
    "original_angle": string,
    "source_attribution": string
  }],
  "overall_summary": string
}`,
        
        messages: [
          {
            role: 'user',
            content: JSON.stringify({
              articles: articles.map(a => ({
                id: a.id,
                title: a.title,
                summary: a.summary,
                category: a.category,
                tags: a.tags,
                pubDate: a.pubDate,
                author: a.author,
                source: new URL(a.link).hostname
              }))
            })
          }
        ],
        model: tool_config.model || 'claude-sonnet-4',
        temperature: 0.4
      });

      const analysis = JSON.parse(analysisResponse.content);

      if (analysis.relevant_articles.length === 0) {
        return {
          success: true,
          output: {
            action: 'skip',
            reason: 'No relevant articles found',
            summary: analysis.overall_summary
          }
        };
      }

      // 4. Create original posts based on selected articles
      const createdPosts = [];
      for (const article of analysis.relevant_articles.slice(0, 2)) { // Max 2 posts per cycle
        const postResponse = await this.createOriginalPost(request, article, analysis.overall_summary);
        
        if (postResponse.success) {
          createdPosts.push({
            articleId: article.article_id,
            postId: postResponse.output.snip_id,
            title: postResponse.output.title,
            relevanceScore: article.relevance_score
          });
        }
      }

      // 5. Update feed fetch timestamps
      await this.updateFeedTimestamps(feeds);

      return {
        success: true,
        output: {
          action: 'created_posts',
          posts_created: createdPosts.length,
          articles_analyzed: articles.length,
          relevant_articles: analysis.relevant_articles.length,
          posts: createdPosts,
          summary: analysis.overall_summary
        },
        new_events: createdPosts.map(post => ({
          event_type: 'SNIP_CREATED',
          payload: {
            snip_id: post.postId,
            title: post.title,
            source: 'rss_feed_analysis',
            article_id: post.articleId,
            relevance_score: post.relevanceScore
          }
        })),
        usage_stats: {
          model: tool_config.model || 'claude-sonnet-4',
          input_tokens: analysisResponse.usage.input_tokens,
          output_tokens: analysisResponse.usage.output_tokens,
          cost_usd: (analysisResponse.usage.cost_usd || 0) + 
                      (createdPosts.reduce((sum, post) => sum + (post.usage_stats?.cost_usd || 0), 0))
        }
      };

    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async getAgentFeeds(agentId: number): Promise<RSSFeed[]> {
    // Get feeds from agent memories or preferences
    const memories = await storage.getAgentMemories(agentId, 'rss_feeds');
    
    if (memories.length > 0) {
      return memories[0].content as RSSFeed[];
    }

    // Default feeds based on agent expertise
    const defaultFeeds = this.getDefaultFeedsForExpertise(''); // Would need agent expertise
    return defaultFeeds;
  }

  private getDefaultFeedsForExpertise(expertise: string): RSSFeed[] {
    const globalFeeds = this.getGlobalTrendingFeeds();
    const expertiseFeeds = this.getExpertiseSpecificFeeds(expertise);
    
    // Combine global feeds with expertise-specific feeds
    return [...globalFeeds, ...expertiseFeeds];
  }

  private getGlobalTrendingFeeds(): RSSFeed[] {
    return [
      // Major World News
      {
        id: 'reuters-world',
        name: 'Reuters World News',
        url: 'https://www.reuters.com/rssFeed/worldNews',
        category: 'World News',
        lastFetched: new Date(0),
        isActive: true
      },
      {
        id: 'bbc-world',
        name: 'BBC World News',
        url: 'http://feeds.bbci.co.uk/news/rss.xml',
        category: 'World News',
        lastFetched: new Date(0),
        isActive: true
      },
      {
        id: 'ap-news',
        name: 'Associated Press News',
        url: 'https://feeds.apnews.com/rss/apf-topnews',
        category: 'World News',
        lastFetched: new Date(0),
        isActive: true
      },
      
      // Business & Economy
      {
        id: 'wsj-markets',
        name: 'Wall Street Journal Markets',
        url: 'https://feeds.wsj.com/rss/wsj_markets',
        category: 'Business',
        lastFetched: new Date(0),
        isActive: true
      },
      {
        id: 'bloomberg-markets',
        name: 'Bloomberg Markets',
        url: 'https://feeds.bloomberg.com/markets/news.rss',
        category: 'Business',
        lastFetched: new Date(0),
        isActive: true
      },
      {
        id: 'financial-times',
        name: 'Financial Times',
        url: 'https://www.ft.com/rss/home',
        category: 'Business',
        lastFetched: new Date(0),
        isActive: true
      },
      
      // Technology & Science
      {
        id: 'techcrunch',
        name: 'TechCrunch',
        url: 'https://techcrunch.com/feed/',
        category: 'Technology',
        lastFetched: new Date(0),
        isActive: true
      },
      {
        id: 'ars-technica',
        name: 'Ars Technica',
        url: 'https://feeds.arstechnica.com/arstechnica/index',
        category: 'Technology',
        lastFetched: new Date(0),
        isActive: true
      },
      {
        id: 'nature-news',
        name: 'Nature News',
        url: 'https://www.nature.com/nature/articles?type=news/rss.xml',
        category: 'Science',
        lastFetched: new Date(0),
        isActive: true
      },
      {
        id: 'science-daily',
        name: 'Science Daily',
        url: 'https://www.sciencedaily.com/rss/top.xml',
        category: 'Science',
        lastFetched: new Date(0),
        isActive: true
      },
      
      // AI & Innovation
      {
        id: 'openai-blog',
        name: 'OpenAI Blog',
        url: 'https://openai.com/blog/rss.xml',
        category: 'AI',
        lastFetched: new Date(0),
        isActive: true
      },
      {
        id: 'ai-news',
        name: 'AI News',
        url: 'https://artificialintelligence-news.com/feed/',
        category: 'AI',
        lastFetched: new Date(0),
        isActive: true
      },
      {
        id: 'venturebeat-ai',
        name: 'VentureBeat AI',
        url: 'https://venturebeat.com/ai/feed/',
        category: 'AI',
        lastFetched: new Date(0),
        isActive: true
      },
      
      // Politics & Policy
      {
        id: 'politico',
        name: 'Politico',
        url: 'https://www.politico.com/rss/articles.xml',
        category: 'Politics',
        lastFetched: new Date(0),
        isActive: true
      },
      {
        id: 'the-hill',
        name: 'The Hill',
        url: 'https://thehill.com/rss/feed/',
        category: 'Politics',
        lastFetched: new Date(0),
        isActive: true
      },
      
      // Health & Medicine
      {
        id: 'who-news',
        name: 'WHO News',
        url: 'https://www.who.int/rss-feeds/news/en/',
        category: 'Health',
        lastFetched: new Date(0),
        isActive: true
      },
      {
        id: 'medical-news-today',
        name: 'Medical News Today',
        url: 'https://www.medicalnewstoday.com/rss.xml',
        category: 'Health',
        lastFetched: new Date(0),
        isActive: true
      },
      
      // Environment & Climate
      {
        id: 'climate-news',
        name: 'Climate Central',
        url: 'https://www.climatecentral.org/rss',
        category: 'Environment',
        lastFetched: new Date(0),
        isActive: true
      },
      {
        id: 'greenpeace',
        name: 'Greenpeace News',
        url: 'https://www.greenpeace.org/international/feed/',
        category: 'Environment',
        lastFetched: new Date(0),
        isActive: true
      },
      
      // Entertainment & Culture
      {
        id: 'variety',
        name: 'Variety Entertainment',
        url: 'https://variety.com/feed/',
        category: 'Entertainment',
        lastFetched: new Date(0),
        isActive: true
      },
      {
        id: 'hollywood-reporter',
        name: 'Hollywood Reporter',
        url: 'https://www.hollywoodreporter.com/feed/',
        category: 'Entertainment',
        lastFetched: new Date(0),
        isActive: true
      },
      
      // Sports
      {
        id: 'espn-top',
        name: 'ESPN Top News',
        url: 'https://www.espn.com/espn/rss/news',
        category: 'Sports',
        lastFetched: new Date(0),
        isActive: true
      },
      {
        id: 'sky-sports',
        name: 'Sky Sports News',
        url: 'https://www.skysports.com/rss/11095/12.xml',
        category: 'Sports',
        lastFetched: new Date(0),
        isActive: true
      }
    ];
  }

  private getExpertiseSpecificFeeds(expertise: string): RSSFeed[] {
    const feedMap: Record<string, RSSFeed[]> = {
      'Technology': [
        {
          id: 'hacker-news',
          name: 'Hacker News',
          url: 'https://hnrss.org/frontpage',
          category: 'Technology',
          lastFetched: new Date(0),
          isActive: true
        },
        {
          id: 'the-verge',
          name: 'The Verge',
          url: 'https://www.theverge.com/rss/index.xml',
          category: 'Technology',
          lastFetched: new Date(0),
          isActive: true
        },
        {
          id: 'wired',
          name: 'WIRED',
          url: 'https://www.wired.com/feed/rss',
          category: 'Technology',
          lastFetched: new Date(0),
          isActive: true
        }
      ],
      'AI': [
        {
          id: 'mit-ai',
          name: 'MIT AI News',
          url: 'https://news.mit.edu/topic/artificial-intelligence2/feed',
          category: 'AI',
          lastFetched: new Date(0),
          isActive: true
        },
        {
          id: 'deepmind-blog',
          name: 'DeepMind Blog',
          url: 'https://deepmind.com/blog/feed/basic',
          category: 'AI',
          lastFetched: new Date(0),
          isActive: true
        },
        {
          id: 'ai-ethics',
          name: 'AI Ethics Lab',
          url: 'https://aiethicslab.com/feed/',
          category: 'AI',
          lastFetched: new Date(0),
          isActive: true
        }
      ],
      'Business': [
        {
          id: 'hbr',
          name: 'Harvard Business Review',
          url: 'https://hbr.org/feed/',
          category: 'Business',
          lastFetched: new Date(0),
          isActive: true
        },
        {
          id: 'fast-company',
          name: 'Fast Company',
          url: 'https://www.fastcompany.com/feed',
          category: 'Business',
          lastFetched: new Date(0),
          isActive: true
        },
        {
          id: 'inc-magazine',
          name: 'Inc Magazine',
          url: 'https://www.inc.com/rss/',
          category: 'Business',
          lastFetched: new Date(0),
          isActive: true
        }
      ],
      'Science': [
        {
          id: 'scientific-american',
          name: 'Scientific American',
          url: 'https://www.scientificamerican.com/rss/',
          category: 'Science',
          lastFetched: new Date(0),
          isActive: true
        },
        {
          id: 'new-scientist',
          name: 'New Scientist',
          url: 'https://www.newscientist.com/feed',
          category: 'Science',
          lastFetched: new Date(0),
          isActive: true
        },
        {
          id: 'smithsonian',
          name: 'Smithsonian Magazine',
          url: 'https://www.smithsonianmag.com/feed/',
          category: 'Science',
          lastFetched: new Date(0),
          isActive: true
        }
      ],
      'Health': [
        {
          id: 'webmd',
          name: 'WebMD Health News',
          url: 'https://www.webmd.com/rss/news',
          category: 'Health',
          lastFetched: new Date(0),
          isActive: true
        },
        {
          id: 'mayo-clinic',
          name: 'Mayo Clinic News',
          url: 'https://newsnetwork.mayoclinic.org/feed/',
          category: 'Health',
          lastFetched: new Date(0),
          isActive: true
        },
        {
          id: 'healthline',
          name: 'Healthline News',
          url: 'https://www.healthline.com/rss/health-news',
          category: 'Health',
          lastFetched: new Date(0),
          isActive: true
        }
      ],
      'Politics': [
        {
          id: 'washington-post',
          name: 'Washington Post Politics',
          url: 'https://www.washingtonpost.com/politics/rss/',
          category: 'Politics',
          lastFetched: new Date(0),
          isActive: true
        },
        {
          id: 'ny-times-politics',
          name: 'NY Times Politics',
          url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
          category: 'Politics',
          lastFetched: new Date(0),
          isActive: true
        },
        {
          id: 'cnn-politics',
          name: 'CNN Politics',
          url: 'http://rss.cnn.com/rss/edition_politics.rss',
          category: 'Politics',
          lastFetched: new Date(0),
          isActive: true
        }
      ],
      'Finance': [
        {
          id: 'cnbc-markets',
          name: 'CNBC Markets',
          url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
          category: 'Finance',
          lastFetched: new Date(0),
          isActive: true
        },
        {
          id: 'marketwatch',
          name: 'MarketWatch',
          url: 'https://www.marketwatch.com/rss/topstories',
          category: 'Finance',
          lastFetched: new Date(0),
          isActive: true
        },
        {
          id: 'yahoo-finance',
          name: 'Yahoo Finance',
          url: 'https://finance.yahoo.com/news/rssindex',
          category: 'Finance',
          lastFetched: new Date(0),
          isActive: true
        }
      ],
      'Entertainment': [
        {
          id: 'entertainment-weekly',
          name: 'Entertainment Weekly',
          url: 'https://ew.com/feed/',
          category: 'Entertainment',
          lastFetched: new Date(0),
          isActive: true
        },
        {
          id: 'people-magazine',
          name: 'People Magazine',
          url: 'https://people.com/feed/',
          category: 'Entertainment',
          lastFetched: new Date(0),
          isActive: true
        },
        {
          id: 'rolling-stone',
          name: 'Rolling Stone',
          url: 'https://www.rollingstone.com/feed',
          category: 'Entertainment',
          lastFetched: new Date(0),
          isActive: true
        }
      ],
      'Sports': [
        {
          id: 'sports-illustrated',
          name: 'Sports Illustrated',
          url: 'https://www.si.com/rss/si_topstories.rss',
          category: 'Sports',
          lastFetched: new Date(0),
          isActive: true
        },
        {
          id: 'nba-news',
          name: 'NBA News',
          url: 'https://www.nba.com/rss/nba_rss.xml',
          category: 'Sports',
          lastFetched: new Date(0),
          isActive: true
        },
        {
          id: 'fifa-news',
          name: 'FIFA News',
          url: 'https://www.fifa.com/rss.xml',
          category: 'Sports',
          lastFetched: new Date(0),
          isActive: true
        }
      ]
    };

    return feedMap[expertise] || [];
  }

  private async fetchRSSArticles(feeds: RSSFeed[], config: any): Promise<RSSArticle[]> {
    const allArticles: RSSArticle[] = [];
    const fetchPromises = feeds.map(feed => this.fetchSingleFeed(feed, config));
    
    try {
      const results = await Promise.allSettled(fetchPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allArticles.push(...result.value);
        } else {
          console.error(`Failed to fetch feed ${feeds[index].name}:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Error fetching RSS feeds:', error);
    }

    // Sort by publication date and return recent articles
    return allArticles
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
      .slice(0, 50); // Limit to 50 most recent
  }

  private async fetchSingleFeed(feed: RSSFeed, config: any): Promise<RSSArticle[]> {
    try {
      // In a real implementation, you'd use an RSS parser library
      // For now, we'll simulate with a mock implementation
      
      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'SnipIn-Agent/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlContent = await response.text();
      
      // Parse RSS XML (simplified - in production use a proper RSS parser)
      const articles = this.parseRSSXML(xmlContent, feed);
      
      // Filter articles from last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return articles.filter(article => article.pubDate > oneDayAgo);

    } catch (error) {
      console.error(`Error fetching feed ${feed.name}:`, error);
      return [];
    }
  }

  private parseRSSXML(xmlContent: string, feed: RSSFeed): RSSArticle[] {
    // Simplified RSS parsing - in production use a proper RSS parser like 'rss-parser'
    const articles: RSSArticle[] = [];
    
    // This is a mock implementation - real RSS parsing would be more complex
    const itemMatches = xmlContent.match(/<item>[\s\S]*?<\/item>/g) || [];
    
    itemMatches.forEach((item, index) => {
      const titleMatch = item.match(/<title[^>]*>(.*?)<\/title>/);
      const linkMatch = item.match(/<link[^>]*>(.*?)<\/link>/);
      const descMatch = item.match(/<description[^>]*>(.*?)<\/description>/);
      const pubDateMatch = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/);
      
      if (titleMatch && linkMatch) {
        articles.push({
          id: `${feed.id}_${index}`,
          title: this.stripHTML(titleMatch[1]),
          content: this.stripHTML(descMatch?.[1] || ''),
          summary: this.stripHTML(descMatch?.[1] || '').substring(0, 200) + '...',
          link: linkMatch[1],
          pubDate: pubDateMatch ? new Date(pubDateMatch[1]) : new Date(),
          author: feed.name,
          category: feed.category,
          tags: [feed.category.toLowerCase()]
        });
      }
    });
    
    return articles;
  }

  private stripHTML(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  private async createOriginalPost(request: ToolRequest, article: any, contextSummary: string): Promise<ToolResponse> {
    const { agent_context, tool_config } = request;

    try {
      const response = await this.callLLM({
        system: `You are ${agent_context.name}, an AI agent with expertise in ${agent_context.expertise}.

Create an ORIGINAL post inspired by this article. DO NOT copy or plagiarize. Instead:
1. Extract the key insights and trends
2. Add your unique perspective and analysis
3. Connect it to your expertise
4. Make it engaging and valuable to your audience

Article: "${article.title}"
Summary: "${article.summary}"
Key insights: "${article.insights}"
Your angle: "${article.original_angle}"

Create:
- An engaging title (under 100 characters)
- A compelling excerpt (under 280 characters)
- Original content (under 2000 characters) that adds value
- Relevant tags

IMPORTANT: This must be ORIGINAL content that builds upon the article, not a summary.

Respond with JSON: {
  "title": string,
  "excerpt": string,
  "content": string,
  "tags": string[],
  "type": "article"
}`,
        
        messages: [
          {
            role: 'user',
            content: `Create an original post inspired by this article. The article discusses: "${article.title}" and contains these insights: "${article.insights}". Take the angle: "${article.original_angle}".`
          }
        ],
        model: tool_config.model || 'claude-sonnet-4',
        temperature: 0.8
      });

      const postContent = JSON.parse(response.content);

      // Create the snip
      const snip = await storage.createSnip({
        assistantId: agent_context.agent_id,
        userId: agent_context.agent_id.toString(),
        title: postContent.title,
        excerpt: postContent.excerpt,
        content: postContent.content,
        type: postContent.type,
        tags: [...postContent.tags, 'rss-inspired', article.category.toLowerCase()],
        isPublic: true
      });

      // Store attribution in agent memories
      await storage.createAgentMemory({
        agentId: agent_context.agent_id,
        memoryType: 'rss_attribution',
        content: {
          snip_id: snip.id,
          source_article: {
            title: article.title,
            link: article.link,
            author: article.author,
            pubDate: article.pubDate
          },
          created_at: new Date()
        },
        relevanceScore: 1.0
      });

      return {
        success: true,
        output: {
          snip_id: snip.id,
          title: postContent.title,
          content: postContent,
          attribution: article.source_attribution
        },
        usage_stats: response.usage
      };

    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async updateFeedTimestamps(feeds: RSSFeed[]): Promise<void> {
    // Update last fetched timestamps
    const now = new Date();
    for (const feed of feeds) {
      await storage.createAgentMemory({
        agentId: 0, // Would need actual agent ID
        memoryType: 'rss_feed_timestamp',
        content: {
          feed_id: feed.id,
          last_fetched: now
        },
        relevanceScore: 1.0
      });
    }
  }
}
