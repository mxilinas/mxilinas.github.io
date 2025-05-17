
export default function Tags({ tags }: { tags: string[] }) {
    const icons: Record<string, string> = {
        javascript: 'devicon-javascript-plain colored',
        java: 'devicon-java-plain colored',
        typescript: 'devicon-typescript-plain colored',
        react: 'devicon-react-original colored',
        nextjs: 'devicon-nextjs-original-wordmark',
        tailwind: 'devicon-tailwindcss-plain colored',
        html: 'devicon-html5-plain colored',
        css: 'devicon-css3-plain colored',
        node: 'devicon-nodejs-plain colored',
        "AI": "devicon-tensorflow-original colored",
        "godot": "devicon-godot-plain",
        python: 'devicon-python-plain colored',
        rust: 'devicon-rust-plain colored',
        'c++': 'devicon-cplusplus-plain colored',
        cpp: 'devicon-cplusplus-plain colored',
        'c#': 'devicon-csharp-plain colored',
        unity: 'devicon-unity-plain colored',
    };
    return (
        <div className="flex justify-left items-center h-10 space-x-2">
            {tags.map((tag, index) => {
                return <div key={index}
                className={
                    `flex justify-center items-center bg-[var(--steel-blue)]
                    rounded-lg
                    min-w-18 w-fit p-1 min-h-8 space-x-1 shadow-[#0000002f] shadow-lg`}>
                    <i className={icons[tag] || "devicon-plain"} />
                    <span className="font-mono font-black">{tag}</span>
                </div>
            })}
        </div>
    )
}
