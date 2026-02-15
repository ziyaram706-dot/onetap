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
    AlertCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox"
import RegistrationForm from '../components/RegistrationForm';

export default function LandingPage() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('individual');

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    };

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
                    <nav className="hidden md:flex gap-6 items-center landing-nav">
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

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-[100] bg-background animate-in slide-in-from-right duration-300">
                        <div className="container flex h-16 items-center justify-between border-b">
                            <div className="flex items-center gap-2 font-bold text-xl text-primary">
                                <Heart className="h-6 w-6 fill-primary" />
                                <span>OneTap Help</span>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)}>
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="container py-8 flex flex-col gap-6">
                            <a href="#features" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Services</a>
                            <a href="#pricing" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Membership</a>
                            <a href="#contact" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Join Now</a>
                            <div className="pt-4 flex flex-col gap-4">
                                <Button variant="outline" size="lg" className="w-full" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>Login</Button>
                                <Button size="lg" className="w-full" onClick={() => { document.getElementById('contact').scrollIntoView(); setMobileMenuOpen(false); }}>Get Started</Button>
                            </div>
                        </div>
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
                        <FeatureCard icon={Shield} title="Hospital Visits" description="Assistance with medical appointments, checkups, and hospital stays." />
                        <FeatureCard icon={Users} title="Companionship" description="Combating loneliness with meaningful conversations and activities." />
                        <FeatureCard icon={CreditCard} title="Bill Payments" description="Secure assistance with banking, utility bills, and other errands." />
                        <FeatureCard icon={Phone} title="Emergency Support" description="On-call assistance for emergencies, acting as the first point of contact." />
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

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-8"> {/* Increased top padding to avoid overlap */}
                        <Card className="border-2 hover:border-primary transition-colors hover:shadow-lg">
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
                                <Button className="w-full" variant="outline" onClick={() => handlePlanSelect('individual')}>Choose Individual</Button>
                            </CardFooter>
                        </Card>

                        {/* Adjust overlap with margin top */}
                        <Card className="border-2 border-primary shadow-xl relative mt-12 md:mt-0 lg:mt-0 transform md:-translate-y-4">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap z-20 shadow-md">
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
                                <Button className="w-full font-bold shadow-md" size="lg" onClick={() => handlePlanSelect('couple')}>Choose Couple</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Registration Form Section */}
            <section id="contact" className="bg-slate-50 py-24">
                <div className="container max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Membership Application</h2>
                        <p className="text-muted-foreground">
                            Please fill out the details below to create your account and apply for membership.
                        </p>
                    </div>

                    <RegistrationForm selectedPlan={selectedPlan} />
                </div>
            </section>

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


