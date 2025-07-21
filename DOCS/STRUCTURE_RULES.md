# RepoClone Structure Rules

## Root Level (RepoClone)
### Allowed
- Intelligence files (README.md, INTELLIGENCE.md, STRUCTURE_RULES.md, package.json, index.js)
- Project templates (created by users)
- RepoCloneMeta/ (backend logic container)
- scripts/ (enforcement tools)
- .intelligence/ (monitoring data)

### Forbidden
- backend-logic/ (must be in RepoCloneMeta/)
- ai-systems/ (must be in RepoCloneMeta/backend-logic/)
- core-systems/ (must be in RepoCloneMeta/backend-logic/)
- Any other backend logic directories

## RepoCloneMeta/backend-logic/
### Allowed
- ai-systems/ (AI systems for OTHER projects)
- core-systems/ (Core systems for OTHER projects)
- project-templates/ (Templates for deployment)
- cli-tools/ (Command line tools)
- infrastructure/ (Deployment infrastructure)

## Enforcement
- AI Monitor continuously watches for violations
- Automatic violation detection and reporting
- Structure validation on system startup
- Intelligence file integrity checks

## Violation Types
1. **Forbidden Directory**: Backend logic at root level
2. **Missing Intelligence**: Required files not present
3. **Structure Violation**: Improper file organization
4. **Content Violation**: Intelligence files missing key content

Last Updated: 2025-07-20T22:38:57.945Z
