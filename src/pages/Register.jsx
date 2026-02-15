import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';

export default function Register() {
    const [agents, setAgents] = useState([]);
    const [formData, setFormData] = useState({
        customerName: '',
        phoneNumber: '',
        medicalHistory: '',
        registrationType: 'myself',
        agentId: '',
        paymentReceived: false
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        // Fetch users who can be agents (managers, telecallers, super_admin, marketing_lead)
        // Public policy allows reading profiles.
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .order('full_name');

        if (data) {
            setAgents(data);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleCheckboxChange = (checked) => {
        setFormData({ ...formData, paymentReceived: checked });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                customer_name: formData.customerName,
                phone_number: formData.phoneNumber,
                medical_history: formData.medicalHistory,
                registration_type: formData.registrationType,
                status: 'new',
                payment_status: 'pending' // Default
            };

            if (formData.agentId) {
                payload.agent_id = formData.agentId;
                // If agent selected, check payment logic
                if (formData.paymentReceived) {
                    payload.payment_status = 'received';
                } else {
                    payload.payment_status = 'not_received';
                }
            }

            const { error } = await supabase.from('leads').insert([payload]);
            if (error) throw error;

            setSuccess(true);
            setFormData({
                customerName: '',
                phoneNumber: '',
                medicalHistory: '',
                registrationType: 'myself',
                agentId: '',
                paymentReceived: false
            });
        } catch (err) {
            console.error("Error submitting form:", err);
            alert("Registration failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="text-green-600">Success!</CardTitle>
                        <CardDescription>Your registration has been submitted successfully.</CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-center">
                        <Button onClick={() => setSuccess(false)}>Submit Another</Button>
                        <Link to="/" className="ml-4 text-sm text-blue-600 underline">Home</Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-10">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Register Lead</CardTitle>
                    <CardDescription className="text-center">Fill in the details below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Registering For</Label>
                            <Select value={formData.registrationType} onValueChange={(val) => handleSelectChange('registrationType', val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="myself">Myself</SelectItem>
                                    <SelectItem value="family">My Family</SelectItem>
                                    <SelectItem value="agent">I am an Agent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Customer Name</Label>
                                <Input name="customerName" value={formData.customerName} onChange={handleInputChange} required placeholder="Name" />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required placeholder="Phone" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Medical History</Label>
                            <Textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleInputChange} placeholder="Enter medical history..." rows={3} />
                        </div>

                        <div className="space-y-2">
                            <Label>Select Agent (Optional)</Label>
                            <Select value={formData.agentId} onValueChange={(val) => handleSelectChange('agentId', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Agent Name" />
                                </SelectTrigger>
                                <SelectContent>
                                    {agents.map(agent => (
                                        <SelectItem key={agent.id} value={agent.id}>
                                            {agent.full_name} <span className="text-xs text-muted-foreground">({agent.role})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Payment Checkbox - Visible only if agent is selected */}
                        {formData.agentId && (
                            <div className="flex items-center space-x-2 border p-4 rounded-md bg-slate-50">
                                <Checkbox
                                    id="paymentReceived"
                                    checked={formData.paymentReceived}
                                    onCheckedChange={handleCheckboxChange}
                                />
                                <Label htmlFor="paymentReceived" className="cursor-pointer">
                                    Payment Received?
                                </Label>
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Registration'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center border-t pt-4">
                    <Link to="/" className="text-sm text-muted-foreground hover:text-primary">Back to Home</Link>
                </CardFooter>
            </Card>
        </div>
    );
}
