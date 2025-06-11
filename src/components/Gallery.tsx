import Tile from "../components/Tile";
import path from "path";
import matter from "gray-matter";
import fs from "fs";

interface PostMetadata {
    title: string;
    date: string;
    excerpt: string;
    image: string;
    tags: string[];
    demo: string;
}

export interface Post {
    slug: string;
    metadata: PostMetadata;
    content: string;
}

function getAllPosts(): Post[] {
    const postsDirectory = path.join(process.cwd(), 'src/posts');
    const dirNames = fs.readdirSync(postsDirectory);
    console.log(dirNames)

    return dirNames.map((dirName, i) => {
        const filePath = path.join(postsDirectory, dirName, "index.md");
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);
        const metadata: PostMetadata = {
            demo: data.demo,
            tags: data.tags,
            image: data.image,
            title: data.title,
            excerpt: data.excerpt,
            date: data.date,
        }
        return {
            slug: "/blog/" + dirName.replace(/\.md$/, ''),
            metadata: metadata,
            content,
        };
    });
}

export default function Gallery() {

    const posts = getAllPosts();

    return (
        <div id="gallery" className="flex justify-center items-center w-full
        md:p-5 lg:p-0 scroll-mt-40">
            <div className="inline-flex flex-col space-y-6 md:w-fit w-full 
            lg:p-0">
                <h1 className="pl-4 text-2xl">My Projects</h1>
                {posts.map((post, index) => (
                    <Tile key={post.slug} post={post} />
                ))}
            </div>
        </div>
    )
}
