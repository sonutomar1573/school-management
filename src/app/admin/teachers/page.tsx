"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";

type Section = { id: string; name: string; class?: { name: string } };
type ClassItem = { id: string; name: string; sections: Section[] };
type Teacher = {
  id: string;
  name: string;
  mobile: string;
  subjectSpecialization: string | null;
  assignedSections: { id: string; name: string; class: { name: string } }[];
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [subject, setSubject] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    const [tRes, cRes] = await Promise.all([
      fetch("/api/admin/teachers"),
      fetch("/api/admin/classes"),
    ]);
    if (tRes.ok) setTeachers(await tRes.json());
    if (cRes.ok) setClasses(await cRes.json());
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        mobile,
        subjectSpecialization: subject,
        sectionId: sectionId || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to add teacher");
      return;
    }

    setName("");
    setMobile("");
    setSubject("");
    setSectionId("");
    loadData();
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Teacher Management</h1>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h2 className="text-sm font-semibold text-gray-700 uppercase mb-4">Add New Teacher (Default Password: Teacher@123)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Teacher Name"
            className="px-3 py-2 border rounded-lg text-gray-900"
          />
          <input
            type="text"
            required
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Mobile (Login ID)"
            className="px-3 py-2 border rounded-lg text-gray-900"
          />
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (e.g., Maths)"
            className="px-3 py-2 border rounded-lg text-gray-900"
          />
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="px-3 py-2 border rounded-lg text-gray-900 bg-white"
          >
            <option value="">Assign Class Teacher (Optional)</option>
            {classes.map((cls) =>
              cls.sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {cls.name} - Section {sec.name}
                </option>
              ))
            )}
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4" /> Add Teacher
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="block w-full overflow-x-auto md:table w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Mobile (Login ID)</th>
              <th className="p-4">Subject</th>
              <th className="p-4">Class Teacher Of</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm text-gray-800">
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-400">No teachers added yet.</td>
              </tr>
            ) : (
              teachers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{t.name}</td>
                  <td className="p-4">{t.mobile}</td>
                  <td className="p-4">{t.subjectSpecialization || "-"}</td>
                  <td className="p-4">
                    {t.assignedSections.length > 0
                      ? t.assignedSections.map((s) => `${s.class.name} (${s.name})`).join(", ")
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
