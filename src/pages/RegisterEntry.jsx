import React from 'react';
import RegistrationForm from '../components/RegistrationForm';

export default function RegisterEntry() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">New Member Registration</h1>
            </div>
            
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <RegistrationForm />
            </div>
        </div>
    );
}
