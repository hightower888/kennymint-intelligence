# 📋 RepoClone Structure Rules

## **Enforcement Rules for Template Deployment System**

### **Core Principle**
RepoClone is a template deployment system. The backend-logic contains intelligence FOR OTHER PROJECTS, not for RepoClone itself. Projects are created at the root level with clean separation.

### **Structure Rules**

#### **✅ ALLOWED**

**Root Level (RepoClone/)**
- `README.md` - Project identity and purpose
- `INTELLIGENCE.md` - Self-aware intelligence system
- `STRUCTURE_RULES.md` - This file - enforcement rules
- `.hooks/` - GitHub hooks for enforcement
- `backend-logic/` - Intelligence for deployment (NOT for RepoClone)
- `[ProjectName]/` - Projects at root level (e.g., `DemoTechApp/`)

**Backend Logic (`backend-logic/`)**
- `ai-systems/` - AI systems for other projects
- `project-templates/` - Templates to deploy
- `core-systems/` - Core logic for other projects
- `cli/` - Deployment tools
- `infrastructure/` - Infrastructure orchestration
- `docs/` - Documentation for deployment

**Projects (`[ProjectName]/`)**
- `package.json` - Project-specific configuration
- `templates/` - Project-specific templates (references backend-logic)
- `assets/` - Project-specific assets
- `config/` - Project-specific configuration
- `[project files]` - Only project-specific content

#### **❌ FORBIDDEN**

**In Backend Logic (`backend-logic/`)**
- ❌ Frontend components (`.tsx`, `.jsx`, `.vue`)
- ❌ Project-specific files
- ❌ Actual React/Vue/Angular applications
- ❌ Frontend build artifacts

**In Project Root (RepoClone/)**
- ❌ Backend logic files (`.ts`, `.js`) outside `backend-logic/`
- ❌ Mixed frontend/backend code
- ❌ Template files that copy backend logic

**In Projects (`[ProjectName]/`)**
- ❌ Backend logic (should reference `backend-logic/`)
- ❌ AI systems (should reference `backend-logic/ai-systems/`)
- ❌ Core systems (should reference `backend-logic/core-systems/`)

### **Template Rules**

#### **Template Structure**
```
backend-logic/project-templates/[template-name]/
├── package.json           # Required
├── README.md             # Required
├── tsconfig.json         # Required
├── components/           # Frontend components
├── pages/               # Pages (Next.js)
├── styles/              # Styles
└── [template files]     # Template-specific files
```

#### **Template Requirements**
- ✅ Must have `package.json`
- ✅ Must have `README.md`
- ✅ Must have `tsconfig.json`
- ✅ Must reference backend logic (not copy it)
- ✅ Must be industry-specific when applicable
- ✅ Must be complete and deployable

### **Project Rules**

#### **Project Structure**
```
[ProjectName]/
├── package.json          # Project-specific config
├── README.md            # Project-specific docs
├── templates/           # Project-specific templates
├── assets/              # Project assets
├── config/              # Project config
└── [project files]      # Project-specific content
```

#### **Project Requirements**
- ✅ Must be at root level (not inside `backend-logic/`)
- ✅ Must reference backend logic (not copy it)
- ✅ Must contain only project-specific content
- ✅ Must follow template structure
- ✅ Must be deployable independently

### **Reference Architecture**

#### **How Projects Reference Backend Logic**
```typescript
// ✅ CORRECT: Reference backend logic
import { AISystem } from '../../backend-logic/ai-systems/ai-coordinator';
import { SecurityManager } from '../../backend-logic/core-systems/security/security-manager';

// ❌ WRONG: Copy backend logic
// Don't copy AI systems or core logic into projects
```

#### **Template Deployment**
```bash
# ✅ CORRECT: Deploy from template
cp -r backend-logic/project-templates/nextjs-template/ MyNewProject/
cd MyNewProject
npm install

# ❌ WRONG: Copy backend logic
# Don't copy backend-logic into projects
```

### **Enforcement Mechanisms**

#### **GitHub Hooks**
- **Pre-commit**: Validates structure rules
- **Post-commit**: Validates template completeness
- **Automatic**: Prevents violations before commit

#### **Validation Checks**
1. **Structure Validation**
   - No frontend code in backend-logic
   - No backend code in project root
   - Projects at root level only

2. **Template Validation**
   - Required files present
   - Complete structure
   - Reference-based architecture

3. **Project Validation**
   - Clean separation
   - Project-specific content only
   - Proper references to backend logic

### **Intelligence Rules**

#### **Self-Awareness**
- RepoClone understands it's a template deployment system
- Backend-logic is for other projects, not for RepoClone
- Intelligence enforces clean separation
- Learning from deployment patterns

#### **Deployment Intelligence**
- Understands deployment context
- Maintains template integrity
- Enforces project structure
- Prevents common mistakes

### **Violation Handling**

#### **Automatic Prevention**
- GitHub hooks prevent violations
- Pre-commit validation stops bad commits
- Post-commit validation ensures completeness

#### **Manual Correction**
```bash
# If violations are found:
node backend-logic/cli/cleanup-structure.js
```

#### **Learning from Violations**
- Activity is logged
- Patterns are recognized
- Intelligence improves
- Future violations prevented

### **Success Metrics**

#### **Structure Compliance**
- ✅ 100% clean separation
- ✅ No mixed frontend/backend code
- ✅ Projects at root level
- ✅ Templates reference backend logic

#### **Template Completeness**
- ✅ All templates deployable
- ✅ Required files present
- ✅ Industry-specific when applicable
- ✅ Reference-based architecture

#### **Deployment Success**
- ✅ Clean project creation
- ✅ Proper structure enforcement
- ✅ Template completeness
- ✅ Intelligence activation

---

**📋 Structure Rules: Enforced and Maintained**
**🧠 Intelligence System: Active and Learning**
**🚀 Template Deployment: Ready and Reliable** 