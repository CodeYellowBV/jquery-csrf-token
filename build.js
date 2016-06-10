const rollup = require('rollup');
const babel = require('rollup-plugin-babel');

rollup.rollup({
    entry: './index.js',
    plugins: [
        babel({
            exclude: 'node_modules/**',
        }),
    ],
}).then((bundle) => {
    bundle.write({
        format: 'umd',
        moduleId: 'jquery-csrf-token',
        moduleName: 'jqueryCSRFToken',
        dest: 'dist/jquery-csrf-token.js',
    });
}).catch((err) => {
    console.log(String(err));
    process.exit(1);
});
