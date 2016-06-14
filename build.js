const rollup = require('rollup');
const babel = require('rollup-plugin-babel');

rollup.rollup({
    entry: './index.js',
    external: [
        'jquery',
    ],
    plugins: [
        babel({
            exclude: 'node_modules/**',
        }),
    ],
}).then((bundle) => {
    bundle.write({
        format: 'umd',
        globals: {
            jquery: 'jQuery',
        },
        moduleId: 'jquery-csrf-token',
        moduleName: 'jqueryCsrfToken',
        dest: 'dist/jquery-csrf-token.js',
    });
}).catch((err) => {
    console.log(String(err));
    process.exit(1);
});
