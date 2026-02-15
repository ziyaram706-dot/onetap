import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Heart,
    Shield,
    Eye,
    EyeOff,
    CheckCircle2,
    User,
    Phone,
    Mail,
    Info,
    Camera,
    Upload,
    X
} from 'lucide-react';

export default function RegistrationForm({ selectedPlan = 'individual', isAdminFlow = false, onSuccess }) {
    const navigate = useNavigate();
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        // Auth Info
        email: '',
        password: '',

        // Agent Info
        agentId: '',
        agentPassword: '',

        // Basic Info
        customerName: '',
        phone: '',
        age: '',
        address: '',
        registrationType: 'myself',
        memberName: '',

        // Relative / Guardian
        relativeName: '',
        relationship: '',
        relativePhone: '',
        relativeEmail: '',

        // Service Needs
        updateFrequency: 'weekly',
        communicationMode: [],
        supportAreas: [],

        // Emergency
        emergencyContactName: '',
        emergencyRelationship: '',
        emergencyContactNumber: '',
        emergencyPermission: false,
        authorizedPerson: '',

        // Payment (Only for agent flow)
        paymentMode: 'cash',
        chequeNumber: '',
        paymentDate: '',
        bankName: '',

        // Photos
        memberPhoto: null,
        spousePhoto: null,
        memberPhotoUrl: '',
        spousePhotoUrl: '',

        // Declaration
        declarationInfo: false,
        declarationRules: false
    });

    const [photoPreviews, setPhotoPreviews] = useState({
        member: null,
        spouse: null
    });

    // Sync registrationType when selectedPlan prop changes
    useEffect(() => {
        if (selectedPlan) {
            // Standardize registrationType to match DB constraint: 'individual', 'couple', 'family'
            const mappedType = selectedPlan === 'individual' ? 'individual' : (selectedPlan === 'couple' ? 'couple' : (selectedPlan === 'family' ? 'family' : 'individual'));
            setFormData(prev => ({ ...prev, registrationType: mappedType }));
        }
    }, [selectedPlan]);

    useEffect(() => {
        // Fetch agents (telecaller, marketing_lead, manager)
        const fetchAgents = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, role, email') // Added email for verification
                .in('role', ['telecaller', 'marketing_lead', 'manager', 'super_admin']);

            if (data) setAgents(data);
        };
        fetchAgents();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            if (name === 'supportAreas' || name === 'communicationMode') {
                setFormData(prev => {
                    const currentArray = prev[name] || [];
                    if (checked) {
                        return { ...prev, [name]: [...currentArray, value] };
                    } else {
                        return { ...prev, [name]: currentArray.filter(item => item !== value) };
                    }
                });
            } else {
                setFormData(prev => ({ ...prev, [name]: checked }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePhotoChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size should be less than 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreviews(prev => ({ ...prev, [type]: reader.result }));
            };
            reader.readAsDataURL(file);

            setFormData(prev => ({ ...prev, [`${type}Photo`]: file }));
        }
    };

    const removePhoto = (type) => {
        setPhotoPreviews(prev => ({ ...prev, [type]: null }));
        setFormData(prev => ({ ...prev, [`${type}Photo`]: null }));
    };

    // Helper for shadcn checkbox/select which don't pass standard events
    const updateField = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxArrayUpdate = (name, value, checked) => {
        setFormData(prev => {
            const currentArray = prev[name] || [];
            if (checked) {
                return { ...prev, [name]: [...currentArray, value] };
            } else {
                return { ...prev, [name]: currentArray.filter(item => item !== value) };
            }
        });
    };

    const uploadPhoto = async (file, type) => {
        if (!file) return null;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `leads/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
            .from('photos')
            .upload(filePath, file);

        if (uploadError) {
            console.error(`Error uploading ${type} photo:`, uploadError);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let memberPhotoUrl = '';
            let spousePhotoUrl = '';

            // 0. Handle Photo Uploads
            if (formData.memberPhoto) {
                memberPhotoUrl = await uploadPhoto(formData.memberPhoto, 'member');
            }
            if (formData.spousePhoto) {
                spousePhotoUrl = await uploadPhoto(formData.spousePhoto, 'spouse');
            }

            // Case 1: Public Flow (Landing Page) - Needs Auth Signup
            if (!isAdminFlow) {
                if (!formData.email || !formData.password) {
                    throw new Error("Email and password are required for account creation.");
                }

                // Agent Verification
                if (formData.agentId) {
                    if (!formData.agentPassword) {
                        throw new Error("Agent password is required for verification.");
                    }

                    const agent = agents.find(a => a.id === formData.agentId);
                    if (!agent || !agent.email) throw new Error("Selected agent email not found for verification.");

                    console.log(`Verifying agent: ${agent.email}`);
                    const { error: signInError } = await supabase.auth.signInWithPassword({
                        email: agent.email,
                        password: formData.agentPassword
                    });

                    if (signInError) {
                        throw new Error("Agent verification failed: Invalid password.");
                    }

                    // Sign out immediately to clear agent session so we can create the new user
                    await supabase.auth.signOut();
                }

                // 1. Sign Up User
                console.log("Signing up user...");
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.customerName,
                        }
                    }
                });

                if (authError) throw authError;

                if (authData.user) {
                    // 2. Create Profile (Role: Member)
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: authData.user.id,
                            email: formData.email,
                            full_name: formData.customerName,
                            role: 'member'
                        });

                    if (profileError) console.error("Profile creation error:", profileError);

                    // 3. Create Lead
                    await insertLead(authData.user.id, memberPhotoUrl, spousePhotoUrl);
                }
            }
            // Case 2: Admin Flow (Dashboard) - Just insert lead
            else {
                await insertLead(null, memberPhotoUrl, spousePhotoUrl);
            }

            setSuccess(true);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Submission error:", err);
            alert("Submission failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const insertLead = async (userId, memberPhotoUrl, spousePhotoUrl) => {
        const payload = {
            created_by: userId || null,
            customer_name: formData.customerName,
            age: formData.age ? parseInt(formData.age) : null,
            address: formData.address,
            phone_number: formData.phone,
            email: formData.email,
            registration_type: formData.registrationType,
            agent_id: formData.agentId || null,

            member_name: formData.memberName || formData.customerName,
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

            payment_mode: (formData.agentId || isAdminFlow) ? formData.paymentMode : null,
            cheque_number: (formData.agentId || isAdminFlow) ? formData.chequeNumber : null,
            payment_date: ((formData.agentId || isAdminFlow) && formData.paymentDate) ? formData.paymentDate : null,
            bank_name: (formData.agentId || isAdminFlow) ? formData.bankName : null,

            photo_url_member: memberPhotoUrl,
            photo_url_spouse: spousePhotoUrl,

            declaration_info: formData.declarationInfo,
            declaration_rules: formData.declarationRules,

            status: 'new',
            payment_status: (formData.agentId || isAdminFlow) ? 'received' : 'pending'
        };

        const { error: leadError } = await supabase.from('leads').insert([payload]);
        if (leadError) throw leadError;
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
                    <h3 className="text-xl font-bold text-green-900">Success!</h3>
                    <p className="text-green-700 mt-2">
                        {isAdminFlow
                            ? "Registration completed successfully."
                            : "Account created and application submitted. You can login once approved."}
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                        {!isAdminFlow && (
                            <Button onClick={() => navigate('/login')} className="bg-green-600 hover:bg-green-700">
                                Login Now
                            </Button>
                        )}
                        {isAdminFlow && (
                            <Button onClick={() => setSuccess(false)} variant="outline">
                                Register Another
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Account Info - Hidden in Admin Flow if preferred, but usually keep email */}
            {!isAdminFlow && (
                <div className="p-4 bg-slate-50 rounded-lg space-y-4 border">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" /> Account Credentials
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Email Address *</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                required
                                placeholder="you@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Password *</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => updateField('password', e.target.value)}
                                    required
                                    placeholder="Create a password"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground">Min. 6 characters</p>
                        </div>
                    </div>

                    {/* Agent Selection */}
                    <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-2">
                            <Label>Agent / Referral (Optional)</Label>
                            <Select value={formData.agentId} onValueChange={(val) => updateField('agentId', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Agent if applicable" />
                                </SelectTrigger>
                                <SelectContent>
                                    {agents.map((agent) => (
                                        <SelectItem key={agent.id} value={agent.id}>
                                            {agent.full_name || agent.email} ({agent.role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {formData.agentId && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-amber-600 flex items-center gap-1">
                                    <Shield className="h-3 w-3" /> Agent Verification Required
                                </Label>
                                <Input
                                    type="password"
                                    value={formData.agentPassword}
                                    onChange={(e) => updateField('agentPassword', e.target.value)}
                                    placeholder="Enter Agent Login Password to Verify"
                                    className="border-amber-200 focus:border-amber-500"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Please ask the agent to enter their password to confirm this referral.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Section 1: Basic Info */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input value={formData.customerName} onChange={(e) => updateField('customerName', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Age</Label>
                        <Input type="number" value={formData.age} onChange={(e) => updateField('age', e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Address *</Label>
                    <Textarea value={formData.address} onChange={(e) => updateField('address', e.target.value)} required />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Phone Number *</Label>
                        <Input value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Membership Type</Label>
                        <Select value={formData.registrationType} onValueChange={(val) => updateField('registrationType', val)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="individual">Individual</SelectItem>
                                <SelectItem value="couple">Couple</SelectItem>
                                <SelectItem value="family">Family</SelectItem>
                                <SelectItem value="agent">Agent</SelectItem>
                                <SelectItem value="myself">Myself (Legacy)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Photo Upload Section */}
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Camera className="h-5 w-5 text-primary" /> Profile Photo(s)
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Member Photo */}
                        <div className="space-y-2">
                            <Label>{(formData.registrationType === 'couple' || formData.registrationType === 'family') ? 'Member Photo' : 'Your Photo'} *</Label>
                            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-slate-50 transition-colors relative">
                                {photoPreviews.member ? (
                                    <div className="relative group">
                                        <img src={photoPreviews.member} alt="Member preview" className="h-32 w-32 object-cover rounded-full border-4 border-white shadow-md" />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto('member')}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center gap-2">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <span className="text-sm text-muted-foreground font-medium">Click to upload photo</span>
                                        <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoChange(e, 'member')} />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Spouse Photo - Only for Couple/Family */}
                        {(formData.registrationType === 'couple' || formData.registrationType === 'family') && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-right-4">
                                <Label>Spouse Photo *</Label>
                                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-slate-50 transition-colors relative">
                                    {photoPreviews.spouse ? (
                                        <div className="relative group">
                                            <img src={photoPreviews.spouse} alt="Spouse preview" className="h-32 w-32 object-cover rounded-full border-4 border-white shadow-md" />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto('spouse')}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center gap-2">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Upload className="h-6 w-6" />
                                            </div>
                                            <span className="text-sm text-muted-foreground font-medium">Click to upload spouse photo</span>
                                            <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoChange(e, 'spouse')} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Section 2: Relative / Guardian */}
            <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">Details of Relative / Local Guardian</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={formData.relativeName} onChange={(e) => updateField('relativeName', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Relationship</Label>
                        <Input value={formData.relationship} onChange={(e) => updateField('relationship', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Contact Number</Label>
                        <Input value={formData.relativePhone} onChange={(e) => updateField('relativePhone', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={formData.relativeEmail} onChange={(e) => updateField('relativeEmail', e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Section 3: Preferences */}
            <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">Communication Preferences</h3>
                <div className="space-y-2">
                    <Label>Update Frequency</Label>
                    <Select value={formData.updateFrequency} onValueChange={(val) => updateField('updateFrequency', val)}>
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
                        {['whatsapp', 'email', 'phone'].map(mode => (
                            <div key={mode} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`comm-${mode}`}
                                    checked={formData.communicationMode.includes(mode)}
                                    onCheckedChange={(checked) => handleCheckboxArrayUpdate('communicationMode', mode, checked)}
                                />
                                <Label htmlFor={`comm-${mode}`} className="capitalize">{mode}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    <Label>Areas of Support Required</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {['Health updates', 'Medication reminders', 'Outing / trip arrangements', 'Bill payments', 'General Companionship'].map((area) => (
                            <div key={area} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`support-${area}`}
                                    checked={formData.supportAreas.includes(area)}
                                    onCheckedChange={(checked) => handleCheckboxArrayUpdate('supportAreas', area, checked)}
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
                        <Input value={formData.emergencyContactName} onChange={(e) => updateField('emergencyContactName', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Relationship</Label>
                        <Input value={formData.emergencyRelationship} onChange={(e) => updateField('emergencyRelationship', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Number</Label>
                        <Input value={formData.emergencyContactNumber} onChange={(e) => updateField('emergencyContactNumber', e.target.value)} />
                    </div>
                </div>
                <div className="flex items-center space-x-2 py-2">
                    <Checkbox
                        id="permission"
                        checked={formData.emergencyPermission}
                        onCheckedChange={(checked) => updateField('emergencyPermission', checked)}
                    />
                    <Label htmlFor="permission">I give permission to contact this person in case of an emergency.</Label>
                </div>
            </div>

            {/* Section 5: Payment (Always visible in Admin flow or if agent selected) */}
            {(isAdminFlow || formData.agentId) && (
                <div className="space-y-4 border-t pt-4 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-semibold text-lg">Payment Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Payment Mode</Label>
                            <Select value={formData.paymentMode} onValueChange={(val) => updateField('paymentMode', val)}>
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
                            <Input type="date" value={formData.paymentDate} onChange={(e) => updateField('paymentDate', e.target.value)} />
                        </div>
                    </div>
                    {formData.paymentMode === 'cheque' && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cheque Number</Label>
                                <Input value={formData.chequeNumber} onChange={(e) => updateField('chequeNumber', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Bank Name</Label>
                                <Input value={formData.bankName} onChange={(e) => updateField('bankName', e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Section 6: Declaration */}
            <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">Declaration</h3>
                <div className="flex items-start space-x-2">
                    <Checkbox
                        id="dec-info"
                        checked={formData.declarationInfo}
                        onCheckedChange={(checked) => updateField('declarationInfo', checked)}
                    />
                    <Label htmlFor="dec-info" className="text-sm">
                        I hereby declare that the information furnished above is true and correct to the best of my knowledge and belief.
                    </Label>
                </div>
                <div className="flex items-start space-x-2">
                    <Checkbox
                        id="dec-rules"
                        checked={formData.declarationRules}
                        onCheckedChange={(checked) => updateField('declarationRules', checked)}
                    />
                    <Label htmlFor="dec-rules" className="text-sm">
                        I agree to abide by the rules and regulations of the organization.
                    </Label>
                </div>
            </div>

            <Button type="submit" className="w-full text-lg h-12" disabled={loading}>
                {loading ? 'Processing...' : (isAdminFlow ? 'Register Lead' : 'Create Account & Submit')}
            </Button>
        </form>
    );
}
