import { useLessons } from "../components/LessonContext";
import { useState } from "react";

const AddToModuleSelector = ({ lesson, onSuccess }) => {
  const { modules, addLessonToModule, suggestModules } = useLessons();
  const [selectedModule, setSelectedModule] = useState("");
  const suggestions = suggestModules(lesson).map((m) => m.title);

  const handleAdd = () => {
    if (selectedModule) {
      addLessonToModule(selectedModule, lesson);
      onSuccess?.(); // Optional callback after add
      alert(`Lesson added to "${selectedModule}"!`);
    }
  };

  return (
    <div className="p-4">
      <label htmlFor="moduleSelect" className="block font-bold mb-2">
        Select Module to Add:
      </label>

      <select
        id="moduleSelect"
        value={selectedModule}
        onChange={(e) => setSelectedModule(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="" disabled>
          -- Select a module --
        </option>

        {/* Suggested first */}
        {modules
          .filter((mod) => suggestions.includes(mod.title))
          .map((mod) => (
            <option key={mod.title} value={mod.title}>
              ⭐ {mod.title}
            </option>
          ))}

        {/* Divider */}
        {suggestions.length > 0 && <option disabled>──────────</option>}

        {/* All other modules */}
        {modules
          .filter((mod) => !suggestions.includes(mod.title))
          .map((mod) => (
            <option key={mod.title} value={mod.title}>
              {mod.title}
            </option>
          ))}
      </select>

      <button
        onClick={handleAdd}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Lesson to Module
      </button>
    </div>
  );
};

export default AddToModuleSelector;
