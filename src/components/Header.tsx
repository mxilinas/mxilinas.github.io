"use client"

import { Major_Mono_Display } from 'next/font/google';
import { useEffect, useCallback, useRef, useState } from 'react';
import HamburgerButton from "../components/HamburgerButton";
import Link from 'next/link';
import "../app/globals.css";

const mmd = Major_Mono_Display({ weight: "400", subsets: ["latin"] })

function HeaderLink({ children, link }: { children: React.ReactNode, link: string }) {
    return (
        <Link href={link} className="select-none w-full h-20 flex items-center text-center text-nowrap pl-5 cursor-pointer hover:underline">
            {children}
        </Link>
    )
}

export default function Header() {

    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true)
    }, [])

    const [height, setHeight] = useState(0);
    const [open, setopen] = useState(false);
    const transition = useRef("none");
    const pressCount = useRef(0);

    // Used to set the height when the element enters the DOM.
    const linksRef = useCallback((node: HTMLDivElement) => {
        if (node) {
            setHeight(open ? 0 : -node.clientHeight);
            pressCount.current += 1;
            if (pressCount.current > 2)
                transition.current = "all 0.5s ease";
        }
    }, [open]);

    const links = (
        <div
            ref={linksRef}
            className={`select-none duration-500 bg-[var(--background-secondary)] 
            pl-0 pr-0 flex flex-col md:items-right right-0 absolute w-svw 
            md:w-1/6 justify-center text-xl md:text-sm
            border-[var(--background-darker)] border-b-1`}
            style={{
                transform: `translateY(${height}px)`,
                transition: transition.current,
                opacity: open ? "100%" : "0%",
            }}
        >
            <HeaderLink link="/#gallery">📂 Projects</HeaderLink>
            <hr className="w-full text-[var(--background-darker)]" />
            <HeaderLink link="/">👤 About</HeaderLink>
            <hr className="w-full text-[var(--background-darker)]" />
        </div>
    )

    if (!isClient) return;

    return (
        <div className="sticky top-0 w-full z-[100]">
            <div className={`relative flex bg-[var(--background)] z-[100] 
                items-center space-x-8 p-8 border-[var(--background-darker)] border-b-1`}>
                <Link
                    href="/"
                    className={`transition-all
                        duration-500
                        text-4xl
                        w-fit
                        top-0 
                        ${mmd.className}
                        cursor-pointer
                        opacity-50
                        hover:opacity-100 
                        select-none`
                    }>
                    MX</Link>
                <div id="spacer" className="w-full"></div>
                <HamburgerButton width={30} open={open} setopenAction={setopen} />
            </div>
            {links}
        </div>
    )
}
