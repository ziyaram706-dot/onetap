import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '../supabaseClient';
import { Users, Phone, DollarSign, Activity } from 'lucide-react';

export default function DashboardHome() {
    const [stats, setStats] = useState({
        totalLeads: 0,
        newLeads: 0,
        convertedLeads: 0,
        pendingPayments: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        // Simple verification/stats fetch
        try {
            const { count: total } = await supabase.from('leads').select('*', { count: 'exact', head: true });
            const { count: newL } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new');
            const { count: converted } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'completed');
            const { count: payments } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('payment_status', 'pending');

            setStats({
                totalLeads: total || 0,
                newLeads: newL || 0,
                convertedLeads: converted || 0,
                pendingPayments: payments || 0
            });
        } catch (e) {
            console.error(e);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className={`h-4 w-4 text-muted-foreground ${color}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">
                    Updated just now
                </p>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your lead management system.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Leads" value={stats.totalLeads} icon={Users} />
                <StatCard title="New Leads" value={stats.newLeads} icon={Activity} color="text-blue-500" />
                <StatCard title="Converted" value={stats.convertedLeads} icon={Phone} color="text-green-500" />
                <StatCard title="Pending Payments" value={stats.pendingPayments} icon={DollarSign} color="text-yellow-500" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">See the 'Leads' tab for detailed table view.</p>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Shortcuts to common tasks.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
