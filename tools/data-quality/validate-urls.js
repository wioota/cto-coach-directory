const fs = require('fs');
const yaml = require('js-yaml');
const https = require('https');
const http = require('http');

async function checkUrl(url, timeout = 5000) {
  return new Promise((resolve) => {
    if (!url || url === '') {
      resolve({ url, status: 'empty', message: 'Empty URL' });
      return;
    }
    
    try {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const req = client.request({
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        timeout: timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; URL-Checker/1.0)'
        }
      }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ url, status: 'ok', code: res.statusCode });
        } else if (res.statusCode >= 300 && res.statusCode < 400) {
          resolve({ url, status: 'redirect', code: res.statusCode, location: res.headers.location });
        } else {
          resolve({ url, status: 'error', code: res.statusCode });
        }
      });
      
      req.on('error', (err) => {
        resolve({ url, status: 'error', message: err.message });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({ url, status: 'timeout', message: 'Request timeout' });
      });
      
      req.end();
    } catch (err) {
      resolve({ url, status: 'invalid', message: err.message });
    }
  });
}

async function validateCoachUrls() {
  try {
    const data = yaml.load(fs.readFileSync('src/coaches/coaches.yaml', 'utf8'));
    
    console.log(`\n=== URL VALIDATION REPORT ===`);
    console.log(`Checking URLs for ${data.length} coaches...\n`);
    
    const urlChecks = [];
    
    for (const coach of data) {
      // Check website
      if (coach.contact?.website) {
        urlChecks.push(checkUrl(coach.contact.website).then(result => ({
          coach: coach.name,
          type: 'website',
          ...result
        })));
      }
      
      // Check LinkedIn
      if (coach.contact?.linkedin) {
        urlChecks.push(checkUrl(coach.contact.linkedin).then(result => ({
          coach: coach.name,
          type: 'linkedin',
          ...result
        })));
      }
      
      // Check Calendly
      if (coach.contact?.calendly) {
        urlChecks.push(checkUrl(coach.contact.calendly).then(result => ({
          coach: coach.name,
          type: 'calendly',
          ...result
        })));
      }
    }
    
    const results = await Promise.all(urlChecks);
    
    // Group results by status
    const grouped = {
      ok: [],
      error: [],
      timeout: [],
      invalid: [],
      redirect: []
    };
    
    results.forEach(result => {
      grouped[result.status].push(result);
    });
    
    // Report findings
    console.log(`✅ Working URLs (${grouped.ok.length}):`);
    grouped.ok.forEach(r => console.log(`  ${r.coach} - ${r.type}: ${r.url} (${r.code})`));
    
    if (grouped.redirect.length > 0) {
      console.log(`\n🔄 Redirects (${grouped.redirect.length}):`);
      grouped.redirect.forEach(r => console.log(`  ${r.coach} - ${r.type}: ${r.url} → ${r.location || 'unknown'} (${r.code})`));
    }
    
    if (grouped.error.length > 0) {
      console.log(`\n❌ Errors (${grouped.error.length}):`);
      grouped.error.forEach(r => console.log(`  ${r.coach} - ${r.type}: ${r.url} (${r.code || r.message})`));
    }
    
    if (grouped.timeout.length > 0) {
      console.log(`\n⏰ Timeouts (${grouped.timeout.length}):`);
      grouped.timeout.forEach(r => console.log(`  ${r.coach} - ${r.type}: ${r.url}`));
    }
    
    if (grouped.invalid.length > 0) {
      console.log(`\n🚫 Invalid URLs (${grouped.invalid.length}):`);
      grouped.invalid.forEach(r => console.log(`  ${r.coach} - ${r.type}: ${r.url} (${r.message})`));
    }
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total URLs checked: ${results.length}`);
    console.log(`Working: ${grouped.ok.length}`);
    console.log(`Redirects: ${grouped.redirect.length}`);
    console.log(`Errors: ${grouped.error.length}`);
    console.log(`Timeouts: ${grouped.timeout.length}`);
    console.log(`Invalid: ${grouped.invalid.length}`);
    
  } catch (e) {
    console.error('Error:', e.message);
  }
}

validateCoachUrls();
