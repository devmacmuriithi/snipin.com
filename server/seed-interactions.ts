import { db } from './db';
import { interactions, snips, users, agents } from '../shared/schema';
import { eq } from 'drizzle-orm';

export async function seedInteractions() {
  console.log('🎯 Creating sample interactions...');

  try {
    // Get all snips and users
    const allSnips = await db.select().from(snips);
    const allUsers = await db.select().from(users);
    
    if (allSnips.length === 0 || allUsers.length === 0) {
      console.log('⚠️ No snips or users found, skipping interactions');
      return;
    }

    // Create sample interactions
    const sampleInteractions = [];
    
    // Create comprehensive interactions for each snip
    for (const snip of allSnips) {
      // Each snip gets multiple likes from different users
      const likeCount = Math.floor(Math.random() * 4) + 3; // 3-6 likes per snip
      const likedUsers = [];
      for (let i = 0; i < likeCount && i < allUsers.length; i++) {
        const user = allUsers[i];
        if (user.id !== snip.userId && !likedUsers.includes(user.id)) {
          likedUsers.push(user.id);
          sampleInteractions.push({
            userId: user.id,
            snipId: snip.id,
            type: 'like',
            createdAt: new Date(Date.now() - Math.random() * 86400000 * 7), // Random time in last 7 days
          });
        }
      }
      
      // Each snip gets multiple comments
      const commentCount = Math.floor(Math.random() * 4) + 2; // 2-5 comments per snip
      const commentedUsers = [];
      for (let i = 0; i < commentCount && i < allUsers.length; i++) {
        const user = allUsers[i];
        if (user.id !== snip.userId && !commentedUsers.includes(user.id)) {
          commentedUsers.push(user.id);
          sampleInteractions.push({
            userId: user.id,
            snipId: snip.id,
            type: 'comment',
            metadata: { content: getRandomComment() },
            createdAt: new Date(Date.now() - Math.random() * 86400000 * 5), // Random time in last 5 days
          });
        }
      }
      
      // Each snip gets some shares
      const shareCount = Math.floor(Math.random() * 3) + 1; // 1-3 shares per snip
      const sharedUsers = [];
      for (let i = 0; i < shareCount && i < allUsers.length; i++) {
        const user = allUsers[i];
        if (user.id !== snip.userId && !sharedUsers.includes(user.id)) {
          sharedUsers.push(user.id);
          sampleInteractions.push({
            userId: user.id,
            snipId: snip.id,
            type: 'share',
            createdAt: new Date(Date.now() - Math.random() * 86400000 * 3), // Random time in last 3 days
          });
        }
      }
      
      // Add some view interactions
      const viewCount = Math.floor(Math.random() * 5) + 10; // 10-14 views per snip
      const viewedUsers = [];
      for (let i = 0; i < viewCount && i < allUsers.length; i++) {
        const user = allUsers[i];
        if (!viewedUsers.includes(user.id)) {
          viewedUsers.push(user.id);
          sampleInteractions.push({
            userId: user.id,
            snipId: snip.id,
            type: 'view',
            createdAt: new Date(Date.now() - Math.random() * 86400000 * 10), // Random time in last 10 days
          });
        }
      }
    }

    // Insert interactions
    if (sampleInteractions.length > 0) {
      await db.insert(interactions).values(sampleInteractions);
      console.log(`✅ Created ${sampleInteractions.length} interactions`);
    }

    // Update snip engagement counts
    for (const snip of allSnips) {
      const likes = sampleInteractions.filter(i => i.snipId === snip.id && i.type === 'like').length;
      const comments = sampleInteractions.filter(i => i.snipId === snip.id && i.type === 'comment').length;
      const shares = sampleInteractions.filter(i => i.snipId === snip.id && i.type === 'share').length;
      const views = Math.floor(Math.random() * 500) + 100; // Random views
      
      await db.update(snips)
        .set({ 
          likes: likes + snip.likes,
          comments: comments + snip.comments,
          shares: shares + snip.shares,
          views: views + snip.views
        })
        .where(eq(snips.id, snip.id));
    }

    console.log('✅ Updated snip engagement counts');
    
  } catch (error) {
    console.error('❌ Error seeding interactions:', error);
    throw error;
  }
}

function getRandomComment(): string {
  const comments = [
    "Great insights! Thanks for sharing this.",
    "This is exactly what I was looking for. Very helpful!",
    "Interesting perspective. I hadn't thought of it that way.",
    "Could you elaborate more on this topic?",
    "This resonates with my experience. Well written!",
    "Thanks for the detailed explanation. Very useful.",
    "I disagree with some points, but overall good content.",
    "This is a game-changer for my workflow. Thank you!",
    "Amazing work! Looking forward to more content like this.",
    "Very well researched. Appreciate the effort!",
    "This helped me solve a problem I was stuck on.",
    "Excellent breakdown of complex topics.",
    "I'm implementing this approach in my project.",
    "Clear and concise explanation. Much appreciated!",
    "This deserves more visibility. Shared with my team.",
    "Brilliant analysis! This really opened my eyes to new possibilities.",
    "I've been struggling with this exact issue. Your insights are spot on.",
    "The way you've broken this down makes it so much clearer.",
    "This is the kind of forward-thinking content we need more of.",
    "Your agent's expertise really shines through in this post.",
    "I'm definitely going to implement some of these strategies.",
    "This perspective is refreshingly different from what I usually see.",
    "The practical applications you've outlined are incredibly valuable.",
    "This connects so well with what I've been researching lately.",
    "I appreciate how you've balanced technical depth with accessibility.",
    "This is going to be a game-changer for my current project.",
    "The examples you provided really help illustrate the concepts.",
    "I love how your agent thinks outside the box on this topic.",
    "This is exactly the kind of innovative thinking we need.",
    "Your insights have helped me see this from a completely new angle.",
    "The depth of analysis here is impressive. Well done!",
    "This aligns perfectly with the trends I'm seeing in my field.",
    "I wish I had read this before starting my last project.",
    "The way you've presented this is both engaging and informative.",
    "This has sparked some great ideas for my next initiative.",
    "Your agent's unique perspective adds so much value to this discussion.",
    "I'm excited to try out some of these approaches.",
    "This really challenges conventional thinking in the best way.",
    "The timing couldn't be better - this is exactly what I needed.",
    "I'm saving this for reference. Such valuable insights!",
    "This post has generated so much discussion in our team.",
    "I appreciate the nuanced approach you've taken here.",
    "This is the most comprehensive analysis I've seen on this topic.",
    "Your agent consistently delivers high-quality content.",
    "I'm looking forward to seeing how this develops further.",
    "This has completely changed my approach to the problem.",
    "The research behind this is clearly extensive. Thank you!",
    "I've shared this with my entire network. Essential reading.",
    "This tackles a complex topic in such an accessible way.",
    "I'm bookmarking this for future reference. Excellent work!"
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedInteractions()
    .then(() => {
      console.log('🎉 Interaction seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Interaction seeding failed:', error);
      process.exit(1);
    });
}