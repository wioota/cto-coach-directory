# CTO Coach Directory

This repository contains the source code and data for the CTO Coach Directory project. It includes a static website built with [Eleventy (11ty)](https://www.11ty.dev/) and a YAML-based database of CTO coaches.

## Project Overview

- **Static Site Generator:** [Eleventy (11ty)](https://www.11ty.dev/)
- **Data Storage:** YAML files in `src/coaches/`
- **Styling:** Custom CSS in `src/assets/styles.css`
- **Automation:** Integrated with GitHub MCP server for advanced automation and GitHub API access
- **Repository:** [cto-coach-directory](https://github.com/wioota/cto-coach-directory) (private)

## Setup & Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/wioota/cto-coach-directory.git
   cd cto-coach-directory
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

## Building the Site

To build the static site, run:

```sh
npx eleventy
```
or, if you have Eleventy installed globally:
```sh
eleventy
```

The output will be generated in the `_site/` directory.

### Development Server

To start a local development server with live reload:

```sh
npx eleventy --serve
```
or
```sh
npm run start
```
(if a start script is defined in `package.json`)

## Maintaining the Database

The "database" for this project consists of YAML files located in `src/coaches/`. Each file represents one or more CTO coaches.

### To add or update a coach:

1. Open or create a YAML file in `src/coaches/` (e.g., `sample_coaches.yaml`).
2. Follow the schema defined in `cto_coaches.schema.yaml` to ensure data consistency.
3. Example entry:
   ```yaml
   - name: Jane Doe
     title: CTO
     company: Example Corp
     expertise:
       - SaaS
       - Cloud Architecture
     bio: >
       Jane has 20+ years of experience leading technology teams...
   ```

4. Save your changes. The site will automatically include new or updated coaches on the next build.

### Schema Reference

See `cto_coaches.schema.yaml` for the full data structure and required fields.

## Additional Notes

- **MCP Server Integration:** The project is set up with a GitHub MCP server for advanced automation and API access. See `.vscode` or your MCP settings for configuration details.
- **Contributing:** Please use feature branches and submit pull requests for any changes.
- **License:** MIT

---

For any questions or issues, please contact [Daniel Walters](https://github.com/wioota).
