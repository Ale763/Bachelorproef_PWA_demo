const fs = require('fs');

module.exports = {
    devServer: {
        https: {
            key: fs.readFileSync('/Users/ale/Dropbox/localhost-cert/server.key'),
            cert: fs.readFileSync('/Users/ale/Dropbox/localhost-cert/server.crt'),
            ca: fs.readFileSync('/Users/ale/Dropbox/localhost-cert/rootCA.pem'),
        },
        publicPath: process.env.BASE_URL,
        host: 'localhost',
        disableHostCheck: true
    },
    configureWebpack: {
        devtool: 'source-map',
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
    }
}
