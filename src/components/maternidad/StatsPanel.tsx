import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMaternidad } from "@/lib/maternidad/store";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function StatsPanel() {
  const { questionnaires } = useMaternidad();

  const byStatus = [
    { name: "Asignados", count: questionnaires.filter((q) => q.status === "assigned").length },
    { name: "En progreso", count: questionnaires.filter((q) => q.status === "in_progress").length },
    { name: "Pausados", count: questionnaires.filter((q) => q.status === "paused").length },
    { name: "Completados", count: questionnaires.filter((q) => q.status === "completed").length },
    { name: "Cancelados", count: questionnaires.filter((q) => q.status === "cancelled").length },
  ];

  const answerStats = [
    {
      name: "Trabajo parto (Sí)",
      count: questionnaires.filter((q) => q.adminAnswers?.trabajoParto === true).length,
    },
    {
      name: "Enfermedad (Sí)",
      count: questionnaires.filter((q) => q.adminAnswers?.enfermedadEmbarazo === true).length,
    },
    {
      name: "Amamanta (Sí)",
      count: questionnaires.filter((q) => q.adminAnswers?.puedeAmamantar === true).length,
    },
    {
      name: "Corrientes (Sí)",
      count: questionnaires.filter((q) => q.adminAnswers?.corrientesCapital === true).length,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cuestionarios por estado</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="oklch(0.62 0.11 188)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Respuestas positivas (Admin)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={answerStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="oklch(0.55 0.14 165)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
