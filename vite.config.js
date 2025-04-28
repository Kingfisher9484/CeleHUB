// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from "path";

// // https://vite.dev/config/
// export default defineConfig({
//   // server:{
//   //   host:"0.0.0.0",
//   //   fs:{
//   //     strict:false
//   //   },
//   // },
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "src"),
//     },
//   },
//   plugins: [react()],
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    fs: {
      strict: false,
    },
    allowedHosts: ['celehub-1.onrender.com'], // Corrected host
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [react()],
});
