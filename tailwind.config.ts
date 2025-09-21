import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // Base colors from CSS variables
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Cybersecurity status colors
        status: {
          critical: {
            DEFAULT: "hsl(var(--status-critical))",
            foreground: "hsl(var(--status-critical-foreground))",
          },
          high: {
            DEFAULT: "hsl(var(--status-high))",
            foreground: "hsl(var(--status-high-foreground))",
          },
          medium: {
            DEFAULT: "hsl(var(--status-medium))",
            foreground: "hsl(var(--status-medium-foreground))",
          },
          low: {
            DEFAULT: "hsl(var(--status-low))",
            foreground: "hsl(var(--status-low-foreground))",
          },
          info: {
            DEFAULT: "hsl(var(--status-info))",
            foreground: "hsl(var(--status-info-foreground))",
          },
          success: {
            DEFAULT: "hsl(var(--status-success))",
            foreground: "hsl(var(--status-success-foreground))",
          },
          warning: {
            DEFAULT: "hsl(var(--status-warning))",
            foreground: "hsl(var(--status-warning-foreground))",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Professional border radius system
        "professional-xs": "var(--radius-xs)",
        "professional-sm": "var(--radius-sm)",
        "professional-md": "var(--radius-md)",
        "professional-lg": "var(--radius-lg)",
        "professional-xl": "var(--radius-xl)",
        "professional-2xl": "var(--radius-2xl)",
      },
      spacing: {
        // Professional spacing system (4px grid)
        "space-grid-1": "var(--spacing-1)",
        "space-grid-2": "var(--spacing-2)",
        "space-grid-3": "var(--spacing-3)",
        "space-grid-4": "var(--spacing-4)",
        "space-grid-5": "var(--spacing-5)",
        "space-grid-6": "var(--spacing-6)",
        "space-grid-8": "var(--spacing-8)",
        "space-grid-10": "var(--spacing-10)",
        "space-grid-12": "var(--spacing-12)",
        "space-grid-16": "var(--spacing-16)",
      },
      fontSize: {
        // Enterprise typography scale
        "enterprise-xs": "var(--font-size-xs)",
        "enterprise-sm": "var(--font-size-sm)",
        "enterprise-base": "var(--font-size-base)",
        "enterprise-lg": "var(--font-size-lg)",
        "enterprise-xl": "var(--font-size-xl)",
        "enterprise-2xl": "var(--font-size-2xl)",
        "enterprise-3xl": "var(--font-size-3xl)",
        "enterprise-4xl": "var(--font-size-4xl)",
      },
      boxShadow: {
        // Professional shadow system
        "professional-xs": "var(--shadow-xs)",
        "professional-sm": "var(--shadow-sm)",
        "professional-md": "var(--shadow-md)",
        "professional-lg": "var(--shadow-lg)",
        "professional-xl": "var(--shadow-xl)",
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;