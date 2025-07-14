const fs = require('fs');
const yaml = require('js-yaml');

try {
  const data = yaml.load(fs.readFileSync('src/coaches/coaches.yaml', 'utf8'));
  
  console.log(`\n=== DATA CONSISTENCY REPORT ===`);
  console.log(`Analyzing ${data.length} coaches...\n`);
  
  // Collect all unique values for standardization
  const uniqueValues = {
    countries: new Set(),
    specialties: new Set(),
    companyTypes: new Set(),
    industries: new Set(),
    geographies: new Set(),
    languages: new Set(),
    tags: new Set()
  };
  
  data.forEach(coach => {
    // Countries
    if (coach.location?.country) {
      uniqueValues.countries.add(coach.location.country);
    }
    
    // Specialties
    if (coach.coaching_specialties) {
      coach.coaching_specialties.forEach(spec => uniqueValues.specialties.add(spec));
    }
    
    // Company types
    if (coach.supported_company_types) {
      coach.supported_company_types.forEach(type => uniqueValues.companyTypes.add(type));
    }
    
    // Industries
    if (coach.supported_industries) {
      coach.supported_industries.forEach(ind => uniqueValues.industries.add(ind));
    }
    
    // Geographies
    if (coach.supported_geographies) {
      coach.supported_geographies.forEach(geo => uniqueValues.geographies.add(geo));
    }
    
    // Languages
    if (coach.languages) {
      coach.languages.forEach(lang => uniqueValues.languages.add(lang));
    }
    
    // Tags
    if (coach.tags) {
      coach.tags.forEach(tag => uniqueValues.tags.add(tag));
    }
  });
  
  // Report unique values for standardization review
  console.log(`COUNTRIES (${uniqueValues.countries.size}):`);
  Array.from(uniqueValues.countries).sort().forEach(c => console.log(`  - ${c}`));
  
  console.log(`\nCOACHING SPECIALTIES (${uniqueValues.specialties.size}):`);
  Array.from(uniqueValues.specialties).sort().forEach(s => console.log(`  - ${s}`));
  
  console.log(`\nCOMPANY TYPES (${uniqueValues.companyTypes.size}):`);
  Array.from(uniqueValues.companyTypes).sort().forEach(t => console.log(`  - ${t}`));
  
  console.log(`\nINDUSTRIES (${uniqueValues.industries.size}):`);
  Array.from(uniqueValues.industries).sort().forEach(i => console.log(`  - ${i}`));
  
  console.log(`\nGEOGRAPHIES (${uniqueValues.geographies.size}):`);
  Array.from(uniqueValues.geographies).sort().forEach(g => console.log(`  - ${g}`));
  
  console.log(`\nLANGUAGES (${uniqueValues.languages.size}):`);
  Array.from(uniqueValues.languages).sort().forEach(l => console.log(`  - ${l}`));
  
  console.log(`\nTAGS (${uniqueValues.tags.size}):`);
  Array.from(uniqueValues.tags).sort().forEach(t => console.log(`  - ${t}`));
  
  // Check for potential inconsistencies
  console.log(`\n=== POTENTIAL INCONSISTENCIES ===`);
  
  // Country variations
  const countries = Array.from(uniqueValues.countries);
  const countryIssues = countries.filter(c => 
    countries.some(other => other !== c && other.toLowerCase().includes(c.toLowerCase()))
  );
  if (countryIssues.length > 0) {
    console.log(`Country name variations detected:`);
    countryIssues.forEach(c => console.log(`  - ${c}`));
  }
  
  // Specialty variations (look for similar terms)
  const specialties = Array.from(uniqueValues.specialties);
  const specDuplicates = [];
  specialties.forEach(spec => {
    const similar = specialties.filter(other => 
      other !== spec && 
      (other.toLowerCase().includes(spec.toLowerCase()) || 
       spec.toLowerCase().includes(other.toLowerCase()))
    );
    if (similar.length > 0) {
      specDuplicates.push(`${spec} <-> ${similar.join(', ')}`);
    }
  });
  
  if (specDuplicates.length > 0) {
    console.log(`\nSimilar specialties (potential duplicates):`);
    [...new Set(specDuplicates)].forEach(d => console.log(`  - ${d}`));
  }
  
} catch (e) {
  console.error('Error reading coaches data:', e.message);
}
