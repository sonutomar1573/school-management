"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

type Section = { id: string; name: string; class: { name: string } };
type Student = { id: string; rollNumber: string; name: string };

export default function TeacherAttendancePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [statuses, setStatuses] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE">>({});
  const [savedMsg, setSavedMsg] = useState("");

  async function loadAttendance(secId: string, dt: string) {
    const query = new URLSearchParams({ date: dt });
    if (secId) query.set("sectionId", secId);
    const res = await fetch(`/api/teacher/attendance?${query.toString()}`);
    if (!res.ok) return;
    const data = await res.json();
    setSections(data.sections);
    if (!secId && data.sections.length > 0) setSectionId(data.sections[0].id);
    setStudents(data.students);

    const initial: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {};
    data.students.forEach((s: Student) => {
      initial[s.id] = data.records[s.id] || "PRESENT";
    });
    setStatuses(initial);
  }

  useEffect(() => {
    loadAttendance(sectionId, date);
  }, [sectionId, date]);

  async function handleSave() {
    setSavedMsg("");
    const entries = students.map((s) => ({ studentId: s.id, status: statuses[s.id] || "PRESENT" }));
    const res = await fetch("/api/teacher/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId, date, entries }),
    });
    if (res.ok) setSavedMsg("Attendance saved successfully!");
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Daily Attendance</h1>

      <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200">
        <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} className="px-3 py-2 border rounded-lg text-gray-900 bg-white">
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.class.name} - Section {s.name}</option>
          ))}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 border rounded-lg text-gray-900" />
        <button onClick={handleSave} className="ml-auto flex items-center gap-2 px-5 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700">
          <Save className="w-4 h-4" /> Save Attendance
        </button>
      </div>

      {savedMsg && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">{savedMsg}</div>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="p-4">Roll No</th>
              <th className="p-4">Student Name</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {students.length === 0 ? (
              <tr><td colSpan={3} className="p-6 text-center text-gray-400">No students in this section.</td></tr>
            ) : (
              students.map((s) => (
                <tr key={s.id}>
                  <td className="p-4 font-semibold text-gray-800">{s.rollNumber}</td>
                  <td className="p-4 text-gray-800">{s.name}</td>
                  <td className="p-4 flex gap-2">
                    {(["PRESENT", "ABSENT", "LATE"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatuses((prev) => ({ ...prev, [s.id]: st }))}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          statuses[s.id] === st
                            ? st === "PRESENT"
                              ? "bg-green-600 text-white border-green-600"
                              : st === "ABSENT"
                              ? "bg-red-600 text-white border-red-600"
                              : "bg-yellow-500 text-white border-yellow-500"
                            : "bg-white text-gray-600 border-gray-300"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
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
