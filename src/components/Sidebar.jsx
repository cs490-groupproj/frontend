git import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Dumbbell, CreditCard, User, Utensils, MessageSquare } from 'lucide-react';
import React from 'react'

export default function Sidebar() {
    const links = [
        { to: '/clientDashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/coaches', icon: Users, label: 'Browse Coaches' },
        { to: '/exercises', icon: Dumbbell, label: 'Exercises' },
        { to: "/nutrition", icon: Utensils, label: "Nutrition" },
        { to: '/chat', icon: MessageSquare, label: 'Chat' },
        { to: '/payment', icon: CreditCard, label: 'Payment' },
        { to: '/profile', icon: User, label: 'Edit Profile' },
    ];

    return (
        <aside className="bg-card border-border fixed min-h-screen w-64 border-r pt-10">
            <nav className="px-6 space-y-2">
                {links.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                    : 'hover:bg-sidebar/80'
                            }`
                        }
                    >
                        <Icon size={20} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
