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

    const [selectedLead, setSelectedLead] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const handleViewDetails = (lead) => {
        setSelectedLead(lead);
        setIsViewOpen(true);
    };

    // ... (rest of existing functions)

                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleViewDetails(lead)}>
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(lead.phone_number)}>
                                                    Copy Phone
                                                </DropdownMenuItem>
    {/* ... */ }
                                        </DropdownMenuContent >
                                    </DropdownMenu >
                                </TableCell >
                            </TableRow >
                        ))
                    )
}
                </TableBody >
            </Table >
            </div >

    {/* View Details Dialog */ }
    < Dialog open = { isViewOpen } onOpenChange = { setIsViewOpen } >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Lead Details</DialogTitle>
                <DialogDescription>Full registration information.</DialogDescription>
            </DialogHeader>
            {selectedLead && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Personal Information</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="font-medium">Customer Name:</span> <span>{selectedLead.customer_name}</span>
                            <span className="font-medium">Member Name:</span> <span>{selectedLead.member_name || '-'}</span>
                            <span className="font-medium">Age:</span> <span>{selectedLead.age || '-'}</span>
                            <span className="font-medium">Email:</span> <span>{selectedLead.email || '-'}</span>
                            <span className="font-medium">Phone:</span> <span>{selectedLead.phone_number}</span>
                            <span className="font-medium">Address:</span> <span className="col-span-2">{selectedLead.address || '-'}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Relatives & Emergency</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="font-medium">Relative Name:</span> <span>{selectedLead.relative_name || '-'}</span>
                            <span className="font-medium">Relation:</span> <span>{selectedLead.relationship || '-'}</span>
                            <span className="font-medium">Relative Phone:</span> <span>{selectedLead.relative_phone || '-'}</span>
                            <span className="font-medium">Emerg. Contact:</span> <span>{selectedLead.emergency_contact_name || '-'}</span>
                            <span className="font-medium">Emerg. Phone:</span> <span>{selectedLead.emergency_contact_number || '-'}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Service Requirements</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="font-medium">Registration Type:</span> <span className="capitalize">{selectedLead.registration_type}</span>
                            <span className="font-medium">Update Freq:</span> <span>{selectedLead.update_frequency || '-'}</span>
                            <span className="font-medium">Comm. Mode:</span> <span>{selectedLead.communication_mode?.join(', ') || '-'}</span>
                            <span className="font-medium col-span-2">Support Areas:</span>
                            <div className="col-span-2 flex flex-wrap gap-1">
                                {selectedLead.support_areas?.map((area, i) => (
                                    <Badge key={i} variant="secondary">{area}</Badge>
                                )) || '-'}
                            </div>
                            <span className="font-medium col-span-2">Medical History:</span>
                            <p className="col-span-2 whitespace-pre-wrap bg-muted p-2 rounded-md text-xs">{selectedLead.medical_history || 'None'}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Administrative</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="font-medium">Status:</span> <StatusBadge status={selectedLead.status} />
                            <span className="font-medium">Payment Status:</span>
                            <Badge variant={selectedLead.payment_status === 'received' ? 'default' : 'secondary'} className={selectedLead.payment_status === 'received' ? 'bg-green-600' : ''}>
                                {selectedLead.payment_status}
                            </Badge>
                            <span className="font-medium">Created By:</span> <span>{selectedLead.created_by_profile?.full_name || 'System'}</span>
                            <span className="font-medium">Assigned To:</span> <span>{selectedLead.assigned_to_profile?.full_name || 'Unassigned'}</span>
                            <span className="font-medium">Agent ID:</span> <span>{selectedLead.agent_id ? 'Yes' : 'No'}</span>
                            {selectedLead.payment_mode && (
                                <>
                                    <span className="font-medium">Payment Mode:</span> <span className="capitalize">{selectedLead.payment_mode}</span>
                                    {selectedLead.cheque_number && <><span className="font-medium">Cheque No:</span> <span>{selectedLead.cheque_number}</span></>}
                                    {selectedLead.bank_name && <><span className="font-medium">Bank:</span> <span>{selectedLead.bank_name}</span></>}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button onClick={() => setIsViewOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
            </Dialog >
        </div >
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
