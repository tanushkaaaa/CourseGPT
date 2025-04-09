import { useState } from "react";

const ModuleCard = ({ module }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  const visibleLessons = expanded
    ? module.lessons
    : module.lessons.slice(0, 2);

  return (
    <div className="bg-white shadow-md rounded-md p-6 mb-4 border border-gray-200">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-primary">{module.title}</h3>
        <button
          onClick={toggleExpand}
          className="text-sm text-blue-600 hover:underline"
        >
          {expanded ? "Hide Lessons" : "View All"}
        </button>
      </div>

      {/* 🔧 Changed from description to overview */}
      <p className="text-gray-600 mt-2">{module.overview}</p>

      <div className="mt-3 text-sm text-gray-700">
        <p><strong>Difficulty:</strong> {module.difficulty}</p>
        <p><strong>Prerequisites:</strong> {module.prerequisites.join(", ")}</p>
        <p><strong>Estimated Time:</strong> {module.estimatedTime}</p>
      </div>

      <div className="mt-4">
        <h4 className="font-medium mb-1">Lessons:</h4>
        <ul className="list-disc list-inside text-sm space-y-1">
          {visibleLessons.map((lesson, index) => (
            <li
              key={index}
              className="cursor-pointer hover:underline text-blue-700"
              onClick={() => alert(`Open or download: ${lesson.title}`)} // replace with actual action
            >
              {lesson.title}
            </li>
          ))}
        </ul>

        {!expanded && module.lessons.length > 2 && (
          <p className="text-xs text-gray-500 mt-2">
            ...and {module.lessons.length - 2} more
          </p>
        )}
      </div>
    </div>
  );
};

export default ModuleCard;
