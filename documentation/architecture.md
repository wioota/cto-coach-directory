# Architectural Diagrams for GreatCTO Project

## C4 Container Diagram

This diagram visualizes the system architecture using containers and their interactions.

```mermaid
flowchart TD
    A[Static Site Generator] --> B[eleventy.js]
    B --> C[Frontend Components]
    C --> D[HTML/CSS/JS]
    C --> E[Data Filtering]
    E --> F[coaches.yaml]
    D --> G[User Interface]
    G --> H[Display Coaches]
```

## Sequence Diagram for Build Process

This diagram shows the sequence of actions during the build process.

```mermaid
sequenceDiagram
    participant User
    participant npm
    participant eleventy
    User ->> npm: Run build script
    npm ->> eleventy: Execute static site generation
    eleventy ->> CI/CD: Deploy if production build
```

## Data Flow Diagram

Simplifies the data handling between frontend and data source.

```mermaid
flowchart LR
    A[User Request] --> B[Frontend]
    B --> C[Backend Implicit]
    C --> D[coaches.yaml]
    D --> E[Data Processing]
    E --> B
    B --> F[Response to User]
```

## Notes

- These diagrams are based on reverse engineering and can be expanded with more details.
- Use Mermaid tools to render these diagrams in Markdown viewers.
