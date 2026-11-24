"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";

type Section = { id: string; name: string };
type ClassItem = { id: string; name: string; sections: Section[] };
type Student = {
  id: string;
  rollNumber: string;
  name: string;
  user: { identifier: string };
  class: { name: string };
  section: { name: string };
  parent: { name: string; mobile: string };
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentMobile, setParentMobile] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    const [sRes, cRes] = await Promise.all([
      fetch("/api/admin/students"),
      fetch("/api/admin/classes"),
    ]);
    if (sRes.ok) setStudents(await sRes.json());
    if (cRes.ok) setClasses(await cRes.json());
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedClass = classes.find((c) => c.id === classId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const res = await fetch("/api/admin/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, rollNumber, classId, sectionId, parentName, parentMobile }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to register student");
      return;
    }

    setSuccess(`Registered! Student Login ID: ${data.studentLoginId} (Pass: Student@123) | Parent Login: ${parentMobile} (Pass: Parent@123)`);
    setName("");
    setRollNumber("");
    setParentName("");
    setParentMobile("");
    loadData();
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Management</h1>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h2 className="text-sm font-semibold text-gray-700 uppercase mb-4">Register New Student</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Student Full Name"
            className="px-3 py-2 border rounded-lg text-gray-900"
          />
          <select
            required
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setSectionId("");
            }}
            className="px-3 py-2 border rounded-lg text-gray-900 bg-white"
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            required
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            disabled={!classId}
            className="px-3 py-2 border rounded-lg text-gray-900 bg-white disabled:bg-gray-100"
          >
            <option value="">Select Section</option>
            {selectedClass?.sections.map((s) => (
              <option key={s.id} value={s.id}>Section {s.name}</option>
            ))}
          </select>
          <input
            type="text"
            required
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="Roll Number (e.g., 1, 2)"
            className="px-3 py-2 border rounded-lg text-gray-900"
          />
          <input
            type="text"
            required
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="Parent Name"
            className="px-3 py-2 border rounded-lg text-gray-900"
          />
          <input
            type="text"
            required
            value={parentMobile}
            onChange={(e) => setParentMobile(e.target.value)}
            placeholder="Parent Mobile (Parent Login ID)"
            className="px-3 py-2 border rounded-lg text-gray-900"
          />
        </div>
        <button
          type="submit"
          className="mt-4 flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4" /> Register Student
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="block w-full overflow-x-auto md:table w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="p-4">Roll No</th>
              <th className="p-4">Student Name</th>
              <th className="p-4">Class / Section</th>
              <th className="p-4">Student Login ID</th>
              <th className="p-4">Parent & Mobile</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm text-gray-800">
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">No students registered yet.</td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-4 font-semibold">{s.rollNumber}</td>
                  <td className="p-4 font-medium">{s.name}</td>
                  <td className="p-4">{s.class.name} - {s.section.name}</td>
                  <td className="p-4 font-mono text-xs text-blue-700">{s.user.identifier}</td>
                  <td className="p-4">{s.parent.name} ({s.parent.mobile})</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
