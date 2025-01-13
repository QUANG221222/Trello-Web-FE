import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import viteSvgr from "vite-plugin-svgr"

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ["@emotion/react", "@emotion/styled", "@mui/material/Tooltip"]
  },
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"]
      }
    }),
    viteSvgr()
  ],
  // base: './'
  resolve: {
    alias: [{ find: "~", replacement: "/src" }]
  }
})
