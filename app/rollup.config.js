import rollupVue from 'rollup-plugin-vue';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonJS from 'rollup-plugin-commonjs';
import serve from 'rollup-plugin-serve';

const shouldServe = process.env.ROLLUP_SERVE === '1';

export default {
    input: './www/js/index.js',
    output: [
        {
            file: './www/js/bundle.js',
            format: 'iife',
        },
    ],
    plugins: [
        rollupVue(),
        resolve(),
        commonJS({
            include: 'node_modules/**'
        }),
        babel({
            exclude: 'node_modules/**' // only transpile our source code
        })
    ].concat(shouldServe ? [serve({
        open: true,
        contentBase: 'www'
    })] : [])
};
