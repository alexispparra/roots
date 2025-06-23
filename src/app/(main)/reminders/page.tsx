import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Calendar, Building, CheckCircle } from "lucide-react";

const reminders = [
  {
    id: 1,
    title: "Submit Q2 Financial Report",
    project: "Pinnacle Towers",
    date: "2024-07-25",
    type: "Deadline",
  },
  {
    id: 2,
    title: "Client Meeting: Greenwood Residences",
    project: "Greenwood Residences",
    date: "2024-07-28",
    type: "Meeting",
  },
  {
    id: 3,
    title: "Site Inspection",
    project: "Riverside Complex",
    date: "2024-08-01",
    type: "Event",
  },
  {
    id: 4,
    title: "Finalize architectural plans",
    project: "Oceanview Villas",
    date: "2024-08-05",
    type: "Deadline",
  },
  {
    id: 5,
    title: "Pay suppliers for July",
    project: "General",
    date: "2024-08-10",
    type: "Payment",
  },
];

const typeIcons = {
    Deadline: <CheckCircle className="h-5 w-5 text-destructive" />,
    Meeting: <Calendar className="h-5 w-5 text-blue-500" />,
    Event: <Building className="h-5 w-5 text-green-500" />,
    Payment: <Bell className="h-5 w-5 text-yellow-500" />,
}

export default function RemindersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Reminders & Calendar</CardTitle>
        <CardDescription>
          Upcoming deadlines and events synced from your calendar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="flex items-start gap-4 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                {typeIcons[reminder.type as keyof typeof typeIcons]}
              </div>
              <div className="grid flex-1 gap-1">
                <p className="font-semibold">{reminder.title}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{reminder.project}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(reminder.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">{reminder.type}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
