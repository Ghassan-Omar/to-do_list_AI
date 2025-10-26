import { GoogleGenerativeAI } from "@google/generative-ai";

//  Initialize the Google Generative AI client with the API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Function to suggest tasks based on context
export async function suggestTasks(context) {
  const prompt = `You are an intelligent task management assistant. Based on the following context: "${context}"

Please suggest 5 practical and actionable tasks that would be helpful to add to a to-do list. 

Requirements:
- Each task should be clear, specific, and actionable
- Tasks should be relevant to the given context
- Provide only the task descriptions, one per line
- Do not include numbering, bullets, or any formatting
- Keep each task concise (under 100 characters)

Output format: Plain text, one task per line.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // convert the plain text response into an array of tasks
  return text
    .trim()
    .split("\n")
    .filter((task) => task.length > 0);
}

// Function to analyze productivity based on completed and pending tasks
export async function analyzeProductivity(tasks) {
  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);

  const prompt = `I have completed ${completedTasks.length} tasks and I have ${
pendingTasks.length
} tasks remaining.
Remaining tasks: ${pendingTasks.map((t) => t.text).join(", ")}
Give me a short tip (just two sentences) to improve my productivity.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
