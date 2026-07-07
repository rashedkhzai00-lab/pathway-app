export interface Tip {
  id: string;
  title: string;
  description: string;
  category?: string;
}

export const SOURCE_URL = "";
export const SOURCE_LABEL = "Inspired by tips shared on Reddit";

export const TIPS: Tip[] = [
  {
    id: "body-doubling",
    title: "Body doubling",
    description: "Work alongside someone else — even on a video call with cameras on — to make starting tasks feel less daunting.",
    category: "Focus",
  },
  {
    id: "two-minute-rule",
    title: "Two-minute rule",
    description: "If something takes less than two minutes, do it immediately instead of adding it to a list. It breaks the inertia of task avoidance.",
    category: "Focus",
  },
  {
    id: "temptation-bundling",
    title: "Temptation bundling",
    description: "Pair a task you avoid with something you enjoy — like a favourite playlist or snack. Link the reward directly to the task.",
    category: "Motivation",
  },
  {
    id: "time-blocking",
    title: "Time blocking",
    description: "Put tasks on your calendar as fixed appointments, not just a to-do list. Seeing them as scheduled reduces decision fatigue.",
    category: "Routines",
  },
  {
    id: "external-alarms",
    title: "External alarms",
    description: "Use multiple alarms or timers spread through the day for transitions — leaving the house, switching tasks, taking breaks.",
    category: "Routines",
  },
  {
    id: "reduce-friction",
    title: "Reduce friction",
    description: "Set up your environment so starting is effortless: lay out clothes the night before, keep your workspace ready, charge devices proactively.",
    category: "Environment",
  },
  {
    id: "pomodoro",
    title: "Timed sprints",
    description: "Work in short, focused bursts (15–25 minutes) with a proper break after. The countdown creates urgency that helps ADHD brains engage.",
    category: "Focus",
  },
  {
    id: "visual-reminders",
    title: "Visual reminders",
    description: "Keep important items visible — sticky notes, open tabs, a whiteboard. Out of sight really does mean out of mind with ADHD.",
    category: "Environment",
  },
  {
    id: "reward-first",
    title: "Front-load the reward",
    description: "Start a task with the part you find most interesting or satisfying. Momentum from that spark can carry you through the rest.",
    category: "Motivation",
  },
  {
    id: "implementation-intention",
    title: "If–then planning",
    description: "Write tasks as 'if–then' statements: 'If I sit down after lunch, then I will open my notes first.' Specificity beats willpower.",
    category: "Routines",
  },
  {
    id: "noise-management",
    title: "Manage your noise",
    description: "Some ADHD brains focus better with background noise (lo-fi, café sounds, rain); others need silence. Experiment and stick with what works.",
    category: "Environment",
  },
  {
    id: "done-not-perfect",
    title: "Done beats perfect",
    description: "Perfectionism is often paralysis in disguise. Set a 'good enough' bar before you start so you know when to stop and move on.",
    category: "Motivation",
  },
];
