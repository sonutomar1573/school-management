import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { Users, GraduationCap, BookOpen, CalendarCheck, CheckCircle2 } from "lucide-react";

export default async function AdminDashboard() {
  await connection();

  const todayStr = new Date().toISOString().split("T")[0];
  const todayDate = new Date(todayStr);

  const [studentCount, teacherCount, classCount, examCount, todayAttendance] = await Promise.all([
    prisma.student.count({ where: { isDeleted: false } }),
    prisma.teacher.count({ where: { isDeleted: false } }),
    prisma.class.count(),
    prisma.exam.count(),
    prisma.attendance.findMany({ where: { date: todayDate } }),
  ]);

  const markedToday = todayAttendance.length;
  const presentToday = todayAttendance.filter((a) => a.status === "PRESENT").length;
  const todayPct = markedToday > 0 ? `${Math.round((presentToday / markedToday) * 100)}%` : "N/A";

  const stats = [
    { label: "Total Students", value: studentCount, sub: "Active enrolled", icon: GraduationCap, color: "text-blue-600 bg-blue-50" },
    { label: "Total Teachers", value: teacherCount, sub: "Active faculty", icon: Users, color: "text-green-600 bg-green-50" },
    { label: "Total Classes", value: classCount, sub: "Configured grades", icon: BookOpen, color: "text-purple-600 bg-purple-50" },
    { label: "Scheduled Exams", value: examCount, sub: "Active exams", icon: CalendarCheck, color: "text-orange-600 bg-orange-50" },
    {
      label: "Today's Attendance",
      value: todayPct,
      sub: markedToday > 0 ? `${presentToday}/${markedToday} present today` : "Not marked yet",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
