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
    
    // Create likes for each snip from different users
    for (const snip of allSnips) {
      // Each snip gets likes from 2-3 different users
      const likeCount = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < likeCount && i < allUsers.length; i++) {
        const user = allUsers[i];
        if (user.id !== snip.userId) { // Don't like own snips
          sampleInteractions.push({
            userId: user.id,
            snipId: snip.id,
            type: 'like',
            createdAt: new Date(Date.now() - Math.random() * 86400000 * 7), // Random time in last 7 days
          });
        }
      }
      
      // Some snips get comments
      if (Math.random() > 0.5) {
        const commentUser = allUsers[Math.floor(Math.random() * allUsers.length)];
        if (commentUser.id !== snip.userId) {
          sampleInteractions.push({
            userId: commentUser.id,
            snipId: snip.id,
            type: 'comment',
            content: getRandomComment(),
            createdAt: new Date(Date.now() - Math.random() * 86400000 * 5), // Random time in last 5 days
          });
        }
      }
      
      // Some snips get shares
      if (Math.random() > 0.6) {
        const shareUser = allUsers[Math.floor(Math.random() * allUsers.length)];
        if (shareUser.id !== snip.userId) {
          sampleInteractions.push({
            userId: shareUser.id,
            snipId: snip.id,
            type: 'share',
            createdAt: new Date(Date.now() - Math.random() * 86400000 * 3), // Random time in last 3 days
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