// src/pages/jobs/quizData.ts
import type { QuizQuestion } from "./JobApplicationWizard";

// Official Hippies Heaven Employment Questionnaire
// We will keep your wording exactly. Choices are in the same order you gave,
// and we mark the correctIndex based on ✅ Correct Answer.
// We'll provide a shuffle util for both questions and choices.

const RAW_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question:
      "You’re scheduled to work at 8 AM but your car breaks down at 7:30. What should you do first?",
    choices: [
      "Call a friend to complain",
      "Call your manager immediately and explain the situation",
      "Post about it on social media",
      "Just show up late without saying anything",
    ],
    correctIndex: 1,
  },
  {
    id: "q2",
    question:
      "A customer drops a $20 bill on the floor and doesn’t notice. What should you do?",
    choices: [
      "Keep it quietly",
      "Pick it up and return it to the customer",
      "Split it with a coworker",
      "Wait to see if anyone else claims it",
    ],
    correctIndex: 1,
  },
  {
    id: "q3",
    question:
      "You notice a coworker not doing their job and it’s affecting you. What’s the best way to handle it?",
    choices: [
      "Yell at them",
      "Politely talk to them or notify your manager if needed",
      "Ignore it completely",
      "Post about them online",
    ],
    correctIndex: 1,
  },
  {
    id: "q4",
    question: "If you spill something on the floor, what should you do?",
    choices: [
      "Walk away and pretend it’s not yours",
      "Clean it up right away or report it",
      "Wait for the janitor",
      "Warn customers not to step there",
    ],
    correctIndex: 1,
  },
  {
    id: "q5",
    question:
      "A customer is angry and yelling. What should you do?",
    choices: [
      "Yell back",
      "Stay calm, listen, and get a manager if necessary",
      "Walk away",
      "Record them on your phone",
    ],
    correctIndex: 1,
  },
  {
    id: "q6",
    question:
      "Your manager gives you a task you don’t understand. What do you do?",
    choices: [
      "Guess what to do",
      "Ask for clarification before starting",
      "Ignore it",
      "Ask a coworker to do it for you",
    ],
    correctIndex: 1,
  },
  {
    id: "q7",
    question:
      "You find a phone left on the counter. What’s the best action?",
    choices: [
      "Keep it until someone asks",
      "Turn it in to a manager or lost-and-found immediately",
      "Leave it where it is",
      "Try to unlock it",
    ],
    correctIndex: 1,
  },
  {
    id: "q8",
    question:
      "You notice the front of the store is messy but it’s not your area. What do you do?",
    choices: [
      "Ignore it",
      "Tidy it up or notify the person responsible",
      "Wait for your manager to say something",
      "Tell a customer to avoid it",
    ],
    correctIndex: 1,
  },
  {
    id: "q9",
    question:
      "A customer asks a question you don’t know the answer to. What’s best?",
    choices: [
      "Make up an answer",
      "Say 'I don’t know' and walk away",
      "Tell them you’re not sure but you’ll ask someone who knows",
      "Tell them to Google it",
    ],
    correctIndex: 2,
  },
  {
    id: "q10",
    question:
      "You’re working and a friend stops by to hang out. What should you do?",
    choices: [
      "Talk for a while since it’s slow",
      "Politely tell them you can’t talk while working",
      "Invite them behind the counter",
      "Ignore other customers",
    ],
    correctIndex: 1,
  },
  {
    id: "q11",
    question:
      "The power goes out during your shift. What’s the first thing you should do?",
    choices: [
      "Leave immediately",
      "Continue selling as normal",
      "Stay calm and wait for manager instructions",
      "Use your phone’s flashlight and keep working",
    ],
    correctIndex: 2,
  },
  {
    id: "q12",
    question:
      "You accidentally ring something up wrong. What’s the right step?",
    choices: [
      "Ignore it",
      "Tell a manager and correct the sale",
      "Ask the customer to pay extra",
      "Pretend it didn’t happen",
    ],
    correctIndex: 1,
  },
  {
    id: "q13",
    question:
      "You’re assigned a boring or repetitive task. What should you do?",
    choices: [
      "Refuse to do it",
      "Do it correctly with a positive attitude",
      "Work slower",
      "Ask someone else to trade tasks",
    ],
    correctIndex: 1,
  },
  {
    id: "q14",
    question:
      "A coworker jokes about stealing merchandise. What should you do?",
    choices: [
      "Laugh it off",
      "Report it to a manager immediately",
      "Join the joke",
      "Keep it secret",
    ],
    correctIndex: 1,
  },
  {
    id: "q15",
    question:
      "You’re 10 minutes early for your shift. What’s the right thing to do?",
    choices: [
      "Clock in early to earn extra pay",
      "Wait until your scheduled time unless told otherwise",
      "Leave and come back later",
      "Hang out behind the counter",
    ],
    correctIndex: 1,
  },
  {
    id: "q16",
    question:
      "You accidentally break a product. What should you do?",
    choices: [
      "Hide it",
      "Tell your manager right away",
      "Blame someone else",
      "Leave it on the shelf",
    ],
    correctIndex: 1,
  },
  {
    id: "q17",
    question:
      "You’re told to stop using your phone at work. What’s the best reaction?",
    choices: [
      "Argue about it",
      "Put it away and follow the rule",
      "Keep using it secretly",
      "Quit",
    ],
    correctIndex: 1,
  },
  {
    id: "q18",
    question:
      "You notice a small fire starting in a trash can. What should you do first?",
    choices: [
      "Run out of the building",
      "Alert others and use the fire extinguisher if safe to do so",
      "Take a video for proof",
      "Try to stomp it out",
    ],
    correctIndex: 1,
  },
  {
    id: "q20",
    question:
      "You’re unsure how to do part of your job, but don’t want to look dumb. What’s the best move?",
    choices: [
      "Guess and hope it’s right",
      "Ask your manager or coworker for guidance",
      "Pretend you know",
      "Wait until someone notices",
    ],
    correctIndex: 1,
  },
  {
    id: "q21",
    question:
      "You accidentally see a coworker taking money from the register. What should you do?",
    choices: [
      "Confront them privately",
      "Ignore it",
      "Report it to management immediately",
      "Record them for social media",
    ],
    correctIndex: 2,
  },
  {
    id: "q22",
    question:
      "Your friend asks for a 'hook-up' or discount without permission. What do you do?",
    choices: [
      "Give it to them quietly",
      "Politely refuse and explain store policy",
      "Charge them half",
      "Let them take it",
    ],
    correctIndex: 1,
  },
  {
    id: "q23",
    question:
      "You made a mistake that cost the company money. What’s the best way to handle it?",
    choices: [
      "Hide it",
      "Report it and offer to help fix it",
      "Blame someone else",
      "Pretend it didn’t happen",
    ],
    correctIndex: 1,
  },
  {
    id: "q24",
    question:
      "Your manager is gone and a customer overpays. What’s the right action?",
    choices: [
      "Keep the extra money",
      "Tell the customer and return the extra",
      "Put it in a tip jar",
      "Wait until the manager returns",
    ],
    correctIndex: 1,
  },
  {
    id: "q25",
    question:
      "You realize a coworker is clocking in early to get extra pay. What should you do?",
    choices: [
      "Join them",
      "Ignore it",
      "Report it privately to management",
      "Joke about it",
    ],
    correctIndex: 2,
  },
];

// Fisher-Yates shuffle
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Returns:
// - questions in random order
// - each question's choices also randomized
// - correctIndex updated to match the shuffled choices
export function getRandomizedQuiz(): QuizQuestion[] {
  const qShuffled = shuffleArray(RAW_QUESTIONS).map((q) => {
    const indexedChoices = q.choices.map((choiceText, idx) => ({
      choiceText,
      originalIndex: idx,
    }));

    const shuffledChoices = shuffleArray(indexedChoices);
    const newChoices = shuffledChoices.map((c) => c.choiceText);
    const newCorrectIndex = shuffledChoices.findIndex(
      (c) => c.originalIndex === q.correctIndex
    );

    return {
      ...q,
      choices: newChoices,
      correctIndex: newCorrectIndex,
    };
  });

  return qShuffled;
}
