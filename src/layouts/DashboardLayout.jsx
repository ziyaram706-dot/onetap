import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Users,
    Phone,
    LogOut,
    Menu,
    X,
    LayoutDashboard,
    ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['super_admin', 'manager', 'telecaller', 'marketing_lead']
    },
    {
        label: 'Users',
        href: '/dashboard/users',
        icon: Users,
        roles: ['super_admin']
    },
    {
        label: 'Leads',
        href: '/dashboard/leads',
        icon: Phone,
        roles: ['super_admin', 'manager', 'telecaller', 'marketing_lead']
    },
    {
        label: 'Registration Form',
        href: '/register',
        icon: ClipboardList,
        roles: ['super_admin', 'manager', 'telecaller']
    },
    {
        label: 'Service Requests',
        href: '/dashboard/requests',
        icon: ClipboardList,
        roles: ['super_admin', 'manager']
    }
];

function Sidebar({ role, signOut, navigate, isMobile, closeMobileMenu }) {
    const location = useLocation();

    // Safety check: if role is undefined, default to empty string or handle gracefully
    const currentRole = role || '';

    const filteredNavItems = NAV_ITEMS.filter(item =>
        item.roles.includes(currentRole)
    );

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 text-white">
            <div className="p-6 border-b border-slate-700">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    OneTap Lead
                </h1>
                <p className="text-xs text-slate-400 mt-1 capitalize">Role: {currentRole.replace('_', ' ')}</p>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {filteredNavItems.map((item) => (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.href
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-slate-800 text-slate-300'
                            }`}
                        onClick={() => isMobile && closeMobileMenu && closeMobileMenu()}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-700">
                <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-800" onClick={handleSignOut}>
                    <LogOut size={20} className="mr-2" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}

export default function DashboardLayout() {
    const { user, role, signOut } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 fixed inset-y-0 left-0 z-50">
                <Sidebar
                    role={role}
                    signOut={signOut}
                    navigate={navigate}
                    isMobile={false}
                />
            </aside>

            {/* Mobile Header & Content Wrapper */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                <header className="bg-white border-b h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu size={24} />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-64 border-r-slate-800 bg-slate-900 text-white">
                                <Sidebar
                                    role={role}
                                    signOut={signOut}
                                    navigate={navigate}
                                    isMobile={true}
                                    closeMobileMenu={() => setIsMobileMenuOpen(false)}
                                />
                            </SheetContent>
                        </Sheet>
                        <h2 className="text-lg font-semibold text-slate-800 md:hidden">OneTap</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium">{user?.email}</p>
                            <p className="text-xs text-slate-500 capitalize">{role?.replace('_', ' ')}</p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Avatar>
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={async () => { await signOut(); navigate('/login'); }}>Sign Out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
