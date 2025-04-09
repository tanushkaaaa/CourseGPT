import Sidebar from "./components/Sidebar";
import LessonGenerator from "./components/LessonGenerator";
import ModuleOrganizer from "./components/ModuleOrganizer";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen bg-bg flex">
      {/* <Sidebar /> */}
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<LessonGenerator />} />
          <Route path="/modules" element={<ModuleOrganizer />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
