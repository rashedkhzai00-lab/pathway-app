export interface Tip {
  id: string;
  category: string;
  text: string;
}

export interface TipCategory {
  id: string;
  label: string;
}

export const SOURCE_URL =
  "https://www.reddit.com/r/ADHD/comments/ioi1my/i_went_through_700_reddit_comments_and_collected/";

export const SOURCE_LABEL = "Inspired by tips shared on Reddit";

export const DISCLAIMER =
  "These tips are shared by other ADHD folks and aren't a substitute for medical or professional advice — try what resonates, and check with a doctor or therapist before changing medication routines.";

export const TIP_CATEGORIES: TipCategory[] = [
  { id: "general", label: "General tips" },
  { id: "cleaning", label: "Cleaning" },
  { id: "memory", label: "Memory" },
  { id: "time-blindness", label: "Time Blindness" },
  { id: "distractions", label: "Distractions" },
  { id: "getting-things-done", label: "Getting Things Done" },
  { id: "emotional-dysregulation", label: "Emotional Dysregulation" },
  { id: "sleep", label: "Sleep" },
  { id: "relationships", label: "Relationships" },
  { id: "work", label: "Work" },
  { id: "school", label: "School" },
  { id: "executive-function", label: "Executive Function" },
  { id: "nutrition-medication", label: "Nutrition/Medication" },
];

export const TIPS: Tip[] = [
  { id: "general-1", category: "general", text: "Do some cardio before anything that requires sitting still for a while — it makes it easier to settle in afterward." },
  { id: "general-2", category: "general", text: "Keep important, time-sensitive things where you can actually see them, not tucked away." },
  { id: "general-3", category: "general", text: "When you're feeling overwhelmed, write it all out on a whiteboard or list — it doesn't matter what it is, and you can rip up or toss the paper afterward if you want to keep it private." },
  { id: "general-4", category: "general", text: "When watching videos, use playback speed to your advantage — speed up or slow down, whichever actually helps you focus." },
  { id: "general-5", category: "general", text: "With multiple tasks of the same urgency, start with the hardest one, then alternate between easy and hard tasks from there. Works for basically anything in life." },

  { id: "cleaning-1", category: "cleaning", text: "Put things wherever works for you, but keep the location consistent so you always know where to look." },
  { id: "cleaning-2", category: "cleaning", text: "Keep a catch-all basket or container for items you don't have an obvious home for." },
  { id: "cleaning-3", category: "cleaning", text: "Break the room (or space) into sections, write them as a checklist, and start with whichever section is hardest or most tedious." },
  { id: "cleaning-4", category: "cleaning", text: "Moving between rooms? Grab whatever item belongs in the room you're heading to and drop it off there." },
  { id: "cleaning-5", category: "cleaning", text: "You don't have to stick to one cleaning mode. Doing dishes and spot trash nearby? Toss the trash, then go right back to the dishes." },
  { id: "cleaning-6", category: "cleaning", text: "Have a go-to playlist or podcast lineup reserved just for cleaning sessions." },

  { id: "memory-1", category: "memory", text: "A tablet (iPad-style) for colorful notes can beat paper notebooks you're likely to misplace." },
  { id: "memory-2", category: "memory", text: "Park in the same spot every time you visit a common location, so you never forget where your car is." },
  { id: "memory-3", category: "memory", text: "Keep a spare house key in your car, and another hidden outside the house." },
  { id: "memory-4", category: "memory", text: "Keep frequently-needed items visible and within reach — e.g. keep pills next to your water bottle." },
  { id: "memory-5", category: "memory", text: "Use a Bluetooth tracker (like a Tile) on keys and wallets." },
  { id: "memory-6", category: "memory", text: "Tape your go-to recipes inside a kitchen cabinet door." },
  { id: "memory-7", category: "memory", text: "Do a three-point check before leaving the house — phone, wallet, keys." },
  { id: "memory-8", category: "memory", text: "Ask a voice assistant to set reminders for you instead of relying on memory." },
  { id: "memory-9", category: "memory", text: "Try the \"mind palace\" memory technique for things you need to retain." },
  { id: "memory-10", category: "memory", text: "Put your keys on top of your lunch, so you physically can't leave without grabbing both." },
  { id: "memory-11", category: "memory", text: "If you need to remember an item tomorrow, put it right by the exit door tonight — or a sticky note on the door handle if it's something in the fridge." },
  { id: "memory-12", category: "memory", text: "Buy duplicates of things you use constantly (chargers at home and at work, etc.) so you're never without one." },
  { id: "memory-13", category: "memory", text: "Give things a consistent, labeled home — a label maker helps." },
  { id: "memory-14", category: "memory", text: "Set up a designated spot for important things, since it's hard to keep track of everything in your head." },
  { id: "memory-15", category: "memory", text: "Build yourself a \"second brain\" in whatever tool suits you — a notes app, planner, or similar." },
  { id: "memory-16", category: "memory", text: "Deliberately place an object somewhere unusual as a visual trigger to remember something." },
  { id: "memory-17", category: "memory", text: "Count your steps out loud when walking into a new room — it anchors your focus and works a bit like a mini meditation." },
  { id: "memory-18", category: "memory", text: "Keep a bowl by the door to drop keys, badge, and wallet into the moment you get home." },
  { id: "memory-19", category: "memory", text: "Always carry a small everyday bag with your essentials, so you're not hunting for things each time you leave." },
  { id: "memory-20", category: "memory", text: "The moment something gets scheduled, add it to your calendar immediately — parties, appointments, refills, deadlines." },
  { id: "memory-21", category: "memory", text: "Favorite: use spaced repetition (flashcard-style) to remember details about people in your life." },

  { id: "time-blindness-1", category: "time-blindness", text: "Set your phone clock 10–15 minutes fast on purpose." },
  { id: "time-blindness-2", category: "time-blindness", text: "Put calendar appointments 10–20 minutes earlier than the real time." },
  { id: "time-blindness-3", category: "time-blindness", text: "A schedule only works if you've also set alarms for every part of it." },
  { id: "time-blindness-4", category: "time-blindness", text: "For hyperfocus-prone tasks, set a timer for less time than you think you need, so you have buffer to wrap up — a watch timer works better than your phone, since it won't pull you into distraction." },
  { id: "time-blindness-5", category: "time-blindness", text: "Use an app that chimes every 30 minutes during the day, so you stay aware of how much time has passed." },
  { id: "time-blindness-6", category: "time-blindness", text: "Each morning, write your to-do list by hand and log when you start or switch tasks — or use a time-tracking app for this." },
  { id: "time-blindness-7", category: "time-blindness", text: "Favorite: get an electric toothbrush with a built-in timer, since time blindness makes it easy to brush way too short or way too long." },

  { id: "distractions-1", category: "distractions", text: "Turn off all phone notifications except the essentials — texts, calls, calendar." },
  { id: "distractions-2", category: "distractions", text: "Use website or app blockers for your particular distractions, like social media or YouTube." },
  { id: "distractions-3", category: "distractions", text: "Get solid noise-cancelling headphones paired with non-distracting background audio." },
  { id: "distractions-4", category: "distractions", text: "If you can't resist answering a text or email the second it arrives, tell the person you'll reply shortly instead of dropping what you're doing." },
  { id: "distractions-5", category: "distractions", text: "Exercise first — your brain focuses better afterward, especially with cardio." },
  { id: "distractions-6", category: "distractions", text: "Favorite: a noise-cancelling headset with white or brown noise can trigger hyperfocus and block out distractions almost like a switch." },

  { id: "gtd-1", category: "getting-things-done", text: "Android users: put your to-do widget right on the home screen so it's the first thing you see." },
  { id: "gtd-2", category: "getting-things-done", text: "Break tasks into as many smaller pieces as it takes for it to feel manageable." },
  { id: "gtd-3", category: "getting-things-done", text: "Chain a new task onto one that's already ending — transitions make it easier to start something new." },
  { id: "gtd-4", category: "getting-things-done", text: "Use the Pomodoro technique for everything; having a break to look forward to helps." },
  { id: "gtd-5", category: "getting-things-done", text: "Remember that partial progress counts — getting some percent of a task done beats not starting at all." },
  { id: "gtd-6", category: "getting-things-done", text: "Attach a number to routine actions (like a set count of brush strokes) to make starting feel less abstract." },
  { id: "gtd-7", category: "getting-things-done", text: "Give yourself a small permissible lie to get moving — e.g. tell yourself you'll only unload part of the dishwasher." },
  { id: "gtd-8", category: "getting-things-done", text: "Decide the next day's plan the night before, especially around medication timing." },
  { id: "gtd-9", category: "getting-things-done", text: "Don't count on your future self to be more motivated than you are right now — plan as if today's motivation is all you'll get." },
  { id: "gtd-10", category: "getting-things-done", text: "When switching tasks, treat it like changing context so your brain has an easier time letting go of the last one." },
  { id: "gtd-11", category: "getting-things-done", text: "Keep breaks short and a little boring on purpose, so they're not so tempting that you can't stop." },
  { id: "gtd-12", category: "getting-things-done", text: "Turn chores into a game with a built-in time limit — e.g. see how much you can clean before the coffee finishes brewing." },
  { id: "gtd-13", category: "getting-things-done", text: "Use to-do lists as external memory rather than a source of guilt — write it down so you're not holding it all mentally." },
  { id: "gtd-14", category: "getting-things-done", text: "Read tasks out loud or say them to yourself if that helps them actually register." },
  { id: "gtd-15", category: "getting-things-done", text: "Reward yourself when you get things done — positive reinforcement helps you keep going." },
  { id: "gtd-16", category: "getting-things-done", text: "Change your environment for tasks that need focus — a space with fewer built-in distractions, like a library or cafe, can help." },
  { id: "gtd-17", category: "getting-things-done", text: "Set a specific time to stop working and relax, so you don't feel guilty resting later." },
  { id: "gtd-18", category: "getting-things-done", text: "Vary your alarm and timer sounds, and use them often." },
  { id: "gtd-19", category: "getting-things-done", text: "Favorite: treat timers and alarms as non-negotiable — when one goes off, stop what you're doing right away, no matter where you are in the task." },
  { id: "gtd-20", category: "getting-things-done", text: "Favorite: try body doubling — having someone else nearby, working or not, makes tasks feel more accountable and less isolating." },

  { id: "emotional-dysregulation-1", category: "emotional-dysregulation", text: "Do a nightly brain dump in a notebook before bed." },
  { id: "emotional-dysregulation-2", category: "emotional-dysregulation", text: "Don't feel bad about struggling in school or work — coping strategies improve over time, and so will you." },
  { id: "emotional-dysregulation-3", category: "emotional-dysregulation", text: "Use journaling as a way to process and work through emotional history." },
  { id: "emotional-dysregulation-4", category: "emotional-dysregulation", text: "Remind yourself the world won't end if a few things fall behind." },
  { id: "emotional-dysregulation-5", category: "emotional-dysregulation", text: "Write a reverse to-do list of what you actually accomplished, so the day doesn't feel like a total loss." },
  { id: "emotional-dysregulation-6", category: "emotional-dysregulation", text: "Give yourself permission to let go of and forgive small missteps — don't dwell on the awkward thing from last week." },
  { id: "emotional-dysregulation-7", category: "emotional-dysregulation", text: "Forgive yourself for your limits." },
  { id: "emotional-dysregulation-8", category: "emotional-dysregulation", text: "Try meditation as an active-break option if you struggle to actually rest — an app can help when you're starting out." },
  { id: "emotional-dysregulation-9", category: "emotional-dysregulation", text: "Recognize that shaming yourself over motivation is counterproductive — it doesn't reflect reality and only makes things harder." },
  { id: "emotional-dysregulation-10", category: "emotional-dysregulation", text: "Favorite: therapy (like CBT) combined with medication was described as genuinely helpful for managing this." },
  { id: "emotional-dysregulation-11", category: "emotional-dysregulation", text: "Favorite: stop punishing yourself over the past — focus on the present and on improving from here." },

  { id: "sleep-1", category: "sleep", text: "Put your phone across the room with the alarm volume high, so you have to physically get up to turn it off." },
  { id: "sleep-2", category: "sleep", text: "If you struggle to actually get up after waking, set a second timer a few minutes later that forces you out of bed." },
  { id: "sleep-3", category: "sleep", text: "Use two bright alarm clocks set 5–15 minutes apart to help your body recognize morning has arrived." },
  { id: "sleep-4", category: "sleep", text: "Lower the thermostat about an hour before bed, then let it warm up around wake time — the temperature contrast helps with both falling asleep and waking up." },
  { id: "sleep-5", category: "sleep", text: "Use a reminder app for starting your bedtime routine, and treat the reminder itself as part of that routine." },
  { id: "sleep-6", category: "sleep", text: "Schedule early meetings or commitments to force an earlier wake time." },
  { id: "sleep-7", category: "sleep", text: "Favorite: set two alarms — one to get up and take medication, and a later one to actually start the day, so your meds have kicked in by the time you're up." },

  { id: "relationships-1", category: "relationships", text: "It's okay to just be around people and let conversation happen — you don't have to fill every silence yourself." },
  { id: "relationships-2", category: "relationships", text: "If a conversation is running long or repetitive, wait for a natural pause instead of cutting the person off mid-sentence." },
  { id: "relationships-3", category: "relationships", text: "Try to avoid the word \"but\" right after acknowledging someone's point — it tends to undercut what you just said." },
  { id: "relationships-4", category: "relationships", text: "Favorite: for eye contact, focus on the bridge of the other person's nose — it reads as natural eye contact without the discomfort." },

  { id: "work-1", category: "work", text: "If you hate your job, switch — it makes it much easier to build positive momentum in the rest of your life." },
  { id: "work-2", category: "work", text: "Find work that fits how your brain actually operates, rather than constantly fighting your own patterns to fit a rigid schedule." },
  { id: "work-3", category: "work", text: "Being self-employed or setting your own hours can work well if a traditional 9-to-5 structure doesn't suit you." },
  { id: "work-4", category: "work", text: "Break a big project into a rough draft first, then a more detailed pass, then the final version — rather than trying to do it all at once." },
  { id: "work-5", category: "work", text: "The moment you learn about a deadline, reach out and set expectations early — proactive communication is appreciated." },
  { id: "work-6", category: "work", text: "Reply to messages as soon as you see them; people tend to notice and value quick responses more than they notice occasional delays elsewhere." },
  { id: "work-7", category: "work", text: "Be upfront about your limitations at work — most people are understanding about day-to-day basics, and it saves you from a bigger problem later by trying to hide it." },
  { id: "work-8", category: "work", text: "Don't compare your motivation, output, or effort to other people's — everyone's brain runs differently, and constant comparison just adds pressure." },
  { id: "work-9", category: "work", text: "Favorite: learn to say no to things that pile onto your plate — it protects your mental health, and it gets easier the more you practice it." },

  { id: "school-1", category: "school", text: "Use active recall plus spaced repetition when studying for exams — most students skip these and it shows in results." },
  { id: "school-2", category: "school", text: "If it's hard to start an assignment, only read and briefly annotate it at first, then take a break — your subconscious keeps working on it in the background." },
  { id: "school-3", category: "school", text: "Once you're at roughly 75% done, turn it in early rather than waiting until the exact deadline." },
  { id: "school-4", category: "school", text: "Print your notes and slides ahead of time, so you're not splitting attention between listening and writing." },
  { id: "school-5", category: "school", text: "Favorite: check what accommodations your school offers for ADHD — extra time or similar supports can genuinely help." },

  { id: "executive-function-1", category: "executive-function", text: "Build both a morning routine and a reset routine — something to fall back on when the day feels unfocused." },
  { id: "executive-function-2", category: "executive-function", text: "Have a go-to uniform for work or common scenarios, so you're not making decisions about what to wear." },
  { id: "executive-function-3", category: "executive-function", text: "Stay hydrated — dehydration makes it harder to feel rested even after enough sleep." },
  { id: "executive-function-4", category: "executive-function", text: "Set alarms louder than the default, since standard volumes are easy to sleep through or ignore." },
  { id: "executive-function-5", category: "executive-function", text: "Track common household tasks (cleaning, groceries) so you're not deciding from scratch each time." },
  { id: "executive-function-6", category: "executive-function", text: "Reduce the friction to get started — set out clothes, pack a bag, etc. the night before." },
  { id: "executive-function-7", category: "executive-function", text: "Give yourself low, achievable standards and be willing to leave something unfinished, rather than rigid perfectionism." },
  { id: "executive-function-8", category: "executive-function", text: "Write down the next few steps when starting a task, even though you'll inevitably improvise once you get moving." },
  { id: "executive-function-9", category: "executive-function", text: "Favorite: on tough days, aim for just one thing done well — like cleaning a single room properly — instead of everything at once." },

  { id: "nutrition-medication-1", category: "nutrition-medication", text: "If you're low on vitamin D, get it checked and supplement if a doctor confirms it — it affects mood and energy." },
  { id: "nutrition-medication-2", category: "nutrition-medication", text: "Eat enough protein and stay hydrated." },
  { id: "nutrition-medication-3", category: "nutrition-medication", text: "Figure out what time of day works best for taking your medication." },
  { id: "nutrition-medication-4", category: "nutrition-medication", text: "Keep a weekly pill organizer so you can tell at a glance whether you've taken your dose." },
  { id: "nutrition-medication-5", category: "nutrition-medication", text: "Favorite: use a 7-day pill organizer with AM/PM slots so tracking medication becomes automatic and cheap to maintain." },
];
