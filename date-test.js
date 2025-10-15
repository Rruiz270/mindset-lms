// Test script to debug Sunday/Saturday issue

// Test for this week to see what days we get
const today = new Date();
console.log('Today:', today.toDateString(), 'Day:', today.getDay());

// Test the next 7 days
for (let i = 0; i < 7; i++) {
  const testDate = new Date();
  testDate.setDate(today.getDate() + i);
  const dayOfWeek = testDate.getDay();
  console.log(`Date: ${testDate.toDateString()}, Day: ${dayOfWeek}, Is Sunday: ${dayOfWeek === 0}, Should Skip: ${dayOfWeek === 0}`);
}

// Let's specifically test this weekend
const thisWeekend = new Date();
// Find next Saturday
while (thisWeekend.getDay() !== 6) {
  thisWeekend.setDate(thisWeekend.getDate() + 1);
}

console.log('\n--- Weekend Test ---');
console.log('Saturday:', thisWeekend.toDateString(), 'Day:', thisWeekend.getDay());

const sunday = new Date(thisWeekend);
sunday.setDate(sunday.getDate() + 1);
console.log('Sunday:', sunday.toDateString(), 'Day:', sunday.getDay());

console.log('\n--- Days of Week Reference ---');
console.log('Sunday = 0, Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5, Saturday = 6');