import rollupVue from 'rollup-plugin-vue';
import resolve from 'rollup-plugin-node-resolve';
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
        serve({
            open: true,
            contentBase: 'www'
        })
    ]
};