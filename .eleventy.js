const yaml = require("js-yaml");
const fs = require("fs");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

module.exports = function(eleventyConfig) {
  // Pass through static assets (CSS, images, etc.)
  eleventyConfig.addPassthroughCopy("assets");

  // Load the JSON schema for coaches
  const coachSchemaSource = 'cto_coaches.jsonschema.json';
  let coachSchema;
  try {
    coachSchema = JSON.parse(fs.readFileSync(coachSchemaSource, 'utf8'));
  } catch (e) {
    console.error(`Error loading or parsing coach schema ${coachSchemaSource}:`, e);
    throw new Error(`Failed to load coach schema: ${coachSchemaSource}. Build cannot continue without a valid schema.`);
  }

  const ajv = new Ajv({ allErrors: true }); // Default strict: true is fine.
  addFormats(ajv);

  const validateCoachArray = ajv.compile(coachSchema); // Validator for the whole array of coaches
  const validateSingleCoach = ajv.compile(coachSchema.items); // Validator for a single coach object

  // Load, validate, and provide coach data from sample_coaches.yaml
  // This will make `sample_coaches` globally available in templates.
  const coachDataPath = "src/coaches/sample_coaches.yaml";
  let validatedCoaches = [];
  try {
    const fileContents = fs.readFileSync(coachDataPath, 'utf8');
    const rawCoachData = yaml.load(fileContents);

    if (Array.isArray(rawCoachData)) {
      console.log(`Validating data from ${coachDataPath}...`);
      validatedCoaches = rawCoachData.filter((coach, index) => {
        if (validateSingleCoach(coach)) {
          return true;
        } else {
          const coachIdentifier = coach.name || coach.id || `Entry at index ${index}`;
          console.warn(`[Validation Warning] Coach data for '${coachIdentifier}' is invalid and will be excluded:`);
          validateSingleCoach.errors.forEach(err => {
            console.warn(`  - ${err.instancePath || 'Root'}: ${err.message} (schema: ${err.schemaPath})`);
          });
          return false;
        }
      });
      console.log(`Validation complete for ${coachDataPath}. ${validatedCoaches.length} out of ${rawCoachData.length} entries are valid.`);
      if (validatedCoaches.length < rawCoachData.length) {
        console.warn("Some coach entries were filtered out due to validation errors. Check warnings above.");
      }

    } else {
      // This case handles if sample_coaches.yaml is not an array (which would be a schema violation itself)
      console.error(`[Validation Error] Data in ${coachDataPath} is not an array as expected by the root schema. No coach data will be loaded.`);
      validatedCoaches = []; // Ensure it's an empty array if the top-level structure is wrong
    }
  } catch (e) {
    console.error(`Error loading or parsing ${coachDataPath}:`, e);
    // Depending on severity, you might want to throw e to stop the build
    // For now, it defaults to an empty array of coaches.
    validatedCoaches = [];
  }
  eleventyConfig.addGlobalData("sample_coaches", validatedCoaches);

  // The original YAML data extension is still useful for any other YAML files
  // that are not coaches and are loaded by Eleventy's default mechanisms.
  eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));

  // Set custom input/output directories
  return {
    dir: {
      input: "src",
      includes: "_includes",
      // data: "coaches", // We are now handling src/coaches manually for validation
      output: "_site"
    },
    dataTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
