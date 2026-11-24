"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

type Section = { id: string; name: string; _count: { students: number } };
type ClassItem = { id: string; name: string; sections: Section[] };

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [className, setClassName] = useState("");
  const [sectionInputs, setSectionInputs] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  async function loadClasses() {
    const res = await fetch("/api/admin/classes");
    if (res.ok) setClasses(await res.json());
  }

  useEffect(() => {
    loadClasses();
  }, []);

  async function handleAddClass(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: className }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }
    setClassName("");
    loadClasses();
  }

  async function handleAddSection(classId: string) {
    const name = sectionInputs[classId];
    if (!name?.trim()) return;
    setError("");

    const res = await fetch("/api/admin/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, name }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }
    setSectionInputs((prev) => ({ ...prev, [classId]: "" }));
    loadClasses();
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Classes & Sections</h1>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">{error}</div>
      )}

      <form onSubmit={handleAddClass} className="flex gap-3 mb-8 bg-white p-4 rounded-xl border border-gray-200">
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Enter class name (e.g., Class 1, Class 10)"
          className="flex-1 px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">{cls.name}</h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {cls.sections.length === 0 ? (
                <span className="text-sm text-gray-400">No sections yet</span>
              ) : (
                cls.sections.map((sec) => (
                  <span
                    key={sec.id}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100"
                  >
                    Section {sec.name} ({sec._count.students})
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={sectionInputs[cls.id] || ""}
                onChange={(e) => setSectionInputs((prev) => ({ ...prev, [cls.id]: e.target.value }))}
                placeholder="Add section (A, B...)"
                className="flex-1 px-3 py-1.5 text-sm border rounded-lg text-gray-900"
              />
              <button
                type="button"
                onClick={() => handleAddSection(cls.id)}
                className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
