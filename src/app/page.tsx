import Greeter from "../components/Greeter";
import Gallery from "../components/Gallery";
import ShaderPage from "../components/ShaderPage";
import Header from "../components/Header";

export default function Home() {
    return (
        <div>
            <Header />
            <div className="flex flex-col justify-center items-center p-5">
                <Greeter />
                <ShaderPage />
            </div>
            <Gallery />
        </div>
    );
}
