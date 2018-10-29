module.exports = {
  importWorkboxFrom: "local",
  "skipWaiting": true,
  globDirectory: "dist/",
  globPatterns: ["**/*.{css,js,html,json,png}"],
  swDest: "dist/sw.js"
};
