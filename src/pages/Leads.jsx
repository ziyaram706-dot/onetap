import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Search, Filter } from 'lucide-react';

export default function Leads() {
    const { user, role } = useAuth();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
    const [telecallers, setTelecallers] = useState([]);
    const [formData, setFormData] = useState({
        customerName: '',
        phoneNumber: '',
        medicalHistory: '',
        registrationType: 'myself',
        assignedTo: '',
        status: 'new'
    });
    const [submitting, setSubmitting] = useState(false);
    const [updatingId, setUpdatingId] = useState(null); // For inline status updates

    const isManagerOrAdmin = role === 'super_admin' || role === 'manager';
    const isTelecaller = role === 'telecaller';

    useEffect(() => {
        fetchLeads();
        if (isManagerOrAdmin) {
            fetchTelecallers();
        }
    }, [role]);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            // Join with profiles to get assigned_to name
            // Note: Supabase JS join syntax
            let query = supabase
                .from('leads')
                .select(`
            *,
            assigned_to_profile:profiles!assigned_to(full_name),
            created_by_profile:profiles!created_by(full_name)
        `)
                .order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;
            setLeads(data || []);
        } catch (err) {
            console.error('Error fetching leads:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTelecallers = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('role', 'telecaller');
        setTelecallers(data || []);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleAddLead = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                customer_name: formData.customerName,
                phone_number: formData.phoneNumber,
                medical_history: formData.medicalHistory,
                registration_type: formData.registrationType,
                status: 'new',
                created_by: user.id
            };

            if (formData.assignedTo && isManagerOrAdmin) {
                payload.assigned_to = formData.assignedTo;
            }

            const { error } = await supabase.from('leads').insert([payload]);
            if (error) throw error;

            setIsAddLeadOpen(false);
            setFormData({
                customerName: '',
                phoneNumber: '',
                medicalHistory: '',
                registrationType: 'myself',
                assignedTo: '',
                status: 'new'
            });
            fetchLeads();
        } catch (err) {
            console.error("Error adding lead:", err);
            alert("Failed to add lead: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const updateLeadStatus = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            const { error } = await supabase
                .from('leads')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Optimistic update or refetch
            setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
        } catch (err) {
            console.error("Error updating status:", err);
            alert(err.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const updatePaymentStatus = async (id, newStatus) => {
        if (!isManagerOrAdmin) return;
        setUpdatingId(id);
        try {
            const { error } = await supabase
                .from('leads')
                .update({ payment_status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setLeads(leads.map(lead => lead.id === id ? { ...lead, payment_status: newStatus } : lead));
        } catch (err) {
            console.error("Error updating payment:", err);
            alert(err.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'called': return 'bg-yellow-100 text-yellow-800';
            case 'waiting': return 'bg-orange-100 text-orange-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
                    <p className="text-muted-foreground">Manage and track your leads.</p>
                </div>
                <div className="flex gap-2">
                    {/* Search/Filter can go here */}
                    {isManagerOrAdmin && (
                        <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Lead
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Add New Lead</DialogTitle>
                                    <DialogDescription>
                                        Enter lead details manually.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddLead} className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Customer Name</Label>
                                            <Input name="customerName" value={formData.customerName} onChange={handleInputChange} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone Number</Label>
                                            <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Medical History</Label>
                                        <Textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleInputChange} rows={3} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Registration Type</Label>
                                            <Select value={formData.registrationType} onValueChange={(val) => handleSelectChange('registrationType', val)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="myself">Myself</SelectItem>
                                                    <SelectItem value="family">Family</SelectItem>
                                                    <SelectItem value="agent">Agent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {isManagerOrAdmin && (
                                            <div className="space-y-2">
                                                <Label>Assign To</Label>
                                                <Select value={formData.assignedTo} onValueChange={(val) => handleSelectChange('assignedTo', val)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Telecaller" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {telecallers.map(t => (
                                                            <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={submitting}>
                                            {submitting ? 'Adding...' : 'Add Lead'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>History</TableHead>
                            <TableHead>Registration</TableHead>
                            <TableHead>Status</TableHead>
                            {isManagerOrAdmin && <TableHead>Payment</TableHead>}
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Created By</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-24">Loading leads...</TableCell>
                            </TableRow>
                        ) : leads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-24">No leads found.</TableCell>
                            </TableRow>
                        ) : (
                            leads.map((lead) => (
                                <TableRow key={lead.id}>
                                    <TableCell className="font-medium">{lead.customer_name}</TableCell>
                                    <TableCell>{lead.phone_number}</TableCell>
                                    <TableCell className="max-w-[150px] truncate" title={lead.medical_history}>{lead.medical_history}</TableCell>
                                    <TableCell className="capitalize">{lead.registration_type}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={lead.status}
                                            onValueChange={(val) => updateLeadStatus(lead.id, val)}
                                            disabled={updatingId === lead.id}
                                        >
                                            <SelectTrigger className={`h-8 w-[130px] ${getStatusColor(lead.status)} border-0`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new">New</SelectItem>
                                                <SelectItem value="called">Called</SelectItem>
                                                <SelectItem value="waiting">Waiting</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    {isManagerOrAdmin && (
                                        <TableCell>
                                            <Select
                                                value={lead.payment_status}
                                                onValueChange={(val) => updatePaymentStatus(lead.id, val)}
                                                disabled={updatingId === lead.id}
                                            >
                                                <SelectTrigger className={`h-8 w-[140px] ${lead.payment_status === 'received' ? 'text-green-700 font-medium' : ''}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="received">Received</SelectItem>
                                                    <SelectItem value="not_received">Not Received</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        {lead.assigned_to_profile?.full_name || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {lead.created_by_profile?.full_name || 'System'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
