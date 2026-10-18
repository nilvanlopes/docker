import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    allowedHosts: ["fichamutantes.localnetwork"],
    proxy: {
      "/api": "http://fichamutantes_dev_api:3000",
    },
  },
});
