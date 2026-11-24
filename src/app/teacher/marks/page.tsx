"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

type Subject = { id: string; name: string };
type Section = { id: string; name: string; class: { name: string; subjects: Subject[] } };
type Exam = { id: string; name: string };
type Student = { id: string; rollNumber: string; name: string };

export default function TeacherMarksPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [examId, setExamId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [savedMsg, setSavedMsg] = useState("");

  async function loadData(secId: string, exId: string, subId: string) {
    const q = new URLSearchParams();
    if (secId) q.set("sectionId", secId);
    if (exId) q.set("examId", exId);
    if (subId) q.set("subjectId", subId);

    const res = await fetch(`/api/teacher/marks?${q.toString()}`);
    if (!res.ok) return;
    const data = await res.json();

    setSections(data.sections);
    setExams(data.exams);
    const activeSec = secId || data.sections[0]?.id || "";
    const activeEx = exId || data.exams[0]?.id || "";
    if (!secId && activeSec) setSectionId(activeSec);
    if (!exId && activeEx) setExamId(activeEx);

    const currentSecObj = data.sections.find((s: Section) => s.id === activeSec);
    const activeSub = subId || currentSecObj?.class.subjects[0]?.id || "";
    if (!subId && activeSub) setSubjectId(activeSub);

    setStudents(data.students);
    const map: Record<string, string> = {};
    data.students.forEach((st: Student) => {
      map[st.id] = data.marksMap[st.id] !== undefined ? String(data.marksMap[st.id]) : "";
    });
    setScores(map);
  }

  useEffect(() => {
    loadData(sectionId, examId, subjectId);
  }, [sectionId, examId, subjectId]);

  const currentSection = sections.find((s) => s.id === sectionId);
  const subjects = currentSection?.class.subjects || [];

  async function handleSave() {
    setSavedMsg("");
    const entries = students
      .filter((s) => scores[s.id] !== "")
      .map((s) => ({ studentId: s.id, marksObtained: Number(scores[s.id]) }));

    if (!examId || !subjectId || entries.length === 0) return;

    const res = await fetch("/api/teacher/marks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId, subjectId, maxMarks: Number(maxMarks), entries }),
    });
    if (res.ok) setSavedMsg("Marks saved successfully!");
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Enter Student Marks</h1>

      <div className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-xl border border-gray-200">
        <select value={examId} onChange={(e) => setExamId(e.target.value)} className="px-3 py-2 border rounded-lg text-gray-900 bg-white">
          <option value="">Select Exam</option>
          {exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
        </select>

        <select value={sectionId} onChange={(e) => { setSectionId(e.target.value); setSubjectId(""); }} className="px-3 py-2 border rounded-lg text-gray-900 bg-white">
          {sections.map((s) => <option key={s.id} value={s.id}>{s.class.name} - Section {s.name}</option>)}
        </select>

        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="px-3 py-2 border rounded-lg text-gray-900 bg-white">
          <option value="">Select Subject</option>
          {subjects.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
        </select>

        <input
          type="number"
          value={maxMarks}
          onChange={(e) => setMaxMarks(e.target.value)}
          placeholder="Max Marks"
          className="w-28 px-3 py-2 border rounded-lg text-gray-900"
        />

        <button onClick={handleSave} className="ml-auto flex items-center gap-2 px-5 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700">
          <Save className="w-4 h-4" /> Save Marks
        </button>
      </div>

      {savedMsg && <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">{savedMsg}</div>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="block w-full overflow-x-auto md:table w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="p-4">Roll No</th>
              <th className="p-4">Student Name</th>
              <th className="p-4">Marks Obtained (out of {maxMarks})</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {students.length === 0 ? (
              <tr><td colSpan={3} className="p-6 text-center text-gray-400">No students found.</td></tr>
            ) : (
              students.map((s) => (
                <tr key={s.id}>
                  <td className="p-4 font-semibold text-gray-800">{s.rollNumber}</td>
                  <td className="p-4 text-gray-800">{s.name}</td>
                  <td className="p-4">
                    <input
                      type="number"
                      min="0"
                      max={maxMarks}
                      value={scores[s.id] ?? ""}
                      onChange={(e) => setScores((prev) => ({ ...prev, [s.id]: e.target.value }))}
                      placeholder="Enter marks"
                      className="w-32 px-3 py-1.5 border rounded-lg text-gray-900"
                    />
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
