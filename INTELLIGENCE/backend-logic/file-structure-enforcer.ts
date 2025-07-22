import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface FileStructureRule {
  path: string;
  type: 'backend-logic' | 'frontend-template' | 'project-data' | 'forbidden';
  description: string;
  validation: (content: string) => boolean;
}

interface ProjectContext {
  type: 'nextjs' | 'react' | 'vue' | 'angular' | 'vanilla';
  industry: string;
  audience: string;
  features: string[];
}

class FileStructureEnforcer {
  private rules: FileStructureRule[] = [];
  private projectContext: ProjectContext | null = null;

  constructor() {
    this.initializeRules();
  }

  private initializeRules() {
    this.rules = [
      // Backend Logic Rules (Immutable, Universal)
      {
        path: 'backend-logic/',
        type: 'backend-logic',
        description: 'Core engine logic, AI systems, and universal functionality',
        validation: (content) => !content.includes('import React') && !content.includes('useState')
      },
      {
        path: 'backend-logic/ai-systems/',
        type: 'backend-logic',
        description: 'AI intelligence systems and coordination',
        validation: () => true
      },
      {
        path: 'backend-logic/core-systems/',
        type: 'backend-logic',
        description: 'Core system management (security, monitoring, deployment)',
        validation: () => true
      },
      {
        path: 'backend-logic/advanced-features/',
        type: 'backend-logic',
        description: 'Advanced AI features and capabilities',
        validation: () => true
      },
      {
        path: 'backend-logic/next-level/',
        type: 'backend-logic',
        description: 'Next-level AI capabilities',
        validation: () => true
      },
      {
        path: 'backend-logic/self-improving/',
        type: 'backend-logic',
        description: 'Self-improving AI systems',
        validation: () => true
      },
      {
        path: 'backend-logic/integration/',
        type: 'backend-logic',
        description: 'System integration and coordination',
        validation: () => true
      },
      {
        path: 'backend-logic/constants/',
        type: 'backend-logic',
        description: 'System constants and configuration',
        validation: () => true
      },
      {
        path: 'backend-logic/storage-management/',
        type: 'backend-logic',
        description: 'Storage and asset management',
        validation: () => true
      },
      {
        path: 'backend-logic/scripts/',
        type: 'backend-logic',
        description: 'Backend utility scripts',
        validation: () => true
      },
      {
        path: 'backend-logic/cli/',
        type: 'backend-logic',
        description: 'Command line tools',
        validation: () => true
      },
      {
        path: 'backend-logic/infrastructure/',
        type: 'backend-logic',
        description: 'Infrastructure orchestration',
        validation: () => true
      },
      {
        path: 'backend-logic/docs/',
        type: 'backend-logic',
        description: 'Backend documentation',
        validation: () => true
      },
      {
        path: 'backend-logic/connection/',
        type: 'backend-logic',
        description: 'Project connection system',
        validation: () => true
      },

      // Frontend Template Rules (Adaptive, Project-Specific)
      {
        path: 'backend-logic/project-templates/',
        type: 'frontend-template',
        description: 'Frontend template schemas and examples',
        validation: (content) => {
          // Frontend templates should contain React/Vue/Angular code
          return content.includes('import React') || 
                 content.includes('import Vue') || 
                 content.includes('import { Component }') ||
                 content.includes('<!DOCTYPE html>');
        }
      },
      {
        path: 'backend-logic/project-templates/nextjs-template/',
        type: 'frontend-template',
        description: 'Next.js frontend template',
        validation: (content) => content.includes('import React') || content.includes('export default')
      },
      {
        path: 'backend-logic/project-templates/react-template/',
        type: 'frontend-template',
        description: 'React frontend template',
        validation: (content) => content.includes('import React')
      },
      {
        path: 'backend-logic/project-templates/vue-template/',
        type: 'frontend-template',
        description: 'Vue frontend template',
        validation: (content) => content.includes('import Vue') || content.includes('<template>')
      },

      // Project Data Rules (Mutable, Project-Specific)
      {
        path: 'backend-logic/projects/',
        type: 'project-data',
        description: 'Project-specific data and configurations',
        validation: () => true
      },
      {
        path: 'backend-logic/projects/*/',
        type: 'project-data',
        description: 'Individual project folders',
        validation: () => true
      },
      {
        path: 'backend-logic/projects/*/templates/',
        type: 'project-data',
        description: 'Project-specific frontend templates',
        validation: (content) => content.includes('import React') || content.includes('export default')
      },
      {
        path: 'backend-logic/projects/*/brand-guidelines/',
        type: 'project-data',
        description: 'Project brand guidelines',
        validation: () => true
      },
      {
        path: 'backend-logic/projects/*/config/',
        type: 'project-data',
        description: 'Project configuration',
        validation: () => true
      },
      {
        path: 'backend-logic/projects/*/assets/',
        type: 'project-data',
        description: 'Project assets',
        validation: () => true
      },
      {
        path: 'backend-logic/projects/*/data-stores/',
        type: 'project-data',
        description: 'Project data stores',
        validation: () => true
      },
      {
        path: 'backend-logic/projects/*/learning-data/',
        type: 'project-data',
        description: 'Project learning data',
        validation: () => true
      },
      {
        path: 'backend-logic/projects/*/workflows/',
        type: 'project-data',
        description: 'Project workflows',
        validation: () => true
      },

      // Forbidden Rules (Prevent Chaos)
      {
        path: 'backend-logic/dashboard/public/',
        type: 'forbidden',
        description: 'Dashboard frontend should be in separate frontend template',
        validation: () => false
      },
      {
        path: 'backend-logic/dashboard/dashboard-app.tsx',
        type: 'forbidden',
        description: 'Frontend code in backend logic is forbidden',
        validation: () => false
      }
    ];
  }

  public analyzeProjectContext(projectPath: string): ProjectContext {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Determine project type
        let type: ProjectContext['type'] = 'vanilla';
        if (packageJson.dependencies?.next) type = 'nextjs';
        else if (packageJson.dependencies?.react) type = 'react';
        else if (packageJson.dependencies?.vue) type = 'vue';
        else if (packageJson.dependencies?.['@angular/core']) type = 'angular';

        // Analyze project structure for context
        const hasBrandGuidelines = fs.existsSync(path.join(projectPath, 'brand-guidelines'));
        const hasConfig = fs.existsSync(path.join(projectPath, 'config'));
        const hasAssets = fs.existsSync(path.join(projectPath, 'assets'));

        // Determine industry/audience from project structure
        let industry = 'general';
        let audience = 'general';
        
        if (hasBrandGuidelines) {
          const brandFiles = fs.readdirSync(path.join(projectPath, 'brand-guidelines'));
          if (brandFiles.some(f => f.includes('tech'))) industry = 'technology';
          if (brandFiles.some(f => f.includes('health'))) industry = 'healthcare';
          if (brandFiles.some(f => f.includes('finance'))) industry = 'finance';
        }

        const features: string[] = [];
        if (fs.existsSync(path.join(projectPath, 'templates'))) features.push('custom-templates');
        if (fs.existsSync(path.join(projectPath, 'workflows'))) features.push('workflows');
        if (fs.existsSync(path.join(projectPath, 'data-stores'))) features.push('data-stores');

        this.projectContext = { type, industry, audience, features };
        return this.projectContext;
      }
    } catch (error) {
      console.error('Error analyzing project context:', error);
    }

    return { type: 'vanilla', industry: 'general', audience: 'general', features: [] };
  }

  public enforceStructure() {
    console.log('🔍 Enforcing file structure rules...');
    
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check for forbidden patterns
    this.checkForbiddenPatterns(violations);
    
    // Validate backend logic purity
    this.validateBackendLogicPurity(violations);
    
    // Ensure frontend templates are complete
    this.validateFrontendTemplates(recommendations);
    
    // Clean up dashboard chaos
    this.cleanupDashboardChaos();

    if (violations.length > 0) {
      console.log('❌ Structure violations found:');
      violations.forEach(v => console.log(`  - ${v}`));
    }

    if (recommendations.length > 0) {
      console.log('💡 Recommendations:');
      recommendations.forEach(r => console.log(`  - ${r}`));
    }

    if (violations.length === 0 && recommendations.length === 0) {
      console.log('✅ File structure is clean and properly organized!');
    }
  }

  private checkForbiddenPatterns(violations: string[]) {
    // Check for frontend code in backend logic
    const backendPaths = [
      'backend-logic/dashboard/public/',
      'backend-logic/dashboard/dashboard-app.tsx'
    ];

    backendPaths.forEach(path => {
      if (fs.existsSync(path)) {
        violations.push(`Frontend code found in backend logic: ${path}`);
      }
    });
  }

  private validateBackendLogicPurity(violations: string[]) {
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
        this.scanForFrontendCode(logicPath, violations);
      }
    });
  }

  private scanForFrontendCode(dirPath: string, violations: string[]) {
    const files = this.getAllFiles(dirPath);
    
    files.forEach(file => {
      if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        violations.push(`Frontend file found in backend logic: ${file}`);
      }
      
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for actual React component definitions, not just React code generation
        if (this.isActualReactComponent(content)) {
          violations.push(`Frontend component found in backend file: ${file}`);
        }
      }
    });
  }

  private isActualReactComponent(content: string): boolean {
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

  private validateFrontendTemplates(recommendations: string[]) {
    const templatePaths = [
      'backend-logic/project-templates/nextjs-template/',
      'backend-logic/project-templates/react-template/',
      'backend-logic/project-templates/vue-template/'
    ];

    templatePaths.forEach(templatePath => {
      if (!fs.existsSync(templatePath)) {
        recommendations.push(`Create missing template: ${templatePath}`);
      } else {
        this.validateTemplateCompleteness(templatePath, recommendations);
      }
    });
  }

  private validateTemplateCompleteness(templatePath: string, recommendations: string[]) {
    const requiredFiles = [
      'package.json',
      'README.md',
      'next.config.js',
      'tsconfig.json'
    ];

    requiredFiles.forEach(file => {
      if (!fs.existsSync(path.join(templatePath, file))) {
        recommendations.push(`Missing required file in template: ${templatePath}${file}`);
      }
    });
  }

  private cleanupDashboardChaos() {
    console.log('🧹 Cleaning up dashboard chaos...');
    
    // Move dashboard frontend to proper template
    const dashboardFrontendPath = 'backend-logic/dashboard/public/dashboard-app.tsx';
    const newDashboardTemplatePath = 'backend-logic/project-templates/dashboard-template/';
    
    if (fs.existsSync(dashboardFrontendPath)) {
      // Create dashboard template directory
      if (!fs.existsSync(newDashboardTemplatePath)) {
        fs.mkdirSync(newDashboardTemplatePath, { recursive: true });
      }
      
      // Move frontend code to template
      const frontendContent = fs.readFileSync(dashboardFrontendPath, 'utf8');
      fs.writeFileSync(path.join(newDashboardTemplatePath, 'dashboard-app.tsx'), frontendContent);
      
      // Remove from backend logic
      fs.unlinkSync(dashboardFrontendPath);
      
      console.log('✅ Moved dashboard frontend to proper template location');
    }
  }

  private getAllFiles(dirPath: string): string[] {
    const files: string[] = [];
    
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

  public createAdaptiveTemplate(projectContext: ProjectContext) {
    console.log('🎨 Creating adaptive template based on project context...');
    
    const templatePath = `backend-logic/project-templates/${projectContext.type}-template/`;
    
    if (!fs.existsSync(templatePath)) {
      fs.mkdirSync(templatePath, { recursive: true });
    }

    // Create industry-specific template
    this.createIndustrySpecificTemplate(templatePath, projectContext);
    
    console.log(`✅ Created adaptive template for ${projectContext.type} in ${projectContext.industry} industry`);
  }

  private createIndustrySpecificTemplate(templatePath: string, context: ProjectContext) {
    // Create package.json
    const packageJson = this.generatePackageJson(context);
    fs.writeFileSync(path.join(templatePath, 'package.json'), JSON.stringify(packageJson, null, 2));
    
    // Create README
    const readme = this.generateReadme(context);
    fs.writeFileSync(path.join(templatePath, 'README.md'), readme);
    
    // Create configuration files
    if (context.type === 'nextjs') {
      this.createNextJsTemplate(templatePath, context);
    } else if (context.type === 'react') {
      this.createReactTemplate(templatePath, context);
    }
  }

  private generatePackageJson(context: ProjectContext) {
    const basePackage = {
      name: `${context.industry}-${context.type}-template`,
      version: '1.0.0',
      description: `${context.industry} ${context.type} template with backend logic integration`,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies: {},
      devDependencies: {}
    };

    if (context.type === 'nextjs') {
      basePackage.dependencies = {
        next: '^13.0.0',
        react: '^18.0.0',
        'react-dom': '^18.0.0'
      };
    }

    return basePackage;
  }

  private generateReadme(context: ProjectContext) {
    return `# ${context.industry} ${context.type} Template

This template is powered by the backend logic engine and provides:

- Industry-specific components for ${context.industry}
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
`;
  }

  private createNextJsTemplate(templatePath: string, context: ProjectContext) {
    // Create pages directory
    const pagesPath = path.join(templatePath, 'pages');
    fs.mkdirSync(pagesPath, { recursive: true });
    
    // Create components directory
    const componentsPath = path.join(templatePath, 'components');
    fs.mkdirSync(componentsPath, { recursive: true });
    
    // Create industry-specific components
    this.createIndustryComponents(componentsPath, context);
  }

  private createReactTemplate(templatePath: string, context: ProjectContext) {
    // Create src directory
    const srcPath = path.join(templatePath, 'src');
    fs.mkdirSync(srcPath, { recursive: true });
    
    // Create components directory
    const componentsPath = path.join(srcPath, 'components');
    fs.mkdirSync(componentsPath, { recursive: true });
    
    // Create industry-specific components
    this.createIndustryComponents(componentsPath, context);
  }

  private createIndustryComponents(componentsPath: string, context: ProjectContext) {
    const industryComponents = {
      technology: ['TechHeader', 'TechFooter', 'TechCard'],
      healthcare: ['HealthHeader', 'HealthFooter', 'HealthCard'],
      finance: ['FinanceHeader', 'FinanceFooter', 'FinanceCard']
    };

    const components = industryComponents[context.industry as keyof typeof industryComponents] || ['Header', 'Footer', 'Card'];
    
    components.forEach(componentName => {
      const componentContent = this.generateComponent(componentName, context);
      fs.writeFileSync(path.join(componentsPath, `${componentName}.tsx`), componentContent);
    });
  }

  private generateComponent(componentName: string, context: ProjectContext) {
    return `import React from 'react';

interface ${componentName}Props {
  // Add your props here
}

export const ${componentName}: React.FC<${componentName}Props> = ({}) => {
  return (
    <div className="${componentName.toLowerCase()}-component">
      <h2>${componentName} for ${context.industry}</h2>
      {/* Add your component content here */}
    </div>
  );
};

export default ${componentName};
`;
  }
}

export default FileStructureEnforcer; 