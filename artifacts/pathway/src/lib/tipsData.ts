export interface Tip {
  id: string;
  category: string;
  text: string;
}

export interface TipCategory {
  id: string;
  label: string;
}

export const SOURCE_URL = "";
export const SOURCE_LABEL = "Inspired by tips shared on Reddit";

export const TIP_CATEGORIES: TipCategory[] = [
  { id: "general", label: "General tips" },
  { id: "cleaning", label: "Cleaning" },
];

export const TIPS: Tip[] = [
  {
    id: "general-1",
    category: "general",
    text: "Do some cardio before anything that requires sitting still for a while — it makes it easier to settle in afterward.",
  },
  {
    id: "general-2",
    category: "general",
    text: "Keep important, time-sensitive things where you can actually see them, not tucked away.",
  },
  {
    id: "general-3",
    category: "general",
    text: "When you're feeling overwhelmed, write it all out on a whiteboard or list — it doesn't matter what it is, and you can rip up or toss the paper afterward if you want to keep it private.",
  },
  {
    id: "general-4",
    category: "general",
    text: "When watching videos, use playback speed to your advantage — speed up or slow down, whichever actually helps you focus.",
  },
  {
    id: "general-5",
    category: "general",
    text: "With multiple tasks of the same urgency, start with the hardest one, then alternate between easy and hard tasks from there. Works for basically anything in life.",
  },
  {
    id: "cleaning-1",
    category: "cleaning",
    text: "Put things wherever works for you, but keep the location consistent so you always know where to look.",
  },
  {
    id: "cleaning-2",
    category: "cleaning",
    text: "Keep a catch-all basket or container for items you don't have an obvious home for.",
  },
  {
    id: "cleaning-3",
    category: "cleaning",
    text: "Break the room (or space) into sections, write them as a checklist, and start with whichever section is hardest or most tedious.",
  },
  {
    id: "cleaning-4",
    category: "cleaning",
    text: "Moving between rooms? Grab whatever item belongs in the room you're heading to and drop it off there.",
  },
  {
    id: "cleaning-5",
    category: "cleaning",
    text: "You don't have to stick to one cleaning mode. Doing dishes and spot trash nearby? Toss the trash, then go right back to the dishes.",
  },
  {
    id: "cleaning-6",
    category: "cleaning",
    text: "Have a go-to playlist or podcast lineup reserved just for cleaning sessions.",
  },
];
