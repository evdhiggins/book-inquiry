import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'dist/bundle.js',
  },
  plugins: [
    svelte({
      // skip transitions on first load
      skipIntroByDefault: true,
      nestedTransitions: true,

      // enable run-time checks when not in production
      dev: !production,

      // extract css into separate file
      css: (css) => {
        css.write('dist/bundle.css');
      },
    }),

    resolve(),
    commonjs(),

    // minify production build
    production && terser(),
  ],
};
