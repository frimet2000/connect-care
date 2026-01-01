
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Users, UserCheck, Calendar, Activity, Ban, Trash2, CheckCircle } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalTherapists: number;
  activeTherapists: number;
  totalAppointments: number;
}

interface TherapistUser {
  id: string; // therapist id
  user_id: string;
  first_name: string; // from profiles or calculated
  last_name: string; // from profiles or calculated
  full_name: string; // from profiles
  profession: string;
  is_active: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTherapists: 0,
    activeTherapists: 0,
    totalAppointments: 0,
  });
  const [therapists, setTherapists] = useState<TherapistUser[]>([]);

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
    fetchTherapists();
  }, []);

  const checkAdminAccess = async () => {
    // First check session storage from AdminLogin
    const isSessionAdmin = sessionStorage.getItem("isAdminAuthenticated") === "true";
    if (isSessionAdmin) {
      setLoading(false);
      return;
    }

    // Fallback to Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/admin/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("user_id", user.id)
      .single();

    // Note: user_type constraint might be restricted to 'therapist'/'parent'
    // This check is here for future proofing if schema is updated
    if (profile?.user_type !== "admin") {
      toast({
        variant: "destructive",
        title: "אין גישה",
        description: "נא להתחבר כמנהל מערכת",
      });
      navigate("/admin/login");
    }
  };

  const fetchStats = async () => {
    const [
      { count: usersCount },
      { count: therapistsCount },
      { count: activeTherapistsCount },
      { count: appointmentsCount },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("therapists").select("*", { count: "exact", head: true }),
      supabase.from("therapists").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("appointments").select("*", { count: "exact", head: true }),
    ]);

    setStats({
      totalUsers: usersCount || 0,
      totalTherapists: therapistsCount || 0,
      activeTherapists: activeTherapistsCount || 0,
      totalAppointments: appointmentsCount || 0,
    });
  };

  const fetchTherapists = async () => {
    // Join therapists with profiles to get names
    const { data: therapistsData, error } = await supabase
      .from("therapists")
      .select(`
        id,
        user_id,
        profession,
        is_active,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching therapists:", error);
      return;
    }

    // Since we can't easily join in client-side query without proper foreign key setup exposed to JS client sometimes,
    // let's fetch profiles separately and map them. 
    // Actually, we can assume we might need to fetch profiles.
    // Let's try to fetch profiles for these user_ids.
    
    if (therapistsData) {
      const userIds = therapistsData.map(t => t.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const combinedData = therapistsData.map(therapist => {
        const profile = profilesData?.find(p => p.user_id === therapist.user_id);
        return {
          ...therapist,
          full_name: profile?.full_name || "Unknown",
          first_name: "",
          last_name: ""
        };
      });
      
      setTherapists(combinedData);
    }
    setLoading(false);
  };

  const toggleTherapistStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("therapists")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן היה לשנות את סטטוס המטפל",
      });
    } else {
      toast({
        title: "הסטטוס עודכן",
        description: `המטפל ${!currentStatus ? "הופעל" : "נחסם"} בהצלחה`,
      });
      fetchTherapists(); // Refresh list
      fetchStats(); // Refresh stats
    }
  };

  const deleteTherapist = async (id: string, userId: string) => {
    // Delete from therapists table
    const { error: therapistError } = await supabase
      .from("therapists")
      .delete()
      .eq("id", id);

    if (therapistError) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן היה למחוק את המטפל",
      });
      return;
    }

    // Optionally delete from profiles or handle auth user deletion (requires server-side admin client usually)
    // For now, we just remove their therapist entry so they don't show up.
    
    toast({
      title: "מטפל נמחק",
      description: "המטפל הוסר מהמערכת בהצלחה",
    });
    fetchTherapists();
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-background text-right" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">לוח בקרה - מנהל מערכת</h1>
          <Badge variant="outline" className="text-lg px-4 py-1">
            Admin Access
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">סה״כ משתמשים</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">מטפלים רשומים</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTherapists}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">מטפלים פעילים</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTherapists}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">תורים במערכת</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Therapists Management */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>ניהול מטפלים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">שם המטפל</TableHead>
                    <TableHead className="text-right">מקצוע</TableHead>
                    <TableHead className="text-right">סטטוס</TableHead>
                    <TableHead className="text-right">תאריך הצטרפות</TableHead>
                    <TableHead className="text-right">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        טוען נתונים...
                      </TableCell>
                    </TableRow>
                  ) : therapists.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        לא נמצאו מטפלים במערכת
                      </TableCell>
                    </TableRow>
                  ) : (
                    therapists.map((therapist) => (
                      <TableRow key={therapist.id}>
                        <TableCell className="font-medium">{therapist.full_name}</TableCell>
                        <TableCell>
                           {/* You might want to map profession value to label here */}
                           {therapist.profession}
                        </TableCell>
                        <TableCell>
                          {therapist.is_active ? (
                            <Badge className="bg-green-500 hover:bg-green-600">פעיל</Badge>
                          ) : (
                            <Badge variant="destructive">חסום/לא פעיל</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(therapist.created_at).toLocaleDateString("he-IL")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={therapist.is_active ? "text-red-500 hover:text-red-600" : "text-green-500 hover:text-green-600"}
                              onClick={() => toggleTherapistStatus(therapist.id, therapist.is_active)}
                            >
                              {therapist.is_active ? (
                                <>
                                  <Ban className="w-4 h-4 ml-1" />
                                  חסום
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 ml-1" />
                                  הפעל
                                </>
                              )}
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="w-4 h-4 ml-1" />
                                  מחק
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    פעולה זו תמחק את המטפל מהמערכת לצמיתות ולא ניתן יהיה לשחזר את הנתונים.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>ביטול</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteTherapist(therapist.id, therapist.user_id)}>
                                    מחק מטפל
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
