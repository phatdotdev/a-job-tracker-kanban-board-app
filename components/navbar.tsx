"use client";

import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import Link from "next/link";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SignOutBtn from "./sign-out-btn";
import { useSession } from "@/lib/auth/auth-client";

export default function Navbar() {
    const { data: session, isPending } = useSession();
    return (
        <nav className="border-b border-gray-200 bg-white">
            <div
                className="container mx-auto flex h-16 items-center px-4 justify-between
            "
            >
                <Link
                    href="/"
                    className="flex items-center gap-2 text-xl font-semibold text-primary"
                >
                    <Briefcase />
                    <span>Job Tracker</span>
                </Link>

                <div className="flex items-center gap-4">
                    {session?.user ? (
                        <>
                            <Link href="/dashboard">
                                <Button variant="ghost">Dashboard</Button>
                            </Link>
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <Avatar>
                                        <AvatarFallback className="bg-primary text-white">
                                            {session.user.name[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-54 px-2">
                                    <DropdownMenuGroup>
                                        <div className="p-1">
                                            <p>{session.user.name}</p>
                                            <p>{session.user.email}</p>
                                        </div>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <SignOutBtn />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Link href="/sign-in">
                                <Button
                                    variant="ghost"
                                    className="text-gray-700 hover:text-black"
                                >
                                    Log In
                                </Button>
                            </Link>
                            <Link href="/sign-up">
                                <Button className="bg-primary hover:bg-primary/90">
                                    Start for free
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
