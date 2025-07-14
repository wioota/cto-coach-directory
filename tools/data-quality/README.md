# Data Quality Tools

This directory contains tools and reports for maintaining data quality in the CTO Coach Directory.

## Scripts

### `audit-data.js`
Audits all coach entries for missing critical data fields including emails, photos, websites, pricing, etc.

**Usage:**
```bash
cd tools/data-quality
node audit-data.js
```

**Output:** Detailed report of missing data with counts and percentages.

### `validate-urls.js`
Validates all URLs in coach entries (websites, LinkedIn, Calendly) to ensure they're working and accessible.

**Usage:**
```bash
cd tools/data-quality
node validate-urls.js
```

**Output:** Status report of all URLs with working/error/timeout classifications.

### `check-data-consistency.js`
Analyzes data consistency across all coach entries, looking for standardization issues and potential duplicates.

**Usage:**
```bash
cd tools/data-quality
node check-data-consistency.js
```

**Output:** Lists of unique values and potential inconsistencies for manual review.

## Reports

### `DATA_QUALITY_REPORT.md`
Comprehensive data quality assessment report with findings, recommendations, and action items.

## Running from Project Root

You can also run these tools from the project root:

```bash
# Audit missing data
node tools/data-quality/audit-data.js

# Validate URLs
node tools/data-quality/validate-urls.js

# Check consistency
node tools/data-quality/check-data-consistency.js
```

## Maintenance

Run these tools regularly (monthly) to maintain data quality standards as new coaches are added to the directory.
