import React from 'react';
import RegistrationForm from '../components/RegistrationForm';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export default function Register() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-10">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">New Membership Registration</CardTitle>
                    <CardDescription className="text-center">Admin/Staff Portal for entering new leads and applications.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RegistrationForm isAdminFlow={true} />
                </CardContent>
                <CardFooter className="justify-center border-t pt-4">
                    <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary">Back to Dashboard</Link>
                </CardFooter>
            </Card>
        </div>
    );
}
