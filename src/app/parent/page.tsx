import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import StudentReportView from "@/components/StudentReportView";

export default async function ParentDashboard() {
  const session = await getSession();

  const parent = await prisma.parent.findUnique({
    where: { userId: session?.userId },
    include: {
      students: {
        where: { isDeleted: false },
        include: {
          class: true,
          section: true,
          parent: true,
          attendance: { orderBy: { date: "desc" } },
          marks: { include: { exam: true, subject: true } },
        },
      },
    },
  });

  if (!parent) {
    return <div className="p-8 text-gray-500">Parent record not found.</div>;
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {parent.name}</h2>
        <p className="text-sm text-gray-500">Viewing academic progress and attendance for your child(ren).</p>
      </div>

      {parent.students.length === 0 ? (
        <div className="bg-white p-6 rounded-xl border text-gray-500">No students linked to this account.</div>
      ) : (
        parent.students.map((student) => (
          <StudentReportView key={student.id} student={student} />
        ))
      )}
    </div>
  );
}
