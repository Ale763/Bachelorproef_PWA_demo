module.exports = {
    "globDirectory": "dist/",
    "globPatterns":
        [
            // "**/*.{css,ico,html,png,js,json,woff2}",
            "**/manifest.json",
            "**/index.html",
            "**/app.js",
            "**/about.js",
        ],
    "swSrc": "src/sw.js",
    "swDest": "public/sw.js"
};
