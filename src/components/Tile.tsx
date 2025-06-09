"use client"

import Tags from "../components/Tags"
import Image from "next/image"
import { Post } from "../components/Gallery";

function TileButton({ children, link }: { children: React.ReactNode, link: string }) {
    return (
        <a
            href={link}
            className="bg-[var(--blue)] text-white text-center rounded-sm p-2
            w-30 h-10 cursor-pointer hover:bg-[#2c95d3]">
            {children}
        </a>
    )
}

function show_demo(post: Post) {
    let mobile = window.matchMedia("(width < 90rem)").matches
    let has_demo = post.metadata.demo
    if (!mobile && has_demo) {
        return <TileButton link={post.metadata.demo}>Demo</TileButton> 
    }
}

export default function Tile({ post }: { post: Post }) {
    return (
        <div className="flex space-y-4 flex-col bg-[var(--background-secondary)]
        w-full lg:w-[60vw] h-130 md:h-100 aspect-square md:aspect-video rounded-md p-4">
            <div className="flex flex-col md:flex-row h-full 
            overflow-hidden bg-[var(--background-secondary)]">
                <div className="flex flex-col bg-[var(--background-secondary)]
                h-fit md:h-full w-full justify-center items-center
                md:items-start
                md:w-2/3 p-5 space-y-4">
                    <h1 className="text-4xl">{post.metadata.title}</h1>
                    <p id="description" className="h-full overflow-y-scroll
                    text-lg">{post.metadata.excerpt}</p>
                    <div id="tile-buttons" className="flex md:flex-row h-fit
                    md:justify-start md:items-start justify-end space-x-2">
                        <TileButton link={post.slug}>Blog</TileButton>
                        {show_demo(post)}
                    </div>
                    <Tags tags={post.metadata.tags} />
                </div>
                <div id="image-container" className="relative overflow-hidden
                bg-[var(--background-secondary)] border-3
                border-[var(--background-darker)] w-full h-full group">
                    {
                        post.metadata.image ? <Image
                            className="transition-transform w-auto duration-500
                    ease-in-out group-hover:scale-110 object-cover"
                            src={post.metadata.image}
                            alt="image"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px)
                    50vw, 33vw"
                            fill={true}
                            style={{ objectFit: "cover" }}
                        /> : null
                    }
                </div>
            </div>
        </div>
    )
}
