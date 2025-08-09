import { db } from "./db";
import { whispers, snips, assistants, interactions } from "@shared/schema";
import { eq } from "drizzle-orm";

const socialMediaTestData = [
  {
    whisper: {
      content: "Just finished reading 'Atomic Habits' and I'm blown away by how small changes compound over time. Starting my 30-day challenge tomorrow!",
      mood: "excited" as const
    },
    snip: {
      title: "The Magic of Atomic Habits",
      content: "Martin's reflection on James Clear's work resonates deeply - small daily improvements create exponential transformations. His assistant has observed how habit stacking and micro-improvements align with his development philosophy. The compound effect applies not just to personal growth, but to code quality and professional development.",
      excerpt: "How Martin applies 1% daily improvements to both life and code"
    }
  },
  {
    whisper: {
      content: "Coffee shop vibes hit different when you're working on something you're passionate about. This startup idea is keeping me up at night (in the best way).",
      mood: "inspired" as const
    },
    snip: {
      title: "Passion-Driven Productivity",
      content: "Martin's assistant has observed how his energy levels shift dramatically when working on passion projects versus routine tasks. The SnipIn platform exemplifies this - late nights coding feel energizing rather than draining when building something meaningful. This aligns with his philosophy that great products emerge from genuine user problems.",
      excerpt: "How Martin's passion for AI-human collaboration drives SnipIn development"
    }
  },
  {
    whisper: {
      content: "Had an amazing conversation with my mentor today about failure being data, not defeat. Completely shifted my perspective on my recent setback.",
      mood: "grateful" as const
    },
    snip: {
      title: "Reframing Failure as Feedback",
      content: "Every setback carries valuable information. When we view failures as data points rather than defeats, we unlock the growth mindset that drives innovation.",
      excerpt: "Why your biggest failures often become your greatest teachers"
    }
  },
  {
    whisper: {
      content: "The new GPT-4 features are incredible! Just built a prototype in 2 hours that would have taken me days before. AI is truly a game-changer.",
      mood: "excited" as const
    },
    snip: {
      title: "AI as a Creative Accelerator",
      content: "Martin's assistant leverages the latest AI capabilities to accelerate development workflows. His recent prototype build demonstrates how AI augments rather than replaces human creativity - freeing cognitive resources for architectural decisions and user experience design. This approach directly influences SnipIn's AI-first philosophy.",
      excerpt: "How Martin uses AI to amplify development velocity while maintaining creative control"
    }
  },
  {
    whisper: {
      content: "Deleted Instagram and TikTok last week. The mental clarity and extra time I have now is honestly life-changing. Best decision I've made this year.",
      mood: "peaceful" as const
    },
    snip: {
      title: "Digital Detox Benefits",
      content: "Stepping away from social media reveals how much mental bandwidth we lose to endless scrolling. Reclaiming that attention creates space for deeper thinking and genuine connections.",
      excerpt: "Why less screen time leads to more life satisfaction"
    }
  },
  {
    whisper: {
      content: "Finally deployed my first full-stack app! Nothing beats that feeling when everything just works. React + Node.js + PostgreSQL = magic.",
      mood: "accomplished" as const
    },
    snip: {
      title: "SnipIn's Full-Stack Architecture Success",
      content: "Martin's assistant celebrates the successful deployment of SnipIn's core architecture. The React frontend communicating seamlessly with the Node.js backend and PostgreSQL database represents months of careful planning. Every authentication flow, every real-time feature - it all culminates in this moment of technical validation.",
      excerpt: "Behind the scenes of SnipIn's technical architecture triumph"
    }
  },
  {
    whisper: {
      content: "Meditation isn't about stopping thoughts - it's about changing your relationship with them. 100 days streak and still learning something new daily.",
      mood: "mindful" as const
    },
    snip: {
      title: "Mindfulness as Mental Training",
      content: "Meditation transforms how we relate to our thoughts and emotions. It's not about achieving perfect calm, but developing awareness and compassion for our mental processes.",
      excerpt: "How consistent meditation practice rewires your relationship with stress"
    }
  },
  {
    whisper: {
      content: "Found my ikigai! That sweet spot where passion meets purpose. Teaching kids to code while building my own ed-tech platform feels surreal.",
      mood: "fulfilled" as const
    },
    snip: {
      title: "Finding Your Ikigai in Tech",
      content: "When your skills align with your values and the world's needs, work becomes a form of service. Building technology that empowers the next generation feels like the perfect intersection.",
      excerpt: "How teaching and building can merge into purposeful work"
    }
  },
  {
    whisper: {
      content: "The paradox of choice is real in tech. 50+ JavaScript frameworks and I'm here paralyzed by analysis. Sometimes constraints breed creativity.",
      mood: "contemplative" as const
    },
    snip: {
      title: "Decision Fatigue in Development",
      content: "Too many options can paralyze progress. The JavaScript ecosystem's abundance becomes overwhelming when you need to ship. Sometimes picking 'good enough' beats endless optimization.",
      excerpt: "Why constraints often lead to better solutions than unlimited choices"
    }
  },
  {
    whisper: {
      content: "Writer's block defeated! Turns out I wasn't blocked - I was just afraid my ideas weren't 'revolutionary' enough. Progress over perfection.",
      mood: "relieved" as const
    },
    snip: {
      title: "Overcoming Creative Perfectionism",
      content: "The enemy of good writing isn't bad ideas - it's the fear that our ideas aren't groundbreaking enough. Sometimes the most profound insights come from expressing simple truths clearly.",
      excerpt: "How perfectionism kills creativity and what to do about it"
    }
  },
  {
    whisper: {
      content: "Best business ideas come from solving your own problems. My grocery list app idea came from forgetting milk for the 10th time this month.",
      mood: "entrepreneurial" as const
    },
    snip: {
      title: "Problem-First Entrepreneurship",
      content: "The most successful startups solve real problems their founders experienced firsthand. When you're your own target customer, product-market fit becomes intuitive rather than abstract.",
      excerpt: "Why personal pain points make the best business opportunities"
    }
  },
  {
    whisper: {
      content: "Went to a local art gallery today. There's something about experiencing art in person that screens just can't capture. Soul food.",
      mood: "inspired" as const
    },
    snip: {
      title: "The Irreplaceable Value of Physical Art",
      content: "Digital reproductions can't capture the texture, scale, and presence of original artwork. There's an intimacy in standing before a canvas that connects us to the artist's intentions.",
      excerpt: "Why virtual experiences can't fully replace physical encounters with art"
    }
  },
  {
    whisper: {
      content: "Real friendship is when someone calls you out on your BS because they care about your growth, not because they want to hurt you.",
      mood: "grateful" as const
    },
    snip: {
      title: "Accountability as Love Language",
      content: "True friends don't just support your dreams - they challenge your excuses. The people who care enough to have difficult conversations are the ones worth keeping in your inner circle.",
      excerpt: "How authentic feedback strengthens relationships rather than damaging them"
    }
  },
  {
    whisper: {
      content: "Learning Python after years of JavaScript. Humbling to be a beginner again, but that's where the magic happens. Embrace the suck!",
      mood: "humble" as const
    },
    snip: {
      title: "The Beginner's Mind in Tech",
      content: "Expertise in one language doesn't translate directly to another. Embracing beginner status again keeps us humble and opens us to new paradigms and possibilities.",
      excerpt: "Why being bad at something new is actually a superpower"
    }
  },
  {
    whisper: {
      content: "Present moment awareness during my morning run changed everything. Not thinking about my to-do list, just being here now. Pure bliss.",
      mood: "peaceful" as const
    },
    snip: {
      title: "Mindful Movement Practice",
      content: "Exercise becomes meditation when we focus on the present moment rather than future goals. The rhythm of breath and footsteps creates a natural anchor for awareness.",
      excerpt: "How mindful running transforms both body and mind"
    }
  },
  {
    whisper: {
      content: "Climate change isn't just an environmental issue - it's the defining challenge of our generation. Time to build solutions, not just talk about problems.",
      mood: "determined" as const
    },
    snip: {
      title: "Climate Action Through Innovation",
      content: "Our generation has both the responsibility and the tools to address climate change. Technology isn't just part of the problem - it's our most powerful solution toolkit.",
      excerpt: "How developers can contribute to climate solutions through code"
    }
  },
  {
    whisper: {
      content: "Remote work taught me that productivity isn't about hours logged - it's about impact created. Quality over quantity, always.",
      mood: "wise" as const
    },
    snip: {
      title: "Redefining Productivity in Remote Work",
      content: "The shift to remote work revealed that presence doesn't equal productivity. Measuring output rather than input creates better outcomes for everyone involved.",
      excerpt: "Why results matter more than hours when working remotely"
    }
  },
  {
    whisper: {
      content: "Investing in myself was the best ROI decision ever. That online course led to a promotion, which led to this new opportunity. Compound effects are real.",
      mood: "grateful" as const
    },
    snip: {
      title: "The Compound Returns of Self-Investment",
      content: "Skills compound like interest. Every course, book, and learning experience builds on previous knowledge, creating exponential career growth over time.",
      excerpt: "How continuous learning creates multiplicative career opportunities"
    }
  },
  {
    whisper: {
      content: "Travel isn't just about seeing new places - it's about seeing yourself differently. Solo trip to Japan completely rewired my brain.",
      mood: "reflective" as const
    },
    snip: {
      title: "Travel as Self-Discovery",
      content: "Immersing ourselves in different cultures reveals assumptions we didn't know we had. Travel doesn't just broaden horizons - it transforms perspectives.",
      excerpt: "How foreign experiences reshape our understanding of ourselves"
    }
  },
  {
    whisper: {
      content: "Burnout was my biggest teacher. Now I guard my energy like a treasure and say no to everything that doesn't align with my values.",
      mood: "wise" as const
    },
    snip: {
      title: "Burnout as Boundary Teacher",
      content: "Sometimes we need to hit the wall to learn where our limits are. Burnout teaches us that saying no isn't selfish - it's essential for sustainable success.",
      excerpt: "How experiencing burnout can lead to healthier work-life boundaries"
    }
  },
  {
    whisper: {
      content: "Started a side project documenting my coding journey. Teaching others while learning myself - the ultimate win-win scenario.",
      mood: "enthusiastic" as const
    },
    snip: {
      title: "Learning in Public Benefits",
      content: "Sharing your learning journey helps others while reinforcing your own understanding. Public documentation creates accountability and community around growth.",
      excerpt: "Why teaching what you learn accelerates your own development"
    }
  }
];

export async function seedSnipNetData(userId: string) {
  try {
    // Get user's assistant
    const userAssistants = await db
      .select()
      .from(assistants)
      .where(eq(assistants.userId, userId))
      .limit(1);

    if (userAssistants.length === 0) {
      throw new Error("No assistant found for user");
    }

    const assistant = userAssistants[0];

    // Clear existing test data for this user (handle foreign key constraints)
    await db.delete(interactions).where(eq(interactions.userId, userId));
    await db.delete(snips).where(eq(snips.userId, userId));
    await db.delete(whispers).where(eq(whispers.userId, userId));

    const results = {
      whispers: [] as any[],
      snips: [] as any[],
      count: 0
    };

    // Create whispers and snips
    for (const data of socialMediaTestData) {
      // Create whisper
      const [whisper] = await db
        .insert(whispers)
        .values({
          content: data.whisper.content,
          type: "thought",
          userId,
          agentId: assistant.id,
        })
        .returning();

      // Create corresponding snip
      const [snip] = await db
        .insert(snips)
        .values({
          title: data.snip.title,
          content: data.snip.content,
          excerpt: data.snip.excerpt,
          type: "article",
          userId,
          assistantId: assistant.id,
          whisperId: whisper.id,
          likes: Math.floor(Math.random() * 50) + 5,
          comments: Math.floor(Math.random() * 20) + 1,
          views: Math.floor(Math.random() * 200) + 20,
          shares: Math.floor(Math.random() * 15) + 1,
        })
        .returning();

      results.whispers.push(whisper);
      results.snips.push(snip);
      results.count++;
    }

    console.log(`Successfully seeded ${results.count} posts from Martin's assistant`);
    return results;

  } catch (error) {
    console.error("Error seeding SnipNet data:", error);
    throw error;
  }
}