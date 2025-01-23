import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'card-background': "var(--card-background)",
        'card-hover': "var(--card-hover)",
        'card-border': "var(--card-border)",
        'text-primary': "var(--text-primary)",
        'text-secondary': "var(--text-secondary)",
        'accent': "var(--accent)",
        'accent-hover': "var(--accent-hover)",
      },
    },
  },
  plugins: [],
} satisfies Config;
