import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    CheckCircle2,
    Heart,
    Shield,
    Phone,
    Users,
    ArrowRight,
    Menu,
    X,
    CreditCard,
    MapPin,
    Mail,
    AlertCircle
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox"

export default function LandingPage() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background font-sans anti-aliased">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        <Heart className="h-6 w-6 fill-primary" />
                        <span>OneTap Help</span>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-6 items-center">
                        <a href="#features" className="text-sm font-medium transition-colors hover:text-primary">Services</a>
                        <a href="#pricing" className="text-sm font-medium transition-colors hover:text-primary">Membership</a>
                        <a href="#contact" className="text-sm font-medium transition-colors hover:text-primary">Join Now</a>
                        <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
                        <Button onClick={() => document.getElementById('contact').scrollIntoView()}>Get Started</Button>
                    </nav>

                    {/* Mobile Nav Toggle */}
                    <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-b bg-background p-4 space-y-4">
                        <a href="#features" className="block text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Services</a>
                        <a href="#pricing" className="block text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Membership</a>
                        <a href="#contact" className="block text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Join Now</a>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/login')}>Login</Button>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="container py-24 md:py-32 grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                        Always With You. <br />
                        <span className="text-primary">Dignity & Care for Elders.</span>
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Ensuring elders are never alone. From hospital visits to companionship,
                        we provide the family-like support your loved ones deserve.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" onClick={() => document.getElementById('contact').scrollIntoView()} className="gap-2">
                            Join Now <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => document.getElementById('features').scrollIntoView()}>
                            Explore Services
                        </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-primary" /> Verified Caregivers</div>
                        <div className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-primary" /> 24/7 Support</div>
                    </div>
                </div>
                <div className="relative h-[400px] lg:h-[500px] rounded-xl overflow-hidden bg-slate-100 border shadow-xl">
                    <img
                        src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=2000&auto=format&fit=crop"
                        alt="Elderly care"
                        className="object-cover w-full h-full"
                    />
                </div>
            </section>

            {/* Features/Services */}
            <section id="features" className="bg-slate-50 py-24">
                <div className="container">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Comprehensive Elder Care Services</h2>
                        <p className="text-muted-foreground">
                            We don't just provide a service; we build a relationship. Our caregivers are trained to handle various needs with empathy.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard
                            icon={Shield}
                            title="Hospital Visits"
                            description="Assistance with medical appointments, checkups, and hospital stays to ensure safety."
                        />
                        <FeatureCard
                            icon={Users}
                            title="Companionship"
                            description="Combating loneliness with meaningful conversations, reading, and shared activities."
                        />
                        <FeatureCard
                            icon={CreditCard}
                            title="Bill Payments"
                            description="Secure assistance with banking, utility bills, and other financial errands."
                        />
                        <FeatureCard
                            icon={Phone}
                            title="Emergency Support"
                            description="On-call assistance for emergencies, acting as the first point of contact."
                        />
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-24">
                <div className="container">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Simple, Transparent Membership</h2>
                        <p className="text-muted-foreground">
                            Choose a plan that fits your needs. Membership unlocks priority access and exclusive discounts.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-4">
                        <Card className="border-2 hover:border-primary transition-colors">
                            <CardHeader>
                                <CardTitle className="text-2xl">Individual</CardTitle>
                                <CardDescription>For single seniors living alone</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-4xl font-bold">₹1,000<span className="text-base font-normal text-muted-foreground">/year</span></div>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Priority Booking</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Verified Caregivers</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Monthly Health Updates</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Emergency Coordination</li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={() => document.getElementById('contact').scrollIntoView()}>Choose Individual</Button>
                            </CardFooter>
                        </Card>

                        <Card className="border-2 border-primary shadow-lg relative mt-12 md:mt-0">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap z-10">
                                MOST POPULAR
                            </div>
                            <CardHeader>
                                <CardTitle className="text-2xl">Couple</CardTitle>
                                <CardDescription>Perfect for elderly couples</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-4xl font-bold">₹1,750<span className="text-base font-normal text-muted-foreground">/year</span></div>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Covers Both Spouses</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Joint Activities</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> All Individual Benefits</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Priority Emergency Response</li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={() => document.getElementById('contact').scrollIntoView()}>Choose Couple</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Registration Form Section */}
            <section id="contact" className="bg-slate-50 py-24">
                <div className="container max-w-3xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Join Golden Moments</h2>
                        <p className="text-muted-foreground">
                            Ready to get started? Fill out the form below. We need these details to ensure the best care.
                        </p>
                    </div>

                    <RegistrationForm />
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-12">
                <div className="container grid md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-bold text-xl text-white">
                            <Heart className="h-6 w-6 fill-white" />
                            <span>OneTap Help</span>
                        </div>
                        <p className="text-sm">
                            Dedicated to improving the quality of life for seniors through compassionate care and trusted support.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">Home</a></li>
                            <li><a href="#about" className="hover:text-white">About Us</a></li>
                            <li><a href="#features" className="hover:text-white">Services</a></li>
                            <li><a href="#contact" className="hover:text-white">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 7012649326</li>
                            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> dmaid20@gmail.com</li>
                            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Kerala, India</li>
                        </ul>
                    </div>
                </div>
                <div className="container mt-8 pt-8 border-t border-slate-800 text-center text-sm">
                    © 2026 OneTap Help. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description }) {
    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="p-0 mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Icon className="h-6 w-6" />
                </div>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-muted-foreground">
                {description}
            </CardContent>
        </Card>
    )
}

// Embedded Registration Form Component
function RegistrationForm() {
    const [formData, setFormData] = useState({
        customerName: '',
        age: '',
        phoneNumber: '',
        email: '',
        address: '',
        medicalHistory: '',
        registrationType: 'myself',
        emergencyName: '',
        emergencyPhone: '',
        emergencyRelation: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            // Prepare payload matching the new schema
            const payload = {
                customer_name: formData.customerName,
                phone_number: formData.phoneNumber,
                medical_history: formData.medicalHistory,
                registration_type: formData.registrationType,
                status: 'new',
                payment_status: 'pending',
                // New Fields
                age: formData.age ? parseInt(formData.age) : null,
                email: formData.email,
                address: formData.address,
                emergency_details: {
                    name: formData.emergencyName,
                    phone: formData.emergencyPhone,
                    relation: formData.emergencyRelation
                }
            };

            const { error } = await supabase.from('leads').insert([payload]);
            if (error) throw error;

            setSuccess(true);
            setFormData({
                customerName: '',
                age: '',
                phoneNumber: '',
                email: '',
                address: '',
                medicalHistory: '',
                registrationType: 'myself',
                emergencyName: '',
                emergencyPhone: '',
                emergencyRelation: '',
            });
        } catch (err) {
            console.error("Error submitting:", err);
            setErrorMsg(err.message || "Submission failed.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6 text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-green-100 p-3">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-green-900">Application Submitted!</h3>
                    <p className="text-green-700 mt-2">
                        Thank you for registering. Our team will contact you shortly.
                    </p>
                    <Button onClick={() => setSuccess(false)} variant="outline" className="mt-6 border-green-600 text-green-700 hover:bg-green-100">
                        Submit Another
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Member Registration</CardTitle>
                <CardDescription>Please provide complete details for better assistance.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input name="customerName" value={formData.customerName} onChange={handleInputChange} required placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label>Age</Label>
                            <Input name="age" type="number" value={formData.age} onChange={handleInputChange} required placeholder="65" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required placeholder="+91 9876543210" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email (Optional)</Label>
                            <Input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Current Address</Label>
                        <Textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Full address..." rows={2} required />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Registering For</Label>
                            <Select value={formData.registrationType} onValueChange={(val) => handleSelectChange('registrationType', val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="myself">Myself</SelectItem>
                                    <SelectItem value="family">Family Member</SelectItem>
                                    <SelectItem value="agent">I am an Agent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="border-t pt-4 mt-4">
                        <h3 className="font-semibold mb-4 text-sm uppercase text-muted-foreground">Emergency Contact</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Contact Name</Label>
                                <Input name="emergencyName" value={formData.emergencyName} onChange={handleInputChange} required placeholder="Relative Name" />
                            </div>
                            <div className="space-y-2">
                                <Label>Relation</Label>
                                <Input name="emergencyRelation" value={formData.emergencyRelation} onChange={handleInputChange} required placeholder="Son/Daughter" />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input name="emergencyPhone" value={formData.emergencyPhone} onChange={handleInputChange} required placeholder="Phone" />
                            </div>
                        </div>
                    </div>

                    {/* Medical / Other */}
                    <div className="border-t pt-4 mt-4">
                        <Label>Medical History / Special Needs (Optional)</Label>
                        <Textarea
                            name="medicalHistory"
                            value={formData.medicalHistory}
                            onChange={handleInputChange}
                            placeholder="Diabetes, Hypertension, Mobility issues, etc."
                            rows={3}
                            className="mt-2"
                        />
                    </div>

                    {errorMsg && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {errorMsg}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
