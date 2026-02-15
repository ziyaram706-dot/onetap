import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

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

    // View Details State
    const [selectedLead, setSelectedLead] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    // Filters
    const [filterStatus, setFilterStatus] = useState('all');
    const [activeTab, setActiveTab] = useState('all');

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
            created_by_profile:profiles!created_by(full_name, role)
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

    const handleViewDetails = (lead) => {
        setSelectedLead(lead);
        setIsViewOpen(true);
    };

    const getFilteredLeads = () => {
        let filtered = leads;

        // Tab Filter
        if (activeTab === 'applications') {
            filtered = filtered.filter(l => l.created_by_profile?.role === 'member');
        } else if (activeTab === 'internal') {
            filtered = filtered.filter(l => l.created_by_profile?.role !== 'member');
        }

        // Status Filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(l => l.status === filterStatus);
        }

        return filtered;
    };

    const filteredLeadsList = getFilteredLeads();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Leads & Applications</h2>
                    <p className="text-muted-foreground">Manage membership applications and internal leads.</p>
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="all">All Entries</TabsTrigger>
                    <TabsTrigger value="applications">Member Applications</TabsTrigger>
                    <TabsTrigger value="internal">Internal Leads</TabsTrigger>
                </TabsList>

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
                            ) : filteredLeadsList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">No entries found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredLeadsList.map((lead) => (
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
                                                    <DropdownMenuItem onClick={() => handleViewDetails(lead)}>
                                                        View Details
                                                    </DropdownMenuItem>
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

                {/* View Details Dialog */}
                <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
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
                        <DialogFooter className="flex justify-between items-center w-full">
                            <div className="flex gap-2">
                                {isManagerOrAdmin && selectedLead.payment_status !== 'received' && (
                                    <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => updatePaymentStatus(selectedLead.id, 'received')}>
                                        Mark as Received
                                    </Button>
                                )}
                                {isManagerOrAdmin && selectedLead.payment_status === 'received' && (
                                    <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => updatePaymentStatus(selectedLead.id, 'pending')}>
                                        Mark as Pending
                                    </Button>
                                )}
                            </div>
                            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Tabs>
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
