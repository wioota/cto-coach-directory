# Product Requirements Document (PRD) for GreatCTO Project

## Brief overview

This document outlines the requirements, architecture, and guidelines for the GreatCTO coaching project. It serves as a reverse-engineered PRD based on the project files, enabling easy addition of new features.

## Business Requirements

- **User Stories**:
  - As a user, I want to view a list of coaches to find the right one for my needs.
  - As a coach, I want to ensure my information is displayed correctly and updated easily.
  - As an administrator, I want to manage the filtering and categorization of coaches.
- **Acceptance Criteria**:
  - The application must display at least 10 sample coaches with basic information.
  - Filtering by skills or categories should be functional and intuitive.
  - The build process should handle both development and production environments seamlessly.
- **Goals**:
  - To provide a user-friendly interface for exploring coaching resources.
  - To support future feature additions, such as user authentication and advanced search.

## Technical Requirements

- **Project Overview**:
  - This is an Eleventy-based static site generator, built with Node.js and npm.
  - Key files include package.json for dependencies, build.yml for CI/CD, and src/ for source assets.
- **Dependencies**:
  - `@11ty/eleventy`: Version ^3.1.0 - Static site generator.
  - `cross-env`: Version ^7.0.3 - Cross-platform environment variables for scripts.
  - `ajv`, `ajv-formats`: For JSON schema validation, used in filters.js.
- **Build Process**:
  - Scripts: `build` for development build, `build:prod` for production build.
  - CI/CD defined in .github/workflows/build.yml.
- **Architecture Notes**:
  - The project uses a simple static site architecture, with data from src/coaches/coaches.yaml.
  - Future enhancements can include backend integration for dynamic data.

## Appendix

- For detailed diagrams and code structure, refer to the architecture documentation.
