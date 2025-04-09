// SectionEditor.jsx
import { useState, useEffect } from "react";


export default function SectionEditor({ title, field, value, onChange, onRegenerate }) {
    return (
      <div>
        <h3 className="text-xl font-semibold text-indigo-700 mb-2 border-b-2 border-indigo-300 pb-1 flex justify-between items-center">
          <span>{title}</span>
          <button
            onClick={onRegenerate}
            className="text-sm bg-indigo-200 text-indigo-800 px-2 py-1 rounded hover:bg-indigo-300 transition"
          >
            🔄 Regenerate
            {/* {isRegenerating ? "Regenerating..." : "↻ Regenerate"} */}
          </button>
        </h3>
  
        {Array.isArray(value) ? (
          <ul className="space-y-1 text-gray-700 list-disc list-inside">
            {value.map((item, i) => (
              <li key={i}>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const updated = [...value];
                    updated[i] = e.target.value;
                    onChange(updated);
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              </li>
            ))}
          </ul>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-gray-800"
            rows={4}
          />
        )}
      </div>
    );
  }
  