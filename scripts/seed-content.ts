/**
 * Content Generation Script for Mindset LMS
 *
 * Generates exercises, slides, and homework for ALL 176 topics
 * using Anthropic Claude Haiku API.
 *
 * Usage: npx tsx scripts/seed-content.ts [--level STARTER|SURVIVOR|EXPLORER|EXPERT] [--dry-run] [--skip-existing]
 */

import { PrismaClient, Level } from '@prisma/client'
import Anthropic from '@anthropic-ai/sdk'

const prisma = new PrismaClient()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── CLI Args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const levelFilter = args.includes('--level')
  ? (args[args.indexOf('--level') + 1]?.toUpperCase() as Level)
  : null
const dryRun = args.includes('--dry-run')
const skipExisting = args.includes('--skip-existing')

// ─── Level → CEFR mapping ───────────────────────────────────────────────────

const LEVEL_DESCRIPTIONS: Record<Level, string> = {
  STARTER: 'A0-A1 (Beginner). Use very simple sentences (5-8 words). Basic vocabulary only. Present simple tense. No idioms. Concrete topics.',
  SURVIVOR: 'A2-B1 (Elementary-Intermediate). Everyday situations and common expressions. Simple compound sentences. Past simple, present continuous. Common phrasal verbs.',
  EXPLORER: 'B1-B2 (Intermediate-Upper Intermediate). Opinions on current topics. Complex grammar (conditionals, passive voice, reported speech). Abstract concepts. Some idiomatic expressions.',
  EXPERT: 'B2-C1 (Upper Intermediate-Advanced). Nuanced debates, academic vocabulary. Complex sentence structures. Subjunctive, mixed conditionals. Formal and informal registers.',
}

// ─── Prompts ─────────────────────────────────────────────────────────────────

function buildExercisePrompt(topicName: string, level: Level): string {
  return `You are an expert ESL content creator. Generate 5 pre-class exercises for the topic "${topicName}".

LEVEL: ${level} — ${LEVEL_DESCRIPTIONS[level]}

Create exactly 5 exercises, one for each category below. Return ONLY valid JSON (no markdown, no code fences).

The JSON must be an array of 5 objects with this exact structure:
[
  {
    "category": "READING",
    "type": "MULTIPLE_CHOICE",
    "title": "Reading: [topic-related title]",
    "instructions": "[clear instruction for the student]",
    "content": {
      "passage": "[a short reading passage, 3-6 sentences appropriate for the level]",
      "questions": [
        {
          "question": "[comprehension question about the passage]",
          "options": ["A) ...", "B) ...", "C) ...", "D) ..."]
        },
        {
          "question": "[second question]",
          "options": ["A) ...", "B) ...", "C) ...", "D) ..."]
        }
      ]
    },
    "correctAnswer": { "answers": ["B", "A"] },
    "points": 10
  },
  {
    "category": "WRITING",
    "type": "ESSAY",
    "title": "Writing: [topic-related title]",
    "instructions": "[writing task instruction]",
    "content": {
      "prompt": "[clear writing prompt appropriate for the level]",
      "minWords": ${level === 'STARTER' ? 30 : level === 'SURVIVOR' ? 60 : level === 'EXPLORER' ? 100 : 150},
      "guideQuestions": ["[helpful question 1]", "[helpful question 2]", "[helpful question 3]"]
    },
    "correctAnswer": null,
    "points": 20
  },
  {
    "category": "LISTENING",
    "type": "TRUE_FALSE",
    "title": "Listening: [topic-related title]",
    "instructions": "Read the dialogue and decide if the statements are true or false.",
    "content": {
      "dialogue": "[a short dialogue between 2 people, 4-8 lines, related to the topic]",
      "statements": [
        { "statement": "[statement about the dialogue]", "isTrue": true },
        { "statement": "[statement about the dialogue]", "isTrue": false },
        { "statement": "[statement about the dialogue]", "isTrue": true }
      ]
    },
    "correctAnswer": { "answers": [true, false, true] },
    "points": 10
  },
  {
    "category": "SPEAKING",
    "type": "AUDIO_RECORDING",
    "title": "Speaking: [topic-related title]",
    "instructions": "[speaking task instruction]",
    "content": {
      "prompt": "[what the student should talk about]",
      "talkingPoints": ["[point 1]", "[point 2]", "[point 3]"],
      "minDuration": ${level === 'STARTER' ? 30 : level === 'SURVIVOR' ? 45 : 60},
      "usefulPhrases": ["[phrase 1]", "[phrase 2]", "[phrase 3]", "[phrase 4]"]
    },
    "correctAnswer": null,
    "points": 15
  },
  {
    "category": "GRAMMAR",
    "type": "GAP_FILL",
    "title": "Grammar: [topic-related grammar point]",
    "instructions": "[grammar exercise instruction]",
    "content": {
      "grammarFocus": "[the grammar point being practiced]",
      "sentences": [
        { "text": "I ___ to the store yesterday.", "gap": "went", "hint": "(go)" },
        { "text": "She ___ her homework right now.", "gap": "is doing", "hint": "(do)" },
        { "text": "[sentence 3]", "gap": "[answer]", "hint": "([base form])" },
        { "text": "[sentence 4]", "gap": "[answer]", "hint": "([base form])" },
        { "text": "[sentence 5]", "gap": "[answer]", "hint": "([base form])" }
      ]
    },
    "correctAnswer": { "answers": ["went", "is doing", "[answer3]", "[answer4]", "[answer5]"] },
    "points": 10
  }
]

IMPORTANT RULES:
- All content MUST be in English
- Difficulty MUST match the ${level} level (${LEVEL_DESCRIPTIONS[level]})
- The reading passage, dialogue, and grammar sentences MUST relate to "${topicName}"
- Provide EXACTLY 5 exercises in the array
- Return ONLY the JSON array, no other text`
}

function buildSlidesPrompt(topicName: string, level: Level): string {
  return `You are an expert ESL teacher creating live class slides for the topic "${topicName}".

LEVEL: ${level} — ${LEVEL_DESCRIPTIONS[level]}

Create exactly 5 slides for a 60-minute live class. Return ONLY valid JSON (no markdown, no code fences).

The JSON must be an array of 5 objects:
[
  {
    "slideNumber": 1,
    "title": "Warm-up: [engaging title]",
    "type": "intro",
    "content": {
      "objective": "[what students will learn today]",
      "warmUpActivity": "[fun icebreaker question or activity related to the topic]",
      "discussionQuestions": ["[question 1]", "[question 2]"],
      "timeMinutes": 10
    },
    "notes": "[teacher notes: how to guide the warm-up, what to look for]"
  },
  {
    "slideNumber": 2,
    "title": "Vocabulary: [subtitle]",
    "type": "vocabulary",
    "content": {
      "words": [
        { "word": "[word]", "definition": "[simple definition]", "example": "[example sentence]", "partOfSpeech": "[noun/verb/adj/etc]" },
        { "word": "[word 2]", "definition": "[definition]", "example": "[example]", "partOfSpeech": "[pos]" },
        { "word": "[word 3]", "definition": "[definition]", "example": "[example]", "partOfSpeech": "[pos]" },
        { "word": "[word 4]", "definition": "[definition]", "example": "[example]", "partOfSpeech": "[pos]" },
        { "word": "[word 5]", "definition": "[definition]", "example": "[example]", "partOfSpeech": "[pos]" },
        { "word": "[word 6]", "definition": "[definition]", "example": "[example]", "partOfSpeech": "[pos]" }
      ],
      "activity": "[vocabulary practice activity description]",
      "timeMinutes": 12
    },
    "notes": "[teacher notes for vocabulary presentation]"
  },
  {
    "slideNumber": 3,
    "title": "[Reading or Listening activity title]",
    "type": "grammar",
    "content": {
      "grammarPoint": "[the grammar structure being taught]",
      "explanation": "[clear grammar explanation appropriate for the level]",
      "examples": ["[example 1]", "[example 2]", "[example 3]"],
      "practiceActivity": "[controlled practice activity]",
      "timeMinutes": 15
    },
    "notes": "[teacher notes for grammar presentation and common errors to watch for]"
  },
  {
    "slideNumber": 4,
    "title": "Discussion: [engaging title]",
    "type": "communication",
    "content": {
      "activity": "[description of the communication activity]",
      "instructions": ["[step 1]", "[step 2]", "[step 3]"],
      "discussionQuestions": ["[question 1]", "[question 2]", "[question 3]", "[question 4]"],
      "usefulLanguage": ["[phrase 1]", "[phrase 2]", "[phrase 3]", "[phrase 4]"],
      "timeMinutes": 18
    },
    "notes": "[teacher notes for facilitating discussion, error correction strategies]"
  },
  {
    "slideNumber": 5,
    "title": "Wrap-up: [title]",
    "type": "review",
    "content": {
      "reviewActivity": "[quick review game or activity]",
      "keyTakeaways": ["[takeaway 1]", "[takeaway 2]", "[takeaway 3]"],
      "homeworkPreview": "[brief description of what homework will involve]",
      "timeMinutes": 5
    },
    "notes": "[teacher notes for closing the class]"
  }
]

IMPORTANT RULES:
- All content MUST be in English
- Difficulty MUST match the ${level} level
- Vocabulary and grammar MUST relate to "${topicName}"
- Provide EXACTLY 5 slides
- Return ONLY the JSON array, no other text`
}

function buildHomeworkPrompt(topicName: string, level: Level): string {
  return `You are an expert ESL teacher creating a post-class homework assignment for the topic "${topicName}".

LEVEL: ${level} — ${LEVEL_DESCRIPTIONS[level]}

Create 1 consolidation homework exercise. Return ONLY valid JSON (no markdown, no code fences).

The JSON must be a single object:
{
  "category": "WRITING",
  "type": "ESSAY",
  "title": "Homework: [topic-related title]",
  "instructions": "[clear homework instructions]",
  "content": {
    "task": "[detailed description of the homework task]",
    "requirements": ["[requirement 1]", "[requirement 2]", "[requirement 3]"],
    "minWords": ${level === 'STARTER' ? 40 : level === 'SURVIVOR' ? 80 : level === 'EXPLORER' ? 120 : 180},
    "rubric": {
      "content": "[what content is expected]",
      "language": "[what language use is expected]",
      "organization": "[what organization is expected]"
    },
    "dueInfo": "Complete before your next class"
  },
  "correctAnswer": null,
  "points": 25
}

IMPORTANT RULES:
- The homework should consolidate what was learned in the topic "${topicName}"
- Difficulty MUST match the ${level} level
- Return ONLY the JSON object, no other text`
}

// ─── Anthropic call with retry ───────────────────────────────────────────────

async function callClaude(prompt: string, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      })
      const block = message.content[0]
      return block.type === 'text' ? block.text.trim() : ''
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string }
      if (err.status === 429 && attempt < retries) {
        const wait = attempt * 5000
        console.log(`    Rate limited, waiting ${wait / 1000}s...`)
        await sleep(wait)
        continue
      }
      throw error
    }
  }
  throw new Error('Max retries exceeded')
}

function parseJSON<T>(raw: string): T {
  // Strip markdown code fences if present
  let cleaned = raw.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }
  return JSON.parse(cleaned)
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── Category/Type mappings ──────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
  READING: 'READING',
  WRITING: 'WRITING',
  LISTENING: 'LISTENING',
  SPEAKING: 'SPEAKING',
  GRAMMAR: 'GRAMMAR',
}

const TYPE_MAP: Record<string, string> = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  TRUE_FALSE: 'TRUE_FALSE',
  GAP_FILL: 'GAP_FILL',
  ESSAY: 'ESSAY',
  AUDIO_RECORDING: 'AUDIO_RECORDING',
  MATCHING: 'MATCHING',
  ERROR_CORRECTION: 'ERROR_CORRECTION',
  SENTENCE_TRANSFORMATION: 'SENTENCE_TRANSFORMATION',
  AUDIO_QUIZ: 'AUDIO_QUIZ',
  DICTATION: 'DICTATION',
  NOTE_TAKING: 'NOTE_TAKING',
  PRONUNCIATION: 'PRONUNCIATION',
  DRAG_DROP: 'DRAG_DROP',
  CROSSWORD: 'CROSSWORD',
  FLASHCARD: 'FLASHCARD',
  SEQUENCING: 'SEQUENCING',
}

// ─── Process a single topic ──────────────────────────────────────────────────

async function processTopicContent(topic: { id: string; name: string; level: Level }) {
  console.log(`\n  📝 Generating exercises for "${topic.name}"...`)

  // ── 1. Pre-class exercises (5) ───────────────────────────────────────────
  const exercisePrompt = buildExercisePrompt(topic.name, topic.level)
  const exerciseRaw = await callClaude(exercisePrompt)
  let exercises: Array<{
    category: string
    type: string
    title: string
    instructions: string
    content: Record<string, unknown>
    correctAnswer: Record<string, unknown> | null
    points: number
  }>

  try {
    exercises = parseJSON(exerciseRaw)
    if (!Array.isArray(exercises)) throw new Error('Expected array')
  } catch (e) {
    console.log(`    ⚠️  Failed to parse exercises for "${topic.name}", skipping exercises`)
    console.log(`    Error: ${(e as Error).message}`)
    exercises = []
  }

  // ── 2. Slides (5) ───────────────────────────────────────────────────────
  console.log(`  📊 Generating slides for "${topic.name}"...`)
  const slidesPrompt = buildSlidesPrompt(topic.name, topic.level)
  const slidesRaw = await callClaude(slidesPrompt)
  let slides: Array<{
    slideNumber: number
    title: string
    type: string
    content: Record<string, unknown>
    notes: string
  }>

  try {
    slides = parseJSON(slidesRaw)
    if (!Array.isArray(slides)) throw new Error('Expected array')
  } catch (e) {
    console.log(`    ⚠️  Failed to parse slides for "${topic.name}", skipping slides`)
    console.log(`    Error: ${(e as Error).message}`)
    slides = []
  }

  // ── 3. Homework (1) ─────────────────────────────────────────────────────
  console.log(`  📚 Generating homework for "${topic.name}"...`)
  const homeworkPrompt = buildHomeworkPrompt(topic.name, topic.level)
  const homeworkRaw = await callClaude(homeworkPrompt)
  let homework: {
    category: string
    type: string
    title: string
    instructions: string
    content: Record<string, unknown>
    correctAnswer: Record<string, unknown> | null
    points: number
  } | null

  try {
    homework = parseJSON(homeworkRaw)
  } catch (e) {
    console.log(`    ⚠️  Failed to parse homework for "${topic.name}", skipping homework`)
    console.log(`    Error: ${(e as Error).message}`)
    homework = null
  }

  if (dryRun) {
    console.log(`  [DRY RUN] Would create ${exercises.length} exercises, ${slides.length} slides, ${homework ? 1 : 0} homework`)
    return { exercises: exercises.length, slides: slides.length, homework: homework ? 1 : 0 }
  }

  // ── Save to DB ─────────────────────────────────────────────────────────
  let savedExercises = 0
  let savedSlides = 0
  let savedHomework = 0

  // Delete existing content for this topic
  await prisma.slideExercise.deleteMany({
    where: { slide: { topicId: topic.id } },
  })
  await prisma.slide.deleteMany({ where: { topicId: topic.id } })
  // Only delete exercises we're replacing (submissions have FK)
  const existingExercises = await prisma.exercise.findMany({
    where: { topicId: topic.id },
    select: { id: true },
  })
  if (existingExercises.length > 0) {
    await prisma.submission.deleteMany({
      where: { exerciseId: { in: existingExercises.map(e => e.id) } },
    })
    await prisma.exercise.deleteMany({ where: { topicId: topic.id } })
  }

  // Save exercises
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i]
    const category = CATEGORY_MAP[ex.category?.toUpperCase()] || 'READING'
    const type = TYPE_MAP[ex.type?.toUpperCase()] || 'MULTIPLE_CHOICE'

    try {
      await prisma.exercise.create({
        data: {
          topicId: topic.id,
          phase: 'PRE_CLASS',
          category: category as 'READING' | 'WRITING' | 'LISTENING' | 'SPEAKING' | 'GRAMMAR' | 'VOCABULARY',
          type: type as 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'GAP_FILL' | 'ESSAY' | 'AUDIO_RECORDING' | 'MATCHING' | 'SEQUENCING' | 'ERROR_CORRECTION' | 'SENTENCE_TRANSFORMATION' | 'AUDIO_QUIZ' | 'DICTATION' | 'NOTE_TAKING' | 'PRONUNCIATION' | 'DRAG_DROP' | 'CROSSWORD' | 'FLASHCARD',
          title: ex.title || `${category} Exercise`,
          instructions: ex.instructions || 'Complete the exercise.',
          content: ex.content || {},
          correctAnswer: ex.correctAnswer || undefined,
          points: ex.points || 10,
          orderIndex: i + 1,
        },
      })
      savedExercises++
    } catch (e) {
      console.log(`    ⚠️  Failed to save exercise ${i + 1}: ${(e as Error).message}`)
    }
  }

  // Save slides
  for (const slide of slides) {
    try {
      await prisma.slide.create({
        data: {
          topicId: topic.id,
          slideNumber: slide.slideNumber,
          title: slide.title,
          type: slide.type || 'intro',
          content: slide.content || {},
          notes: slide.notes || null,
          order: slide.slideNumber,
        },
      })
      savedSlides++
    } catch (e) {
      console.log(`    ⚠️  Failed to save slide ${slide.slideNumber}: ${(e as Error).message}`)
    }
  }

  // Save homework
  if (homework) {
    const hwCategory = CATEGORY_MAP[homework.category?.toUpperCase()] || 'WRITING'
    const hwType = TYPE_MAP[homework.type?.toUpperCase()] || 'ESSAY'
    try {
      await prisma.exercise.create({
        data: {
          topicId: topic.id,
          phase: 'AFTER_CLASS',
          category: hwCategory as 'READING' | 'WRITING' | 'LISTENING' | 'SPEAKING' | 'GRAMMAR' | 'VOCABULARY',
          type: hwType as 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'GAP_FILL' | 'ESSAY' | 'AUDIO_RECORDING' | 'MATCHING' | 'SEQUENCING' | 'ERROR_CORRECTION' | 'SENTENCE_TRANSFORMATION' | 'AUDIO_QUIZ' | 'DICTATION' | 'NOTE_TAKING' | 'PRONUNCIATION' | 'DRAG_DROP' | 'CROSSWORD' | 'FLASHCARD',
          title: homework.title || 'Homework',
          instructions: homework.instructions || 'Complete the homework assignment.',
          content: homework.content || {},
          correctAnswer: homework.correctAnswer || undefined,
          points: homework.points || 25,
          orderIndex: 6, // after the 5 pre-class exercises
        },
      })
      savedHomework++
    } catch (e) {
      console.log(`    ⚠️  Failed to save homework: ${(e as Error).message}`)
    }
  }

  console.log(`  ✅ Saved ${savedExercises} exercises, ${savedSlides} slides, ${savedHomework} homework`)
  return { exercises: savedExercises, slides: savedSlides, homework: savedHomework }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║   Mindset LMS — Content Generation Script           ║')
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log()

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY is not set. Add it to your .env file.')
    process.exit(1)
  }

  if (dryRun) console.log('🏃 DRY RUN mode — no data will be saved\n')
  if (levelFilter) console.log(`🎯 Filtering by level: ${levelFilter}\n`)
  if (skipExisting) console.log('⏭️  Skipping topics that already have exercises\n')

  // Fetch all topics
  const whereClause = levelFilter ? { level: levelFilter } : {}
  const topics = await prisma.topic.findMany({
    where: whereClause,
    orderBy: [{ level: 'asc' }, { orderIndex: 'asc' }],
    include: {
      _count: {
        select: { exercises: true, liveClassSlides: true },
      },
    },
  })

  console.log(`Found ${topics.length} topics to process\n`)

  const totals = { exercises: 0, slides: 0, homework: 0, skipped: 0, errors: 0 }
  let currentLevel = ''

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i]

    // Print level header
    if (topic.level !== currentLevel) {
      currentLevel = topic.level
      console.log(`\n${'═'.repeat(50)}`)
      console.log(`📚 ${currentLevel} (${LEVEL_DESCRIPTIONS[currentLevel as Level].split('.')[0]})`)
      console.log('═'.repeat(50))
    }

    // Skip if already has content
    if (skipExisting && topic._count.exercises > 0 && topic._count.liveClassSlides > 0) {
      console.log(`  ⏭️  [${i + 1}/${topics.length}] "${topic.name}" — already has content, skipping`)
      totals.skipped++
      continue
    }

    console.log(`\n🔄 [${i + 1}/${topics.length}] Processing "${topic.name}" (${topic.level})`)

    try {
      const result = await processTopicContent(topic)
      totals.exercises += result.exercises
      totals.slides += result.slides
      totals.homework += result.homework
    } catch (e) {
      console.log(`  ❌ ERROR processing "${topic.name}": ${(e as Error).message}`)
      totals.errors++
    }

    // Rate limiting: small delay between topics to avoid hitting API limits
    if (i < topics.length - 1) {
      await sleep(1000)
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────
  console.log('\n')
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║   GENERATION COMPLETE                               ║')
  console.log('╠══════════════════════════════════════════════════════╣')
  console.log(`║  Topics processed: ${(topics.length - totals.skipped).toString().padEnd(33)}║`)
  console.log(`║  Topics skipped:   ${totals.skipped.toString().padEnd(33)}║`)
  console.log(`║  Exercises created: ${totals.exercises.toString().padEnd(32)}║`)
  console.log(`║  Slides created:    ${totals.slides.toString().padEnd(32)}║`)
  console.log(`║  Homework created:  ${totals.homework.toString().padEnd(32)}║`)
  console.log(`║  Errors:            ${totals.errors.toString().padEnd(32)}║`)
  console.log('╚══════════════════════════════════════════════════════╝')

  if (totals.errors > 0) {
    console.log(`\n⚠️  ${totals.errors} topics had errors. Re-run with --skip-existing to retry only failed ones.`)
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
