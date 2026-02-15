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
import { PlusCircle, Search, Filter, MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

    // Filters
    const [filterStatus, setFilterStatus] = useState('all');

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
            let query = supabase
                .from('leads')
                .select(`
            *,
            assigned_to_profile:profiles!assigned_to(full_name, email),
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
        try {
            const { error } = await supabase
                .from('leads')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const updatePaymentStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('leads')
                .update({ payment_status: newStatus })
                .eq('id', id);

            if (error) throw error;
            setLeads(leads.map(lead => lead.id === id ? { ...lead, payment_status: newStatus } : lead));
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    }

    const filteredLeads = leads.filter(lead => {
        if (filterStatus === 'all') return true;
        return lead.status === filterStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
                    <p className="text-muted-foreground">Manage leads and track conversions.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="called">Called</SelectItem>
                            <SelectItem value="waiting">Waiting</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                        </SelectContent>
                    </Select>
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

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead className="hidden md:table-cell">Status</TableHead>
                            <TableHead className="hidden md:table-cell">Type</TableHead>
                            <TableHead className="hidden md:table-cell">Assigned To</TableHead>
                            {isManagerOrAdmin && <TableHead>Payment</TableHead>}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell>
                            </TableRow>
                        ) : filteredLeads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">No leads found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredLeads.map((lead) => (
                                <TableRow key={lead.id}>
                                    <TableCell>
                                        <div className="font-medium">{lead.customer_name}</div>
                                        <div className="text-sm text-muted-foreground">{lead.phone_number}</div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <StatusBadge status={lead.status} />
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell capitalize">
                                        {lead.registration_type}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {lead.assigned_to_profile ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.assigned_to_profile.full_name}`} />
                                                    <AvatarFallback>{lead.assigned_to_profile.full_name[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm">{lead.assigned_to_profile.full_name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">Unassigned</span>
                                        )}
                                    </TableCell>
                                    {isManagerOrAdmin && (
                                        <TableCell>
                                            <Badge variant={lead.payment_status === 'received' ? 'default' : 'secondary'} className={lead.payment_status === 'received' ? 'bg-green-600 hover:bg-green-700' : ''}>
                                                {lead.payment_status === 'received' ? 'Paid' : 'Pending'}
                                            </Badge>
                                        </TableCell>
                                    )}
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(lead.phone_number)}>
                                                    Copy Phone
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                                {['new', 'called', 'waiting', 'completed', 'rejected'].map(s => (
                                                    <DropdownMenuItem key={s} onClick={() => updateLeadStatus(lead.id, s)}>
                                                        Mark as {s.charAt(0).toUpperCase() + s.slice(1)}
                                                    </DropdownMenuItem>
                                                ))}
                                                {isManagerOrAdmin && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuLabel>Payment</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => updatePaymentStatus(lead.id, 'received')}>Mark Paid</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => updatePaymentStatus(lead.id, 'pending')}>Mark Pending</DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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

function StatusBadge({ status }) {
    const styles = {
        new: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        called: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        waiting: "bg-orange-100 text-orange-800 hover:bg-orange-200",
        completed: "bg-green-100 text-green-800 hover:bg-green-200",
        rejected: "bg-red-100 text-red-800 hover:bg-red-200",
    };

    return (
        <Badge variant="outline" className={`${styles[status] || styles.new} border-transparent`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    )
}
