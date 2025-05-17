import Image from "next/image"
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import style from './markdown-styles.module.css';
import 'highlight.js/styles/github.css';
import Header from "../../../components/Header";

type Props = {
    params: Promise<{ slug: string }>
};

// Generate paths from folder names inside /posts
export async function generateStaticParams() {
    const postDirs = fs.readdirSync(path.join(process.cwd(), "src/posts"), {
        withFileTypes: true,
    }).filter(dirent => dirent.isDirectory());

    return postDirs.map((dirent) => ({
        slug: dirent.name,
    }));
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const filePath = path.join(process.cwd(), "src/posts", slug, 'index.md');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { content, data } = matter(fileContent);

    return (
        <>

            <Header />
            <div className="flex justify-center w-full p-10">
                <div className="flex w-full md:w-3/4">
                    <main className={style.reactMarkDown + " space-y-2"}>
                        <h1>{data.title}</h1>
                        <p>{data.date}</p>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                                img: ({ src = '', alt = '' }) => {
                                    if (typeof src !== "string") return;
                                    return (
                                        <span className="rounded-2xl overflow-hidden">
                                            <Image
                                                src={src}
                                                alt={alt}
                                                width={0}
                                                height={0}
                                                sizes="50vw"
                                                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                                            />
                                        </span>
                                    )
                                },
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </main>
                </div>
            </div>
        </>
    );
}
