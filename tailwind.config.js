/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                'main': '#0a0a0a',
                'secondary': '#1a1a1a',
                'main-card': '#262626',
                'main-border': '#404040',
                'complementary-main': '#6c6a6a',
                'complementary-secondary': '#e5e5e5',
                'opposite': '#f5f5f5',
                'opposite-secondary': '#e5e5e5',
                'accent-blue': '#3b82f6',
                'accent-red': '#ef4444',
                'accent-yellow': '#f59e0b',
                'accent-green': '#10b981'
            }
        }
    },
    darkMode: 'selector',
    plugins: [require('@tailwindcss/forms')]
}
