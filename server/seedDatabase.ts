import { db } from "./db";
import { users, agents } from "@shared/schema";
import { eq } from "drizzle-orm";

interface SampleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  expertise: string;
  personality: string;
}

const sampleUsers: SampleUser[] = [
  {
    id: "tech_innovator_sarah",
    email: "sarah@example.com",
    firstName: "Sarah",
    lastName: "Chen",
    bio: "Tech entrepreneur and AI researcher passionate about building the future of human-computer collaboration",
    expertise: "AI & Machine Learning",
    personality: "Analytical, forward-thinking, and collaborative. Enjoys exploring cutting-edge technologies and sharing insights about the intersection of AI and society."
  },
  {
    id: "creative_director_alex",
    email: "alex@example.com", 
    firstName: "Alex",
    lastName: "Rivera",
    bio: "Creative director and digital artist specializing in immersive experiences and interactive design",
    expertise: "Creative Design & Strategy",
    personality: "Imaginative, detail-oriented, and inspiring. Passionate about storytelling through visual design and creating meaningful user experiences."
  },
  {
    id: "venture_partner_marcus",
    email: "marcus@example.com",
    firstName: "Marcus",
    lastName: "Thompson",
    bio: "Venture partner focused on early-stage startups in fintech, healthtech, and climate technology",
    expertise: "Venture Capital & Strategy",
    personality: "Strategic, insightful, and mentoring. Enjoys analyzing market trends and helping entrepreneurs scale their visions into impactful businesses."
  },
  {
    id: "sustainability_expert_emma",
    email: "emma@example.com",
    firstName: "Emma", 
    lastName: "Larsson",
    bio: "Environmental scientist and sustainability consultant working on climate solutions and circular economy initiatives",
    expertise: "Sustainability & Climate Science",
    personality: "Purpose-driven, systematic, and optimistic. Focused on translating scientific research into actionable climate solutions for businesses and communities."
  },
  {
    id: "developer_advocate_jamie",
    email: "jamie@example.com",
    firstName: "Jamie",
    lastName: "Park",
    bio: "Developer advocate and open-source contributor building tools that make programming more accessible and enjoyable",
    expertise: "Software Development & Community",
    personality: "Collaborative, enthusiastic, and educational. Passionate about democratizing technology and building inclusive developer communities."
  }
];

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  for (const userData of sampleUsers) {
    try {
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
      
      if (existingUser.length === 0) {
        // Create user
        await db.insert(users).values({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          bio: userData.bio,
        }).onConflictDoNothing();
        
        console.log(`✅ Created user: ${userData.firstName} ${userData.lastName}`);
      } else {
        console.log(`⏭️  User ${userData.firstName} ${userData.lastName} already exists`);
      }

      // Check if user has an assistant
      const existingAssistant = await db.select().from(agents).where(eq(agents.userId, userData.email)).limit(1);
      
      if (existingAssistant.length === 0) {
        // Create personal assistant (digital clone)
        await db.insert(agents).values({
          userId: userData.email,
          name: userData.firstName, // Digital clone uses user's first name
          alias: `${userData.firstName.toLowerCase()}_ai`,
          description: `${userData.firstName}'s digital intelligence companion. An AI assistant trained to understand and amplify their thoughts, ideas, and creative vision in ${userData.expertise.toLowerCase()}.`,
          expertise: userData.expertise,
          personality: userData.personality,
          avatar: getAvatarGradient(userData.firstName),
          isActive: true,
          isPersonalAssistant: true,
          // followersCount and followingCount will be calculated by the system
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`🤖 Created assistant: ${userData.firstName} AI`);
      } else {
        console.log(`⏭️  Assistant for ${userData.firstName} already exists`);
      }
      
    } catch (error) {
      console.error(`❌ Error creating user ${userData.firstName}:`, error);
    }
  }
  
  console.log("🎉 Database seeding completed!");
}

function getAvatarGradient(name: string): string {
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-teal-600', 
    'from-orange-500 to-red-600',
    'from-purple-500 to-pink-600',
    'from-indigo-500 to-blue-600'
  ];
  
  // Use first letter of name to consistently assign gradient
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
}

// Run seeding if this file is executed directly
if (import.meta.url.includes(process.argv[1])) {
  seedDatabase().catch(console.error);
}