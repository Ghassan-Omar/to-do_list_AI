import { useState, useEffect } from "react";
import { suggestTasks, analyzeProductivity } from "./gemini";

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiAdvice, setAiAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  // Save Dark Mode
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Save Tasks in Local Storage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Adding a new task
  const addTask = () => {
    if (input.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          text: input,
          completed: false,
          category: "personal",
        },
      ]);
      setInput("");
    }
  };

  // changing task completion status
  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // deleting a task
  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // Getting AI suggestions
  const getAISuggestions = async () => {
    setLoading(true);
    try {
      const context =
        tasks.length > 0
          ? `I have these tasks: ${tasks.map((t) => t.text).join(", ")}`
          : "I want to organize my day";

      const suggestions = await suggestTasks(context);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error("AI error:", error);
      alert(
        "Error fetching AI suggestions. Please try again later, make sure your API key is valid or switch to another model."
      );
    }
    setLoading(false);
  };

  // Getting advice from AI
  const getAIAdvice = async () => {
    if (tasks.length === 0) {
      alert("Add some tasks first!");
      return;
    }

    setLoading(true);
    try {
      const advice = await analyzeProductivity(tasks);
      setAiAdvice(advice);
    } catch (error) {
      console.error("ُError in AI :", error);
    }
    setLoading(false);
  };

  // adding AI suggestion to tasks
  const addSuggestion = (suggestion) => {
    setTasks([
      ...tasks,
      { id: Date.now(), text: suggestion, completed: false },
    ]);
    setAiSuggestions(aiSuggestions.filter((s) => s !== suggestion));
  };
  // Filtering tasks based on search and filter
  const getFilteredTasks = () => {
    let filtered = tasks;

    // Filtering by status
    if (filter === "completed") {
      filtered = filtered.filter((task) => task.completed);
    } else if (filter === "pending") {
      filtered = filtered.filter((task) => !task.completed);
    }

    // Search filtering
    if (searchQuery.trim()) {
      filtered = filtered.filter((task) =>
        task.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  // Switch Dark Mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div
      className={`min-h-screen p-8 transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-950 to-sky-700"
          : "bg-gradient-to-br from-sky-200 to-sky-400"
      }`}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header with button Dark Mode */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={toggleDarkMode}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              darkMode
                ? "bg-sky-950 text-gray-100 hover:bg-sky-500"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <div className="text-center flex-1">
            <h1
              className={`text-4xl font-bold mb-2 ${
                darkMode ? "text-white" : "text-white"
              }`}
            >
              Intellegent To-Do List
            </h1>
            <p
              className={`opacity-90 ${
                darkMode ? "text-gray-200" : "text-white"
              }`}
            >
              Empowered by Google Gemini AI
            </p>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        <div
          className={`rounded-2xl shadow-2xl p-8 ${
            darkMode ? "bg-gradient-to-br from-sky-700 to-sky-950" : "bg-white"
          }`}
        >
          {/* Input field */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in tasks..."
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-left ${
                darkMode
                  ? "bg-sky-950 border-sky-500 text-white placeholder-sky-50 focus:border-sky-400"
                  : "bg-white border-gray-300 text-gray-800 focus:border-gray-500"
              }`}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6">
            {["all", "pending", "completed"].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === filterType
                    ? darkMode
                      ? "bg-sky-500 text-white"
                      : "bg-gray-600 text-white"
                    : darkMode
                    ? "bg-sky-950 text-white hover:bg-sky-900"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {filterType === "all"
                  ? "All Tasks"
                  : filterType === "pending"
                  ? "🕒 Pending"
                  : "✅ Completed"}
              </button>
            ))}
          </div>

          {/* Input and Add Button */}
          <div className="flex gap-3 mb-6">
             <button
              onClick={addTask}
              className={`px-6 py-3 text-white font-bold rounded-lg  ${ 
              darkMode
              ? "bg-sky-950 hover:bg-sky-500 transition-colors"
              : "bg-gray-500 hover:bg-gray-700 transition-colors"
              }`}
            >
              Add
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
              placeholder="Add new task..."
              className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none text-left ${
                darkMode
                  ? "bg-sky-950 border-gray-600 text-white placeholder-gray-400 focus:border-gray-400"
                  : "bg-white border-gray-300 text-gray-800 focus:border-gray-500"
              }`}
            />
           
          </div>

          {/* AI Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={getAISuggestions}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-sky-900 text-white rounded-lg hover:bg-sky-500 disabled:bg-sky-300 transition-colors"
            >
              {loading ? "Downloading..." : "AI new suggestions"}
            </button>
            <button
              onClick={getAIAdvice}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-sky-900 text-white rounded-lg hover:bg-sky-500 disabled:bg-sky-300 transition-colors"
            >
              {loading ? "Downloading... " : "AI productivity advice 💡"}
            </button>
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                darkMode ? "bg-sky-800" : "bg-sky-500"
              }`}
            >
              <h3
                className={`text-lg font-bold mb-3 text-left ${
                  darkMode ? "text-sky-200" : "text-sky-500"
                }`}
              >
                AI Suggestions:
              </h3>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-white"
                    }`}
                  >
                    <button
                      onClick={() => addSuggestion(suggestion)}
                      className="px-3 py-1 bg-sky-300 text-white rounded hover:bg-sky-400 transition-colors text-sm"
                    >
                      Add
                    </button>
                    <span
                      className={`flex-1 text-left ${
                        darkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      {suggestion}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI advice */}
          {aiAdvice && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                darkMode ? "bg-sky-900" : "bg-sky-50"
              }`}
            >
              <h3
                className={`text-lg font-bold mb-2 text-left ${
                  darkMode ? "text-sky-200" : "text-sky-500"
                }`}
              >
                Advice from AI:
              </h3>
              <p
                className={`text-left leading-relaxed ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {aiAdvice}
              </p>
            </div>
          )}

          {/* Todo list */}
          <div className="space-y-3">
            {getFilteredTasks().length === 0 ? (
              <p
                className={`text-center py-8 ${
                  darkMode ? "text-sky-400" : "text-sky-400"
                }`}
              >
                {searchQuery
                  ? "No search results found"
                  : "No tasks found. Start adding a task!"}
              </p>
            ) : (
              getFilteredTasks().map((task) => (
                <div
                  key={task.id}
                  className={`flex items-left gap-3 p-4 rounded-lg transition-colors ${
                    darkMode
                      ? "bg-sky-800 hover:bg-sky-500"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                   <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span
                    className={`flex-1 text-left ${
                      task.completed
                        ? darkMode
                          ? "line-through text-sky-500"
                          : "line-through text-gray-400"
                        : darkMode
                        ? "text-sky-200"
                        : "text-gray-800"
                    }`}
                  >
                    {task.text}
                  </span>
                  
                 
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="px-3 py-1 bg-rose-500 text-white rounded hover:bg-red-400 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Task Summary */}
          {tasks.length > 0 && (
            <div
              className={`mt-6 p-4 rounded-lg flex justify-around text-center ${
                darkMode ? "bg-sky-800" : "bg-sky-50"
              }`}
            >
              <div>
                <div
                  className={`text-2xl font-bold ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {tasks.length}
                </div>
                <div
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Total
                </div>
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${
                    darkMode ? "text-sky-400" : "text-sky-600"
                  }`}
                >
                  {tasks.filter((t) => t.completed).length}
                </div>
                <div
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Completed
                </div>
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${
                    darkMode ? "text-orange-400" : "text-orange-600"
                  }`}
                >
                  {tasks.filter((t) => !t.completed).length}
                </div>
                <div
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default App;
