import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLessons } from "../components/LessonContext";
import { getTopMatchingModules } from "../utils/moduleMatcher";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import AddToModuleSelector from "../components/AddToModuleSelector";



export default function ModuleOrganizer() {
  const navigate = useNavigate();
  const location = useLocation();
  const newLesson = location.state?.newLesson;

  const {
    lessons,
    addLesson,
    modules = [],
    addLessonToModule,
    addModule,
  } = useLessons();

  const [action, setAction] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [title, setTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");

  const [selectedModule, setSelectedModule] = useState(null);

  


  const SIMILARITY_THRESHOLD = 0.35;

  

  useEffect(() => {
    if (action === "add" && newLesson?.content && modules?.length > 0) {
      const matches = getTopMatchingModules(modules, newLesson.content, newLesson.title, newLesson.topic);
      const filteredMatches = matches.filter(mod => mod.similarityScore >= SIMILARITY_THRESHOLD);
      setSuggestions(filteredMatches);
    }
  }, [action, modules, newLesson]);

  function sanitizeText(text) {
    return typeof text === "string" && text.trim()
      ? text.replace(/[^\x20-\x7E]/g, "") // remove non-ASCII
      : "Not available";
  }
  
  function sanitizeText(text) {
    if (!text || typeof text !== "string") return "";
    return text.replace(/[^\x20-\x7E]/g, "").trim(); // Removes weird chars
  }
  
  function sanitizeArray(arr) {
    return Array.isArray(arr)
      ? arr.map((s) => sanitizeText(s)).filter((s) => s && s.toLowerCase() !== "not available")
      : [];
  }
  
  function downloadLessonPDF(lesson) {
    const doc = new jsPDF();
    let y = 20;
  
    const title = sanitizeText(lesson.title) || "Untitled Lesson";
    const topic = sanitizeText(lesson.topic);
  
    doc.setFontSize(16);
    doc.text(title, 10, y);
    y += 10;
  
    if (topic) {
      doc.setFontSize(12);
      doc.text(`Topic: ${topic}`, 10, y);
      y += 10;
    }
  
    const description = sanitizeText(lesson.description);
    if (description && description.toLowerCase() !== "not available") {
      doc.setFontSize(12);
      doc.text("📌 Description:", 10, y);
      y += 10;
      doc.text(doc.splitTextToSize(description, 180), 10, y);
      y += 20;
    }
  
    const concepts = sanitizeArray(lesson.keyConcepts);
    if (concepts.length > 0) {
      doc.text("🧠 Key Concepts:", 10, y);
      y += 10;
      concepts.forEach((concept) => {
        doc.text(`• ${concept}`, 12, y);
        y += 8;
      });
      y += 10;
    }
  
    const activities = sanitizeArray(lesson.activities);
    if (activities.length > 0) {
      doc.text("🧪 Activities:", 10, y);
      y += 10;
      activities.forEach((activity, i) => {
        doc.text(`Activity ${i + 1}:`, 12, y);
        y += 6;
        doc.text(doc.splitTextToSize(activity, 180), 14, y);
        y += 10;
      });
    }
  
    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
  }
  
  
  

  const handleDownloadLessonPDF = (lesson) => {
    if (lesson.pdfBlob) {
      const url = URL.createObjectURL(lesson.pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${lesson.title.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link); // Required for Firefox
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } else {
      // fallback to rebuild the PDF (your existing function)
      downloadLessonPDF(lesson);
    }
  };  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-8 border border-zinc-200">
        <h2 className="text-4xl font-extrabold text-zinc-800 mb-10 text-center flex items-center justify-center gap-2">
          🗂️ Module Organizer
        </h2>

        {newLesson && !action && (
          <>
            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-lg mb-8 shadow-sm">
              <h3 className="text-lg font-semibold text-blue-800">Lesson to Add</h3>
              <p className="mt-1"><strong>📘 Title:</strong> {newLesson.title}</p>
              <p className="mt-1"><strong>🧠 Topic:</strong> {newLesson.topic}</p>
            </div>

            <div className="text-center space-y-4">
              <p className="text-zinc-700 text-xl">What would you like to do with this lesson?</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setAction("create")}
                  className="bg-green-600 text-white px-6 py-2 rounded-full shadow hover:bg-green-700 transition"
                >
                  ➕ Create New Module
                </button>
                <button
                  onClick={() => setAction("add")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full shadow hover:bg-blue-700 transition"
                >
                  📚 Add to Existing
                </button>
              </div>
            </div>
          </>
        )}

        {action === "create" && (
          <div className="mt-8 bg-white p-6 rounded-xl border border-zinc-300 shadow-inner">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-2xl font-semibold">➕ Create a New Module</h4>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ↩️ Back
                </button>
                <button
                  onClick={() => setAction("")}
                  className="text-sm text-zinc-500 hover:underline"
                >
                  ❌ Close
                </button>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newModule = {
                  title,
                  overview,
                  difficulty,
                  prerequisites: prerequisites.split(",").map(p => p.trim()),
                  estimatedTime,
                  lessons: newLesson ? [newLesson] : [],
                };
                addModule(newModule);
                alert(`Module "${title}" created${newLesson ? " and lesson added" : ""}!`);
                navigate("/modules");
              }}
              className="space-y-4"
            >
              <input className="w-full p-3 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-green-400" type="text" required placeholder="📘 Module Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <input className="w-full p-3 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-green-400" type="text" required placeholder="📝 Overview" value={overview} onChange={(e) => setOverview(e.target.value)} />
              <input className="w-full p-3 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-green-400" type="text" required placeholder="⚙️ Difficulty (e.g., Beginner)" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} />
              <input className="w-full p-3 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-green-400" type="text" required placeholder="🔑 Prerequisites (comma-separated)" value={prerequisites} onChange={(e) => setPrerequisites(e.target.value)} />
              <input className="w-full p-3 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-green-400" type="text" required placeholder="⏱️ Estimated Time (e.g., 2 hours)" value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} />
              <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition" type="submit">
                ✅ Create Module
              </button>
            </form>
          </div>
        )}

{action === "add" && (
  <div className="mt-8 bg-white p-6 rounded-xl border border-zinc-300 shadow-inner">
    <div className="flex justify-between items-center mb-4">
      <h4 className="text-2xl font-semibold">💡 Suggested Modules</h4>
      <button
        onClick={() => setAction("")}
        className="text-sm text-zinc-500 hover:underline"
      >
        ❌ Close
      </button>
    </div>

    {/* ✅ Suggested modules list */}
    {suggestions.length > 0 ? (
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {suggestions.map((module) => (
          <li
            key={module.title}
            className="p-4 rounded-lg border border-blue-200 bg-blue-50 hover:shadow-lg transition cursor-pointer"
            onClick={() => {
              addLessonToModule(module.title, newLesson);
              alert(`Lesson "${newLesson.title}" added to module "${module.title}"`);
              navigate("/modules");
            }}
          >
            <p className="text-lg font-bold text-blue-800">{module.title}</p>
            <p className="text-sm text-blue-700 mt-1">{module.overview}</p>
            <p className="text-xs text-blue-600 mt-2">
              Similarity Score: {(module.similarityScore * 100).toFixed(2)}%
            </p>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-zinc-500 mb-6">No good matches found.</p>
    )}

    {/* ✅ Manual fallback selector */}
    <div className="mt-4 border-t pt-4">
      <h5 className="font-semibold mb-2">Or manually choose from all modules:</h5>
      <AddToModuleSelector
        lesson={newLesson}
        onSuccess={() => {
          navigate("/modules");
        }}
      />
    </div>
  </div>
)}


      {/* Global Buttons — only when no action is active */}
{/* Show these buttons only if no lesson is being added and no action is active */}
{!newLesson && action === "" && (
  <div className="flex justify-end gap-4 mb-4">
    <button
      onClick={() => setAction("create")}
      className="bg-green-600 text-white px-4 py-2 rounded-full shadow hover:bg-green-700 transition"
    >
      ➕ Create New Module
    </button>
    <button
      onClick={() => navigate("/")}
      className="bg-gray-500 text-white px-4 py-2 rounded-full shadow hover:bg-gray-600 transition"
    >
      ↩️ Back to Lesson Generator
    </button>
  </div>
)}



        {/* Existing Modules List */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold text-zinc-800 mb-6">🗂️ Existing Modules</h3>
          {modules.length === 0 ? (
            <p className="text-center text-zinc-500">No modules yet. Start by creating one!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {modules.map((mod) => (
  <div
    key={mod.title}
    className="border border-zinc-200 rounded-2xl p-6 bg-white hover:shadow-xl transition duration-200 cursor-pointer"
    onClick={() => {
      setSelectedModule(mod);
      setTimeout(() => {
        document.getElementById("module-detail")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }}
  >
    <div className="flex flex-col gap-2">
      <h4 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
        📘 {mod.title}
      </h4>
      <p className="text-sm text-zinc-600">{mod.overview}</p>
      <div className="mt-3 text-sm space-y-1 text-zinc-500">
        <p>
          <strong>Difficulty:</strong>{" "}
          <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
            {mod.difficulty}
          </span>
        </p>
        <p>
          <strong>Estimated Time:</strong> {mod.estimatedTime}
        </p>
        <p>
          <strong>Lessons:</strong> {mod.lessons?.length || 0}
        </p>
        {mod.prerequisites?.length > 0 && (
          <p>
            <strong>Prerequisites:</strong>{" "}
            <span className="flex flex-wrap gap-1 mt-1">
              {mod.prerequisites.map((p, i) => (
                <span
                  key={i}
                  className="bg-zinc-100 px-2 py-0.5 rounded text-xs"
                >
                  {p}
                </span>
              ))}
            </span>
          </p>
        )}
      </div>
    </div>
  </div>
))}

            </div>
          )}
        </div>
        {selectedModule && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-xl relative overflow-y-auto max-h-[90vh]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-zinc-800">
          📘 {selectedModule.title} – Lessons
        </h3>
        <button
          className="text-red-500 text-sm hover:underline"
          onClick={() => setSelectedModule(null)}
        >
          ❌ Close
        </button>
      </div>

      {selectedModule.lessons.length > 0 ? (
        <ul className="space-y-4">
          {selectedModule.lessons.map((lesson, index) => (
            <li
              key={index}
              className="border border-zinc-200 p-4 rounded-lg bg-zinc-50 flex justify-between items-start gap-4"
            >
              <div>
                <p className="font-bold text-zinc-800">{lesson.title}</p>
                <p className="text-sm text-zinc-600">{lesson.topic}</p>
              </div>
              <button
                className="bg-blue-500 text-white px-3 py-1 text-sm rounded-full hover:bg-blue-600 transition whitespace-nowrap cursor-pointer"
                onClick={() =>  handleDownloadLessonPDF(lesson)}
              >
                📄 Download
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-zinc-500 italic">No lessons added yet.</p>
      )}

      {/* <button
        className="mt-6 bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition w-full"
        onClick={() => downloadModulePDF(selectedModule)}
      >
        📦 Download Entire Module as PDF
      </button> */}
    </div>
  </div>
)}


      </div>
    </div>
  );
}
