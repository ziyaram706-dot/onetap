import React, { useState } from 'react';
import { supabase } from './supabaseClient';

function App() {
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        address: '',
        phone: '',
        email: '',
        membershipType: '',
        paymentMode: '',
        chequeNumber: '',
        paymentDate: '',
        bankName: '',
        memberName: '',
        relativeName: '',
        relationship: '',
        contactNumber: '',
        relativeEmail: '',
        updateFrequency: '',
        communicationMode: [],
        supportAreas: [],
        emergencyContactName: '',
        emergencyRelationship: '',
        emergencyContactNumber: '',
        emergencyPermission: '',
        authorizedPerson: '',
        declarationInfo: false,
        declarationRules: false
    });

    const [photos, setPhotos] = useState({
        member: null,
        spouse: null
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            // Handle arrays for multiple checkboxes (like supportAreas)
            if (name === 'supportAreas' || name === 'communicationMode') {
                const currentArray = formData[name] || [];
                if (checked) {
                    setFormData({ ...formData, [name]: [...currentArray, value] });
                } else {
                    setFormData({ ...formData, [name]: currentArray.filter(item => item !== value) });
                }
            } else {
                setFormData({ ...formData, [name]: checked });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handlePhotoChange = (e, type) => {
        if (e.target.files && e.target.files[0]) {
            setPhotos(prev => ({ ...prev, [type]: e.target.files[0] }));
        }
    };

    const uploadPhoto = async (file) => {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
            .from('member-photos')
            .upload(filePath, file);

        if (error) {
            console.error('Error uploading photo:', error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('member-photos')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Upload photos first
            let memberPhotoUrl = null;
            let spousePhotoUrl = null;

            if (photos.member) {
                memberPhotoUrl = await uploadPhoto(photos.member);
            }
            if (photos.spouse && formData.membershipType === 'couple') {
                spousePhotoUrl = await uploadPhoto(photos.spouse);
            }

            // Sanitize form data: convert empty strings to null for date fields and others
            const sanitizedData = Object.fromEntries(
                Object.entries(formData).map(([key, value]) => {
                    if (value === '') return [key, null];
                    return [key, value];
                })
            );

            // Add photo URLs to data
            sanitizedData.photo_url_member = memberPhotoUrl;
            sanitizedData.photo_url_spouse = spousePhotoUrl;

            const { data, error } = await supabase
                .from('membership_applications')
                .insert([sanitizedData]);

            if (error) throw error;

            alert('Application Submitted Successfully!');
            console.log('Success:', data);

            // Optional: Reset form or redirect
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error submitting application. Please try again. ' + (error.message || ''));
        }
    };

    const scrollToForm = (type) => {
        setFormData(prev => ({ ...prev, membershipType: type }));
        const element = document.getElementById('contact');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div>
            {/* Header */}
            <header>
                <div className="container">
                    <nav>
                        <div className="logo">OneTap Help</div>
                        <div className="nav-links">
                            <a href="#about">About</a>
                            <a href="#services">Services</a>
                            <a href="#membership">Membership</a>
                            <a href="#team">Team</a>
                            <a href="#contact" className="btn btn-primary">Join Now</a>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <h1>ALWAYS WITH YOU</h1>
                    <p>Support for elderly individuals with dignity, safety, and human connection. Ensuring elders are never alone and families have complete peace of mind.</p>
                    <a href="#contact" className="btn btn-primary">Get Started</a>
                    <a href="#services" className="btn btn-accent" style={{ marginLeft: '1rem' }}>Our Services</a>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="container">
                <div className="text-center mb-4">
                    <h2 className="section-title">About OneTap Help</h2>
                    <p style={{ maxWidth: '800px', margin: '0 auto', color: '#4B5563' }}>
                        OneTap Help is a senior companionship and assistance service created to support elderly individuals. We offer reliable, on-demand support for senior citizens, including hospital visits, outings, daily assistance, and meaningful companionship.
                    </p>
                    <br />
                    <p style={{ fontWeight: 600, color: 'var(--primary-color)' }}>OneTap Help is not just a service. It is a commitment to be present.</p>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" style={{ backgroundColor: 'var(--white)' }}>
                <div className="container">
                    <h2 className="section-title">Our Services</h2>
                    <div className="services-grid">
                        <div className="service-card">
                            <div className="service-icon">🏥</div>
                            <h3>Hospital Visits</h3>
                            <p>Assistance with medical appointments and hospital visits to ensure safety and comfort.</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon">🌳</div>
                            <h3>Assisted Outings</h3>
                            <p>Walks in the park, temple visits, movies, and running errands with a trusted companion.</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon">🤝</div>
                            <h3>Companionship</h3>
                            <p>Meaningful conversation and emotional support to combat loneliness.</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon">🚨</div>
                            <h3>Emergency Assistance</h3>
                            <p>On-call support for emergencies, giving families peace of mind.</p>
                        </div>
                    </div>
                    <div className="text-center" style={{ marginTop: '3rem' }}>
                        <p>All caregivers are trained and background verified. Families receive regular updates.</p>
                    </div>
                </div>
            </section>

            {/* Membership Section */}
            <section id="membership" style={{ backgroundColor: '#F9FAFB', padding: '4rem 2rem' }}>
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="section-title">Membership Plans</h2>
                        <p style={{ color: '#6B7280' }}>Join our community and enjoy exclusive benefits all year round</p>
                    </div>

                    <div className="pricing-grid">
                        {/* Individual Plan */}
                        <div className="pricing-card">
                            <h3 className="plan-title">Individual</h3>
                            <div className="plan-price">
                                <span className="currency">₹</span>1000
                                <span className="period">/ PER YEAR</span>
                            </div>
                            <ul className="plan-features">
                                <li><span className="check">✓</span> All service discounts</li>
                                <li><span className="check">✓</span> Priority booking</li>
                                <li><span className="check">✓</span> Tour participation</li>
                                <li><span className="check">✓</span> Workshop access</li>
                                <li><span className="check">✓</span> Family updates</li>
                            </ul>
                            <button
                                className="btn btn-outline"
                                onClick={() => scrollToForm('individual')}
                            >
                                CHOOSE INDIVIDUAL
                            </button>
                        </div>

                        {/* Couple Plan */}
                        <div className="pricing-card">
                            <h3 className="plan-title">Couple</h3>
                            <div className="plan-price">
                                <span className="currency">₹</span>1750
                                <span className="period">/ PER YEAR</span>
                            </div>
                            <ul className="plan-features">
                                <li><span className="check">✓</span> All service discounts for both</li>
                                <li><span className="check">✓</span> Joint activity participation</li>
                                <li><span className="check">✓</span> Shared tour experiences</li>
                                <li><span className="check">✓</span> Workshop access for two</li>
                                <li><span className="check">✓</span> Regular family updates</li>
                            </ul>
                            <button
                                className="btn btn-primary-dark"
                                onClick={() => scrollToForm('couple')}
                            >
                                CHOOSE COUPLE
                            </button>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <p style={{ fontSize: '0.9rem', color: '#6B7280' }}>* Non-members can avail services at standard pricing without discounts.</p>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section id="team" style={{ backgroundColor: 'var(--white)' }}>
                <div className="container">
                    <h2 className="section-title">Our Team</h2>
                    <div className="team-grid">
                        <div className="team-card">
                            <h3>Laila Beevi</h3>
                            <p className="team-role">Managing Director</p>
                        </div>
                        <div className="team-card">
                            <h3>Abhiram P Mohan</h3>
                            <p className="team-role">CEO</p>
                        </div>
                        <div className="team-card">
                            <h3>Fousiya I</h3>
                            <p className="team-role">PRO</p>
                        </div>
                        <div className="team-card">
                            <h3>Ajith Kumar</h3>
                            <p className="team-role">Marketing Head</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Application Form Section */}
            <section id="contact" className="form-section">
                <div className="container">
                    <h2 className="section-title" style={{ color: 'var(--white)' }}>Join Golden Moments</h2>
                    <div className="form-container">
                        <div className="text-center mb-4">
                            <h3>Membership Application & Family Contact Form</h3>
                            <p>Please fill out the details below to register.</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Section 1 */}
                            <div className="form-section-header">Section 1: Member Personal Details</div>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" name="fullName" className="form-control" onChange={handleInputChange} placeholder="Enter full name" />
                            </div>
                            <div className="form-group">
                                <label>Age</label>
                                <input type="number" name="age" className="form-control" onChange={handleInputChange} placeholder="Enter age" />
                            </div>
                            <div className="form-group">
                                <label>Residential Address</label>
                                <textarea name="address" className="form-control" rows="3" onChange={handleInputChange} placeholder="Enter address"></textarea>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input type="tel" name="phone" className="form-control" onChange={handleInputChange} placeholder="Enter phone number" />
                                </div>
                                <div className="form-group">
                                    <label>Email ID</label>
                                    <input type="email" name="email" className="form-control" onChange={handleInputChange} placeholder="Enter email" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Member Photo</label>
                                <input type="file" accept="image/*" className="form-control" onChange={(e) => handlePhotoChange(e, 'member')} />
                                <small style={{ color: '#6B7280' }}>Upload a recent passport size photo.</small>
                            </div>

                            {/* Section 2 */}
                            <div className="form-section-header">Section 2: Membership Details</div>
                            <div className="form-group">
                                <label>Membership Type</label>
                                <div className="checkbox-group">
                                    <label className="checkbox-item"><input type="radio" name="membershipType" value="individual" checked={formData.membershipType === 'individual'} onChange={handleInputChange} /> Individual (₹1000/yr)</label>
                                    <label className="checkbox-item"><input type="radio" name="membershipType" value="couple" checked={formData.membershipType === 'couple'} onChange={handleInputChange} /> Couple (₹1750/yr)</label>
                                </div>
                                {formData.membershipType === 'couple' && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <label>Spouse / Partner Photo</label>
                                        <input type="file" accept="image/*" className="form-control" onChange={(e) => handlePhotoChange(e, 'spouse')} />
                                        <small style={{ color: '#6B7280' }}>Upload a recent photo of your spouse/partner.</small>
                                    </div>
                                )}
                            </div>

                            {/* Section 3 */}
                            <div className="form-section-header">Section 3: Payment Details</div>
                            <div className="form-group">
                                <label>Payment Mode</label>
                                <div className="checkbox-group">
                                    <label className="checkbox-item"><input type="radio" name="paymentMode" value="cash" onChange={handleInputChange} /> Cash</label>
                                    <label className="checkbox-item"><input type="radio" name="paymentMode" value="cheque" onChange={handleInputChange} /> Cheque</label>
                                    <label className="checkbox-item"><input type="radio" name="paymentMode" value="online" onChange={handleInputChange} /> Online Transfer</label>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Cheque / DD Number</label>
                                    <input type="text" name="chequeNumber" className="form-control" onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Date of Payment</label>
                                    <input type="date" name="paymentDate" className="form-control" onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Bank Name</label>
                                <input type="text" name="bankName" className="form-control" onChange={handleInputChange} />
                            </div>

                            {/* Section 4 */}
                            <div className="form-section-header">Section 4: Relative / Family Contact Details</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Member's Name</label>
                                    <input type="text" name="memberName" className="form-control" onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Relative's Name</label>
                                    <input type="text" name="relativeName" className="form-control" onChange={handleInputChange} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Relationship</label>
                                    <input type="text" name="relationship" className="form-control" onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Contact Number</label>
                                    <input type="tel" name="contactNumber" className="form-control" onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Relative's Email ID</label>
                                <input type="email" name="relativeEmail" className="form-control" onChange={handleInputChange} />
                            </div>

                            {/* Section 5 */}
                            <div className="form-section-header">Section 5: Concerns & Support Requirements</div>
                            <div className="form-group">
                                <label>Frequency of Updates Required</label>
                                <div className="checkbox-group">
                                    <label className="checkbox-item"><input type="radio" name="updateFrequency" value="daily" onChange={handleInputChange} /> Daily</label>
                                    <label className="checkbox-item"><input type="radio" name="updateFrequency" value="weekly" onChange={handleInputChange} /> Weekly</label>
                                    <label className="checkbox-item"><input type="radio" name="updateFrequency" value="monthly" onChange={handleInputChange} /> Monthly</label>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Preferred Mode of Communication</label>
                                <div className="checkbox-group">
                                    <label className="checkbox-item"><input type="checkbox" name="communicationMode" value="phone" onChange={handleInputChange} /> Phone</label>
                                    <label className="checkbox-item"><input type="checkbox" name="communicationMode" value="email" onChange={handleInputChange} /> Email</label>
                                    <label className="checkbox-item"><input type="checkbox" name="communicationMode" value="whatsapp" onChange={handleInputChange} /> WhatsApp</label>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Specific Areas of Support</label>
                                <div className="checkbox-group" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                                    {['Health updates', 'Financial transactions', 'Outing / trip arrangements', 'Medication reminders', 'Companionship / conversation'].map(area => (
                                        <label key={area} className="checkbox-item">
                                            <input type="checkbox" name="supportAreas" value={area} onChange={handleInputChange} /> {area}
                                        </label>
                                    ))}
                                    <label className="checkbox-item"><input type="checkbox" /> Other <input type="text" className="form-control" style={{ width: '200px', display: 'inline-block', padding: '0.25rem', marginLeft: '0.5rem' }} /></label>
                                </div>
                            </div>


                            {/* Section 6 */}
                            <div className="form-section-header">Section 6: Emergency Contact Details</div>
                            <div className="form-group">
                                <label>Emergency Contact Name</label>
                                <input type="text" name="emergencyContactName" className="form-control" onChange={handleInputChange} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Relationship</label>
                                    <input type="text" name="emergencyRelationship" className="form-control" onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Contact Number</label>
                                    <input type="tel" name="emergencyContactNumber" className="form-control" onChange={handleInputChange} />
                                </div>
                            </div>

                            {/* Section 7 */}
                            <div className="form-section-header">Section 7: Permission for Emergency Decisions</div>
                            <div className="form-group">
                                <p className="mb-2">Do you grant permission to Golden Moments Senior Citizens Group to take emergency decisions on behalf of the member?</p>
                                <div className="checkbox-group">
                                    <label className="checkbox-item"><input type="radio" name="emergencyPermission" value="yes" onChange={handleInputChange} /> Yes</label>
                                    <label className="checkbox-item"><input type="radio" name="emergencyPermission" value="no" onChange={handleInputChange} /> No</label>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>If yes, name of authorized person</label>
                                <input type="text" name="authorizedPerson" className="form-control" onChange={handleInputChange} />
                            </div>

                            {/* Declaration */}
                            <div style={{ background: '#F3F4F6', padding: '1.5rem', borderRadius: '0.5rem', marginTop: '2rem' }}>
                                <h4 className="mb-2">Declaration</h4>
                                <p className="mb-2"><input type="checkbox" name="declarationInfo" required onChange={handleInputChange} /> I hereby confirm that the information provided above is true and accurate.</p>
                                <p className="mb-2"><input type="checkbox" name="declarationRules" required onChange={handleInputChange} /> I agree to abide by the rules and regulations of Golden Moments Senior Citizens Group.</p>
                            </div>

                            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>Submit Application</button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer>
                <div className="container">
                    <div className="footer-content">
                        <div>
                            <div className="footer-logo">OneTap Help</div>
                            <p>Always With You</p>
                        </div>
                        <div className="contact-info">
                            <h4 style={{ color: 'var(--white)', marginBottom: '1rem' }}>Contact Us</h4>
                            <p>📧 dmaid20@gmail.com</p>
                            <p>📞 7012649326, 8075460003</p>
                        </div>
                    </div>
                    <div className="copyright">
                        &copy; 2026 OneTap Help. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
