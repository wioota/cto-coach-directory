const { checkUrl } = require('./validate-urls');

// Test with an HTTP URL to verify HTTPS upgrade functionality
async function testHttpUpgrade() {
  console.log('Testing HTTP to HTTPS upgrade functionality...');
  
  try {
    // Test with an HTTP URL that should be upgraded to HTTPS
    const httpResult = await checkUrl('http://example.com');
    console.log('HTTP URL test result:', httpResult);
    
    // Test with an HTTPS URL (should remain unchanged)
    const httpsResult = await checkUrl('https://example.com');
    console.log('HTTPS URL test result:', httpsResult);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}
testHttpUpgrade().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});