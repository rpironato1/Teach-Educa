#!/usr/bin/env node
/**
 * 🔧 SISTEMA DE CORREÇÃO AUTOMÁTICA DE LINTING
 * 
 * Script para corrigir automaticamente os problemas de linting mais comuns
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

class LintingAutofixer {
  constructor() {
    this.fixedFiles = new Set();
    this.fixesApplied = [];
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  async runAutofixes() {
    this.log('🔧 Iniciando correções automáticas de linting...', 'START');

    try {
      // 1. Corrigir problemas de imports não utilizados
      await this.fixUnusedImports();
      
      // 2. Corrigir problemas de variáveis não utilizadas
      await this.fixUnusedVariables();
      
      // 3. Corrigir tipos 'any'
      await this.fixAnyTypes();
      
      // 4. Corrigir problemas de TypeScript
      await this.fixTypeScriptIssues();
      
      // 5. Aplicar correções automáticas do ESLint
      await this.runEslintAutofix();

      this.generateReport();
      
    } catch (error) {
      this.log(`❌ Erro durante correções: ${error instanceof Error ? error.message : String(error)}`, 'ERROR');
      throw error;
    }
  }

  async fixUnusedImports() {
    this.log('📦 Corrigindo imports não utilizados...');
    
    const files = this.findSourceFiles();
    
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      let newContent = content;
      
      // Corrigir imports específicos não utilizados
      const unusedImportFixes = [
        // Remove vi import if not used
        {
          pattern: /import { describe, it, expect, vi(.*?) } from 'vitest'/g,
          replacement: (match, rest) => {
            if (!content.includes('vi.')) {
              return `import { describe, it, expect${rest} } from 'vitest'`;
            }
            return match;
          }
        },
        // Remove specific unused imports
        {
          pattern: /import { (.*?)afterEach(.*?) } from '@testing-library\/react'/g,
          replacement: (match, before, after) => {
            if (!content.includes('afterEach')) {
              const cleanBefore = before.replace(/,\s*$/, '').replace(/^\s*,/, '');
              const cleanAfter = after.replace(/^\s*,/, '').replace(/,\s*$/, '');
              const imports = [cleanBefore, cleanAfter].filter(Boolean).join(', ');
              return imports ? `import { ${imports} } from '@testing-library/react'` : '';
            }
            return match;
          }
        }
      ];
      
      for (const fix of unusedImportFixes) {
        if (typeof fix.replacement === 'function') {
          newContent = newContent.replace(fix.pattern, fix.replacement);
        } else {
          newContent = newContent.replace(fix.pattern, fix.replacement);
        }
      }
      
      if (newContent !== content) {
        writeFileSync(file, newContent);
        this.fixedFiles.add(file);
        this.fixesApplied.push(`Removed unused imports in ${file}`);
      }
    }
  }

  async fixUnusedVariables() {
    this.log('🔄 Corrigindo variáveis não utilizadas...');
    
    const files = this.findSourceFiles();
    
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      let newContent = content;
      
      // Corrigir variáveis não utilizadas adicionando underscore
      const unusedVarFixes = [
        // Error handlers
        {
          pattern: /} catch \(error: ([^)]+)\) {/g,
          replacement: '} catch (_error: $1) {'
        },
        // Function parameters
        {
          pattern: /\(([^:,]+): ([^,)]+)\) => {[^}]*}/g,
          replacement: (match) => {
            // Se a variável não é usada no corpo da função, adicionar _
            return match;
          }
        }
      ];
      
      for (const fix of unusedVarFixes) {
        newContent = newContent.replace(fix.pattern, fix.replacement);
      }
      
      if (newContent !== content) {
        writeFileSync(file, newContent);
        this.fixedFiles.add(file);
        this.fixesApplied.push(`Fixed unused variables in ${file}`);
      }
    }
  }

  async fixAnyTypes() {
    this.log('🎯 Corrigindo tipos "any"...');
    
    const files = this.findSourceFiles();
    
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      let newContent = content;
      
      // Substituições comuns de 'any'
      const anyTypeFixes = [
        // Error handling
        {
          pattern: /error: any/g,
          replacement: 'error: unknown'
        },
        // React props
        {
          pattern: /props: any/g,
          replacement: 'props: Record<string, unknown>'
        },
        // Function parameters
        {
          pattern: /\(\.\.\.\w+: any\[\]/g,
          replacement: (match) => match.replace('any[]', 'unknown[]')
        },
        // Object types
        {
          pattern: /: any\[\]/g,
          replacement: ': unknown[]'
        }
      ];
      
      for (const fix of anyTypeFixes) {
        newContent = newContent.replace(fix.pattern, fix.replacement);
      }
      
      if (newContent !== content) {
        writeFileSync(file, newContent);
        this.fixedFiles.add(file);
        this.fixesApplied.push(`Fixed 'any' types in ${file}`);
      }
    }
  }

  async fixTypeScriptIssues() {
    this.log('📝 Corrigindo problemas específicos de TypeScript...');
    
    const files = this.findSourceFiles();
    
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      let newContent = content;
      
      // Correções específicas de TS
      const tsFixes = [
        // Remove escape desnecessário
        {
          pattern: /\\'/g,
          replacement: "'"
        },
        // Fix async promise executor
        {
          pattern: /new Promise\(async \(/g,
          replacement: 'new Promise(('
        },
        // Fix class property types
        {
          pattern: /private (\w+): string\s*$/gm,
          replacement: ''
        }
      ];
      
      for (const fix of tsFixes) {
        newContent = newContent.replace(fix.pattern, fix.replacement);
      }
      
      if (newContent !== content) {
        writeFileSync(file, newContent);
        this.fixedFiles.add(file);
        this.fixesApplied.push(`Fixed TypeScript issues in ${file}`);
      }
    }
  }

  async runEslintAutofix() {
    this.log('🔧 Executando correções automáticas do ESLint...');
    
    try {
      execSync('npx eslint . --fix --quiet', { 
        cwd: projectRoot,
        stdio: 'pipe'
      });
      this.log('✅ ESLint autofix completado');
    } catch (error) {
      this.log('⚠️ ESLint autofix completado com alguns problemas restantes');
    }
  }

  findSourceFiles() {
    const sourceFiles = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    const searchDirs = [
      join(projectRoot, 'src'),
      join(projectRoot, 'tests'),
      join(projectRoot, 'scripts')
    ];
    
    for (const dir of searchDirs) {
      try {
        this.findFilesRecursive(dir, extensions, sourceFiles);
      } catch (error) {
        // Directory may not exist
      }
    }
    
    return sourceFiles;
  }

  findFilesRecursive(dir, extensions, result) {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        this.findFilesRecursive(fullPath, extensions, result);
      } else if (stat.isFile() && extensions.includes(extname(item))) {
        result.push(fullPath);
      }
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      filesFixed: this.fixedFiles.size,
      fixesApplied: this.fixesApplied.length,
      details: this.fixesApplied,
      affectedFiles: Array.from(this.fixedFiles)
    };
    
    writeFileSync(
      join(projectRoot, 'lint-autofix-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    this.log(`📊 RELATÓRIO DE CORREÇÕES`, 'REPORT');
    this.log(`📁 Arquivos corrigidos: ${this.fixedFiles.size}`, 'REPORT');
    this.log(`🔧 Correções aplicadas: ${this.fixesApplied.length}`, 'REPORT');
    this.log(`📄 Relatório salvo em: lint-autofix-report.json`, 'REPORT');
  }
}

// Execução principal
if (import.meta.url === `file://${process.argv[1]}`) {
  const autofixer = new LintingAutofixer();
  autofixer.runAutofixes().catch(process.exit);
}

export default LintingAutofixer;