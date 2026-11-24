"use client";

import { useState, useMemo } from "react";
import { GraduationCap, CalendarCheck, Award, CreditCard } from "lucide-react";

type AttendanceItem = {
  id: string;
  date: Date | string;
  status: "PRESENT" | "ABSENT" | "LATE";
};

type MarkItem = {
  id: string;
  marksObtained: number;
  maxMarks: number;
  exam: { id: string; name: string };
  subject: { name: string };
};

type StudentData = {
  id: string;
  name: string;
  rollNumber: string;
  class: { name: string };
  section: { name: string };
  parent: { name: string; mobile: string };
  attendance: AttendanceItem[];
  marks: MarkItem[];
};

function calculateGrade(percentage: number) {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
}

function getMonthKey(d: Date | string) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export default function StudentReportView({ student }: { student: StudentData }) {
  const availableMonths = useMemo(() => {
    const keys = new Set<string>();
    student.attendance.forEach((a) => keys.add(getMonthKey(a.date)));
    return Array.from(keys).sort().reverse();
  }, [student.attendance]);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || "ALL");

  const filteredAttendance = useMemo(() => {
    if (selectedMonth === "ALL") return student.attendance;
    return student.attendance.filter((a) => getMonthKey(a.date) === selectedMonth);
  }, [student.attendance, selectedMonth]);

  const totalDays = filteredAttendance.length;
  const presentDays = filteredAttendance.filter((a) => a.status === "PRESENT").length;
  const lateDays = filteredAttendance.filter((a) => a.status === "LATE").length;
  const absentDays = filteredAttendance.filter((a) => a.status === "ABSENT").length;
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // Overall attendance for header badge
  const overallTotal = student.attendance.length;
  const overallPresent = student.attendance.filter((a) => a.status === "PRESENT").length;
  const overallPct = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0;

  // Group marks by Exam
  const examsMap = new Map<string, { examName: string; items: MarkItem[] }>();
  student.marks.forEach((m) => {
    if (!examsMap.has(m.exam.id)) {
      examsMap.set(m.exam.id, { examName: m.exam.name, items: [] });
    }
    examsMap.get(m.exam.id)!.items.push(m);
  });
  const groupedExams = Array.from(examsMap.values());

  return (
    <div className="space-y-6">
      {/* Student Profile Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{student.name}</h2>
            <p className="text-sm text-gray-500">
              {student.class.name} - Section {student.section.name} | Roll No:{" "}
              <span className="font-semibold text-gray-800">{student.rollNumber}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Parent: {student.parent.name} ({student.parent.mobile})
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-4 py-2 bg-green-50 rounded-lg border border-green-100">
            <p className="text-xs text-green-700 font-medium">Overall Attendance</p>
            <p className="text-lg font-bold text-green-800">{overallPct}%</p>
          </div>
          <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> Fees Status
            </p>
            <p className="text-xs font-semibold text-gray-400 mt-1">Coming Soon</p>
          </div>
        </div>
      </div>

      {/* Exam Results & Report Cards */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" /> Exam Results & Report Card
        </h3>

        {groupedExams.length === 0 ? (
          <p className="text-sm text-gray-400">No exam marks uploaded yet.</p>
        ) : (
          <div className="space-y-6">
            {groupedExams.map((group) => {
              const totalObtained = group.items.reduce((sum, i) => sum + i.marksObtained, 0);
              const totalMax = group.items.reduce((sum, i) => sum + i.maxMarks, 0);
              const pct = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0;
              const grade = calculateGrade(pct);

              return (
                <div key={group.examName} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                    <span className="font-semibold text-gray-800">{group.examName}</span>
                    <span className="text-sm font-bold text-blue-700">
                      Total: {totalObtained} / {totalMax} ({pct}%) — Grade: {grade}
                    </span>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white border-b text-xs uppercase text-gray-500">
                      <tr>
                        <th className="p-3">Subject</th>
                        <th className="p-3">Marks Obtained</th>
                        <th className="p-3">Max Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {group.items.map((item) => (
                        <tr key={item.id}>
                          <td className="p-3 font-medium text-gray-800">{item.subject.name}</td>
                          <td className="p-3 text-gray-800">{item.marksObtained}</td>
                          <td className="p-3 text-gray-500">{item.maxMarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Month-Wise Attendance History */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-green-600" /> Attendance History
          </h3>

          <div className="flex items-center gap-3">
            {availableMonths.length > 0 && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthLabel(m)}
                  </option>
                ))}
                <option value="ALL">All Months</option>
              </select>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs font-medium mb-4">
          <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
            Present: {presentDays}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
            Absent: {absentDays}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
            Late: {lateDays}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Month Rate: {attendancePct}% ({totalDays} days)
          </span>
        </div>

        {filteredAttendance.length === 0 ? (
          <p className="text-sm text-gray-400">No attendance records for this period.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {filteredAttendance.map((att) => (
              <div
                key={att.id}
                className={`p-2.5 rounded-lg border text-center text-xs ${
                  att.status === "PRESENT"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : att.status === "ABSENT"
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-yellow-50 border-yellow-200 text-yellow-800"
                }`}
              >
                <div className="font-semibold">
                  {new Date(att.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <div className="mt-0.5 font-bold">{att.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
