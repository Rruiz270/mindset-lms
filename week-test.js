// Test script to debug week start issue
const { startOfWeek, endOfWeek, addDays, format } = require('date-fns');

const today = new Date();
console.log('Today:', today.toDateString(), 'Day:', today.getDay());

// Test with weekStartsOn: 1 (Monday)
const weekStart = startOfWeek(today, { weekStartsOn: 1 });
console.log('Week start (Monday):', weekStart.toDateString(), 'Day:', weekStart.getDay());

const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
console.log('Week end (Sunday):', weekEnd.toDateString(), 'Day:', weekEnd.getDay());

console.log('\n--- Testing 14 days from week start ---');
for (let i = 0; i < 14; i++) {
  const date = addDays(weekStart, i);
  const dayOfWeek = date.getDay();
  const shouldSkip = dayOfWeek === 0;
  console.log(`Day ${i}: ${date.toDateString()}, Day: ${dayOfWeek}, Skip Sunday: ${shouldSkip}`);
}