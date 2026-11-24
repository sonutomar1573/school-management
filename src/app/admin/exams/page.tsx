"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

type Exam = { id: string; name: string; startDate: string; endDate: string };
type ClassItem = { id: string; name: string };
type Subject = { id: string; name: string; class: { name: string } };

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [examName, setExamName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [subjectName, setSubjectName] = useState("");
  const [classId, setClassId] = useState("");
  const [error, setError] = useState("");

  async function loadAll() {
    const [eRes, cRes, sRes] = await Promise.all([
      fetch("/api/admin/exams"),
      fetch("/api/admin/classes"),
      fetch("/api/admin/subjects"),
    ]);
    if (eRes.ok) setExams(await eRes.json());
    if (cRes.ok) setClasses(await cRes.json());
    if (sRes.ok) setSubjects(await sRes.json());
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleAddExam(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: examName, startDate, endDate }),
    });
    if (!res.ok) {
      setError((await res.json()).error);
      return;
    }
    setExamName("");
    setStartDate("");
    setEndDate("");
    loadAll();
  }

  async function handleAddSubject(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: subjectName, classId }),
    });
    if (!res.ok) {
      setError((await res.json()).error);
      return;
    }
    setSubjectName("");
    loadAll();
  }

  return (
    <div className="max-w-5xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Exams & Subjects</h1>
      {error && <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={handleAddExam} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase">Create Exam</h2>
          <input
            type="text"
            required
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="Exam Name (e.g., Mid-Term 2026)"
            className="w-full px-3 py-2 border rounded-lg text-gray-900"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Start Date</label>
              <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-gray-900" />
            </div>
            <div>
              <label className="text-xs text-gray-500">End Date</label>
              <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-gray-900" />
            </div>
          </div>
          <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> Create Exam
          </button>
        </form>

        <form onSubmit={handleAddSubject} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase">Add Subject to Class</h2>
          <select required value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white">
            <option value="">Select Class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input
            type="text"
            required
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="Subject Name (e.g., Mathematics, Science)"
            className="w-full px-3 py-2 border rounded-lg text-gray-900"
          />
          <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Scheduled Exams</h3>
          <ul className="divide-y text-sm">
            {exams.length === 0 ? <li className="text-gray-400 py-2">No exams yet.</li> : exams.map((ex) => (
              <li key={ex.id} className="py-2.5 flex justify-between">
                <span className="font-medium text-gray-800">{ex.name}</span>
                <span className="text-gray-500">{new Date(ex.startDate).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Class Subjects</h3>
          <ul className="divide-y text-sm">
            {subjects.length === 0 ? <li className="text-gray-400 py-2">No subjects yet.</li> : subjects.map((sub) => (
              <li key={sub.id} className="py-2.5 flex justify-between">
                <span className="font-medium text-gray-800">{sub.name}</span>
                <span className="text-blue-600 font-medium">{sub.class.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
