const yaml = require("js-yaml");
const fs = require("fs");

module.exports = function(eleventyConfig) {
  // Pass through static assets (CSS, images, etc.)
  eleventyConfig.addPassthroughCopy("src/assets");

  // Add YAML data file support
  eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));

  // Set custom input/output directories
  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "coaches",
      output: "_site"
    },
    dataTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
