import rollupVue from 'rollup-plugin-vue';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonJS from 'rollup-plugin-commonjs';
import serve from 'rollup-plugin-serve';

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
        }),
        serve({
            open: true,
            contentBase: 'www'
        })
    ]
};