import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import StudentReportView from "@/components/StudentReportView";

export default async function StudentDashboard() {
  const session = await getSession();

  const student = await prisma.student.findUnique({
    where: { userId: session?.userId },
    include: {
      class: true,
      section: true,
      parent: true,
      attendance: { orderBy: { date: "desc" } },
      marks: { include: { exam: true, subject: true } },
    },
  });

  if (!student) {
    return <div className="p-8 text-gray-500">Student record not found.</div>;
  }

  return <StudentReportView student={student} />;
}
