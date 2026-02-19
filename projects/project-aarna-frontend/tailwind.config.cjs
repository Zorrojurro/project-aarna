/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                ocean: {
                    50: '#eef9ff',
                    100: '#d8f1ff',
                    200: '#b9e8ff',
                    300: '#89dbff',
                    400: '#51c5ff',
                    500: '#29a5ff',
                    600: '#1185ff',
                    700: '#0a6deb',
                    800: '#0f57be',
                    900: '#134b95',
                    950: '#112e5a',
                },
                coral: {
                    50: '#fff5ed',
                    100: '#ffe8d4',
                    200: '#ffcda9',
                    300: '#ffab72',
                    400: '#ff7f39',
                    500: '#ff5d13',
                    600: '#f04009',
                    700: '#c72e0a',
                    800: '#9e2610',
                    900: '#802311',
                },
                seagrass: {
                    50: '#eefff4',
                    100: '#d7ffe8',
                    200: '#b2ffd2',
                    300: '#76ffaf',
                    400: '#33f584',
                    500: '#09de62',
                    600: '#01b94e',
                    700: '#059140',
                    800: '#0a7136',
                    900: '#0a5d2e',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Space Grotesk', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [require('daisyui')],
    daisyui: {
        themes: [
            {
                aarna: {
                    primary: '#0a6deb',
                    secondary: '#09de62',
                    accent: '#ff5d13',
                    neutral: '#112e5a',
                    'base-100': '#0b1222',
                    'base-200': '#0f1a2e',
                    'base-300': '#152238',
                    info: '#29a5ff',
                    success: '#09de62',
                    warning: '#ff7f39',
                    error: '#f04009',
                },
            },
        ],
    },
}
