import { db } from "./db";
import { whispers, snips, assistants } from "@shared/schema";
import { eq } from "drizzle-orm";

const testSnipData = [
  {
    whisper: {
      content: "I've been thinking about how morning routines shape our entire day. The way we start sets the tone for everything that follows.",
      mood: "contemplative" as const
    },
    snip: {
      title: "Morning Rituals and Daily Flow",
      content: "The power of starting each day with intention. Small habits compound into massive changes over time.",
      excerpt: "Morning routines as catalysts for daily transformation"
    }
  },
  {
    whisper: {
      content: "AI is changing how we think about creativity. It's not replacing artists - it's giving us new tools to express ideas we never could before.",
      mood: "excited" as const
    },
    snip: {
      title: "AI as Creative Amplifier",
      content: "Artificial intelligence augments human creativity rather than replacing it. We're entering a new renaissance of human-AI collaboration.",
      excerpt: "How AI tools expand the boundaries of creative expression"
    }
  },
  {
    whisper: {
      content: "Time feels different when you're fully present. Minutes can stretch into eternities, while years vanish in what feels like moments.",
      mood: "philosophical" as const
    },
    snip: {
      title: "The Elasticity of Time",
      content: "Time perception shifts dramatically with our level of presence and engagement. Consciousness shapes our experience of duration.",
      excerpt: "How mindfulness transforms our relationship with time"
    }
  },
  {
    whisper: {
      content: "Writer's block isn't really about running out of ideas. It's about being afraid our ideas aren't good enough.",
      mood: "reflective" as const
    },
    snip: {
      title: "Fear Behind Creative Blocks",
      content: "Creative blocks often stem from perfectionism and fear of judgment rather than lack of inspiration.",
      excerpt: "Understanding the psychology of creative resistance"
    }
  },
  {
    whisper: {
      content: "Deep friendships require vulnerability. You can't build real connections on surface-level conversations.",
      mood: "contemplative" as const
    },
    snip: {
      title: "Vulnerability as Connection Gateway",
      content: "Authentic relationships flourish when we share our genuine selves, including our struggles and uncertainties.",
      excerpt: "Why surface connections never satisfy our deeper needs"
    }
  },
  {
    whisper: {
      content: "The best code I write feels like poetry - every line has purpose, every function tells a story.",
      mood: "inspired" as const
    },
    snip: {
      title: "Code as Artistic Expression",
      content: "Well-crafted code embodies elegance, clarity, and intentionality - much like poetry or fine art.",
      excerpt: "When programming transcends utility to become art"
    }
  },
  {
    whisper: {
      content: "We don't find meaning in life - we create it through our choices and how we relate to others.",
      mood: "philosophical" as const
    },
    snip: {
      title: "Meaning as Creative Act",
      content: "Purpose isn't discovered but actively constructed through our decisions, relationships, and contributions.",
      excerpt: "How we become authors of our own significance"
    }
  },
  {
    whisper: {
      content: "Sometimes I think too many choices actually make us less free. Constraints can be liberating.",
      mood: "thoughtful" as const
    },
    snip: {
      title: "The Paradox of Choice",
      content: "Unlimited options can paralyze decision-making, while thoughtful constraints often unlock creativity and action.",
      excerpt: "When limitations become gateways to freedom"
    }
  },
  {
    whisper: {
      content: "The best ideas come from connecting things that seem completely unrelated at first glance.",
      mood: "curious" as const
    },
    snip: {
      title: "Innovation Through Synthesis",
      content: "Breakthrough insights emerge from combining disparate concepts, creating novel connections across domains.",
      excerpt: "How distant ideas converge into revolutionary thinking"
    }
  },
  {
    whisper: {
      content: "Art moves us because it reflects something universal back to us - our shared human experience.",
      mood: "moved" as const
    },
    snip: {
      title: "Art as Mirror of Humanity",
      content: "Great art resonates because it captures fundamental aspects of the human condition we all recognize.",
      excerpt: "Why certain works speak across cultures and centuries"
    }
  },
  {
    whisper: {
      content: "Learning often means unlearning what we thought we knew. Growth requires humility.",
      mood: "humble" as const
    },
    snip: {
      title: "Unlearning as Growth",
      content: "Progress sometimes demands releasing old assumptions and embracing intellectual humility.",
      excerpt: "The courage to let go of comfortable certainties"
    }
  },
  {
    whisper: {
      content: "The present moment is literally the only time we can influence anything. Past and future exist only in our minds.",
      mood: "mindful" as const
    },
    snip: {
      title: "Present as Point of Power",
      content: "All agency exists in the now - our ability to shape reality happens exclusively in present moments.",
      excerpt: "Why mindfulness is the foundation of all change"
    }
  },
  {
    whisper: {
      content: "Digital minimalism isn't about rejecting technology - it's about choosing it intentionally.",
      mood: "balanced" as const
    },
    snip: {
      title: "Intentional Technology Use",
      content: "Mindful tech consumption reduces overwhelm while maximizing the tools that truly serve our goals.",
      excerpt: "Curating digital experiences for focus and well-being"
    }
  },
  {
    whisper: {
      content: "Every failure teaches us something valuable, but only if we're willing to pay attention to the lesson.",
      mood: "wise" as const
    },
    snip: {
      title: "Failure as Curriculum",
      content: "Setbacks become valuable teachers when we approach them with curiosity rather than self-judgment.",
      excerpt: "Transforming defeats into stepping stones"
    }
  },
  {
    whisper: {
      content: "Consciousness is the strangest thing - we're aware that we're aware, but we can't really explain how or why.",
      mood: "wonderstruck" as const
    },
    snip: {
      title: "The Mystery of Awareness",
      content: "Self-consciousness represents one of the deepest puzzles of existence - experience experiencing itself.",
      excerpt: "Why the hard problem of consciousness remains unsolved"
    }
  }
];

export async function seedSnipNetData(userId: string) {
  console.log("Starting SnipNet data seeding...");
  
  try {
    // Get the user's assistant
    const userAssistants = await db
      .select()
      .from(assistants)
      .where(eq(assistants.userId, userId))
      .limit(1);
    
    if (userAssistants.length === 0) {
      console.log("No assistant found for user, creating one...");
      const [newAssistant] = await db
        .insert(assistants)
        .values({
          userId,
          name: "Your Digital Twin",
          description: "A thoughtful AI assistant that helps users explore and develop their ideas.",
        })
        .returning();
      
      if (!newAssistant) {
        throw new Error("Failed to create assistant");
      }
      
      userAssistants.push(newAssistant);
    }
    
    const assistant = userAssistants[0];
    
    // Clear existing test data
    await db.delete(snips).where(eq(snips.userId, userId));
    await db.delete(whispers).where(eq(whispers.userId, userId));
    
    console.log("Creating whispers and snips...");
    
    for (const item of testSnipData) {
      // Create whisper
      const [whisper] = await db
        .insert(whispers)
        .values({
          userId,
          agentId: assistant.id,
          content: item.whisper.content,
          type: "thought",
        })
        .returning();
      
      if (!whisper) {
        console.error("Failed to create whisper");
        continue;
      }
      
      // Create corresponding snip
      await db
        .insert(snips)
        .values({
          whisperId: whisper.id,
          assistantId: assistant.id,
          userId,
          title: item.snip.title,
          content: item.snip.content,
          excerpt: item.snip.excerpt,
          type: "article",
          isPublic: true,
        });
    }
    
    console.log(`Successfully seeded ${testSnipData.length} whispers and snips for SnipNet testing!`);
    return { success: true, count: testSnipData.length };
    
  } catch (error) {
    console.error("Error seeding SnipNet data:", error);
    throw error;
  }
}