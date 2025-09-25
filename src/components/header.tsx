
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Info, Users, Calendar, PenSquare, LayoutGrid, LogOut, LogIn, ShieldCheck, ChevronRight } from 'lucide-react';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


const Header = () => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isAdmin, signInWithGoogle, logout } = useAuth();
  
  const isStaticMode = process.env.NEXT_PUBLIC_STATIC_MODE === 'true';

  const isHomePage = pathname === '/';
  const isEventPage = pathname.startsWith('/events/') && pathname.split('/').length > 2 && !pathname.endsWith('/schedule');
  const eventId = isEventPage ? pathname.split('/')[2] : '';

  // Determine if the page has a transparent nav by default (i.e. has a hero banner)
  const isTransparentNavPage = isHomePage || isEventPage;
  
  const mainNavLinks = [
    { href: '/events', label: 'Tất cả sự kiện', icon: LayoutGrid },
    { href: '/gioi-thieu', label: 'Về CLB', icon: Users },
  ];

  const contextualNavLinks = (isHomePage || isEventPage) ? [
    { href: isHomePage ? '#about' : `/events/${eventId}#about`, label: 'Giới thiệu', icon: Info },
    { href: isHomePage ? '#speakers' : `/events/${eventId}#speakers`, label: 'Diễn giả', icon: Users },
    { href: isHomePage ? '#schedule' : `/events/${eventId}#schedule`, label: 'Lịch trình', icon: Calendar },
    { href: isHomePage ? '#form' : `/events/${eventId}#form`, label: 'Đăng ký', icon: PenSquare },
  ] : [];


  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinkClasses = cn(
    "flex items-center gap-2 text-sm font-medium transition-colors",
    (hasScrolled || !isTransparentNavPage)
        ? "text-muted-foreground hover:text-primary"
        : "text-white/80 hover:text-white"
  );
  

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full transition-all duration-300",
      (hasScrolled || !isTransparentNavPage)
        ? "bg-background/95 backdrop-blur-sm border-b shadow-sm"
        : "bg-transparent border-b-transparent",
    )}>
      <div className={cn(
        "container flex items-center justify-between transition-all duration-300",
        hasScrolled ? "h-16" : "h-20"
      )}>
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          {contextualNavLinks.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClasses}>
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
           <Link href="/events" className={navLinkClasses}>
              <LayoutGrid className="w-4 h-4" />
              Tất cả sự kiện
            </Link>
        </nav>
        <div className="flex items-center gap-4">
           {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && !isStaticMode && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Trang Admin</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Button
              variant="ghost"
              className={cn(
                "hidden md:flex",
                (hasScrolled || !isTransparentNavPage)
                  ? "text-foreground hover:text-accent-foreground"
                  : "text-white hover:bg-white/10 hover:text-white"
              )}
              onClick={signInWithGoogle}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Đăng nhập
            </Button>
          )}

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      (hasScrolled || !isTransparentNavPage) 
                        ? "" 
                        : "text-white hover:text-white hover:bg-white/10"
                    )} 
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Mở menu</span>
                  </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-sm">
                  <SheetHeader className="mb-8">
                     <Logo />
                     <SheetTitle className="sr-only">Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1">
                    {[...contextualNavLinks, ...mainNavLinks].map((link, index) => (
                      <SheetTrigger asChild key={link.href + index}>
                        <Link href={link.href} className="flex items-center justify-between gap-2 text-lg font-medium text-muted-foreground transition-colors hover:text-primary rounded-md px-3 py-3 hover:bg-muted">
                           <div className='flex items-center gap-4'>
                              <link.icon className="w-5 h-5" />
                              {link.label}
                           </div>
                           <ChevronRight className="w-5 h-5" />
                        </Link>
                      </SheetTrigger>
                    ))}
                    <DropdownMenuSeparator className='my-4'/>
                    {!user ? (
                        <SheetTrigger asChild>
                             <Button variant="ghost" onClick={() => { signInWithGoogle(); }} className="justify-start px-3 py-6 text-lg rounded-md hover:bg-primary hover:text-primary-foreground">
                                <LogIn className="mr-4 h-5 w-5" />
                                Đăng nhập
                            </Button>
                        </SheetTrigger>
                    ) : (
                        <SheetTrigger asChild>
                             <Button variant="ghost" onClick={() => { logout(); }} className="justify-start px-3 py-6 text-lg rounded-md hover:bg-destructive hover:text-destructive-foreground">
                                <LogOut className="mr-4 h-5 w-5" />
                                Đăng xuất
                            </Button>
                        </SheetTrigger>
                    )}
                  </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
