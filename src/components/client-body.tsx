"use client";

import { cn } from '@/lib/utils';
import { ReactNode, useEffect } from 'react';

interface ClientBodyProps {
    children: ReactNode;
}

export default function ClientBody({ children }: ClientBodyProps) {
    // Remove any unwanted attributes that might be added by browser extensions
    useEffect(() => {
        const body = document.body;
        if (body.hasAttribute('cz-shortcut-listen')) {
            body.removeAttribute('cz-shortcut-listen');
        }
    }, []);

    return (
        <div className={cn('font-body antialiased min-h-screen bg-background flex flex-col')}>
            {children}
        </div>
    );
}