import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import replace from 'rollup-plugin-replace';

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
    replace({
      include: ['./src/store/modules/Ping.js', './src/store/modules/Items.js'],
      values: {
        ENVIRONMENT: production ? 'prod' : 'dev',
      },
    }),
    svelte({
      // skip transitions on first load
      skipIntroByDefault: false,
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
