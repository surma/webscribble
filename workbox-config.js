module.exports = {
  importWorkboxFrom: "local",
  globDirectory: "dist/",
  globPatterns: ["**/*.{css,js,html}"],
  swDest: "dist/sw.js"
};
