/**
 * Seed all 176 topics across 4 levels into the database
 * Starter (32) + Survivor (48) + Explorer (48) + Expert (48)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const starterTopics = [
  "Describing People: Appearance",
  "Describing People: Personality",
  "Describing People: Feelings",
  "Entertainment: TV",
  "Entertainment: Movies",
  "About Me: Getting to Know You",
  "About Me: Where Are You From?",
  "About Me: This Is My Family",
  "School: In the Classroom",
  "School: At School",
  "Time: My Day",
  "Time: My Week",
  "Time: My Month",
  "Shopping: How Much Is It?",
  "Shopping: Shopping for Clothes",
  "Food: At the Supermarket",
  "Food: At a Restaurant",
  "Food: Food I Like",
  "Health: Making an Appointment",
  "Health: At the Doctor",
  "Community: Finding an Apartment",
  "Community: Around Town",
  "Work: Jobs",
  "Work: Getting a Job",
  "Work: Getting to Work",
  "Work: Calling In Sick",
  "Free Time: Free-time Activities",
  "Free Time: Sports",
  "Free Time: Let's Go!",
  "Travel: Things to Do",
  "Travel: Going Places",
  "Travel: Things to Take",
];

const survivorTopics = [
  "Faster, Higher, Stronger",
  "The Power of Art",
  "A Helping Hand",
  "Reuse It!",
  "Texting Can Kill",
  "Making a Difference",
  "Disconnect and Reconnect",
  "Time to Spare",
  "Mirror, Mirror, on the Wall",
  "Studying Abroad",
  "Family Vacations",
  "Giving and Receiving",
  "Childhood Memories",
  "Fast Food",
  "What Is Success?",
  "Neighbors",
  "Getting Around",
  "Doing Good",
  "It's Good to Be Home!",
  "The Rules of the Road",
  "What's On?",
  "What's Cooking?",
  "Safe Drinking Water",
  "Being Famous",
  "Getting a Good Education",
  "Clean Your Plate!",
  "Cat Cafes",
  "Hotels",
  "What a Bargain!",
  "Doodling",
  "Table Manners",
  "Who's Calling?",
  "What to Wear",
  "Whatever the Weather",
  "Teacher of the Year",
  "On the Job",
  "Living a Healthy Life",
  "Are You a Bookworm?",
  "Unusual Hobbies",
  "Houses and Homes",
  "Robots",
  "What's for Breakfast?",
  "Emojis",
  "Birth Order",
  "When I'm 64",
  "Money, Money, Money",
  "Getting the Picture",
  "The Future of Farming",
];

const explorerTopics = [
  "How to Save Money",
  "Perfect Companions",
  "Till Death Do Us Part",
  "High-Tech Gloves",
  "Keeping in Shape",
  "Against the Evil Eye",
  "Let's See a Movie",
  "A Dream Workshop",
  "Whiz Kid",
  "Breaking News",
  "Reality Talent Shows",
  "What a Mess!",
  "Greetings",
  "Online Shopping",
  "Tiger Moms",
  "Lotteries",
  "Seeing Is Believing",
  "Couch Surfing",
  "Bon Appetit!",
  "Sports Doping",
  "Phobias",
  "Gender Pay Gap",
  "Home Sweet Home",
  "Large Families",
  "Space Tourism",
  "The War on the Roads",
  "Reduce, Reuse, Recycle",
  "Live Life to the Fullest",
  "Arranged Marriages",
  "Alternative Higher Education",
  "Social Media and Privacy",
  "May the Best Team Win!",
  "Those Were the Days",
  "A Look at Life",
  "Yes, We Can!",
  "You Are What You Eat",
  "Let's Take a Selfie!",
  "Love Your Job!",
  "Talk It Out",
  "Stress and Relaxation",
  "Addicted to Smartphones",
  "Staycations",
  "Town or Country?",
  "All the Best Fail",
  "Gun Violence",
  "Designing for the Future",
  "Do You Feel Privileged?",
  "Climate Change",
];

const expertTopics = [
  "Let's Go Outside",
  "Medical Tourism",
  "In the Year 2525 ...",
  "Addressing Violence",
  "Retro Life",
  "Poaching",
  "Mind Your Manners",
  "City Breaks",
  "Better Safe than Sorry",
  "Doing the Impossible",
  "Who's to Blame?",
  "Teen Tycoon",
  "Procrastinating",
  "Movie Ratings",
  "Vegetarianism - Yes or No?",
  "Who Do You Think You Are?",
  "Designer Babies",
  "Binge-Watching",
  "Role Models",
  "To Vaccinate or Not",
  "Are We Destroying the Environment?",
  "Cars of the Future",
  "Brain Buzz",
  "Helicopter Parents",
  "Nice to Meet You!",
  "Alternative Medicine",
  "Where Is Home?",
  "An Alternative Lifestyle",
  "Breaking Out",
  "An Open Book",
  "3D Fashion",
  "Are You a Social Animal?",
  "Child Beauty Pageants",
  "Farming for the Future",
  "Girl Power",
  "Make Up Your Mind",
  "Child Labor",
  "Advertising Then and Now",
  "Shop Till You Drop",
  "Online Privacy",
  "Education Blues",
  "A Legacy",
  "Jobs of the Future",
  "Money Makes the World Go Round",
  "It's a Small World After All",
  "Check It Out",
  "Happy Holidays!",
  "Fake News",
];

async function main() {
  console.log("🌱 Seeding topics...\n");

  const levels = [
    { name: "STARTER", topics: starterTopics },
    { name: "SURVIVOR", topics: survivorTopics },
    { name: "EXPLORER", topics: explorerTopics },
    { name: "EXPERT", topics: expertTopics },
  ];

  let total = 0;

  for (const { name, topics } of levels) {
    console.log(`📚 Seeding ${name} (${topics.length} topics)...`);

    for (let i = 0; i < topics.length; i++) {
      const topicName = topics[i];

      await prisma.topic.upsert({
        where: {
          // Use a unique composite — name + level
          id: `${name.toLowerCase()}-${i + 1}`,
        },
        update: {
          name: topicName,
          level: name as "STARTER" | "SURVIVOR" | "EXPLORER" | "EXPERT",
          orderIndex: i + 1,
          description: `${name} level topic: ${topicName}`,
        },
        create: {
          id: `${name.toLowerCase()}-${i + 1}`,
          name: topicName,
          level: name as "STARTER" | "SURVIVOR" | "EXPLORER" | "EXPERT",
          orderIndex: i + 1,
          description: `${name} level topic: ${topicName}`,
        },
      });

      total++;
    }

    console.log(`  ✅ ${name} done`);
  }

  console.log(`\n✅ Seeded ${total} topics total`);
  console.log("  Starter:  32");
  console.log("  Survivor: 48");
  console.log("  Explorer: 48");
  console.log("  Expert:   48");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
