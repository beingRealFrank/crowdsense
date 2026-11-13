// Self-contained (no relative imports) so node's test runner can load it directly.
const rng = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export type Question = { q: string; answers: string[] };

// Light, everyday, non-political questions where the split is genuinely hard to guess.
export const BANK: Question[] = [
  { q: 'You find a $20 bill in an old coat. What do you do with it?', answers: ['Treat myself today', 'Straight into savings', 'Buy someone else something', 'Leave it in the coat for future me'] },
  { q: 'Best time of day to get real work done?', answers: ['Early morning', 'Late morning', 'Afternoon', 'After dark'] },
  { q: 'The perfect amount of ice in a drink?', answers: ['None', 'A few cubes', 'Half the glass', 'More ice than drink'] },
  { q: 'Which superpower would you actually use every day?', answers: ['Never needing sleep', 'Instant teleport home', 'Perfect memory', 'Talking to animals'] },
  { q: 'How do you eat a KitKat-style bar?', answers: ['Snap off one finger at a time', 'Bite straight across', 'Nibble the chocolate off first', 'I don\'t'] },
  { q: 'Your phone battery is at 9%. Where are you mentally?', answers: ['Totally calm', 'Mild concern', 'Hunting for a charger', 'Full panic'] },
  { q: 'Pick a season to live in forever.', answers: ['Spring', 'Summer', 'Autumn', 'Winter'] },
  { q: 'A stranger\'s dog runs up to you. You…', answers: ['Ask the owner before petting', 'Pet it immediately', 'Freeze politely', 'Get down to its level and say hi'] },
  { q: 'Where does the toilet paper go?', answers: ['Over', 'Under', 'On the floor, honestly', 'Whatever was there'] },
  { q: 'How many browser tabs do you have open right now?', answers: ['Under 5', '5 to 15', '16 to 50', 'I fear counting'] },
  { q: 'The ideal vacation is mostly…', answers: ['Doing nothing on a beach', 'Exploring a city', 'Hiking somewhere wild', 'Eating my way around'] },
  { q: 'What do you do while a video ad plays?', answers: ['Wait it out', 'Mute and look away', 'Skip the instant I can', 'Close the whole thing'] },
  { q: 'Breakfast for dinner is…', answers: ['The best dinner', 'Fine sometimes', 'Wrong', 'Breakfast is breakfast, any time'] },
  { q: 'Your go-to when you can\'t sleep?', answers: ['Read', 'Scroll my phone', 'Podcast or audiobook', 'Lie there and think about 2009'] },
  { q: 'The correct way to hang a towel?', answers: ['Folded in thirds on a rail', 'On a hook', 'Over the door', 'On the floor (temporarily)'] },
  { q: 'Which would you rather give up for a year?', answers: ['Coffee and tea', 'Music', 'Social media', 'Cheese'] },
  { q: 'When a group chat goes quiet, you…', answers: ['Revive it with a meme', 'Let it rest', 'Mute it gladly', 'Didn\'t notice'] },
  { q: 'Best pizza topping, if you could only have one?', answers: ['Pepperoni', 'Mushroom', 'Extra cheese', 'Something unusual'] },
  { q: 'How do you feel about phone calls?', answers: ['Love them', 'Fine with friends only', 'Text me first', 'Absolutely not'] },
  { q: 'A movie everyone loves leaves you cold. You…', answers: ['Say so loudly', 'Keep quiet', 'Rewatch to give it a chance', 'Read why people love it'] },
  { q: 'The best part of a road trip?', answers: ['The snacks', 'The playlist', 'The views', 'Arriving'] },
  { q: 'Your plant is drooping. Honest answer: whose fault?', answers: ['Mine, too little water', 'Mine, too much water', 'The plant\'s', 'I have no plants for this reason'] },
  { q: 'How do you organise your money?', answers: ['Spreadsheet or app', 'Rough mental math', 'Separate accounts for everything', 'Vibes'] },
  { q: 'Pick a pet you\'d keep if space and money were no object.', answers: ['A big dog', 'A cat', 'Something scaly', 'A very small horse'] },
  { q: 'You get the last slice of cake. You…', answers: ['Eat it, no guilt', 'Offer to split it', 'Leave it for someone', 'Pretend I didn\'t see it, then eat it'] },
  { q: 'How do you choose a book or show?', answers: ['Friends\' recommendations', 'Reviews and ratings', 'The cover or trailer', 'Whatever the algorithm says'] },
  { q: 'What wakes you up in the morning?', answers: ['One alarm', 'Many alarms', 'Sunlight', 'A pet or a kid'] },
  { q: 'Best smell in the world?', answers: ['Fresh bread', 'Rain on dry ground', 'Coffee brewing', 'Clean laundry'] },
  { q: 'The rule for socks?', answers: ['Must match', 'Same colour family is fine', 'Mismatched on purpose', 'Socks are optional'] },
  { q: 'Dream weekend morning?', answers: ['Sleep in late', 'Up early for an adventure', 'Long breakfast out', 'Pyjamas and a project'] },
  { q: 'How loud is your phone usually?', answers: ['Always silent', 'Vibrate only', 'Ringer on', 'Depends on the hour'] },
  { q: 'Your karaoke song is…', answers: ['A power ballad', 'An upbeat crowd-pleaser', 'A rap verse I know by heart', 'I will be holding the coats'] },
  { q: 'What makes a café perfect?', answers: ['The coffee', 'The pastries', 'The chairs and light', 'Strong Wi-Fi'] },
  { q: 'You can master one skill overnight. Which?', answers: ['A new language', 'An instrument', 'Cooking', 'Drawing'] },
  { q: 'How do you deal with a spider indoors?', answers: ['Cup and paper, carry it outside', 'Leave it be', 'Call for backup', 'Move house'] },
  { q: 'What\'s the best kind of rain?', answers: ['Light drizzle', 'Heavy downpour', 'Thunderstorm', 'Rain I\'m watching from indoors'] },
  { q: 'When you cook, you…', answers: ['Follow the recipe exactly', 'Use it as a rough guide', 'Never use recipes', 'Order in'] },
  { q: 'Favourite way to spend a long flight?', answers: ['Movies back to back', 'Sleep', 'Read', 'Stare out the window'] },
  { q: 'Your desk right now is…', answers: ['Spotless', 'Organised chaos', 'Unorganised chaos', 'What desk?'] },
  { q: 'Which snack wins a movie night?', answers: ['Popcorn', 'Candy', 'Chips', 'Something homemade'] },
  { q: 'You\'re early to meet a friend. You…', answers: ['Wait right there', 'Walk around nearby', 'Grab a coffee', 'Text them to come early'] },
  { q: 'Best way to learn something new?', answers: ['Video tutorials', 'Reading', 'Just trying it', 'Someone showing me'] },
  { q: 'How many unread emails do you have?', answers: ['Zero, always', 'A handful', 'Hundreds', 'Thousands'] },
  { q: 'Pick a house to live in.', answers: ['Cabin in the woods', 'Flat in a big city', 'Cottage by the sea', 'Farmhouse with land'] },
  { q: 'Your relationship with leftovers?', answers: ['Better the next day', 'Fine if I must', 'Forgotten at the back of the fridge', 'Never any left'] },
  { q: 'What do you do on a rainy Sunday?', answers: ['Movie marathon', 'Bake something', 'Big puzzle or board game', 'Nap, wake, nap'] },
  { q: 'The best place to sit on a bus or train?', answers: ['Window', 'Aisle', 'Right at the back', 'Standing near the door'] },
  { q: 'How do you sign off a casual text?', answers: ['Nothing', 'An emoji', 'A full stop', 'lol'] },
  { q: 'Which chore do you secretly enjoy?', answers: ['Washing dishes', 'Vacuuming', 'Folding laundry', 'None. None at all.'] },
  { q: 'Pick a time period to visit for one day.', answers: ['Ancient times', 'The 1920s', 'The 1980s', '100 years from now'] },
  { q: 'When do you put up winter holiday decorations?', answers: ['Early November', 'Start of December', 'Mid-December', 'I don\'t decorate'] },
  { q: 'Your ideal number of close friends?', answers: ['One or two', 'Three to five', 'Six to ten', 'The more the better'] },
  { q: 'What do you do with a free hour, no phone allowed?', answers: ['Go for a walk', 'Read', 'Tidy up', 'Nap'] },
  { q: 'The best kind of potato?', answers: ['Fries', 'Mashed', 'Roasted', 'Crisps / chips'] },
  { q: 'How do you open a new board game?', answers: ['Read every rule first', 'Skim and start', 'Have someone explain it', 'Watch a video'] },
  { q: 'What music do you work to?', answers: ['Lyrics are fine', 'Instrumental only', 'Ambient noise', 'Total silence'] },
  { q: 'Which animal would be the worst roommate?', answers: ['A raccoon', 'A goose', 'A cat with opinions', 'A parrot that repeats everything'] },
  { q: 'Your favourite kind of photo to take?', answers: ['Food', 'Landscapes', 'Pets', 'Funny signs'] },
  { q: 'How tidy is your phone\'s home screen?', answers: ['One page, very neat', 'Folders for everything', 'Several messy pages', 'I search for everything'] },
  { q: 'Best sandwich bread?', answers: ['Sourdough', 'Plain white', 'Wholegrain', 'A wrap, actually'] },
  { q: 'A shop assistant asks if you need help. You say…', answers: ['"Just looking, thanks"', 'Yes, I have questions', 'Panic and buy something', 'Already have a list, thanks'] },
  { q: 'What would you name a pet goldfish?', answers: ['A human name like Steve', 'A food name', 'Something grand like Admiral', 'Just Fish'] },
  { q: 'How do you remember birthdays?', answers: ['Calendar reminders', 'Social media tells me', 'Memory alone', 'I often don\'t'] },
  { q: 'Best way to cool down on a hot day?', answers: ['Swim', 'Ice cream', 'Fan on full', 'Cold shower'] },
  { q: 'Which would you rather have unlimited of?', answers: ['Books', 'Plane tickets', 'Takeaway food', 'Sleep'] },
  { q: 'You hear a song you loved at 15. You…', answers: ['Sing every word', 'Cringe a little', 'Feel very old', 'Add it to a playlist'] },
  { q: 'Your approach to assembling flat-pack furniture?', answers: ['Instructions, step by step', 'Look at the picture, wing it', 'Pay someone', 'Leftover screws are normal'] },
  { q: 'How do you take your eggs?', answers: ['Scrambled', 'Fried', 'Boiled', 'Poached'] },
  { q: 'What\'s your phone wallpaper?', answers: ['A person or pet', 'A landscape', 'Plain colour', 'Whatever came with it'] },
  { q: 'Pick a dream job for one year.', answers: ['Lighthouse keeper', 'Chef', 'Park ranger', 'Museum curator'] },
  { q: 'The worst sound?', answers: ['Loud chewing', 'Alarm clock', 'Squeaky door', 'Polystyrene rubbing'] },
  { q: 'At a buffet, your first plate is…', answers: ['A balanced little bit of everything', 'Just the good stuff', 'Dessert first', 'A careful scouting mission'] },
  { q: 'How do you feel about surprise parties (for you)?', answers: ['Love them', 'Fine if small', 'Please warn me', 'Absolutely not'] },
  { q: 'What\'s the best fruit?', answers: ['Mango', 'Strawberry', 'Apple', 'Watermelon'] },
  { q: 'Where do you do your best thinking?', answers: ['In the shower', 'On a walk', 'Lying in bed', 'Talking it out'] },
  { q: 'You can keep one kitchen gadget.', answers: ['Kettle', 'Toaster', 'Microwave', 'Air fryer'] },
  { q: 'Which number is the luckiest?', answers: ['3', '7', '8', '13, to be contrary'] },
  { q: 'How do you watch a series?', answers: ['Binge it in a weekend', 'One episode a night', 'Wait until it\'s all out', 'Start strong, never finish'] },
  { q: 'Best kind of weather for a walk?', answers: ['Crisp and sunny', 'Overcast and cool', 'Light rain', 'Warm evening'] },
  { q: 'What\'s the first thing you check in the morning?', answers: ['Messages', 'The weather', 'The news', 'Nothing until coffee'] },
  { q: 'Your handwriting is…', answers: ['Neat', 'Readable', 'Only I can read it', 'I haven\'t written by hand in years'] },
  { q: 'Pick a board game night role.', answers: ['The strategist', 'The rules lawyer', 'The chaos agent', 'The snack provider'] },
  { q: 'Which would you rather explore?', answers: ['The deep ocean', 'Outer space', 'A huge cave system', 'An ancient city'] },
  { q: 'How many pillows on your bed?', answers: ['One', 'Two', 'Three or four', 'A small fortress'] },
  { q: 'Which pasta shape is best?', answers: ['Spaghetti', 'Penne', 'Fusilli', 'Something fancy'] },
  { q: 'How do you react to spoilers?', answers: ['Furious', 'Mildly annoyed', 'Don\'t mind', 'I read the ending first anyway'] },
  { q: 'Your dream garden is mostly…', answers: ['Vegetables', 'Flowers', 'A wild meadow', 'Paving and a nice chair'] },
  { q: 'What do you do when the Wi-Fi drops?', answers: ['Restart the router', 'Wait patiently', 'Switch to mobile data', 'Accept fate and go outside'] },
  { q: 'The best dessert?', answers: ['Chocolate cake', 'Ice cream', 'Fruit pie', 'Cheesecake'] },
  { q: 'How do you pack for a trip?', answers: ['Days ahead, with a list', 'The night before', 'An hour before leaving', 'I overpack everything'] },
  { q: 'Which would you rather be really good at?', answers: ['Dancing', 'Telling jokes', 'Fixing things', 'Remembering names'] },
  { q: 'Your favourite way to get around town?', answers: ['Walking', 'Bike', 'Car', 'Public transport'] },
  { q: 'How do you feel about pineapple in savoury food?', answers: ['Love it', 'Only in some dishes', 'Never', 'Haven\'t tried it'] },
  { q: 'Which would you rather find in your attic?', answers: ['An old treasure map', 'A box of family letters', 'A vintage arcade machine', 'A friendly ghost'] },
  { q: 'What time do you think "late" is for bedtime?', answers: ['10 pm', 'Midnight', '2 am', 'Sunrise'] },
  { q: 'You win a free year of one subscription. Which?', answers: ['Music', 'Films and TV', 'Games', 'Groceries delivered'] },
  { q: 'What\'s your hot drink?', answers: ['Coffee', 'Tea', 'Hot chocolate', 'Hot water with lemon'] },
  { q: 'How competitive are you at games with friends?', answers: ['Not at all', 'A little', 'Quite', 'Friendships have ended'] },
  { q: 'Pick a sky to look at.', answers: ['Sunrise', 'Sunset', 'Starry night', 'Storm rolling in'] },
];

// Day → question index. Walks a seeded shuffle of the bank so nothing repeats
// until every question has been used once, then reshuffles.
export const bankIndexForDay = (day: number): number => {
  const n = BANK.length;
  const cycle = Math.floor((day - 1) / n);
  const pos = (((day - 1) % n) + n) % n;
  const order = Array.from({ length: n }, (_, i) => i);
  const r = rng(cycle * 104729 + 31);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  return order[pos]!;
};

export const bankQuestion = (day: number): Question => BANK[bankIndexForDay(day)]!;

// Validates a moderator-queued custom question.
export const parseCustom = (q: unknown, answersText: unknown): Question | string => {
  if (typeof q !== 'string' || typeof answersText !== 'string') return 'Question and answers are required';
  const question = q.trim();
  const answers = answersText
    .split('\n')
    .map((a) => a.trim())
    .filter(Boolean);
  if (question.length < 8 || question.length > 140) return 'Question must be 8-140 characters';
  if (answers.length < 2 || answers.length > 4) return 'Give 2 to 4 answers, one per line';
  if (answers.some((a) => a.length > 48)) return 'Each answer must be 48 characters or fewer';
  if (new Set(answers.map((a) => a.toLowerCase())).size !== answers.length) return 'Answers must be different';
  return { q: question, answers };
};
