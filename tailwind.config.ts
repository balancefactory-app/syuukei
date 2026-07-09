import type { Config } from "tailwindcss";

/**
 * プロトタイプ (therapy-english-coach.html) の CSS 変数パレットを
 * そのまま Tailwind のテーマトークンとして移植し、デザインの同一性を保つ。
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF6EC",
        sage: {
          DEFAULT: "#8FA888",
          light: "#E7EEE2",
          mid: "#B7C9AF",
          dark: "#5C7455",
        },
        beige: {
          DEFAULT: "#EFE5CE",
          dark: "#D9C9A2",
        },
        wood: {
          DEFAULT: "#AD8A57",
          dark: "#8A6B3E",
        },
        ink: {
          DEFAULT: "#3C392F",
          soft: "#726E5F",
        },
        warn: {
          DEFAULT: "#B5624F",
          bg: "#F4E4DE",
        },
        ok: {
          DEFAULT: "#5C7455",
          bg: "#E7EEE2",
        },
        simple: {
          bg: "#EFEAE0",
          txt: "#7A7364",
        },
        natural: {
          bg: "#E1EAE5",
          txt: "#3F6152",
        },
      },
      fontFamily: {
        serif: ["var(--font-mincho)", "Shippori Mincho", "serif"],
        sans: [
          "var(--font-gothic)",
          "Zen Kaku Gothic New",
          "Hiragino Kaku Gothic ProN",
          "Yu Gothic",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "18px",
      },
      boxShadow: {
        card: "0 2px 10px rgba(80,70,40,0.08)",
      },
      maxWidth: {
        shell: "430px",
      },
    },
  },
  plugins: [],
};

export default config;
