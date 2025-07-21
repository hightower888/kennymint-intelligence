# 📋 Project Structure Rules

## Project-Specific Enforcement Rules

This project follows RepoClone structure rules and enforces clean separation.

### ✅ ALLOWED
- Frontend code in project root
- Project-specific configuration
- References to backend logic
- Industry-specific components

### ❌ FORBIDDEN
- Backend logic in project root
- Copying backend logic (should reference it)
- Mixed frontend/backend code
- Root intelligence files (README.md, INTELLIGENCE.md, STRUCTURE_RULES.md)

### Project Structure
```
DemoTechApp/
├── package.json           # Project configuration
├── README.md             # Project documentation
├── backend-connector.ts  # Backend logic connector
├── PROJECT_SCHEMA.md     # This file - project schema
├── .hooks/               # Project enforcement hooks
├── .github/workflows/    # GitHub Actions enforcement
├── components/           # Frontend components
├── pages/               # Pages (Next.js)
├── templates/           # Project-specific templates
├── assets/              # Project assets
├── config/              # Project configuration
└── [project files]      # Project-specific content
```

### Backend Logic Reference
- Import from `../backend-logic/`
- Use `backend-connector.ts` for connections
- Never copy backend logic into project
- Maintain clean separation

---

**📋 Project Structure Rules: Enforced**
**🧠 Backend Logic: Referenced, Not Copied**
**🚀 Project: Ready for Development** 