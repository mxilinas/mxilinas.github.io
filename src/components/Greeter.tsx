import Image from "next/image";
import { Source_Code_Pro } from 'next/font/google';

const scp = Source_Code_Pro({ subsets: ['latin'], weight: '300' });

const download_icon = <svg
    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth="1.5" stroke="currentColor" className="size-7 pr-2
    aspect-square"> <path strokeLinecap="round" strokeLinejoin="round" d="M3
    16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12
    12 16.5m0 0L7.5 12m4.5 4.5V3" />
</svg>


function Button({ children }: { children: React.ReactNode }) {
    return (
        <a
            className="absolute md:relative right-5 md:right-0 bottom-0
            select-none hang-sign cursor-pointer text-center justify-center
            items-center text-nowrap text-white bg-[#C44536] hover:bg-[#CF5C4F] rounded-sm p-4 w-40
            flex"
            href="https://docs.google.com/document/d/1czOwrs-lTAq4ViRmZDdKQBMOIy7BVwqIdzcIGbWFC1k/edit?usp=sharing"
        >{children}</a>
    )
}

export default function Greeter() {

    const cogs_link = <a className="cursor-pointer text-[#3F7CAC] hover:underline"
        href="https://cogsys.ubc.ca">cognitive systems</a>

    return (
        <div id="greeter" className="pb-25 flex flex-col md:flex-row space-x-5 space-y-5">
            <div>
                <Image
                    className="select-none aspect-square rounded-full
        border-[var(--foreground)] border-1"
                    id="headshot"
                    src="/pumpkin_head.jpg"
                    alt="headshot"
                    width={100}
                    height={100}
                />
            </div>
            <div className="relative space-y-3">
                <h1 className={`text-6xl ${scp.className}`}>Michael Xilinas</h1>
                <div className="grow-width w-3/4 h-0.5 bg-linear-30 from-[#7b7e80]
            to-transparent" />
                <h2 className={`text-2xl`}>
                    Studying {cogs_link} at the University of British Columbia</h2>
                <p className={`text-md md:text-lg md:w-3/5`}>
                    Curious about minds and machines. I use code to explore ideas in AI, physics, and cognitive science.
                </p>
                <ul className="list-disc pl-5">
                    <li>Student</li>
                    <li>Programmer</li>
                    <li>Sports Instructor</li>
                </ul>
                <div id="button-container" className="flex">
                    <Button>{download_icon} Resume</Button>
                </div>
            </div>
        </div>
    )
}
