# 📋 Project Schema Template

## DemoTechApp - Project Schema

### Project Information
- **Name**: DemoTechApp
- **Industry**: technology
- **Audience**: developers
- **Template**: Generated from RepoClone backend logic
- **Created**: 2024-07-16T22:02:00.000Z

### File Schema

#### Required Files
```
DemoTechApp/
├── package.json                    # Project configuration
├── README.md                      # Project documentation
├── PROJECT_INFO.md                # Project information
├── PROJECT_SCHEMA.md              # This file - project schema
├── PROJECT_STRUCTURE_RULES.md     # Project structure rules
├── backend-connector.ts           # Backend logic connector
├── .hooks/                        # Project enforcement hooks
│   ├── pre-commit                # Pre-commit validation
│   └── post-commit               # Post-commit validation
├── .github/workflows/             # GitHub Actions enforcement
│   └── auto-enforce.yml          # Auto-enforcement workflow
├── components/                    # Frontend components
├── pages/                        # Pages (Next.js)
├── templates/                    # Project-specific templates
├── assets/                       # Project assets
├── config/                       # Project configuration
├── data-stores/                  # Project data stores
├── learning-data/                # Project learning data
└── workflows/                    # Project workflows
```

#### Industry-Specific Schema
- **Technology**: AI-powered features, real-time analytics
- **Healthcare**: HIPAA compliance, patient data management
- **Finance**: Security-first, regulatory compliance
- **Education**: Learning management, student data
- **General**: Standard web application structure

#### Audience-Specific Schema
- **Developers**: Technical documentation, API references
- **Business**: Business logic, reporting features
- **Consumers**: User-friendly interfaces, accessibility
- **Enterprise**: Enterprise features, scalability
- **General**: Standard user experience

### Backend Logic Integration Schema

#### Connection Points
1. **Import Statements**: Reference `../backend-logic/`
2. **Configuration**: Use backend logic configuration
3. **Connector**: Use `backend-connector.ts` for connections
4. **Templates**: Reference backend logic templates

#### Forbidden Patterns
1. ❌ Copy backend logic into project
2. ❌ Mix frontend and backend code
3. ❌ Include root intelligence files
4. ❌ Create backend logic in project root

### Enforcement Schema

#### Local Enforcement
- **Pre-commit hooks**: Validate structure before commit
- **Post-commit hooks**: Validate templates after commit
- **Auto-commit**: Auto-commit when rules are followed

#### Remote Enforcement
- **GitHub Actions**: Validate on every push/PR
- **Branch protection**: Require passing checks
- **Template validation**: Ensure completeness

### Development Schema

#### Setup
```bash
npm install
npm run dev
```

#### Backend Logic Connection
```typescript
import BackendConnector from './backend-connector';

const connector = new BackendConnector();
const aiSystem = connector.getAISystem();
const securityManager = connector.getSecurityManager();
```

#### Project Structure Validation
```bash
# Validate project structure
.hooks/pre-commit

# Check template completeness
.hooks/post-commit
```

---

**📋 Project Schema: Complete and Enforced**
**🧠 Backend Logic: Properly Referenced**
**🚀 Project: Ready for Development** 