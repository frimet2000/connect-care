import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";

interface Appointment {
  id: string;
  patientName: string;
  patientAge: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
}

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const TherapistDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("today");

  // Mock data
  const therapistName = "רונית שפירא";

  const stats = {
    todayAppointments: 4,
    pendingRequests: 3,
    monthlyAppointments: 42,
    rating: 4.9,
  };

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      patientName: "מיה",
      patientAge: "ילד (4-7)",
      date: "2025-01-01",
      time: "09:00",
      status: "confirmed",
      notes: "המשך עבודה על הגיית צלילים",
    },
    {
      id: "2",
      patientName: "נועם",
      patientAge: "ילד (4-7)",
      date: "2025-01-01",
      time: "10:00",
      status: "confirmed",
    },
    {
      id: "3",
      patientName: "יובל",
      patientAge: "פעוט (2-4)",
      date: "2025-01-01",
      time: "14:00",
      status: "pending",
      notes: "פגישה ראשונה",
    },
    {
      id: "4",
      patientName: "עדי",
      patientAge: "מתבגר (13-18)",
      date: "2025-01-01",
      time: "16:00",
      status: "pending",
    },
    {
      id: "5",
      patientName: "רון",
      patientAge: "ילד (8-12)",
      date: "2025-01-02",
      time: "09:00",
      status: "pending",
    },
  ]);

  const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  const [availability, setAvailability] = useState<AvailabilitySlot[]>([
    { id: "1", dayOfWeek: 0, startTime: "09:00", endTime: "17:00", isActive: true },
    { id: "2", dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: true },
    { id: "3", dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isActive: true },
    { id: "4", dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isActive: true },
    { id: "5", dayOfWeek: 4, startTime: "09:00", endTime: "13:00", isActive: true },
    { id: "6", dayOfWeek: 5, startTime: "09:00", endTime: "12:00", isActive: false },
  ]);

  const handleApprove = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, status: "confirmed" as const } : apt
      )
    );
  };

  const handleDecline = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, status: "cancelled" as const } : apt
      )
    );
  };

  const toggleAvailability = (id: string) => {
    setAvailability((prev) =>
      prev.map((slot) =>
        slot.id === id ? { ...slot, isActive: !slot.isActive } : slot
      )
    );
  };

  const todayAppointments = appointments.filter(
    (apt) => apt.date === "2025-01-01" && apt.status !== "cancelled"
  );
  const pendingAppointments = appointments.filter((apt) => apt.status === "pending");
  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "confirmed" && apt.date >= "2025-01-01"
  );

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
            <AlertCircle className="w-3 h-3 ml-1" />
            ממתין לאישור
          </Badge>
        );
      case "confirmed":
        return (
          <Badge variant="outline" className="text-secondary border-secondary/30 bg-secondary/10">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            מאושר
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            הושלם
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
            <XCircle className="w-3 h-3 ml-1" />
            בוטל
          </Badge>
        );
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <div className="bg-card rounded-xl border border-border p-4 hover:shadow-card transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-semibold text-primary">
                {appointment.patientName.charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{appointment.patientName}</h4>
              <p className="text-sm text-muted-foreground">{appointment.patientAge}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(appointment.date).toLocaleDateString("he-IL")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{appointment.time}</span>
            </div>
          </div>

          {appointment.notes && (
            <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mt-2">
              📝 {appointment.notes}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(appointment.status)}

          {appointment.status === "pending" && (
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => handleDecline(appointment.id)}
              >
                <XCircle className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                className="bg-secondary hover:bg-secondary/90"
                onClick={() => handleApprove(appointment.id)}
              >
                <CheckCircle2 className="w-4 h-4 ml-1" />
                אשר
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>לוח בקרה - TherapyConnect</title>
        <meta name="description" content="ניהול תורים וזמינות למטפלים" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                שלום, {therapistName} 👋
              </h1>
              <p className="text-muted-foreground">
                הנה סיכום הפעילות שלך להיום
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.todayAppointments}
                    </p>
                    <p className="text-sm text-muted-foreground">תורים היום</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.pendingRequests}
                    </p>
                    <p className="text-sm text-muted-foreground">ממתינים לאישור</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.monthlyAppointments}
                    </p>
                    <p className="text-sm text-muted-foreground">החודש</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Star className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.rating}
                    </p>
                    <p className="text-sm text-muted-foreground">דירוג ממוצע</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-muted/50 p-1 h-auto">
                <TabsTrigger
                  value="today"
                  className="data-[state=active]:bg-card data-[state=active]:shadow-sm px-6 py-2.5"
                >
                  <Calendar className="w-4 h-4 ml-2" />
                  היום ({todayAppointments.length})
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:bg-card data-[state=active]:shadow-sm px-6 py-2.5"
                >
                  <AlertCircle className="w-4 h-4 ml-2" />
                  ממתינים ({pendingAppointments.length})
                </TabsTrigger>
                <TabsTrigger
                  value="upcoming"
                  className="data-[state=active]:bg-card data-[state=active]:shadow-sm px-6 py-2.5"
                >
                  <Clock className="w-4 h-4 ml-2" />
                  קרובים
                </TabsTrigger>
                <TabsTrigger
                  value="availability"
                  className="data-[state=active]:bg-card data-[state=active]:shadow-sm px-6 py-2.5"
                >
                  <Users className="w-4 h-4 ml-2" />
                  זמינות
                </TabsTrigger>
              </TabsList>

              {/* Today's Appointments */}
              <TabsContent value="today" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">תורים להיום</h2>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString("he-IL", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {todayAppointments.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">אין תורים מתוכננים להיום</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayAppointments.map((apt) => (
                      <AppointmentCard key={apt.id} appointment={apt} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Pending Requests */}
              <TabsContent value="pending" className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">בקשות ממתינות</h2>

                {pendingAppointments.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <CheckCircle2 className="w-12 h-12 text-secondary mx-auto mb-4" />
                    <p className="text-muted-foreground">אין בקשות ממתינות</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingAppointments.map((apt) => (
                      <AppointmentCard key={apt.id} appointment={apt} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Upcoming Appointments */}
              <TabsContent value="upcoming" className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">תורים קרובים</h2>

                {upcomingAppointments.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">אין תורים מאושרים קרובים</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.map((apt) => (
                      <AppointmentCard key={apt.id} appointment={apt} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Availability Management */}
              <TabsContent value="availability" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">ניהול זמינות</h2>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 ml-2" />
                    הוסף משבצת
                  </Button>
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="divide-y divide-border">
                    {availability.map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-4 flex items-center justify-between ${
                          !slot.isActive ? "bg-muted/30" : ""
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              slot.isActive ? "bg-secondary" : "bg-muted-foreground"
                            }`}
                          />
                          <div>
                            <p className="font-medium text-foreground">
                              יום {dayNames[slot.dayOfWeek]}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {slot.startTime} - {slot.endTime}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAvailability(slot.id)}
                            className={slot.isActive ? "text-secondary" : "text-muted-foreground"}
                          >
                            {slot.isActive ? "פעיל" : "מושבת"}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  💡 טיפ: לחץ על "פעיל/מושבת" כדי לשנות את זמינות היום
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TherapistDashboard;
