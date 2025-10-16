const fs = require('fs');
const yaml = require('js-yaml');
const https = require('https');
const http = require('http');


async function checkUrl(url, timeout = 5000, allowHttpFallback = false, attemptCount = 0) {
  const maxAttempts = 2; // Prevent infinite recursion

  return new Promise((resolve) => {
    if (!url || url === '') {
      resolve({ url, status: 'empty', message: 'Empty URL' });
      return;
    }

    // Prevent infinite recursion
    if (attemptCount >= maxAttempts) {
      resolve({ url, status: 'error', message: 'Max retry attempts exceeded' });
      return;
    }

    try {
      let targetUrl = url;
      let isHttpsUpgrade = false;

      // Try to upgrade HTTP URLs to HTTPS for security
      if (url.startsWith('http:')) {
        const httpsUrl = url.replace(/^http:/, 'https:');
        if (allowHttpFallback) {
          targetUrl = httpsUrl;
          isHttpsUpgrade = true;
          console.warn(`⚠️  Security warning: Attempting to upgrade insecure URL from ${url} to ${httpsUrl}`);
        } else {
          console.warn(`🚫  Security policy: Rejecting insecure HTTP URL ${url} (HTTPS-only mode)`);
          resolve({ url, status: 'error', message: 'HTTP URLs not allowed in HTTPS-only mode' });
          return;
        }
      }

      const urlObj = new URL(targetUrl);

      // Log warning if still using HTTP after attempted upgrade
      if (urlObj.protocol === 'http:') {
        console.warn(`⚠️  Security warning: Using insecure HTTP protocol for ${targetUrl}`);
      }

      // Use HTTPS client (HTTP fallback only if explicitly allowed)
      const client = urlObj.protocol === 'https:' ? https : http;

      const req = client.request({
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; URL-Checker/1.0)'
        }
      }, (res) => {
        // Track if we're using the original or upgraded URL
        const resultUrl = isHttpsUpgrade ? targetUrl : url;

        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ url: resultUrl, originalUrl: url, status: 'ok', code: res.statusCode });
        } else if (res.statusCode >= 300 && res.statusCode < 400) {
          resolve({ url: resultUrl, originalUrl: url, status: 'redirect', code: res.statusCode, location: res.headers.location });
        } else {
          resolve({ url: resultUrl, originalUrl: url, status: 'error', code: res.statusCode });
        }
      });

      // Set up proper timeout handling
      req.setTimeout(timeout, () => {
        req.destroy();
        resolve({ url, status: 'timeout', message: 'Request timed out' });
      });

      req.on('error', (err) => {
        req.destroy(); // Ensure request is properly cleaned up

        // If HTTPS upgrade failed and HTTP fallback is allowed, try the original HTTP URL
        if (isHttpsUpgrade && allowHttpFallback && err.message.includes('ECONNREFUSED')) {
          console.warn(`⚠️  HTTPS upgrade failed for ${targetUrl}, falling back to original HTTP URL ${url}`);
          return checkUrl(url, timeout, allowHttpFallback, attemptCount + 1);
        }

        resolve({ url, status: 'error', message: err.message });
      });

      req.end();

    } catch (err) {
      resolve({ url, status: 'error', message: err.message });
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

// Export the checkUrl function for testing
module.exports = { checkUrl };
