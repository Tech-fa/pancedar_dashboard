/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                'main': '#ffffff',
                'secondary': '#f5f5f5',
                'main-card': '#262626',
                'main-border': '#404040',
                'complementary-main': '#E5E5E5',
                'complementary-secondary': '#e5e5e5',
                'opposite': '#0a0a0a',
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
