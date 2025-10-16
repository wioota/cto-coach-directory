# URL Validation Security Fix

## Issue Identified

The current implementation in `tools/data-quality/validate-urls.js` has a security issue:

- **Cleartext Transmission of Sensitive Information**: The code uses HTTP which is an insecure protocol that transmits data in cleartext, potentially exposing sensitive information.

## Security Implications

Using HTTP instead of HTTPS has several security risks:
- Data transmitted over HTTP is not encrypted, making it vulnerable to eavesdropping
- HTTP connections are susceptible to man-in-the-middle attacks
- Sensitive information like URLs and response data could be intercepted

## Recommended Code Changes

Here's the corrected code that addresses the security issue:

```javascript
const fs = require('fs');
const yaml = require('js-yaml');
const https = require('https');
const http = require('http');

// Function to attempt upgrading HTTP URLs to HTTPS
function tryHttpsUrl(url) {
  if (url && url.startsWith('http:')) {
    const httpsUrl = url.replace(/^http:/, 'https:');
    console.warn(`⚠️  Security warning: Attempting to upgrade insecure URL from ${url} to ${httpsUrl}`);
    return httpsUrl;
  }
  return url;
}

async function checkUrl(url, timeout = 5000) {
  return new Promise((resolve) => {
    if (!url || url === '') {
      resolve({ url, status: 'empty', message: 'Empty URL' });
      return;
    }
    
    try {
      // Try to upgrade HTTP URLs to HTTPS for security
      const secureUrl = tryHttpsUrl(url);
      const urlObj = new URL(secureUrl);
      
      // Log warning if still using HTTP after attempted upgrade
      if (urlObj.protocol === 'http:') {
        console.warn(`⚠️  Security warning: Using insecure HTTP protocol for ${secureUrl}`);
      }
      
      // Prefer HTTPS, but fall back to HTTP if necessary
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
        // Track if we're using the original or upgraded URL
        const resultUrl = secureUrl !== url ? secureUrl : url;
        
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ url: resultUrl, originalUrl: url, status: 'ok', code: res.statusCode });
        } else if (res.statusCode >= 300 && res.statusCode < 400) {
          resolve({ url: resultUrl, originalUrl: url, status: 'redirect', code: res.statusCode, location: res.headers.location });
        } else {
          resolve({ url: resultUrl, originalUrl: url, status: 'error', code: res.statusCode });
        }
      });
      
      req.on('error', (err) => {
        // If HTTPS upgrade failed, try the original HTTP URL as fallback
        if (secureUrl !== url && err.message.includes('ECONNREFUSED')) {
          console.warn(`⚠️  HTTPS upgrade failed for ${secureUrl}, falling back to original HTTP URL ${url}`);
          return checkUrl(url, timeout).then(resolve);
        }
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

// Rest of the code remains the same
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
```

## Changes Made

1. **Added HTTPS Upgrade Function**: 
   - Created a new `tryHttpsUrl()` function that attempts to upgrade HTTP URLs to HTTPS
   - This provides a more secure connection when possible

2. **Added Security Warnings**:
   - Added warning logs when HTTP URLs are encountered
   - These warnings help developers identify insecure URLs

3. **Implemented Fallback Mechanism**:
   - If HTTPS upgrade fails, the code falls back to the original HTTP URL
   - This maintains compatibility while prioritizing security

4. **Enhanced Result Tracking**:
   - Added `originalUrl` field to track both the original and potentially upgraded URL
   - This provides transparency about URL modifications

## Additional Improvements

While addressing the security issue, I also identified these potential enhancements:

1. **Better Error Handling**: The code now specifically handles HTTPS upgrade failures
2. **Improved Logging**: Added clear security warnings to highlight insecure connections
3. **Maintained Compatibility**: The fallback mechanism ensures URLs still work even if HTTPS isn't available

## Implementation Notes

To implement this fix:
1. Replace the entire contents of `tools/data-quality/validate-urls.js` with the corrected code
2. Test the script with a mix of HTTP and HTTPS URLs to ensure proper functionality
3. Review the console output for security warnings to identify URLs that should be updated to HTTPS

This implementation prioritizes security while maintaining compatibility with existing HTTP URLs.