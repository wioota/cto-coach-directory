const fs = require('fs');
const yaml = require('js-yaml');

try {
  const data = yaml.load(fs.readFileSync('src/coaches/coaches.yaml', 'utf8'));
  
  console.log(`\n=== DATA AUDIT REPORT ===`);
  console.log(`Total coaches: ${data.length}\n`);
  
  const issues = {
    missingEmail: [],
    missingWebsite: [],
    missingPhoto: [],
    missingCalendly: [],
    missingTimezone: [],
    missingPricing: [],
    missingTestimonials: [],
    missingArticleUrls: [],
    missingSubmissionInfo: []
  };
  
  data.forEach(coach => {
    // Check for missing critical contact info
    if (!coach.contact?.email || coach.contact.email === '') {
      issues.missingEmail.push(coach.name);
    }
    
    if (!coach.contact?.website || coach.contact.website === '') {
      issues.missingWebsite.push(coach.name);
    }
    
    if (!coach.contact?.calendly || coach.contact.calendly === '') {
      issues.missingCalendly.push(coach.name);
    }
    
    // Check for missing photo
    if (!coach.photo || coach.photo === '') {
      issues.missingPhoto.push(coach.name);
    }
    
    // Check for missing timezone
    if (!coach.location?.timezone || coach.location.timezone === '') {
      issues.missingTimezone.push(coach.name);
    }
    
    // Check for missing pricing info
    if (!coach.pricing?.currency || coach.pricing.currency === '' || 
        !coach.pricing?.range || coach.pricing.range === '') {
      issues.missingPricing.push(coach.name);
    }
    
    // Check for missing testimonials
    if (!coach.testimonials || coach.testimonials.length === 0) {
      issues.missingTestimonials.push(coach.name);
    }
    
    // Check for articles with missing URLs
    if (coach.articles && coach.articles.length > 0) {
      coach.articles.forEach(article => {
        if (!article.url || article.url === '') {
          issues.missingArticleUrls.push(`${coach.name} - "${article.title}"`);
        }
      });
    }
    
    // Check for missing submission info
    if (!coach.submission_info?.submitted_by || coach.submission_info.submitted_by === '' ||
        !coach.submission_info?.submitted_at || coach.submission_info.submitted_at === '') {
      issues.missingSubmissionInfo.push(coach.name);
    }
  });
  
  // Report findings
  Object.entries(issues).forEach(([issue, coaches]) => {
    if (coaches.length > 0) {
      console.log(`${issue.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} (${coaches.length}):`);
      coaches.forEach(name => console.log(`  - ${name}`));
      console.log('');
    }
  });
  
  // Summary stats
  console.log(`\n=== SUMMARY ===`);
  console.log(`Missing emails: ${issues.missingEmail.length}/${data.length} (${Math.round(issues.missingEmail.length/data.length*100)}%)`);
  console.log(`Missing websites: ${issues.missingWebsite.length}/${data.length} (${Math.round(issues.missingWebsite.length/data.length*100)}%)`);
  console.log(`Missing photos: ${issues.missingPhoto.length}/${data.length} (${Math.round(issues.missingPhoto.length/data.length*100)}%)`);
  console.log(`Missing booking links: ${issues.missingCalendly.length}/${data.length} (${Math.round(issues.missingCalendly.length/data.length*100)}%)`);
  console.log(`Missing pricing: ${issues.missingPricing.length}/${data.length} (${Math.round(issues.missingPricing.length/data.length*100)}%)`);
  
} catch (e) {
  console.error('Error reading coaches data:', e.message);
}
