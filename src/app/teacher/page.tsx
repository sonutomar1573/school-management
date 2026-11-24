import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function TeacherDashboard() {
  const session = await getSession();
  const teacher = await prisma.teacher.findUnique({
    where: { userId: session?.userId },
    include: {
      assignedSections: {
        include: {
          class: true,
          _count: { select: { students: true } },
        },
      },
    },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {teacher?.name || "Teacher"}</h1>
      <p className="text-sm text-gray-500 mb-6">Manage attendance and exam marks for your assigned classes.</p>

      <h2 className="text-sm font-semibold text-gray-600 uppercase mb-3">Assigned Classes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teacher?.assignedSections.length ? (
          teacher.assignedSections.map((sec) => (
            <div key={sec.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{sec.class.name} - Section {sec.name}</h3>
                <p className="text-sm text-gray-500">{sec._count.students} Students</p>
              </div>
              <Link href="/teacher/attendance" className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                Mark Attendance
              </Link>
            </div>
          ))
        ) : (
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-gray-500 text-sm">
            No class teacher sections assigned yet. Ask Admin to assign a section.
          </div>
        )}
      </div>
    </div>
  );
}
