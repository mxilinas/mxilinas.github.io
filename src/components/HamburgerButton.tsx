"use client"

import { Dispatch, SetStateAction } from "react";

export default function HamburgerButton({ open, setopenAction, width }: { open: boolean, setopenAction: Dispatch<SetStateAction<boolean>>, width: number }) {
    const strokeWidth = 2;
    const squish = 8;
    return (
        <div className={`p-3 border-1 border-[var(--foreground)] rounded-full
            transtion-all duration-500 opacity-50 hover:opacity-100`}
            onMouseDown={() => setopenAction(!open)}>
            <svg width={width} height={width} stroke="var(--foreground)" strokeWidth={strokeWidth} strokeLinecap="round"
            >
                <line x1={0} y1={0} x2={width} y2={width}
                    className="transition-all duration-500"
                    style={{ transform: open ? "" : `rotateZ(-45deg) translateX(-${strokeWidth / 2 + squish}px)` }}
                ></line>
                <line x1={width} y1={0} x2={0} y2={width}
                    className="transition-all duration-500"
                    style={{
                        transform: open ? "" : `rotateZ(45deg) translateX(-${strokeWidth / 2 + squish}px)`,
                        transformOrigin: "0% 100%"
                    }}
                ></line>
                <line x1={0} y1={width / 2} x2={width} y2={width / 2}
                    className="transition-all duration-500"
                    style={{
                        opacity: open ? "0%" : "100%",
                    }}
                ></line>
            </svg>
        </div>
    )
}
