import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '../supabaseClient';
import { Users, Phone, DollarSign, Activity, ArrowUpRight } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardHome() {
    const [stats, setStats] = useState({
        totalLeads: 0,
        newLeads: 0,
        convertedLeads: 0,
        pendingPayments: 0
    });
    const [recentLeads, setRecentLeads] = useState([]);

    useEffect(() => {
        fetchStats();
        fetchRecentLeads();
    }, []);

    const fetchStats = async () => {
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

    const fetchRecentLeads = async () => {
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('customer_name, status, created_at, payment_status')
                .order('created_at', { ascending: false })
                .limit(5);
            if (data) setRecentLeads(data);
        } catch (e) {
            console.error(e);
        }
    }

    // Mock data for the chart
    const data = [
        { name: "Jan", total: Math.floor(Math.random() * 50) + 10 },
        { name: "Feb", total: Math.floor(Math.random() * 50) + 10 },
        { name: "Mar", total: Math.floor(Math.random() * 50) + 10 },
        { name: "Apr", total: Math.floor(Math.random() * 50) + 10 },
        { name: "May", total: Math.floor(Math.random() * 50) + 10 },
        { name: "Jun", total: Math.floor(Math.random() * 50) + 10 },
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    {/* DatePicker could go here */}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalLeads}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.newLeads}</div>
                        <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Converted</CardTitle>
                        <Phone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.convertedLeads}</div>
                        <p className="text-xs text-muted-foreground">+19% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                        <p className="text-xs text-muted-foreground">+201 since last hour</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={data}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ background: '#333', border: 'none', borderRadius: '4px', color: '#fff' }}
                                />
                                <Bar dataKey="total" fill="#2563EB" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Leads</CardTitle>
                        <CardDescription>
                            You made {stats.newLeads} new leads this month.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentLeads.map((lead, i) => (
                                <div key={i} className="flex items-center">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.customer_name}`} alt="Avatar" />
                                        <AvatarFallback>OM</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{lead.customer_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {lead.status}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        {lead.payment_status === 'received' ? '+$1,000' : 'Pending'}
                                    </div>
                                </div>
                            ))}
                            {recentLeads.length === 0 && <p className="text-sm text-muted-foreground">No recent leads found.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
