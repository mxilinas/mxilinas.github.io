import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        './app/**/*.{ts,tsx}',
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './posts/**/*.{md}',
    ],
    theme: { extend: {} },
    plugins: [typography],
};

export default config;
