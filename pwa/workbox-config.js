module.exports = {
    "globDirectory": "dist/",
    "globPatterns":
        [
            // "**/*.{css,ico,html,png,js,json,woff2}",
            "**/manifest.json",
            "**/index.html",
            "**/js/*",
            "**/css/*",
            "**/images/*",
            "**/img/*",
            "**/modules/*",
            "**/favicon.ico",
            "**/robots.txt",
        ],
    "swSrc": "public/precache_inject.js",
    "swDest": "public/precache.js",
    "maximumFileSizeToCacheInBytes": 10000000
};
