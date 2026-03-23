/**
 * Fix missing slides for 4 topics that had JSON parse failures.
 * Re-generates slides only (exercises and homework are already saved).
 */

import { PrismaClient, Level } from '@prisma/client'
import Anthropic from '@anthropic-ai/sdk'

const prisma = new PrismaClient()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LEVEL_DESCRIPTIONS: Record<Level, string> = {
  STARTER: 'A0-A1 (Beginner). Use very simple sentences (5-8 words). Basic vocabulary only. Present simple tense. No idioms. Concrete topics.',
  SURVIVOR: 'A2-B1 (Elementary-Intermediate). Everyday situations and common expressions. Simple compound sentences. Past simple, present continuous. Common phrasal verbs.',
  EXPLORER: 'B1-B2 (Intermediate-Upper Intermediate). Opinions on current topics. Complex grammar (conditionals, passive voice, reported speech). Abstract concepts. Some idiomatic expressions.',
  EXPERT: 'B2-C1 (Upper Intermediate-Advanced). Nuanced debates, academic vocabulary. Complex sentence structures. Subjunctive, mixed conditionals. Formal and informal registers.',
}

const TOPICS_TO_FIX = [
  { name: 'Against the Evil Eye', level: 'EXPLORER' as Level },
  { name: "Who's to Blame?", level: 'EXPERT' as Level },
  { name: 'Education Blues', level: 'EXPERT' as Level },
  { name: 'A Legacy', level: 'EXPERT' as Level },
]

function buildSlidesPrompt(topicName: string, level: Level): string {
  return `You are an expert ESL teacher. Create 5 slides for a 60-minute live class on "${topicName}".

LEVEL: ${level} — ${LEVEL_DESCRIPTIONS[level]}

Return ONLY a valid JSON array of 5 objects. No markdown fences. Keep string values SHORT to avoid JSON issues.

[
  {
    "slideNumber": 1,
    "title": "Warm-up",
    "type": "intro",
    "content": {
      "objective": "Learn about ${topicName}",
      "warmUpActivity": "Discuss with partner",
      "discussionQuestions": ["Question 1", "Question 2"],
      "timeMinutes": 10
    },
    "notes": "Teacher notes here"
  },
  {
    "slideNumber": 2,
    "title": "Vocabulary",
    "type": "vocabulary",
    "content": {
      "words": [
        {"word": "word1", "definition": "def1", "example": "example1", "partOfSpeech": "noun"},
        {"word": "word2", "definition": "def2", "example": "example2", "partOfSpeech": "verb"},
        {"word": "word3", "definition": "def3", "example": "example3", "partOfSpeech": "adj"},
        {"word": "word4", "definition": "def4", "example": "example4", "partOfSpeech": "noun"},
        {"word": "word5", "definition": "def5", "example": "example5", "partOfSpeech": "verb"},
        {"word": "word6", "definition": "def6", "example": "example6", "partOfSpeech": "noun"}
      ],
      "activity": "Practice activity",
      "timeMinutes": 12
    },
    "notes": "Teacher notes"
  },
  {
    "slideNumber": 3,
    "title": "Grammar Focus",
    "type": "grammar",
    "content": {
      "grammarPoint": "Grammar structure",
      "explanation": "Explanation here",
      "examples": ["Example 1", "Example 2", "Example 3"],
      "practiceActivity": "Practice description",
      "timeMinutes": 15
    },
    "notes": "Teacher notes"
  },
  {
    "slideNumber": 4,
    "title": "Discussion",
    "type": "communication",
    "content": {
      "activity": "Activity description",
      "instructions": ["Step 1", "Step 2", "Step 3"],
      "discussionQuestions": ["Q1", "Q2", "Q3", "Q4"],
      "usefulLanguage": ["Phrase 1", "Phrase 2", "Phrase 3", "Phrase 4"],
      "timeMinutes": 18
    },
    "notes": "Teacher notes"
  },
  {
    "slideNumber": 5,
    "title": "Wrap-up",
    "type": "review",
    "content": {
      "reviewActivity": "Review game",
      "keyTakeaways": ["Point 1", "Point 2", "Point 3"],
      "homeworkPreview": "Homework description",
      "timeMinutes": 5
    },
    "notes": "Teacher notes"
  }
]

CRITICAL: Return ONLY the JSON array. No extra text. Keep all strings under 200 characters to ensure valid JSON.`
}

function parseJSON<T>(raw: string): T {
  let cleaned = raw.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }
  return JSON.parse(cleaned)
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log('Fixing missing slides for 4 topics...\n')

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY not set')
    process.exit(1)
  }

  for (const { name, level } of TOPICS_TO_FIX) {
    const topic = await prisma.topic.findFirst({ where: { name, level } })
    if (!topic) {
      console.log(`Topic not found: "${name}" (${level})`)
      continue
    }

    console.log(`Generating slides for "${name}" (${level})...`)

    // Try up to 3 times
    let success = false
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const prompt = buildSlidesPrompt(name, level)
        const message = await anthropic.messages.create({
          model: 'claude-haiku-4-5',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
        })
        const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
        const slides = parseJSON<Array<{
          slideNumber: number; title: string; type: string;
          content: Record<string, unknown>; notes: string
        }>>(raw)

        if (!Array.isArray(slides) || slides.length === 0) {
          throw new Error('Empty or invalid slides array')
        }

        // Delete existing slides for this topic
        await prisma.slideExercise.deleteMany({ where: { slide: { topicId: topic.id } } })
        await prisma.slide.deleteMany({ where: { topicId: topic.id } })

        // Save new slides
        for (const slide of slides) {
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
        }

        console.log(`  Saved ${slides.length} slides`)
        success = true
        break
      } catch (e) {
        console.log(`  Attempt ${attempt} failed: ${(e as Error).message}`)
        if (attempt < 3) await sleep(2000)
      }
    }

    if (!success) {
      console.log(`  FAILED after 3 attempts for "${name}"`)
    }

    await sleep(1000)
  }

  // Verify totals
  const slideCount = await prisma.slide.count()
  console.log(`\nTotal slides in DB: ${slideCount}`)
}

main()
  .catch(e => { console.error('Fatal:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
