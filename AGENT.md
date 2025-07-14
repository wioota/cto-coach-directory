# CTO Coach Directory - Agent Guide

## Build/Test Commands
- **Dev build**: `npm run build` or `npx eleventy`
- **Production build**: `npm run build:prod` (includes pathprefix for GitHub Pages)
- **Dev server**: `npm run serve` or `npx eleventy --serve`
- **Test**: No tests configured (placeholder script returns error)
- **Install**: `npm install` or `npm ci` (for clean installs)

## Architecture & Structure
- **Framework**: Eleventy (11ty) static site generator v3.1.0
- **Template Engine**: Nunjucks (.njk files)
- **Data Storage**: YAML files in `src/coaches/coaches.yaml` (main database, not sample)
- **Schema Validation**: JSON Schema (`cto_coaches.jsonschema.json`) with AJV validation
- **Output**: `_site/` directory for generated static files
- **CI/CD**: GitHub Actions (`build.yml`) with GitHub Pages deployment
- **Container**: DevContainer with Debian, Node.js, and TypeScript support

## Code Style & Conventions
- **Paths**: Use forward slashes, prefer project-relative paths
- **Data Handling**: `coaches.yaml` is the complete database - never treat as sample data
- **Communication**: Be concise and direct, avoid unnecessary follow-up questions
- **File Operations**: Never overwrite/delete files without explicit confirmation
- **Continuous Learning**: Update `.clinerules` when discovering new preferences or insights
- **Template Structure**: Uses layout.njk as base template in `src/_includes/`
- **Assets**: Static files in `src/assets/` (copied to `assets/` in output)

## Important Files
- **Main Config**: `.eleventy.js` (Eleventy configuration with validation)
- **Data Schema**: `cto_coaches.jsonschema.json` & `cto_coaches.schema.yaml`
- **Source**: `src/` (templates, includes, coaches data, assets)
- **Build Output**: `_site/` (generated static files)
- **Agent Rules**: `.clinerules` (Cline-specific rules and preferences)
- **Documentation**: `docs/` (PRD, architecture diagrams with Mermaid)
