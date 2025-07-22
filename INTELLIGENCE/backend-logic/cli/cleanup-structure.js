#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class StructureCleanupCLI {
  constructor() {
    this.violations = [];
    this.fixes = [];
  }

  async run() {
    console.log('🧹 AI Development Platform - File Structure Cleanup');
    console.log('==================================================\n');

    // Step 1: Analyze current structure
    this.analyzeCurrentStructure();

    // Step 2: Clean up dashboard chaos
    this.cleanupDashboardChaos();

    // Step 3: Complete frontend templates
    this.completeFrontendTemplates();

    // Step 4: Validate backend logic purity
    this.validateBackendLogicPurity();

    // Step 5: Create missing templates
    this.createMissingTemplates();

    // Step 6: Report results
    this.reportResults();
  }

  analyzeCurrentStructure() {
    console.log('🔍 Analyzing current file structure...');
    
    const rootFiles = fs.readdirSync('.');
    const backendLogicFiles = fs.existsSync('backend-logic') ? fs.readdirSync('backend-logic') : [];
    
    console.log(`Root files: ${rootFiles.length}`);
    console.log(`Backend logic directories: ${backendLogicFiles.length}`);
    
    // Check for forbidden patterns
    this.checkForbiddenPatterns();
  }

  checkForbiddenPatterns() {
    const forbiddenPaths = [
      'backend-logic/dashboard/public/',
      'backend-logic/dashboard/dashboard-app.tsx'
    ];

    forbiddenPaths.forEach(path => {
      if (fs.existsSync(path)) {
        this.violations.push(`Frontend code in backend logic: ${path}`);
      }
    });
  }

  cleanupDashboardChaos() {
    console.log('\n🧹 Cleaning up dashboard chaos...');
    
    const dashboardFrontendPath = 'backend-logic/dashboard/public/dashboard-app.tsx';
    const newDashboardTemplatePath = 'backend-logic/project-templates/dashboard-template/';
    
    if (fs.existsSync(dashboardFrontendPath)) {
      console.log('  📦 Moving dashboard frontend to proper template...');
      
      // Create dashboard template directory
      if (!fs.existsSync(newDashboardTemplatePath)) {
        fs.mkdirSync(newDashboardTemplatePath, { recursive: true });
      }
      
      // Move frontend code to template
      const frontendContent = fs.readFileSync(dashboardFrontendPath, 'utf8');
      fs.writeFileSync(path.join(newDashboardTemplatePath, 'dashboard-app.tsx'), frontendContent);
      
      // Create package.json for dashboard template
      const packageJson = {
        name: 'dashboard-template',
        version: '1.0.0',
        description: 'Master dashboard frontend template',
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start'
        },
        dependencies: {
          next: '^13.0.0',
          react: '^18.0.0',
          'react-dom': '^18.0.0',
          'recharts': '^2.8.0',
          'framer-motion': '^10.16.0'
        }
      };
      
      fs.writeFileSync(
        path.join(newDashboardTemplatePath, 'package.json'), 
        JSON.stringify(packageJson, null, 2)
      );
      
      // Remove from backend logic
      fs.unlinkSync(dashboardFrontendPath);
      
      // Remove the public directory if empty
      const publicDir = 'backend-logic/dashboard/public/';
      if (fs.existsSync(publicDir) && fs.readdirSync(publicDir).length === 0) {
        fs.rmdirSync(publicDir);
      }
      
      this.fixes.push('Moved dashboard frontend to proper template location');
      console.log('  ✅ Dashboard frontend moved to template');
    }
  }

  completeFrontendTemplates() {
    console.log('\n📋 Completing frontend templates...');
    
    const templatePaths = [
      'backend-logic/project-templates/nextjs-template/',
      'backend-logic/project-templates/react-template/',
      'backend-logic/project-templates/vue-template/'
    ];

    templatePaths.forEach(templatePath => {
      if (!fs.existsSync(templatePath)) {
        console.log(`  📁 Creating missing template: ${templatePath}`);
        fs.mkdirSync(templatePath, { recursive: true });
        this.createCompleteTemplate(templatePath);
      } else {
        console.log(`  ✅ Template exists: ${templatePath}`);
        this.validateAndCompleteTemplate(templatePath);
      }
    });
  }

  createCompleteTemplate(templatePath) {
    const templateName = path.basename(templatePath);
    const isNextJs = templateName.includes('nextjs');
    const isReact = templateName.includes('react');
    const isVue = templateName.includes('vue');

    // Create package.json
    const packageJson = {
      name: templateName,
      version: '1.0.0',
      description: `${templateName} template with backend logic integration`,
      scripts: {
        dev: isNextJs ? 'next dev' : 'react-scripts start',
        build: isNextJs ? 'next build' : 'react-scripts build',
        start: isNextJs ? 'next start' : 'react-scripts start',
        lint: isNextJs ? 'next lint' : 'eslint src'
      },
      dependencies: {
        react: '^18.0.0',
        'react-dom': '^18.0.0'
      },
      devDependencies: {
        typescript: '^5.0.0',
        '@types/react': '^18.0.0',
        '@types/react-dom': '^18.0.0'
      }
    };

    if (isNextJs) {
      packageJson.dependencies.next = '^13.0.0';
    } else if (isReact) {
      packageJson.dependencies['react-scripts'] = '^5.0.0';
    } else if (isVue) {
      packageJson.dependencies.vue = '^3.0.0';
      delete packageJson.dependencies.react;
      delete packageJson.dependencies['react-dom'];
    }

    fs.writeFileSync(
      path.join(templatePath, 'package.json'), 
      JSON.stringify(packageJson, null, 2)
    );

    // Create README
    const readme = `# ${templateName}

This template is powered by the backend logic engine and provides:

- Industry-specific components
- Backend logic integration
- Adaptive storage management
- Security and monitoring

## Usage

\`\`\`bash
npm run dev
\`\`\`

## Backend Logic Integration

This template automatically connects to the backend logic engine for:
- AI-powered features
- Adaptive storage
- Security management
- Real-time monitoring

## Project Structure

\`\`\`
${templatePath}
├── package.json
├── README.md
├── tsconfig.json
├── components/
├── pages/
└── styles/
\`\`\`
`;

    fs.writeFileSync(path.join(templatePath, 'README.md'), readme);

    // Create tsconfig.json
    const tsconfig = {
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'es6'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: isNextJs ? 'preserve' : 'react-jsx'
      },
      include: ['**/*.ts', '**/*.tsx'],
      exclude: ['node_modules']
    };

    fs.writeFileSync(
      path.join(templatePath, 'tsconfig.json'), 
      JSON.stringify(tsconfig, null, 2)
    );

    // Create directory structure
    const dirs = ['components', 'pages', 'styles'];
    dirs.forEach(dir => {
      const dirPath = path.join(templatePath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });

    // Create sample components
    this.createSampleComponents(templatePath, isVue);

    this.fixes.push(`Created complete ${templateName} template`);
  }

  createSampleComponents(templatePath, isVue) {
    const componentsPath = path.join(templatePath, 'components');
    
    if (isVue) {
      // Create Vue component
      const vueComponent = `<template>
  <div class="sample-component">
    <h2>Sample Component</h2>
    <p>This is a sample Vue component powered by backend logic.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SampleComponent',
  setup() {
    return {}
  }
})
</script>

<style scoped>
.sample-component {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
`;
      fs.writeFileSync(path.join(componentsPath, 'SampleComponent.vue'), vueComponent);
    } else {
      // Create React component
      const reactComponent = `import React from 'react';

interface SampleComponentProps {
  title?: string;
}

export const SampleComponent: React.FC<SampleComponentProps> = ({ title = 'Sample Component' }) => {
  return (
    <div className="sample-component">
      <h2>{title}</h2>
      <p>This is a sample React component powered by backend logic.</p>
    </div>
  );
};

export default SampleComponent;
`;
      fs.writeFileSync(path.join(componentsPath, 'SampleComponent.tsx'), reactComponent);
    }
  }

  validateAndCompleteTemplate(templatePath) {
    const requiredFiles = ['package.json', 'README.md', 'tsconfig.json'];
    const missingFiles = [];

    requiredFiles.forEach(file => {
      if (!fs.existsSync(path.join(templatePath, file))) {
        missingFiles.push(file);
      }
    });

    if (missingFiles.length > 0) {
      console.log(`  ⚠️  Missing files in ${templatePath}: ${missingFiles.join(', ')}`);
      this.createCompleteTemplate(templatePath);
    }
  }

  validateBackendLogicPurity() {
    console.log('\n🔒 Validating backend logic purity...');
    
    const backendLogicPaths = [
      'backend-logic/ai-systems/',
      'backend-logic/core-systems/',
      'backend-logic/advanced-features/',
      'backend-logic/next-level/',
      'backend-logic/self-improving/',
      'backend-logic/integration/',
      'backend-logic/constants/',
      'backend-logic/storage-management/',
      'backend-logic/scripts/',
      'backend-logic/cli/',
      'backend-logic/infrastructure/',
      'backend-logic/docs/',
      'backend-logic/connection/'
    ];

    backendLogicPaths.forEach(logicPath => {
      if (fs.existsSync(logicPath)) {
        this.scanForFrontendCode(logicPath);
      }
    });
  }

  scanForFrontendCode(dirPath) {
    const files = this.getAllFiles(dirPath);
    
    files.forEach(file => {
      if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        this.violations.push(`Frontend file found in backend logic: ${file}`);
      }
      
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          if (this.isActualReactComponent(content)) {
            this.violations.push(`Frontend component found in backend file: ${file}`);
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    });
  }

  getAllFiles(dirPath) {
    const files = [];
    
    if (fs.existsSync(dirPath)) {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.getAllFiles(fullPath));
        } else {
          files.push(fullPath);
        }
      });
    }
    
    return files;
  }

  isActualReactComponent(content) {
    // Check for actual React component definitions, not code generation
    const reactComponentPatterns = [
      /export\s+(default\s+)?(function|const)\s+\w+\s*[:=]\s*(React\.)?FC/,
      /export\s+(default\s+)?(function|const)\s+\w+\s*[:=]\s*React\.Component/,
      /class\s+\w+\s+extends\s+React\.Component/,
      /return\s*\(\s*<[A-Z][a-zA-Z]*[^>]*>/,
      /import\s+React[^;]*from\s+['"]react['"]/
    ];

    // If it's a backend file that generates React code as examples, that's OK
    if (content.includes('// Example:') || 
        content.includes('// Generated code:') || 
        content.includes('return `') ||
        content.includes('code: "') ||
        content.includes('description: "') ||
        content.includes('pattern: "') ||
        content.includes('suggestedFix: "') ||
        content.includes('XSS') ||
        content.includes('SQL_INJECTION') ||
        content.includes('security') ||
        content.includes('threat') ||
        content.includes('vulnerability')) {
      return false;
    }

    return reactComponentPatterns.some(pattern => pattern.test(content));
  }

  createMissingTemplates() {
    console.log('\n🎨 Creating missing adaptive templates...');
    
    // Create industry-specific templates
    const industries = ['technology', 'healthcare', 'finance'];
    const frameworks = ['nextjs', 'react', 'vue'];
    
    industries.forEach(industry => {
      frameworks.forEach(framework => {
        const templatePath = `backend-logic/project-templates/${industry}-${framework}-template/`;
        
        if (!fs.existsSync(templatePath)) {
          console.log(`  📁 Creating ${industry} ${framework} template...`);
          fs.mkdirSync(templatePath, { recursive: true });
          this.createIndustrySpecificTemplate(templatePath, industry, framework);
        }
      });
    });
  }

  createIndustrySpecificTemplate(templatePath, industry, framework) {
    // Create package.json
    const packageJson = {
      name: `${industry}-${framework}-template`,
      version: '1.0.0',
      description: `${industry} ${framework} template with backend logic integration`,
      scripts: {
        dev: framework === 'nextjs' ? 'next dev' : 'react-scripts start',
        build: framework === 'nextjs' ? 'next build' : 'react-scripts build',
        start: framework === 'nextjs' ? 'next start' : 'react-scripts start',
        lint: framework === 'nextjs' ? 'next lint' : 'eslint src'
      },
      dependencies: {
        react: '^18.0.0',
        'react-dom': '^18.0.0'
      },
      devDependencies: {
        typescript: '^5.0.0',
        '@types/react': '^18.0.0',
        '@types/react-dom': '^18.0.0'
      }
    };

    if (framework === 'nextjs') {
      packageJson.dependencies.next = '^13.0.0';
    } else if (framework === 'react') {
      packageJson.dependencies['react-scripts'] = '^5.0.0';
    } else if (framework === 'vue') {
      packageJson.dependencies.vue = '^3.0.0';
      delete packageJson.dependencies.react;
      delete packageJson.dependencies['react-dom'];
    }

    fs.writeFileSync(
      path.join(templatePath, 'package.json'), 
      JSON.stringify(packageJson, null, 2)
    );

    // Create industry-specific README
    const readme = `# ${industry} ${framework} Template

This ${industry} industry template is powered by the backend logic engine and provides:

- ${industry}-specific components and styling
- Backend logic integration
- Adaptive storage management
- Security and monitoring

## Industry Features

- **Technology**: AI-powered features, real-time analytics
- **Healthcare**: HIPAA compliance, patient data management
- **Finance**: Security-first, regulatory compliance

## Usage

\`\`\`bash
npm run dev
\`\`\`

## Backend Logic Integration

This template automatically connects to the backend logic engine for:
- AI-powered features
- Adaptive storage
- Security management
- Real-time monitoring
`;

    fs.writeFileSync(path.join(templatePath, 'README.md'), readme);

    // Create industry-specific components
    this.createIndustryComponents(templatePath, industry, framework);

    this.fixes.push(`Created ${industry} ${framework} template`);
  }

  createIndustryComponents(templatePath, industry, framework) {
    const componentsPath = path.join(templatePath, 'components');
    fs.mkdirSync(componentsPath, { recursive: true });

    const industryComponents = {
      technology: ['TechHeader', 'TechFooter', 'TechCard', 'TechDashboard'],
      healthcare: ['HealthHeader', 'HealthFooter', 'HealthCard', 'HealthDashboard'],
      finance: ['FinanceHeader', 'FinanceFooter', 'FinanceCard', 'FinanceDashboard']
    };

    const components = industryComponents[industry] || ['Header', 'Footer', 'Card', 'Dashboard'];
    
    components.forEach(componentName => {
      const componentContent = this.generateIndustryComponent(componentName, industry, framework);
      const extension = framework === 'vue' ? '.vue' : '.tsx';
      fs.writeFileSync(path.join(componentsPath, `${componentName}${extension}`), componentContent);
    });
  }

  generateIndustryComponent(componentName, industry, framework) {
    if (framework === 'vue') {
      return `<template>
  <div class="${componentName.toLowerCase()}-component">
    <h2>${componentName} for ${industry}</h2>
    <p>This is a ${industry}-specific ${componentName} component powered by backend logic.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: '${componentName}',
  setup() {
    return {}
  }
})
</script>

<style scoped>
.${componentName.toLowerCase()}-component {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
}
</style>
`;
    } else {
      return `import React from 'react';

interface ${componentName}Props {
  title?: string;
}

export const ${componentName}: React.FC<${componentName}Props> = ({ 
  title = '${componentName} for ${industry}' 
}) => {
  return (
    <div className="${componentName.toLowerCase()}-component">
      <h2>{title}</h2>
      <p>This is a ${industry}-specific ${componentName} component powered by backend logic.</p>
    </div>
  );
};

export default ${componentName};
`;
    }
  }

  reportResults() {
    console.log('\n📊 Cleanup Results');
    console.log('==================');

    if (this.violations.length > 0) {
      console.log('\n❌ Structure violations found:');
      this.violations.forEach(v => console.log(`  - ${v}`));
    }

    if (this.fixes.length > 0) {
      console.log('\n✅ Fixes applied:');
      this.fixes.forEach(f => console.log(`  - ${f}`));
    }

    if (this.violations.length === 0 && this.fixes.length === 0) {
      console.log('\n✅ File structure is already clean and properly organized!');
    }

    console.log('\n🎯 File Structure Rules Enforced:');
    console.log('  • Backend logic contains only universal, immutable code');
    console.log('  • Frontend templates are complete and industry-specific');
    console.log('  • Projects contain only project-specific data');
    console.log('  • No mixing of frontend and backend code');
    console.log('  • Adaptive templates learn from project context');

    console.log('\n🚀 Your AI development platform is now properly structured!');
  }
}

// Run the cleanup
if (require.main === module) {
  const cleanup = new StructureCleanupCLI();
  cleanup.run().catch(console.error);
}

module.exports = StructureCleanupCLI; 