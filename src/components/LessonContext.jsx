import React, { createContext, useContext, useState, useEffect } from "react";
import { generateTagsFromText } from "../utils/tagGenerator";

export const LessonContext = createContext();

const DEFAULT_MODULES = [
  {
    title: "Intro to Clothes",
    overview: "Learn the basics of Jeans and tops.",
    tags: ["clothes", "jeans", "tops", "fashion"],
    difficulty: "Beginner",
    prerequisites: ["none"],
    estimatedTime: "2 hours",
    lessons: [],
  },
  {
    title: "Plant",
    overview: "Learn about photosynthesis, roots, stems, and leaves.",
    tags: ["plant", "photosynthesis", "leaves", "soil", "botany"],
    difficulty: "Easy",
    prerequisites: ["None"],
    estimatedTime: "2 hours",
    lessons: [],
  },
  {
    title: "Fullstack",
    overview: "Learn about MERN stack",
    tags: ["react", "mongoDB"],
    difficulty: "Easy",
    prerequisites: ["None"],
    estimatedTime: "2 hours",
    lessons: [],
  },
];

export const LessonProvider = ({ children }) => {
  const [lessons, setLessons] = useState(() => {
    const saved = localStorage.getItem("lessons");
    return saved ? JSON.parse(saved) : [];
  });

  const [modules, setModules] = useState(() => {
    const saved = localStorage.getItem("modules");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (!localStorage.getItem("modules")) {
      localStorage.setItem("modules", JSON.stringify(DEFAULT_MODULES));
      setModules(DEFAULT_MODULES);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lessons", JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem("modules", JSON.stringify(modules));
  }, [modules]);

  const addLesson = (lesson) => {
    if (!lesson || !lesson.title) {
      console.error("Invalid lesson passed to addLesson:", lesson);
      return;
    }

    const tags = generateTagsFromText(`${lesson.title} ${lesson.topic} ${lesson.content || ""}`);
    const taggedLesson = {
      ...lesson,
      tags,
      learningOutcomes: lesson.learningOutcomes || [],
    };

    setLessons((prev) => [...prev, taggedLesson]);
  };

  const addLessonToModule = (moduleTitle, lesson) => {
    console.log("addLessonToModule called with:", { moduleTitle, lesson });

    if (!lesson || !lesson.title) {
      console.error("❌ Invalid lesson object!", lesson);
      return;
    }

    const tags = generateTagsFromText(`${lesson.title} ${lesson.topic} ${lesson.content || ""}`);
    const taggedLesson = {
      ...lesson,
      tags,
      learningOutcomes: lesson.learningOutcomes || [],
    };

    setModules((prev) =>
      prev.map((mod) =>
        mod.title === moduleTitle
          ? {
              ...mod,
              lessons: [...(mod.lessons || []), taggedLesson],
            }
          : mod
      )
    );
  };

  const addModule = (module) => {
    const tags = generateTagsFromText(`${module.title} ${module.overview}`);
    const taggedModule = { ...module, tags, lessons: [] };
    setModules((prev) => [...prev, taggedModule]);
  };

  const deleteModule = (title) => {
    setModules((prev) => prev.filter((mod) => mod.title !== title));
  };

  const getSimilarityScore = (tagsA, tagsB) => {
    const common = tagsA.filter((tag) => tagsB.includes(tag));
    return (common.length / Math.max(tagsA.length, tagsB.length)) * 100;
  };

  const suggestModules = (lesson) => {
    if (!lesson || typeof lesson !== "object") return [];

    const lessonTags = generateTagsFromText(
      `${lesson.title || ""} ${lesson.topic || ""} ${lesson.content || ""}`
    );

    const scoredModules = modules.map((mod) => {
      const modLessonTitles = (mod.lessons || [])
        .filter((l) => l && typeof l === "object" && typeof l.title === "string")
        .map((l) => l.title)
        .join(" ");

      const modText = `${mod.title || ""} ${mod.overview || ""} ${modLessonTitles}`;
      const moduleTags = generateTagsFromText(modText);

      let score = getSimilarityScore(lessonTags, moduleTags);

      if (
        lesson.title &&
        mod.title &&
        mod.title.toLowerCase().includes(lesson.title.toLowerCase())
      ) {
        score += 20;
      }

      return {
        ...mod,
        similarityScore: score.toFixed(2),
      };
    });

    return scoredModules
      .filter((mod) => parseFloat(mod.similarityScore) > 10)
      .sort((a, b) => b.similarityScore - a.similarityScore);
  };

  return (
    <LessonContext.Provider
      value={{
        lessons,
        addLesson,
        modules,
        setModules,
        addLessonToModule,
        addModule,
        generateTagsFromText,
        suggestModules,
        deleteModule, // ✅ Exposed here
      }}
    >
      {children}
    </LessonContext.Provider>
  );
};

export const useLessons = () => useContext(LessonContext);
