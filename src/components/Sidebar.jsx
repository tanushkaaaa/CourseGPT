import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gradient-to-b from-neutral-100 to-white border-r border-gray-200 p-6 shadow-sm">
      {/* Logo and Brand */}
      <div className="flex items-center gap-3 mb-8">
        <img
          src="/logo.jpeg"
          alt="CourseGPT Logo"
          className="w-10 h-10 rounded-full object-cover shadow mt-1"
        />
        <h2 className="text-2xl font-semibold text-gray-800 tracking-wide">
          CourseGPT
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-4">
        <Link
          to="/"
          className="text-gray-700 hover:bg-amber-100 hover:text-amber-700 px-4 py-2 rounded-lg transition-colors duration-200"
        >
          📘 Lesson Generator
        </Link>
        <Link
          to="/modules"
          className="text-gray-700 hover:bg-amber-100 hover:text-amber-700 px-4 py-2 rounded-lg transition-colors duration-200"
        >
          🗂️ Module Organizer
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
