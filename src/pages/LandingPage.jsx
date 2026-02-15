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
    Upload
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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
                    {/* ... (Features Content same as before) ... */}
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

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-4">
                        {/* ... (Pricing Cards same as before) ... */}
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
                <div className="container max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Membership Application</h2>
                        <p className="text-muted-foreground">
                            Please fill out the details below to apply for membership.
                        </p>
                    </div>

                    <RegistrationForm />
                </div>
            </section>

            <footer className="bg-slate-900 text-slate-300 py-12">
                {/* ... (Footer same as before) ... */}
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

function RegistrationForm() {
    const [formData, setFormData] = useState({
        // Personal
        customerName: '',
        age: '',
        address: '',
        phone: '',
        email: '',
        registrationType: 'individual', // 'individual' or 'couple' based on schema? 'myself' in logic? Schema says 'registration_type'

        // Members
        memberName: '',

        // Relative / Guardian
        relativeName: '',
        relationship: '',
        relativePhone: '', // contactNumber
        relativeEmail: '',

        // Preferences
        updateFrequency: '',
        communicationMode: [],
        supportAreas: [],

        // Emergency
        emergencyContactName: '',
        emergencyRelationship: '',
        emergencyContactNumber: '',
        emergencyPermission: false,
        authorizedPerson: '',

        // Financial
        paymentMode: '',
        chequeNumber: '',
        paymentDate: '',
        bankName: '',

        // Declaration
        declarationInfo: false,
        declarationRules: false,

        // Photos
        photoMember: null,
        photoSpouse: null
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            // Handle arrays for multiple checkboxes
            if (name === 'supportAreas' || name === 'communicationMode') {
                const currentArray = formData[name] || [];
                if (checked) {
                    setFormData({ ...formData, [name]: [...currentArray, value] });
                } else {
                    setFormData({ ...formData, [name]: currentArray.filter(item => item !== value) });
                }
            } else if (name === 'declarationInfo' || name === 'declarationRules' || name === 'emergencyPermission') {
                setFormData({ ...formData, [name]: checked });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSelectChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Flatten payload for 'leads' table with new legacy columns
            const payload = {
                customer_name: formData.customerName,
                age: formData.age ? parseInt(formData.age) : null,
                address: formData.address,
                phone_number: formData.phone,
                email: formData.email,
                registration_type: formData.registrationType,

                // Legacy / Details
                member_name: formData.memberName || formData.customerName, // fallback
                relative_name: formData.relativeName,
                relationship: formData.relationship,
                relative_phone: formData.relativePhone,
                relative_email: formData.relativeEmail,

                update_frequency: formData.updateFrequency,
                communication_mode: formData.communicationMode,
                support_areas: formData.supportAreas,

                emergency_contact_name: formData.emergencyContactName,
                emergency_relationship: formData.emergencyRelationship,
                emergency_contact_number: formData.emergencyContactNumber,
                emergency_permission: formData.emergencyPermission,
                authorized_person: formData.authorizedPerson,

                payment_mode: formData.paymentMode,
                cheque_number: formData.chequeNumber,
                payment_date: formData.paymentDate || null,
                bank_name: formData.bankName,

                declaration_info: formData.declarationInfo,
                declaration_rules: formData.declarationRules,

                status: 'new',
                payment_status: 'pending'
            };

            // Note: File upload logic for photos would go here (upload to storage -> get URL -> add to payload.photo_url_member)
            // Skipping actual file upload for this step unless bucket is confirmed, assuming text URL or handled later.

            const { error } = await supabase.from('leads').insert([payload]);
            if (error) throw error;

            setSuccess(true);
        } catch (err) {
            console.error(err);
            alert("Submission failed: " + err.message);
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
                        Thank you for your application. We will review it and contact you soon.
                    </p>
                    <Button onClick={() => setSuccess(false)} variant="outline" className="mt-6 border-green-600 text-green-700 hover:bg-green-100">
                        Submit Another
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Details of Person to be Enrolled</CardTitle>
                <CardDescription>All fields marked * are required.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Section 1: Basic Info */}
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input name="customerName" value={formData.customerName} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Age</Label>
                                <Input name="age" type="number" value={formData.age} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Address *</Label>
                            <Textarea name="address" value={formData.address} onChange={handleInputChange} required />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Phone Number *</Label>
                                <Input name="phone" value={formData.phone} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input name="email" type="email" value={formData.email} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Membership Type</Label>
                            <Select value={formData.registrationType} onValueChange={(val) => handleSelectChange('registrationType', val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="individual">Individual</SelectItem>
                                    <SelectItem value="couple">Couple</SelectItem>
                                    <SelectItem value="family">Family</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Section 2: Relative / Guardian */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="font-semibold text-lg">Details of Relative / Local Guardian</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input name="relativeName" value={formData.relativeName} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Relationship</Label>
                                <Input name="relationship" value={formData.relationship} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Contact Number</Label>
                                <Input name="relativePhone" value={formData.relativePhone} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input name="relativeEmail" value={formData.relativeEmail} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Preferences */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="font-semibold text-lg">Communication Preferences</h3>
                        <div className="space-y-2">
                            <Label>Update Frequency</Label>
                            <Select value={formData.updateFrequency} onValueChange={(val) => handleSelectChange('updateFrequency', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="fortnightly">Fortnightly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Mode of Communication</Label>
                            <div className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="comm-whatsapp" name="communicationMode" value="whatsapp" onCheckedChange={(checked) => handleInputChange({ target: { name: 'communicationMode', value: 'whatsapp', type: 'checkbox', checked } })} />
                                    <Label htmlFor="comm-whatsapp">WhatsApp</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="comm-email" name="communicationMode" value="email" onCheckedChange={(checked) => handleInputChange({ target: { name: 'communicationMode', value: 'email', type: 'checkbox', checked } })} />
                                    <Label htmlFor="comm-email">Email</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="comm-phone" name="communicationMode" value="phone" onCheckedChange={(checked) => handleInputChange({ target: { name: 'communicationMode', value: 'phone', type: 'checkbox', checked } })} />
                                    <Label htmlFor="comm-phone">Phone</Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <Label>Areas of Support Required</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {['Health updates', 'Medication reminders', 'Outing / trip arrangements', 'Bill payments', 'General Companionship'].map((area) => (
                                    <div key={area} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`support-${area}`}
                                            name="supportAreas"
                                            value={area}
                                            onCheckedChange={(checked) => handleInputChange({ target: { name: 'supportAreas', value: area, type: 'checkbox', checked } })}
                                        />
                                        <Label htmlFor={`support-${area}`}>{area}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Emergency */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="font-semibold text-lg">Emergency Contact</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Relationship</Label>
                                <Input name="emergencyRelationship" value={formData.emergencyRelationship} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Number</Label>
                                <Input name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 py-2">
                            <Checkbox
                                id="permission"
                                name="emergencyPermission"
                                checked={formData.emergencyPermission}
                                onCheckedChange={(checked) => handleInputChange({ target: { name: 'emergencyPermission', type: 'checkbox', checked } })}
                            />
                            <Label htmlFor="permission">I give permission to contact this person in case of an emergency.</Label>
                        </div>
                        <div className="space-y-2">
                            <Label>Authorized Person (if any)</Label>
                            <Input name="authorizedPerson" value={formData.authorizedPerson} onChange={handleInputChange} placeholder="Name of person authorized to act on behalf" />
                        </div>
                    </div>

                    {/* Section 5: Payment */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="font-semibold text-lg">Payment Details</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Payment Mode</Label>
                                <Select value={formData.paymentMode} onValueChange={(val) => handleSelectChange('paymentMode', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Cash / Cheque / Online" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                        <SelectItem value="online">Online / UPI</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Date</Label>
                                <Input name="paymentDate" type="date" value={formData.paymentDate} onChange={handleInputChange} />
                            </div>
                        </div>
                        {formData.paymentMode === 'cheque' && (
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Cheque Number</Label>
                                    <Input name="chequeNumber" value={formData.chequeNumber} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bank Name</Label>
                                    <Input name="bankName" value={formData.bankName} onChange={handleInputChange} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section 6: Declaration */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="font-semibold text-lg">Declaration</h3>
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="dec-info"
                                name="declarationInfo"
                                checked={formData.declarationInfo}
                                onCheckedChange={(checked) => handleInputChange({ target: { name: 'declarationInfo', type: 'checkbox', checked } })}
                            />
                            <Label htmlFor="dec-info" className="text-sm">
                                I hereby declare that the information furnished above is true and correct to the best of my knowledge and belief.
                            </Label>
                        </div>
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="dec-rules"
                                name="declarationRules"
                                checked={formData.declarationRules}
                                onCheckedChange={(checked) => handleInputChange({ target: { name: 'declarationRules', type: 'checkbox', checked } })}
                            />
                            <Label htmlFor="dec-rules" className="text-sm">
                                I agree to abide by the rules and regulations of the organization.
                            </Label>
                        </div>
                    </div>

                    <Button type="submit" className="w-full text-lg h-12" disabled={loading}>
                        {loading ? 'Submitting Application...' : 'Submit Application'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
