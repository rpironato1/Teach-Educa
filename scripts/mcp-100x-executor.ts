#!/usr/bin/env tsx

/**
 * 🚀 MCP PLAYWRIGHT UNIVERSAL - EXECUTOR 100x
 * Sistema automatizado para execução de 100 iterações do protocolo
 * Com detecção automática de problemas e correções sistemáticas
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const execAsync = promisify(exec);

interface TestResult {
  iteration: number;
  timestamp: string;
  duration: number;
  passed: boolean;
  phases: {
    [key: string]: {
      status: 'passed' | 'failed' | 'warning';
      issues: any[];
      evidence: any[];
    }
  };
  issues: {
    critical: any[];
    warnings: any[];
    total: number;
  };
  fixes: string[];
}

interface IssuePattern {
  pattern: RegExp;
  type: 'critical' | 'warning';
  category: string;
  autoFixable: boolean;
  fixFunction?: () => Promise<boolean>;
}

class MCPUniversal100xExecutor {
  private results: TestResult[] = [];
  private totalIssuesFound = 0;
  private totalIssuesFixed = 0;
  private executionStartTime = Date.now();
  private outputDir = '/home/runner/work/Teach-Educa/Teach-Educa/test-results/100x-execution';

  // Padrões de problemas conhecidos para auto-correção
  private issuePatterns: IssuePattern[] = [
    {
      pattern: /Expected moveto path command.*SVG/i,
      type: 'critical',
      category: 'SVG Path Error',
      autoFixable: true,
      fixFunction: () => this.fixSVGPaths()
    },
    {
      pattern: /Cannot destructure property.*of.*undefined.*AuthContext/i,
      type: 'critical', 
      category: 'React Context Error',
      autoFixable: true,
      fixFunction: () => this.fixReactContexts()
    },
    {
      pattern: /color-contrast.*WCAG/i,
      type: 'warning',
      category: 'WCAG Color Contrast',
      autoFixable: true,
      fixFunction: () => this.fixColorContrast()
    },
    {
      pattern: /First Contentful Paint.*>.*2500/i,
      type: 'warning',
      category: 'Performance FCP',
      autoFixable: true,
      fixFunction: () => this.optimizePerformance()
    },
    {
      pattern: /ERR_BLOCKED_BY_CLIENT.*google.*fonts/i,
      type: 'warning',
      category: 'Font Loading',
      autoFixable: true,
      fixFunction: () => this.fixFontLoading()
    }
  ];

  constructor() {
    // Garantir que o diretório de saída existe
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async execute(): Promise<void> {
    console.log('🚀 INICIANDO EXECUÇÃO 100x DO PROTOCOLO MCP PLAYWRIGHT UNIVERSAL');
    console.log('================================================================');
    console.log(`📅 Início: ${new Date().toISOString()}`);
    console.log(`📁 Resultados salvos em: ${this.outputDir}`);
    console.log('================================================================\n');

    for (let iteration = 1; iteration <= 100; iteration++) {
      console.log(`\n🔄 ITERAÇÃO ${iteration}/100`);
      console.log('─'.repeat(50));
      
      const iterationStart = Date.now();
      
      try {
        // Executar uma iteração completa do protocolo
        const result = await this.executeIteration(iteration);
        this.results.push(result);
        
        // Analisar e corrigir problemas encontrados
        await this.analyzeAndFixIssues(result);
        
        // Salvar progresso a cada 10 iterações
        if (iteration % 10 === 0) {
          await this.saveProgressReport();
        }
        
        const iterationTime = Date.now() - iterationStart;
        console.log(`✅ Iteração ${iteration} concluída em ${iterationTime}ms`);
        console.log(`📊 Status: ${result.passed ? 'SUCESSO' : 'PROBLEMAS ENCONTRADOS'}`);
        console.log(`🐛 Problemas encontrados: ${result.issues.total}`);
        console.log(`🔧 Correções aplicadas: ${result.fixes.length}`);
        
      } catch (error) {
        console.error(`❌ Erro na iteração ${iteration}:`, error);
        
        // Registrar falha mas continuar
        this.results.push({
          iteration,
          timestamp: new Date().toISOString(),
          duration: Date.now() - iterationStart,
          passed: false,
          phases: {},
          issues: { critical: [{ error: error.message }], warnings: [], total: 1 },
          fixes: []
        });
      }
      
      // Pausa breve entre iterações para evitar sobrecarga
      await this.sleep(100);
    }
    
    // Gerar relatório final
    await this.generateFinalReport();
  }

  private async executeIteration(iteration: number): Promise<TestResult> {
    const startTime = Date.now();
    
    // Executar o teste Playwright
    const { stdout, stderr } = await execAsync(
      'npx playwright test tests/mcp-playwright-universal-protocol.spec.ts --reporter=json',
      { cwd: '/home/runner/work/Teach-Educa/Teach-Educa' }
    );
    
    const duration = Date.now() - startTime;
    
    // Analisar resultados
    const testResults = this.parsePlaywrightResults(stdout);
    const consoleIssues = this.extractConsoleIssues(stderr);
    
    const allIssues = [...testResults.issues, ...consoleIssues];
    const criticalIssues = allIssues.filter(issue => issue.type === 'critical');
    const warningIssues = allIssues.filter(issue => issue.type === 'warning');
    
    return {
      iteration,
      timestamp: new Date().toISOString(),
      duration,
      passed: criticalIssues.length === 0,
      phases: testResults.phases,
      issues: {
        critical: criticalIssues,
        warnings: warningIssues,
        total: allIssues.length
      },
      fixes: []
    };
  }

  private parsePlaywrightResults(stdout: string): any {
    try {
      const jsonMatch = stdout.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const results = JSON.parse(jsonMatch[0]);
        return this.extractIssuesFromPlaywrightResults(results);
      }
    } catch (error) {
      console.warn('⚠️  Falha ao analisar resultados Playwright:', error);
    }
    
    return { phases: {}, issues: [] };
  }

  private extractIssuesFromPlaywrightResults(results: any): any {
    const issues: any[] = [];
    const phases: any = {};
    
    if (results.suites) {
      results.suites.forEach((suite: any) => {
        suite.specs?.forEach((spec: any) => {
          const phaseName = this.extractPhaseFromSpecTitle(spec.title);
          
          phases[phaseName] = {
            status: spec.tests[0]?.results[0]?.status || 'unknown',
            issues: [],
            evidence: []
          };
          
          spec.tests?.forEach((test: any) => {
            test.results?.forEach((result: any) => {
              if (result.status === 'failed') {
                issues.push({
                  type: 'critical',
                  phase: phaseName,
                  message: result.error?.message || 'Teste falhou',
                  stack: result.error?.stack
                });
              }
              
              // Extrair problemas dos logs de console
              if (result.stdout) {
                const consoleIssues = this.extractConsoleIssues(result.stdout);
                issues.push(...consoleIssues);
              }
            });
          });
        });
      });
    }
    
    return { phases, issues };
  }

  private extractPhaseFromSpecTitle(title: string): string {
    const phaseMatch = title.match(/FASE\s*(\d+)/i);
    return phaseMatch ? `fase${phaseMatch[1]}` : 'unknown';
  }

  private extractConsoleIssues(output: string): any[] {
    const issues: any[] = [];
    const lines = output.split('\n');
    
    lines.forEach(line => {
      this.issuePatterns.forEach(pattern => {
        if (pattern.pattern.test(line)) {
          issues.push({
            type: pattern.type,
            category: pattern.category,
            message: line.trim(),
            autoFixable: pattern.autoFixable,
            pattern: pattern.pattern.source
          });
        }
      });
    });
    
    return issues;
  }

  private async analyzeAndFixIssues(result: TestResult): Promise<void> {
    const fixesApplied: string[] = [];
    
    for (const issue of [...result.issues.critical, ...result.issues.warnings]) {
      if (issue.autoFixable) {
        const pattern = this.issuePatterns.find(p => 
          p.pattern.test(issue.message) && p.fixFunction
        );
        
        if (pattern && pattern.fixFunction) {
          try {
            console.log(`🔧 Aplicando correção para: ${issue.category}`);
            const fixed = await pattern.fixFunction();
            
            if (fixed) {
              fixesApplied.push(`${issue.category}: ${issue.message}`);
              this.totalIssuesFixed++;
              console.log(`✅ Correção aplicada com sucesso: ${issue.category}`);
            }
          } catch (error) {
            console.error(`❌ Falha ao aplicar correção para ${issue.category}:`, error);
          }
        }
      }
    }
    
    result.fixes = fixesApplied;
    this.totalIssuesFound += result.issues.total;
  }

  // Métodos de correção automática
  private async fixSVGPaths(): Promise<boolean> {
    try {
      console.log('🔧 Corrigindo paths SVG malformados...');
      
      // Buscar arquivos SVG problemáticos
      const { stdout } = await execAsync(
        'find src -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | xargs grep -l "path.*d=" 2>/dev/null || true',
        { cwd: '/home/runner/work/Teach-Educa/Teach-Educa' }
      );
      
      const files = stdout.trim().split('\n').filter(f => f.length > 0);
      let fixed = false;
      
      for (const file of files) {
        const filePath = path.join('/home/runner/work/Teach-Educa/Teach-Educa', file);
        if (existsSync(filePath)) {
          let content = readFileSync(filePath, 'utf8');
          
          // Corrigir paths SVG comuns que causam erro
          const fixes = [
            { from: /d="M9 12l2 2 4-4"/g, to: 'd="M9 12 L11 14 L15 10"' },
            { from: /d="([^"]*?)([ml])(\d)/gi, to: (match, p1, command, number) => `d="${p1}${command} ${number}"` },
            { from: /d="([^"]*?)([lhvcsqta])(\d)/gi, to: (match, p1, command, number) => `d="${p1}${command} ${number}"` }
          ];
          
          const originalContent = content;
          fixes.forEach(fix => {
            content = content.replace(fix.from, fix.to as string);
          });
          
          if (content !== originalContent) {
            writeFileSync(filePath, content);
            fixed = true;
            console.log(`✅ SVG paths corrigidos em: ${file}`);
          }
        }
      }
      
      return fixed;
    } catch (error) {
      console.error('❌ Erro ao corrigir SVG paths:', error);
      return false;
    }
  }

  private async fixReactContexts(): Promise<boolean> {
    try {
      console.log('🔧 Corrigindo erros de contextos React...');
      
      const contextFiles = [
        'src/contexts/AuthContext.tsx',
        'src/contexts/CreditContext.tsx', 
        'src/contexts/AnalyticsContext.tsx'
      ];
      
      let fixed = false;
      
      for (const file of contextFiles) {
        const filePath = path.join('/home/runner/work/Teach-Educa/Teach-Educa', file);
        
        if (existsSync(filePath)) {
          let content = readFileSync(filePath, 'utf8');
          const originalContent = content;
          
          // Corrigir problemas comuns de contextos
          content = content
            // Remover funções duplicadas
            .replace(/(\w+)\s*:\s*\(\)\s*=>\s*\{\},?\s*\n\s*\1\s*:/g, '$1:')
            // Corrigir hoisting issues
            .replace(/(const\s+\w+\s*=\s*\(\)\s*=>\s*\{[\s\S]*?\};?)\s*\n\s*(const\s+\w+Context)/g, '$2\n\n$1')
            // Adicionar valores padrão seguros
            .replace(/(\w+):\s*undefined,/g, '$1: () => {},')
            // Corrigir exports
            .replace(/export\s*\{\s*(\w+Context)\s*\};\s*export\s*\{\s*\1\s*\}/g, 'export { $1 }');
          
          if (content !== originalContent) {
            writeFileSync(filePath, content);
            fixed = true;
            console.log(`✅ Contexto React corrigido: ${file}`);
          }
        }
      }
      
      return fixed;
    } catch (error) {
      console.error('❌ Erro ao corrigir contextos React:', error);
      return false;
    }
  }

  private async fixColorContrast(): Promise<boolean> {
    try {
      console.log('🔧 Corrigindo problemas de contraste de cor WCAG...');
      
      // Buscar arquivos CSS e componentes com cores
      const { stdout } = await execAsync(
        'find src -name "*.css" -o -name "*.tsx" -o -name "*.ts" | xargs grep -l "color\\|bg-\\|text-" 2>/dev/null || true',
        { cwd: '/home/runner/work/Teach-Educa/Teach-Educa' }
      );
      
      const files = stdout.trim().split('\n').filter(f => f.length > 0);
      let fixed = false;
      
      for (const file of files) {
        const filePath = path.join('/home/runner/work/Teach-Educa/Teach-Educa', file);
        if (existsSync(filePath)) {
          let content = readFileSync(filePath, 'utf8');
          const originalContent = content;
          
          // Aplicar correções de contraste
          const contrastFixes = [
            { from: /text-gray-400/g, to: 'text-gray-600' },
            { from: /text-gray-300/g, to: 'text-gray-700' },
            { from: /bg-gray-100.*text-gray-400/g, to: 'bg-gray-100 text-gray-700' },
            { from: /color:\s*#ccc/g, to: 'color: #666' },
            { from: /color:\s*#ddd/g, to: 'color: #555' }
          ];
          
          contrastFixes.forEach(fix => {
            content = content.replace(fix.from, fix.to);
          });
          
          if (content !== originalContent) {
            writeFileSync(filePath, content);
            fixed = true;
            console.log(`✅ Contraste de cor corrigido em: ${file}`);
          }
        }
      }
      
      return fixed;
    } catch (error) {
      console.error('❌ Erro ao corrigir contraste de cor:', error);
      return false;
    }
  }

  private async optimizePerformance(): Promise<boolean> {
    try {
      console.log('🔧 Otimizando performance (FCP, bundle size)...');
      
      // Verificar se há lazy loading implementado
      const mainFile = '/home/runner/work/Teach-Educa/Teach-Educa/src/main.tsx';
      if (existsSync(mainFile)) {
        let content = readFileSync(mainFile, 'utf8');
        const originalContent = content;
        
        // Adicionar lazy loading se não existir
        if (!content.includes('React.lazy')) {
          content = content.replace(
            /import\s+(\w+)\s+from\s+['"]\.\/components\/([^'"]+)['"]/g,
            "const $1 = React.lazy(() => import('./components/$2'))"
          );
          
          // Adicionar Suspense se necessário
          if (!content.includes('Suspense')) {
            content = content.replace(
              /import\s+React/g,
              'import React, { Suspense }'
            );
          }
        }
        
        if (content !== originalContent) {
          writeFileSync(mainFile, content);
          console.log('✅ Lazy loading implementado');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro ao otimizar performance:', error);
      return false;
    }
  }

  private async fixFontLoading(): Promise<boolean> {
    try {
      console.log('🔧 Corrigindo problemas de carregamento de fontes...');
      
      const indexFile = '/home/runner/work/Teach-Educa/Teach-Educa/index.html';
      if (existsSync(indexFile)) {
        let content = readFileSync(indexFile, 'utf8');
        const originalContent = content;
        
        // Adicionar preconnect para Google Fonts
        if (!content.includes('preconnect.*fonts.googleapis')) {
          content = content.replace(
            /<head>/,
            `<head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`
          );
        }
        
        // Adicionar font-display: swap
        content = content.replace(
          /family=([^&'"]*)/g,
          'family=$1&display=swap'
        );
        
        if (content !== originalContent) {
          writeFileSync(indexFile, content);
          console.log('✅ Carregamento de fontes otimizado');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro ao corrigir carregamento de fontes:', error);
      return false;
    }
  }

  private async saveProgressReport(): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      progress: {
        iterationsCompleted: this.results.length,
        totalIterations: 100,
        percentage: (this.results.length / 100) * 100
      },
      statistics: {
        totalIssuesFound: this.totalIssuesFound,
        totalIssuesFixed: this.totalIssuesFixed,
        fixRate: this.totalIssuesFound > 0 ? (this.totalIssuesFixed / this.totalIssuesFound) * 100 : 0,
        averageIterationTime: this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length
      },
      recentResults: this.results.slice(-10)
    };
    
    const reportPath = path.join(this.outputDir, `progress-report-${this.results.length}.json`);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Relatório de progresso salvo: ${reportPath}`);
    console.log(`🎯 Progresso: ${report.progress.percentage.toFixed(1)}%`);
    console.log(`🔧 Taxa de correção: ${report.statistics.fixRate.toFixed(1)}%`);
  }

  private async generateFinalReport(): Promise<void> {
    const totalDuration = Date.now() - this.executionStartTime;
    const successfulIterations = this.results.filter(r => r.passed).length;
    
    const finalReport = {
      execution: {
        startTime: new Date(this.executionStartTime).toISOString(),
        endTime: new Date().toISOString(),
        totalDuration: totalDuration,
        totalIterations: 100,
        successfulIterations,
        successRate: (successfulIterations / 100) * 100
      },
      issues: {
        totalFound: this.totalIssuesFound,
        totalFixed: this.totalIssuesFixed,
        fixRate: this.totalIssuesFound > 0 ? (this.totalIssuesFixed / this.totalIssuesFound) * 100 : 0,
        remainingIssues: this.totalIssuesFound - this.totalIssuesFixed
      },
      phases: this.analyzePhasesPerformance(),
      recommendations: this.generateRecommendations(),
      results: this.results
    };
    
    const reportPath = path.join(this.outputDir, 'FINAL-REPORT-100x-EXECUTION.json');
    writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));
    
    // Gerar relatório em markdown também
    const markdownReport = this.generateMarkdownReport(finalReport);
    const markdownPath = path.join(this.outputDir, 'FINAL-REPORT-100x-EXECUTION.md');
    writeFileSync(markdownPath, markdownReport);
    
    console.log('\n🎯 RELATÓRIO FINAL - EXECUÇÃO 100x PROTOCOLO MCP PLAYWRIGHT UNIVERSAL');
    console.log('================================================================');
    console.log(`⏱️  Duração total: ${Math.round(totalDuration / 1000)}s`);
    console.log(`✅ Iterações bem-sucedidas: ${successfulIterations}/100 (${finalReport.execution.successRate.toFixed(1)}%)`);
    console.log(`🐛 Total de problemas encontrados: ${this.totalIssuesFound}`);
    console.log(`🔧 Total de problemas corrigidos: ${this.totalIssuesFixed}`);
    console.log(`📈 Taxa de correção: ${finalReport.issues.fixRate.toFixed(1)}%`);
    console.log(`📄 Relatórios salvos em: ${this.outputDir}`);
    console.log('================================================================');
    
    if (finalReport.issues.remainingIssues > 0) {
      console.log(`⚠️  ${finalReport.issues.remainingIssues} problemas ainda requerem atenção manual`);
    } else {
      console.log('🎉 TODOS OS PROBLEMAS FORAM CORRIGIDOS AUTOMATICAMENTE!');
    }
  }

  private analyzePhasesPerformance(): any {
    const phaseStats: any = {};
    
    this.results.forEach(result => {
      Object.entries(result.phases).forEach(([phaseName, phaseData]: [string, any]) => {
        if (!phaseStats[phaseName]) {
          phaseStats[phaseName] = {
            totalExecutions: 0,
            successfulExecutions: 0,
            totalIssues: 0
          };
        }
        
        phaseStats[phaseName].totalExecutions++;
        if (phaseData.status === 'passed') {
          phaseStats[phaseName].successfulExecutions++;
        }
        phaseStats[phaseName].totalIssues += phaseData.issues?.length || 0;
      });
    });
    
    return phaseStats;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.totalIssuesFixed < this.totalIssuesFound) {
      recommendations.push('Implementar correções manuais para problemas não resolvidos automaticamente');
    }
    
    const successRate = (this.results.filter(r => r.passed).length / 100) * 100;
    if (successRate < 95) {
      recommendations.push('Investigar causas de falhas recorrentes nos testes');
    }
    
    recommendations.push('Implementar monitoramento contínuo de qualidade');
    recommendations.push('Configurar pipeline CI/CD para execução automática do protocolo');
    
    return recommendations;
  }

  private generateMarkdownReport(report: any): string {
    return `# 🚀 RELATÓRIO FINAL - EXECUÇÃO 100x PROTOCOLO MCP PLAYWRIGHT UNIVERSAL

## 📊 Resumo Executivo

- **Duração Total**: ${Math.round(report.execution.totalDuration / 1000)}s
- **Taxa de Sucesso**: ${report.execution.successRate.toFixed(1)}%
- **Problemas Encontrados**: ${report.issues.totalFound}
- **Problemas Corrigidos**: ${report.issues.totalFixed}
- **Taxa de Correção**: ${report.issues.fixRate.toFixed(1)}%

## 🎯 Resultados por Fase

${Object.entries(report.phases).map(([phase, stats]: [string, any]) => `
### ${phase.toUpperCase()}
- Execuções: ${stats.totalExecutions}
- Sucessos: ${stats.successfulExecutions}
- Taxa de sucesso: ${((stats.successfulExecutions / stats.totalExecutions) * 100).toFixed(1)}%
- Problemas encontrados: ${stats.totalIssues}
`).join('\n')}

## 🔧 Recomendações

${report.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

## 📈 Conclusão

${report.issues.remainingIssues === 0 
  ? '🎉 **TODOS OS PROBLEMAS FORAM CORRIGIDOS AUTOMATICAMENTE!**'
  : `⚠️ **${report.issues.remainingIssues} problemas ainda requerem atenção manual**`
}

---
*Relatório gerado automaticamente em ${report.execution.endTime}*
`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Executar o sistema
async function main() {
  const executor = new MCPUniversal100xExecutor();
  await executor.execute();
}

if (require.main === module) {
  main().catch(console.error);
}

export default MCPUniversal100xExecutor;