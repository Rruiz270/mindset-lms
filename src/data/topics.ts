// Topic scheduling system for Mindset LMS
// Starter level: 3-day cycle, Others: 2-day cycle

export interface TopicSchedule {
  id: string;
  name: string;
  level: 'STARTER' | 'SURVIVOR' | 'EXPLORER' | 'EXPERT';
  courseType: 'Smart Learning' | 'Smart Conversation';
  dayIndex: number; // Position in the cycle (starts from 1)
  description?: string;
  objectives?: string[];
  materials?: string[];
}

// Base topics for each level with their cycling pattern
export const STARTER_TOPICS: TopicSchedule[] = [
  // 3-day cycle topics for STARTER level (Smart Learning)
  { id: 'sl_starter_1', name: 'Travel: Things to Do', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 1 },
  { id: 'sl_starter_2', name: 'Travel: Going Places', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 4 },
  { id: 'sl_starter_3', name: 'Travel: Things to Take', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 8 },
  { id: 'sl_starter_4', name: 'Describing People: Appearance', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 11 },
  { id: 'sl_starter_5', name: 'Describing People: Personality', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 15 },
  { id: 'sl_starter_6', name: 'Describing People: Feelings', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 18 },
  { id: 'sl_starter_7', name: 'Entertainment: TV', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 22 },
  { id: 'sl_starter_8', name: 'Entertainment: Movies', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 25 },
  { id: 'sl_starter_9', name: 'About Me: Getting to Know You', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 29 },
  { id: 'sl_starter_10', name: 'About Me: Where Are You From?', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 32 },
  { id: 'sl_starter_11', name: 'About Me: This Is My Family', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 36 },
  { id: 'sl_starter_12', name: 'School: In the Classroom', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 39 },
  { id: 'sl_starter_13', name: 'School: At School', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 43 },
  { id: 'sl_starter_14', name: 'Time: My Day', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 46 },
  { id: 'sl_starter_15', name: 'Time: My Week', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 50 },
  { id: 'sl_starter_16', name: 'Time: My Month', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 53 },
  { id: 'sl_starter_17', name: 'Shopping: How Much Is It?', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 57 },
  { id: 'sl_starter_18', name: 'Shopping: Shopping for Clothes', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 60 },
  { id: 'sl_starter_19', name: 'Food: At the Supermarket', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 64 },
  { id: 'sl_starter_20', name: 'Food: At a Restaurant', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 67 },
  { id: 'sl_starter_21', name: 'Food: Food I Like', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 71 },
  { id: 'sl_starter_22', name: 'Health: Making an Appointment', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 74 },
  { id: 'sl_starter_23', name: 'Health: At the Doctor', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 78 },
  { id: 'sl_starter_24', name: 'Community: Finding an Apartment', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 81 },
  { id: 'sl_starter_25', name: 'Community: Around Town', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 85 },
  { id: 'sl_starter_26', name: 'Work: Jobs', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 88 },
  { id: 'sl_starter_27', name: 'Work: Getting a Job', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 92 },
  { id: 'sl_starter_28', name: 'Work: Getting to Work', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 95 },
  { id: 'sl_starter_29', name: 'Work: Calling In Sick', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 99 },
  { id: 'sl_starter_30', name: 'Free Time: Free-time Activities', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 102 },
  { id: 'sl_starter_31', name: 'Free Time: Sports', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 106 },
  { id: 'sl_starter_32', name: 'Free Time: Let\'s Go!', level: 'STARTER', courseType: 'Smart Learning', dayIndex: 109 },
];

export const SURVIVOR_TOPICS: TopicSchedule[] = [
  // 2-day cycle topics for SURVIVOR level (Smart Learning)
  { id: 'sl_survivor_1', name: 'Birth Order', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 1 },
  { id: 'sl_survivor_2', name: 'When I\'m 64', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 3 },
  { id: 'sl_survivor_3', name: 'Money, Money, Money', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 5 },
  { id: 'sl_survivor_4', name: 'Getting the Picture', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 8 },
  { id: 'sl_survivor_5', name: 'The Future of Farming', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 10 },
  { id: 'sl_survivor_6', name: 'Faster, Higher, Stronger', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 12 },
  { id: 'sl_survivor_7', name: 'The Power of Art', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 15 },
  { id: 'sl_survivor_8', name: 'A Helping Hand', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 17 },
  { id: 'sl_survivor_9', name: 'Reuse It!', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 19 },
  { id: 'sl_survivor_10', name: 'Texting Can Kill', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 22 },
  { id: 'sl_survivor_11', name: 'Making a Difference', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 24 },
  { id: 'sl_survivor_12', name: 'Disconnect and Reconnect', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 26 },
  { id: 'sl_survivor_13', name: 'Time to Spare', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 29 },
  { id: 'sl_survivor_14', name: 'Mirror, Mirror, on the Wall', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 31 },
  { id: 'sl_survivor_15', name: 'Studying Abroad', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 33 },
  { id: 'sl_survivor_16', name: 'Family Vacations', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 36 },
  { id: 'sl_survivor_17', name: 'Giving and Receiving', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 38 },
  { id: 'sl_survivor_18', name: 'Childhood Memories', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 40 },
  { id: 'sl_survivor_19', name: 'Fast Food', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 43 },
  { id: 'sl_survivor_20', name: 'What Is Success?', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 45 },
  { id: 'sl_survivor_21', name: 'Neighbors', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 47 },
  { id: 'sl_survivor_22', name: 'Getting Around', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 50 },
  { id: 'sl_survivor_23', name: 'Doing Good', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 52 },
  { id: 'sl_survivor_24', name: 'It\'s Good to Be Home!', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 54 },
  { id: 'sl_survivor_25', name: 'The Rules of the Road', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 57 },
  { id: 'sl_survivor_26', name: 'What\'s On?', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 59 },
  { id: 'sl_survivor_27', name: 'What\'s Cooking?', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 61 },
  { id: 'sl_survivor_28', name: 'Safe Drinking Water', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 64 },
  { id: 'sl_survivor_29', name: 'Being Famous', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 66 },
  { id: 'sl_survivor_30', name: 'Getting a Good Education', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 68 },
  { id: 'sl_survivor_31', name: 'Clean Your Plate!', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 71 },
  { id: 'sl_survivor_32', name: 'Cat Cafes', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 73 },
  { id: 'sl_survivor_33', name: 'Hotels', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 75 },
  { id: 'sl_survivor_34', name: 'What a Bargain!', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 78 },
  { id: 'sl_survivor_35', name: 'Doodling', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 80 },
  { id: 'sl_survivor_36', name: 'Table Manners', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 82 },
  { id: 'sl_survivor_37', name: 'Who\'s Calling?', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 85 },
  { id: 'sl_survivor_38', name: 'What to Wear', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 87 },
  { id: 'sl_survivor_39', name: 'Whatever the Weather', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 89 },
  { id: 'sl_survivor_40', name: 'Teacher of the Year', level: 'SURVIVOR', courseType: 'Smart Learning', dayIndex: 92 },
];

export const EXPLORER_TOPICS: TopicSchedule[] = [
  // 2-day cycle topics for EXPLORER level (Smart Conversation)
  { id: 'sc_explorer_1', name: 'All the Best Fail', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 1 },
  { id: 'sc_explorer_2', name: 'Gun Violence', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 3 },
  { id: 'sc_explorer_3', name: 'Designing for the Future', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 5 },
  { id: 'sc_explorer_4', name: 'Do You Feel Privileged?', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 8 },
  { id: 'sc_explorer_5', name: 'Climate Change', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 10 },
  { id: 'sc_explorer_6', name: 'How to Save Money', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 12 },
  { id: 'sc_explorer_7', name: 'Perfect Companions', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 15 },
  { id: 'sc_explorer_8', name: 'Till Death Do Us Part', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 17 },
  { id: 'sc_explorer_9', name: 'High-Tech Gloves', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 19 },
  { id: 'sc_explorer_10', name: 'Keeping in Shape', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 22 },
  { id: 'sc_explorer_11', name: 'Against the Evil Eye', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 24 },
  { id: 'sc_explorer_12', name: 'Let\'s See a Movie', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 26 },
  { id: 'sc_explorer_13', name: 'A Dream Workshop', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 29 },
  { id: 'sc_explorer_14', name: 'Whiz Kid', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 31 },
  { id: 'sc_explorer_15', name: 'Breaking News', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 33 },
  { id: 'sc_explorer_16', name: 'Reality Talent Shows', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 36 },
  { id: 'sc_explorer_17', name: 'What a Mess!', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 38 },
  { id: 'sc_explorer_18', name: 'Greetings', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 40 },
  { id: 'sc_explorer_19', name: 'Online Shopping', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 43 },
  { id: 'sc_explorer_20', name: 'Tiger Moms', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 45 },
  { id: 'sc_explorer_21', name: 'Lotteries', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 47 },
  { id: 'sc_explorer_22', name: 'Seeing Is Believing', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 50 },
  { id: 'sc_explorer_23', name: 'Couch Surfing', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 52 },
  { id: 'sc_explorer_24', name: 'Bon Appetit!', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 54 },
  { id: 'sc_explorer_25', name: 'Sports Doping', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 57 },
  { id: 'sc_explorer_26', name: 'Phobias', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 59 },
  { id: 'sc_explorer_27', name: 'Gender Pay Gap', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 61 },
  { id: 'sc_explorer_28', name: 'Home Sweet Home', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 64 },
  { id: 'sc_explorer_29', name: 'Large Families', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 66 },
  { id: 'sc_explorer_30', name: 'Space Tourism', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 68 },
  { id: 'sc_explorer_31', name: 'The War on the Roads', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 71 },
  { id: 'sc_explorer_32', name: 'Reduce, Reuse, Recycle', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 73 },
  { id: 'sc_explorer_33', name: 'Live Life to the Fullest', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 75 },
  { id: 'sc_explorer_34', name: 'Arranged Marriages', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 78 },
  { id: 'sc_explorer_35', name: 'Alternative Higher Education', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 80 },
  { id: 'sc_explorer_36', name: 'Social Media and Privacy', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 82 },
  { id: 'sc_explorer_37', name: 'May the Best Team Win!', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 85 },
  { id: 'sc_explorer_38', name: 'Those Were the Days', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 87 },
  { id: 'sc_explorer_39', name: 'A Look at Life', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 89 },
  { id: 'sc_explorer_40', name: 'Yes, We Can!', level: 'EXPLORER', courseType: 'Smart Conversation', dayIndex: 92 },
];

export const EXPERT_TOPICS: TopicSchedule[] = [
  // 2-day cycle topics for EXPERT level (Smart Conversation)
  { id: 'sc_expert_1', name: 'Money Makes the World Go Round', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 1 },
  { id: 'sc_expert_2', name: 'It\'s a Small World After All', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 3 },
  { id: 'sc_expert_3', name: 'Check It Out', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 5 },
  { id: 'sc_expert_4', name: 'Happy Holidays!', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 8 },
  { id: 'sc_expert_5', name: 'Fake News', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 10 },
  { id: 'sc_expert_6', name: 'Let\'s Go Outside', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 12 },
  { id: 'sc_expert_7', name: 'Medical Tourism', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 15 },
  { id: 'sc_expert_8', name: 'In the Year 2525 ...', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 17 },
  { id: 'sc_expert_9', name: 'Addressing Violence', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 19 },
  { id: 'sc_expert_10', name: 'Retro Life', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 22 },
  { id: 'sc_expert_11', name: 'Poaching', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 24 },
  { id: 'sc_expert_12', name: 'Mind Your Manners', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 26 },
  { id: 'sc_expert_13', name: 'City Breaks', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 29 },
  { id: 'sc_expert_14', name: 'Better Safe than Sorry', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 31 },
  { id: 'sc_expert_15', name: 'Doing the Impossible', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 33 },
  { id: 'sc_expert_16', name: 'Who\'s to Blame?', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 36 },
  { id: 'sc_expert_17', name: 'Teen Tycoon', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 38 },
  { id: 'sc_expert_18', name: 'Procrastinating', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 40 },
  { id: 'sc_expert_19', name: 'Movie Ratings', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 43 },
  { id: 'sc_expert_20', name: 'Vegetarianism - Yes or No?', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 45 },
  { id: 'sc_expert_21', name: 'Who Do You Think You Are?', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 47 },
  { id: 'sc_expert_22', name: 'Designer Babies', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 50 },
  { id: 'sc_expert_23', name: 'Binge-Watching', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 52 },
  { id: 'sc_expert_24', name: 'Role Models', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 54 },
  { id: 'sc_expert_25', name: 'To Vaccinate or Not', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 57 },
  { id: 'sc_expert_26', name: 'Are We Destroying the Environment?', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 59 },
  { id: 'sc_expert_27', name: 'Cars of the Future', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 61 },
  { id: 'sc_expert_28', name: 'Brain Buzz', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 64 },
  { id: 'sc_expert_29', name: 'Helicopter Parents', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 66 },
  { id: 'sc_expert_30', name: 'Nice to Meet You!', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 68 },
  { id: 'sc_expert_31', name: 'Alternative Medicine', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 71 },
  { id: 'sc_expert_32', name: 'Where Is Home?', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 73 },
  { id: 'sc_expert_33', name: 'An Alternative Lifestyle', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 75 },
  { id: 'sc_expert_34', name: 'Breaking Out', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 78 },
  { id: 'sc_expert_35', name: 'An Open Book', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 80 },
  { id: 'sc_expert_36', name: '3D Fashion', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 82 },
  { id: 'sc_expert_37', name: 'Are You a Social Animal?', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 85 },
  { id: 'sc_expert_38', name: 'Child Beauty Pageants', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 87 },
  { id: 'sc_expert_39', name: 'Farming for the Future', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 89 },
  { id: 'sc_expert_40', name: 'Girl Power', level: 'EXPERT', courseType: 'Smart Conversation', dayIndex: 92 },
];

// Combined topics array
export const ALL_TOPICS = [...STARTER_TOPICS, ...SURVIVOR_TOPICS, ...EXPLORER_TOPICS, ...EXPERT_TOPICS];

// Helper function to get topics by level
export const getTopicsByLevel = (level: 'STARTER' | 'SURVIVOR' | 'EXPLORER' | 'EXPERT'): TopicSchedule[] => {
  switch (level) {
    case 'STARTER':
      return STARTER_TOPICS;
    case 'SURVIVOR':
      return SURVIVOR_TOPICS;
    case 'EXPLORER':
      return EXPLORER_TOPICS;
    case 'EXPERT':
      return EXPERT_TOPICS;
    default:
      return [];
  }
};

// Helper function to calculate what topic should be shown for a given date and level
export const getTopicForDate = (date: Date, level: 'STARTER' | 'SURVIVOR' | 'EXPLORER' | 'EXPERT'): TopicSchedule | null => {
  const topics = getTopicsByLevel(level);
  if (topics.length === 0) return null;

  // Handle Sundays (no topic lessons)
  if (date.getDay() === 0) return null;

  // Calculate days since September 1, 2025 (Monday) - the start date from your calendar
  const startDate = new Date(2025, 8, 1); // Sept 1, 2025 (month is 0-based)
  const daysSinceStart = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // If date is before start date, return null
  if (daysSinceStart < 0) return null;

  // Calculate the week number and day of week (Monday = 1, Tuesday = 2, etc., Sunday = 0)
  const dayOfWeek = date.getDay();
  const weekNumber = Math.floor(daysSinceStart / 7);
  
  // Calculate teaching days (excluding Sundays)
  let teachingDaysSinceStart = weekNumber * 6; // 6 teaching days per week
  
  // Add days within current week (excluding Sunday)
  if (dayOfWeek > 0) {
    teachingDaysSinceStart += dayOfWeek - 1; // Monday = 0, Tuesday = 1, etc.
  } else {
    return null; // Sunday - no classes
  }

  let topicIndex: number;
  
  if (level === 'STARTER') {
    // STARTER: 3-day cycle (Mon-Tue-Wed same topic, Thu-Fri-Sat same topic, etc.)
    topicIndex = Math.floor(teachingDaysSinceStart / 3) % topics.length;
  } else {
    // SURVIVOR, EXPLORER, EXPERT: 2-day cycle (Mon-Tue same, Wed-Thu same, Fri-Sat same)
    topicIndex = Math.floor(teachingDaysSinceStart / 2) % topics.length;
  }

  return topics[topicIndex] || null;
};

// Helper function to get upcoming topics for a student
export const getUpcomingTopics = (level: 'STARTER' | 'SURVIVOR' | 'EXPLORER' | 'EXPERT', days: number = 7): TopicSchedule[] => {
  const topics: TopicSchedule[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    
    const topic = getTopicForDate(checkDate, level);
    if (topic && !topics.find(t => t.id === topic.id)) {
      topics.push(topic);
    }
  }
  
  return topics;
};