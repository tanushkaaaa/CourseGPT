import { useLessons } from "./LessonContext";

export default function LessonList() {
  const { lessons } = useLessons();

  if (lessons.length === 0) {
    return (
      <div className="text-zinc-600 italic text-center mt-10">
        No lessons generated yet.
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-6">
      <h2 className="text-2xl font-semibold text-zinc-800 mb-4">📚 Saved Lessons</h2>
      {lessons.map((lesson, index) => (
        <div key={index} className="border rounded-lg p-4 bg-white shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-indigo-700">{lesson.title}</h3>
          <p className="text-sm text-zinc-600 italic">{lesson.topic}</p>

          {lesson.learningOutcomes?.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-zinc-800 mt-2">🎯 Learning Outcomes:</h4>
              <ul className="list-disc list-inside text-sm text-zinc-700">
                {lesson.learningOutcomes.map((outcome, i) => (
                  <li key={i}>{outcome}</li>
                ))}
              </ul>
            </div>
          )}

          {lesson.keyConcepts?.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-zinc-800 mt-2">🔑 Key Concepts:</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {lesson.keyConcepts.map((concept, i) => (
                  <span
                    key={i}
                    className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          <pre className="whitespace-pre-wrap text-sm text-zinc-800 mt-2">{lesson.content}</pre>

          {lesson.activities && (
            <div>
              <h4 className="text-md font-semibold text-zinc-800 mt-3">🎲 Activities:</h4>
              <pre className="whitespace-pre-wrap text-sm text-zinc-700 bg-zinc-50 p-2 rounded-md">
                {lesson.activities}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
