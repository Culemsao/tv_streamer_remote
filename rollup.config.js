import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/google-tv-remote-card.ts",

  output: {
    file: "google-tv-remote-card.js",
    format: "es",
    sourcemap: false,
  },

  plugins: [
    resolve({
      browser: true,
      exportConditions: ["browser", "module", "import", "default"],
      dedupe: ["lit"]
    }),
    commonjs(),
    typescript()
  ],
};
