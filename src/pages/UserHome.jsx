import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Calendar,
    Clock,
    FileText,
    LogOut,
    Plus,
    History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserHome() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [membership, setMembership] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchMembershipDetails();
            fetchServiceRequests();
        }
    }, [user]);

    const fetchMembershipDetails = async () => {
        try {
            // Fetch the lead record associated with this user
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('created_by', user.id)
                .single();

            if (error && error.code !== 'PGRST116') console.error(error);
            setMembership(data);
        } catch (error) {
            console.error("Error fetching membership:", error);
        }
    };

    const fetchServiceRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('service_requests')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl text-primary flex items-center gap-2">
                        <User className="h-6 w-6" />
                        <span>Member Portal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600 hidden md:inline">
                            Welcome, {membership?.customer_name || user?.email}
                        </span>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" /> Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <Tabs defaultValue="services" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                        <TabsTrigger value="services">Request Service</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                    </TabsList>

                    {/* Tab: Request Services */}
                    <TabsContent value="services" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Request a Service</CardTitle>
                                <CardDescription>Select a service and preferred time. We will confirm with you shortly.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ServiceRequestForm onSuccess={fetchServiceRequests} userId={user?.id} />
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Quick Cards for common services */}
                            <ServiceQuickCard
                                title="Medical Companion"
                                description="Assistance for hospital visits or doctor appointments."
                                icon={FileText}
                            />
                            <ServiceQuickCard
                                title="Home Care"
                                description="General assistance with daily activities at home."
                                icon={User}
                            />
                            <ServiceQuickCard
                                title="Emergency Support"
                                description="Immediate assistance for urgent situations."
                                icon={Clock}
                            />
                        </div>
                    </TabsContent>

                    {/* Tab: History */}
                    <TabsContent value="history">
                        <Card>
                            <CardHeader>
                                <CardTitle>My Requests</CardTitle>
                                <CardDescription>Track the status of your service requests.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {loading ? (
                                        <div>Loading...</div>
                                    ) : requests.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">No requests found.</div>
                                    ) : (
                                        requests.map((req) => (
                                            <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                                                <div className="space-y-1">
                                                    <div className="font-semibold">{req.service_name}</div>
                                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                        <Calendar className="h-3 w-3" /> {req.requested_date}
                                                        <Clock className="h-3 w-3" /> {req.requested_time || 'Any time'}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <Badge variant={
                                                        req.status === 'completed' ? 'default' :
                                                            req.status === 'approved' ? 'success' :
                                                                req.status === 'rejected' ? 'destructive' : 'secondary'
                                                    }>
                                                        {req.status.toUpperCase()}
                                                    </Badge>
                                                    {req.payment_status === 'pending' && req.status !== 'rejected' && (
                                                        <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">Payment Pending</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Profile */}
                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>Membership Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {membership ? (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <Label className="text-muted-foreground">Member Name</Label>
                                            <div className="font-medium text-lg">{membership.customer_name}</div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Membership Type</Label>
                                            <div className="font-medium capitalize">{membership.registration_type}</div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Phone</Label>
                                            <div className="font-medium">{membership.phone_number}</div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Email</Label>
                                            <div className="font-medium">{membership.email}</div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Address</Label>
                                            <div className="font-medium">{membership.address}</div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Emergency Contact</Label>
                                            <div className="font-medium">{membership.emergency_contact_name} ({membership.emergency_contact_number})</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-amber-600">
                                        Membership details are syncing or incomplete. Please contact support.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

function ServiceRequestForm({ onSuccess, userId }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        serviceName: '',
        requestedDate: '',
        requestedTime: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.from('service_requests').insert([{
                user_id: userId,
                service_name: formData.serviceName,
                requested_date: formData.requestedDate,
                requested_time: formData.requestedTime
            }]);

            if (error) throw error;

            setFormData({ serviceName: '', requestedDate: '', requestedTime: '' });
            alert("Service requested successfully!");
            onSuccess();
        } catch (error) {
            console.error("Error submitting request:", error);
            alert("Failed to submit request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2 md:col-span-2">
                <Label>Service Required</Label>
                <Select value={formData.serviceName} onValueChange={(val) => setFormData({ ...formData, serviceName: val })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a service..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Medical Companion">Medical Companion</SelectItem>
                        <SelectItem value="Hospital Visit">Hospital Visit</SelectItem>
                        <SelectItem value="Home Care">Home Care Helper</SelectItem>
                        <SelectItem value="Physiotherapy">Physiotherapy</SelectItem>
                        <SelectItem value="Bill Payment">Bill Payment / Errands</SelectItem>
                        <SelectItem value="Emergency">Emergency Support</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Required Date</Label>
                <Input
                    type="date"
                    value={formData.requestedDate}
                    onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label>Preferred Time (Optional)</Label>
                <Input
                    type="time"
                    value={formData.requestedTime}
                    onChange={(e) => setFormData({ ...formData, requestedTime: e.target.value })}
                />
            </div>
            <div className="md:col-span-4">
                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
            </div>
        </form>
    );
}

function ServiceQuickCard({ title, description, icon: Icon }) {
    return (
        <Card className="bg-slate-50 border-dashed">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <CardTitle className="text-base">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
