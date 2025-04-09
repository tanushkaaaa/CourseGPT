import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateLesson ,  generateSection } from "../api/openai";
import jsPDF from "jspdf";
import { useLessons } from "./LessonContext";
import SectionEditor from "./SectionEditor";

export default function LessonGenerator() {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { addLesson } = useLessons();
  const [showModal, setShowModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState(null);

  const [lesson, setLesson] = useState({
    title: "",
    topic: "",
    description: "",
    keyConcepts: [],
    activities: [],
  });

  const navigate = useNavigate();

  const handleGenerate = async (e) => {
    if (!title.trim() || !topic.trim()) return;
    e.preventDefault();
    setLoading(true);
    setResult("Generating...");
    setShowModal(true);

    try {
      const output = await generateLesson(title, topic);
      const structuredLesson = {
        title: extractTitle(output),
        topic,
        content: output,
        description: extractSection(output, "description"),
        keyConcepts: extractList(output, "key concepts"),
        activities: extractList(output, "activity"),
      };

      addLesson(structuredLesson);
      setLesson(structuredLesson);
      setResult(output);
    } catch (err) {
      console.error(err);
      setResult("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text(lesson.title, 10, y);
    y += 10;

    doc.setFontSize(14);
    doc.text(`Topic: ${lesson.topic}`, 10, y);
    y += 10;

    if (lesson.description) {
      doc.setFontSize(12);
      doc.text("📌 Description:", 10, y);
      y += 8;
      doc.setFontSize(11);
      doc.text(doc.splitTextToSize(lesson.description, 180), 10, y);
      y += lesson.description.split("\n").length * 6 + 8;
    }

    if (lesson.keyConcepts.length > 0) {
      doc.setFontSize(12);
      doc.text("🧠 Key Concepts:", 10, y);
      y += 8;
      doc.setFontSize(11);
      lesson.keyConcepts.forEach((item) => {
        doc.text(`• ${item}`, 10, y);
        y += 6;
      });
    }

    if (lesson.activities.length > 0) {
      doc.setFontSize(12);
      doc.text("🧪 Activities:", 10, y);
      y += 8;
      doc.setFontSize(11);
      lesson.activities.forEach((item, i) => {
        doc.text(`Activity ${i + 1}:`, 10, y);
        y += 6;
        doc.text(doc.splitTextToSize(item, 180), 14, y);
        y += item.split("\n").length * 6 + 4;
      });
    }

    doc.save(`${lesson.title}_${lesson.topic}_lesson.pdf`);
    setDownloading(false);
  };

  const handleAddToModule = () => {
    setShowModal(false);
    navigate("/modules", { state: { newLesson: lesson } });
  };

  const extractSection = (text, heading) => {
    const regex = new RegExp(`${heading}\\s*[:\\-]?\\s*([\\s\\S]*?)(\\n\\n|\\n[A-Z]|$)`, "i");
    const match = text.match(regex);
    return match ? match[1].trim() : "Generating...";
  };

  const extractList = (text, heading) => {
    const regex = new RegExp(`${heading}\\s*[:\\-]?\\s*([\\s\\S]*?)(\\n\\n|\\n[A-Z]|$)`, "i");
    const match = text.match(regex);
    if (!match) return [];
    return match[1]
      .split(/(?:^|\n)\s*(?:\d+\.\s+|[-•●])\s*/)
      .map((item) => item.trim())
      .filter((item) => item.length > 2);
  };

  const extractTitle = (text) => {
    const match = text.match(/Title\s*[:\-]?\s*(.*)/i);
    return match ? match[1].trim() : "Untitled Lesson";
  };

  const updateLessonField = (field, value) => {
    setLesson((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const regenerateSection = async (field) => {
    try {
      setRegeneratingSection(field);
      
      // Use the direct function call instead of fetch
      const result = await generateSection(lesson.title, lesson.topic, field);
      
      if (result) {
        updateLessonField(field, result);
      } else {
        throw new Error("No content generated");
      }
    } catch (error) {
      console.error("Regeneration failed:", error);
      // Show error to user - you can use a toast notification library or alert
      alert(`Failed to regenerate ${field}. Please try again.`);
    } finally {
      setRegeneratingSection(null);
    }
  };
  

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      {/* Sidebar */}
      <div className="absolute top-10 left-8 text-white text-lg font-semibold space-y-6 ml-5 -mt-5">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.jpeg" alt="Logo" className="w-10 h-10 rounded-full border-2 border-white shadow-md" />
          <span className="text-2xl text-black font-bold tracking-wide">CourseGPT</span>
        </div>
        <a href="/" className="flex items-center gap-2 text-black hover:text-blue-500 transition">📘 Lesson Generator</a>
        <a href="/modules" className="flex items-center gap-2 text-black hover:text-yellow-300 transition">🗂️ Module Organizer</a>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center min-h-screen px-4 ml-70">
        <div className="bg-opacity-60 mt-[-190px] backdrop-blur-md border-4 border-dashed border-black text-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full" style={{ backgroundColor: "#1a3324" }}>
          <h1 className="text-3xl font-bold text-center mb-6">📘 Generate a Lesson</h1>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Course Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Photosynthesis" className="w-full px-4 py-2 border border-zinc-300 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Topic Description</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Plant energy process" className="w-full px-4 py-2 border border-zinc-300 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
            </div>

            <button type="submit" className="w-full bg-yellow-500 text-black font-bold py-2 rounded-xl hover:bg-yellow-400 transition duration-200" disabled={loading}>
              {loading ? "Generating..." : "Generate Lesson"}
            </button>
          </form>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 pt-20">
              <div className="bg-white text-gray-800 p-8 rounded-2xl max-w-3xl w-full relative shadow-2xl overflow-y-auto max-h-[80vh] font-sans transition-all">
                <button onClick={() => setShowModal(false)} className="cursor-pointer absolute top-3 right-5 text-2xl font-bold text-gray-500 hover:text-black transition">✖</button>
                <h2 className="text-3xl font-extrabold text-center text-emerald-700 mb-4 tracking-wide">{lesson.title}</h2>

                <div id="lesson-content" className="space-y-6 text-base text-gray-900 leading-relaxed">
                  <SectionEditor
                    title="📌 Description"
                    field="description"
                    value={lesson.description}
                    onChange={(val) => updateLessonField("description", val)}
                    onRegenerate={() => regenerateSection("description")}
                  />

                  <SectionEditor
                    title="🧠 Key Concepts"
                    field="keyConcepts"
                    value={lesson.keyConcepts}
                    onChange={(val) => updateLessonField("keyConcepts", val)}
                    onRegenerate={() => regenerateSection("keyConcepts")}
                  />

                  <SectionEditor
                    title="🧪 Activities"
                    field="activities"
                    value={lesson.activities}
                    onChange={(val) => updateLessonField("activities", val)}
                    onRegenerate={() => regenerateSection("activities")}
                  />
                </div>

                <div className="flex justify-end mt-6 gap-4">
                  <button onClick={handleDownloadPDF} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-500 transition" disabled={downloading}>
                    {downloading ? "Downloading..." : "📥 Download PDF"}
                  </button>
                  <button onClick={handleAddToModule} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-500 transition">
                    ➕ Add to Module
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
