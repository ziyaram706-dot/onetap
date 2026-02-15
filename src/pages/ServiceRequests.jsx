import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, XCircle, Clock, Search } from 'lucide-react';
import { Input } from "@/components/ui/input"

export default function ServiceRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('service_requests')
                .select(`
                    *,
                    profiles:user_id (full_name, email)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        const { error } = await supabase
            .from('service_requests')
            .update({ status })
            .eq('id', id);

        if (!error) fetchRequests();
    };

    const updatePaymentStatus = async (id, paymentStatus) => {
        const { error } = await supabase
            .from('service_requests')
            .update({ payment_status: paymentStatus })
            .eq('id', id);

        if (!error) fetchRequests();
    };

    const filteredRequests = requests.filter(req =>
        req.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Service Requests</h2>
                    <p className="text-muted-foreground">Manage and track service requests from members.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>All Requests</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search requests..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Date / Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">Loading...</TableCell>
                                </TableRow>
                            ) : filteredRequests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">No requests found</TableCell>
                                </TableRow>
                            ) : (
                                filteredRequests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell>
                                            <div className="font-medium">{req.profiles?.full_name || 'Unknown'}</div>
                                            <div className="text-sm text-muted-foreground">{req.profiles?.email}</div>
                                        </TableCell>
                                        <TableCell>{req.service_name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span>{req.requested_date}</span>
                                                <span className="text-muted-foreground">{req.requested_time}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                req.status === 'completed' ? 'default' :
                                                    req.status === 'approved' ? 'success' :
                                                        req.status === 'rejected' ? 'destructive' : 'secondary'
                                            }>
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={req.payment_status === 'paid' ? 'text-green-600 border-green-200 bg-green-50' : ''}>
                                                    {req.payment_status}
                                                </Badge>
                                                {req.payment_status !== 'paid' && (
                                                    <Button
                                                        size="xs"
                                                        variant="ghost"
                                                        className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => updatePaymentStatus(req.id, 'paid')}
                                                    >
                                                        Mark Paid
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {req.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-green-200 hover:bg-green-50 hover:text-green-600" onClick={() => updateStatus(req.id, 'approved')}>
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:text-red-600" onClick={() => updateStatus(req.id, 'rejected')}>
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                            {req.status === 'approved' && (
                                                <Button size="sm" variant="outline" onClick={() => updateStatus(req.id, 'completed')}>
                                                    Mark Done
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
