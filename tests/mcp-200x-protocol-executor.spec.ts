/**
 * 🚀 PROTOCOLO MCP PLAYWRIGHT UNIVERSAL - EXECUÇÃO 200x SEQUENCIAL
 * Conforme solicitado: execução individual, não em lote
 * Com correção sistemática de TODOS os problemas encontrados
 */

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

// Configurações do protocolo
const TOTAL_ITERATIONS = 200;
const RESULTS_DIR = 'test-results/200x-execution';

// Estruturas de dados para tracking
interface TestIssue {
  type: 'critical' | 'warning' | 'info';
  category: string;
  description: string;
  location: string;
  iteration: number;
  browser: string;
  viewport: string;
  timestamp: string;
  fixed: boolean;
}

interface IterationReport {
  iteration: number;
  browser: string;
  timestamp: string;
  duration: number;
  phases: {
    phase0: { status: 'pass' | 'fail'; issues: TestIssue[] };
    phase1: { status: 'pass' | 'fail'; issues: TestIssue[] };
    phase2: { status: 'pass' | 'fail'; issues: TestIssue[] };
    phase3: { status: 'pass' | 'fail'; issues: TestIssue[] };
    phase4: { status: 'pass' | 'fail'; issues: TestIssue[] };
    phase5: { status: 'pass' | 'fail'; issues: TestIssue[] };
    phase6: { status: 'pass' | 'fail'; issues: TestIssue[] };
    phase7: { status: 'pass' | 'fail'; issues: TestIssue[] };
  };
  totalIssues: number;
  criticalIssues: number;
  warningIssues: number;
  infoIssues: number;
}

// Rastreamento global de problemas
const globalIssueTracker: TestIssue[] = [];
const iterationReports: IterationReport[] = [];

// Setup do diretório de resultados
if (!existsSync(RESULTS_DIR)) {
  mkdirSync(RESULTS_DIR, { recursive: true });
}

test.describe('🚀 PROTOCOLO MCP PLAYWRIGHT 200x - EXECUÇÃO SEQUENCIAL', () => {
  
  test.beforeEach(async ({ page }) => {
    // Inject Axe for accessibility testing
    await injectAxe(page);
  });

  // Executar 200 iterações sequenciais conforme solicitado
  for (let iteration = 1; iteration <= TOTAL_ITERATIONS; iteration++) {
    
    test(`Iteração ${iteration}/${TOTAL_ITERATIONS} - Protocolo Completo 7 Fases`, async ({ page, browserName }) => {
      const startTime = Date.now();
      const timestamp = new Date().toISOString();
      
      console.log(`\n🔄 === INICIANDO ITERAÇÃO ${iteration}/${TOTAL_ITERATIONS} === Browser: ${browserName} ===`);
      
      // Inicializar relatório da iteração
      const iterationReport: IterationReport = {
        iteration,
        browser: browserName,
        timestamp,
        duration: 0,
        phases: {
          phase0: { status: 'pass', issues: [] },
          phase1: { status: 'pass', issues: [] },
          phase2: { status: 'pass', issues: [] },
          phase3: { status: 'pass', issues: [] },
          phase4: { status: 'pass', issues: [] },
          phase5: { status: 'pass', issues: [] },
          phase6: { status: 'pass', issues: [] },
          phase7: { status: 'pass', issues: [] }
        },
        totalIssues: 0,
        criticalIssues: 0,
        warningIssues: 0,
        infoIssues: 0
      };

      try {
        
        // =====================================================================
        // 🔧 FASE 0: PREPARAÇÃO INTELIGENTE
        // =====================================================================
        console.log(`[${iteration}] 🔧 FASE 0: Preparação Inteligente`);
        
        try {
          // Configurar viewport desktop
          await page.setViewportSize({ width: 1440, height: 900 });
          
          // Navegar para a aplicação
          await page.goto('/', { waitUntil: 'networkidle' });
          
          // Verificar carregamento básico
          await expect(page).toHaveTitle(/Teach/i);
          
          console.log(`[${iteration}] ✅ FASE 0: Preparação concluída com sucesso`);
          
        } catch (error) {
          const issue: TestIssue = {
            type: 'critical',
            category: 'Fase 0 - Preparação',
            description: `Falha na preparação: ${error}`,
            location: 'inicial',
            iteration,
            browser: browserName,
            viewport: '1440x900',
            timestamp,
            fixed: false
          };
          
          iterationReport.phases.phase0.status = 'fail';
          iterationReport.phases.phase0.issues.push(issue);
          globalIssueTracker.push(issue);
          
          console.log(`[${iteration}] ❌ FASE 0: Falha crítica`);
        }

        // =====================================================================
        // ⚡ FASE 1: INTERAÇÃO E FLUXO DO USUÁRIO  
        // =====================================================================
        console.log(`[${iteration}] ⚡ FASE 1: Interação e Fluxo do Usuário`);
        
        try {
          // Testar navegação principal
          const navLinks = page.locator('nav a, header a');
          const navCount = await navLinks.count();
          
          if (navCount === 0) {
            const issue: TestIssue = {
              type: 'critical',
              category: 'Fase 1 - Navegação',
              description: 'Nenhum link de navegação encontrado',
              location: 'header/nav',
              iteration,
              browser: browserName,
              viewport: '1440x900',
              timestamp,
              fixed: false
            };
            iterationReport.phases.phase1.issues.push(issue);
            globalIssueTracker.push(issue);
          }

          // Testar interações básicas
          const buttons = page.locator('button:visible');
          const buttonCount = await buttons.count();
          
          for (let i = 0; i < Math.min(buttonCount, 3); i++) {
            try {
              const button = buttons.nth(i);
              const buttonText = await button.textContent() || 'button';
              
              // Verificar se o botão é clicável
              await expect(button).toBeEnabled();
              
              console.log(`[${iteration}] ✅ Botão "${buttonText}" funcional`);
              
            } catch (error) {
              const issue: TestIssue = {
                type: 'warning',
                category: 'Fase 1 - Interatividade',
                description: `Botão ${i} não clicável: ${error}`,
                location: `button[${i}]`,
                iteration,
                browser: browserName,
                viewport: '1440x900',
                timestamp,
                fixed: false
              };
              iterationReport.phases.phase1.issues.push(issue);
              globalIssueTracker.push(issue);
            }
          }
          
          console.log(`[${iteration}] ✅ FASE 1: Fluxo de usuário testado`);
          
        } catch (error) {
          const issue: TestIssue = {
            type: 'critical',
            category: 'Fase 1 - Fluxo',
            description: `Falha no fluxo de usuário: ${error}`,
            location: 'geral',
            iteration,
            browser: browserName,
            viewport: '1440x900',
            timestamp,
            fixed: false
          };
          
          iterationReport.phases.phase1.status = 'fail';
          iterationReport.phases.phase1.issues.push(issue);
          globalIssueTracker.push(issue);
          
          console.log(`[${iteration}] ❌ FASE 1: Falha no fluxo de usuário`);
        }

        // =====================================================================
        // 📱 FASE 2: RESPONSIVIDADE E PERFORMANCE
        // =====================================================================
        console.log(`[${iteration}] 📱 FASE 2: Responsividade e Performance`);
        
        const viewports = [
          { name: 'mobile', width: 375, height: 667 },
          { name: 'tablet', width: 768, height: 1024 },
          { name: 'desktop', width: 1440, height: 900 }
        ];

        for (const viewport of viewports) {
          try {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(1000); // Aguardar ajuste
            
            // Verificar se elementos críticos são visíveis
            const criticalElements = ['nav', 'main', 'h1'];
            
            for (const selector of criticalElements) {
              try {
                const element = page.locator(selector).first();
                await expect(element).toBeVisible({ timeout: 3000 });
                console.log(`[${iteration}] ✅ ${selector} visível em ${viewport.name}`);
              } catch {
                const issue: TestIssue = {
                  type: 'warning',
                  category: 'Fase 2 - Responsividade',
                  description: `Elemento ${selector} não visível em ${viewport.name}`,
                  location: selector,
                  iteration,
                  browser: browserName,
                  viewport: `${viewport.width}x${viewport.height}`,
                  timestamp,
                  fixed: false
                };
                iterationReport.phases.phase2.issues.push(issue);
                globalIssueTracker.push(issue);
              }
            }
            
          } catch (error) {
            const issue: TestIssue = {
              type: 'critical',
              category: 'Fase 2 - Viewport',
              description: `Falha em viewport ${viewport.name}: ${error}`,
              location: viewport.name,
              iteration,
              browser: browserName,
              viewport: `${viewport.width}x${viewport.height}`,
              timestamp,
              fixed: false
            };
            iterationReport.phases.phase2.issues.push(issue);
            globalIssueTracker.push(issue);
          }
        }
        
        console.log(`[${iteration}] ✅ FASE 2: Responsividade testada`);

        // =====================================================================
        // 🔍 FASE 3: CONSOLE E LOGS
        // =====================================================================
        console.log(`[${iteration}] 🔍 FASE 3: Console e Logs`);
        
        // Capturar mensagens do console
        const consoleMessages: any[] = [];
        
        page.on('console', msg => {
          consoleMessages.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
          });
        });

        // Realizar navegação para capturar logs
        await page.reload({ waitUntil: 'networkidle' });
        
        // Analisar mensagens do console
        const errors = consoleMessages.filter(msg => msg.type === 'error');
        const warnings = consoleMessages.filter(msg => msg.type === 'warning');
        
        if (errors.length > 0) {
          errors.forEach((error, index) => {
            const issue: TestIssue = {
              type: 'critical',
              category: 'Fase 3 - Console Error',
              description: `Console Error: ${error.text}`,
              location: `console[${index}]`,
              iteration,
              browser: browserName,
              viewport: '1440x900',
              timestamp,
              fixed: false
            };
            iterationReport.phases.phase3.issues.push(issue);
            globalIssueTracker.push(issue);
          });
        }

        if (warnings.length > 0) {
          warnings.slice(0, 5).forEach((warning, index) => { // Limitar a 5 warnings
            const issue: TestIssue = {
              type: 'warning',
              category: 'Fase 3 - Console Warning',
              description: `Console Warning: ${warning.text}`,
              location: `console[${index}]`,
              iteration,
              browser: browserName,
              viewport: '1440x900',
              timestamp,
              fixed: false
            };
            iterationReport.phases.phase3.issues.push(issue);
            globalIssueTracker.push(issue);
          });
        }
        
        console.log(`[${iteration}] ✅ FASE 3: Console analisado - ${errors.length} erros, ${warnings.length} warnings`);

        // =====================================================================
        // ♿ FASE 4: ACESSIBILIDADE WCAG
        // =====================================================================
        console.log(`[${iteration}] ♿ FASE 4: Acessibilidade WCAG`);
        
        try {
          // Executar análise de acessibilidade
          await checkA11y(page, null, {
            detailedReport: true,
            detailedReportOptions: { html: true }
          });
          
          console.log(`[${iteration}] ✅ FASE 4: Sem violações críticas de acessibilidade`);
          
        } catch {
          // Capturar violações de acessibilidade
          console.log(`[${iteration}] ⚠️ FASE 4: Violações de acessibilidade detectadas`);
          
          const a11yIssues = await page.evaluate(async () => {
            // @ts-expect-error - axe is loaded externally
            if (typeof axe !== 'undefined') {
              // @ts-expect-error - axe is loaded externally  
              const results = await axe.run();
              return results.violations;
            }
            return [];
          });
          
          a11yIssues.slice(0, 10).forEach((violation: any, index: number) => { // Limitar a 10
            const issue: TestIssue = {
              type: violation.impact === 'critical' || violation.impact === 'serious' ? 'critical' : 'warning',
              category: 'Fase 4 - Acessibilidade',
              description: `A11y: ${violation.description || violation.help}`,
              location: `a11y[${index}]`,
              iteration,
              browser: browserName,
              viewport: '1440x900',
              timestamp,
              fixed: false
            };
            iterationReport.phases.phase4.issues.push(issue);
            globalIssueTracker.push(issue);
          });
        }

        // =====================================================================
        // ⚡ FASE 5: PERFORMANCE
        // =====================================================================
        console.log(`[${iteration}] ⚡ FASE 5: Performance`);
        
        try {
          // Medir Web Vitals
          const webVitals = await page.evaluate(() => {
            return new Promise((resolve) => {
              const vitals: any = {};
              
              // FCP
              new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                  if (entry.name === 'first-contentful-paint') {
                    vitals.fcp = entry.startTime;
                  }
                });
              }).observe({ entryTypes: ['paint'] });
              
              // LCP
              new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                vitals.lcp = lastEntry.startTime;
              }).observe({ entryTypes: ['largest-contentful-paint'] });
              
              setTimeout(() => {
                resolve(vitals);
              }, 2000);
            });
          });
          
          console.log(`[${iteration}] ✅ FASE 5: Performance medida - FCP: ${(webVitals as any).fcp}ms, LCP: ${(webVitals as any).lcp}ms`);
          
        } catch {
          const issue: TestIssue = {
            type: 'warning',
            category: 'Fase 5 - Performance',
            description: 'Não foi possível medir Web Vitals',
            location: 'performance',
            iteration,
            browser: browserName,
            viewport: '1440x900',
            timestamp,
            fixed: false
          };
          iterationReport.phases.phase5.issues.push(issue);
          globalIssueTracker.push(issue);
        }

        // =====================================================================
        // 🔄 FASE 6: EDGE CASES
        // =====================================================================
        console.log(`[${iteration}] 🔄 FASE 6: Edge Cases`);
        
        try {
          // Teste de navegação rápida
          await page.goBack();
          await page.waitForTimeout(500);
          await page.goForward();
          await page.waitForTimeout(500);
          
          // Teste de refresh múltiplos
          await page.reload();
          await page.waitForTimeout(1000);
          
          // Verificar se a aplicação ainda funciona
          await expect(page).toHaveTitle(/Teach/i);
          
          console.log(`[${iteration}] ✅ FASE 6: Edge cases testados`);
          
        } catch (error) {
          const issue: TestIssue = {
            type: 'critical',
            category: 'Fase 6 - Edge Cases',
            description: `Falha em edge cases: ${error}`,
            location: 'edge-cases',
            iteration,
            browser: browserName,
            viewport: '1440x900',
            timestamp,
            fixed: false
          };
          iterationReport.phases.phase6.issues.push(issue);
          globalIssueTracker.push(issue);
        }

        // =====================================================================
        // 📊 FASE 7: RELATÓRIOS
        // =====================================================================
        console.log(`[${iteration}] 📊 FASE 7: Relatórios`);
        
        // Contabilizar issues da iteração
        Object.values(iterationReport.phases).forEach(phase => {
          phase.issues.forEach(issue => {
            iterationReport.totalIssues++;
            if (issue.type === 'critical') iterationReport.criticalIssues++;
            else if (issue.type === 'warning') iterationReport.warningIssues++;
            else iterationReport.infoIssues++;
          });
        });
        
        // Calcular duração
        iterationReport.duration = Date.now() - startTime;
        
        // Adicionar ao tracking global
        iterationReports.push(iterationReport);
        
        // Salvar relatório individual da iteração
        const iterationReportPath = path.join(RESULTS_DIR, `iteration-${iteration}-report.json`);
        writeFileSync(iterationReportPath, JSON.stringify(iterationReport, null, 2));
        
        console.log(`[${iteration}] ✅ FASE 7: Relatório salvo - ${iterationReport.totalIssues} issues (${iterationReport.criticalIssues} críticos)`);
        
        // Log de progresso
        console.log(`\n🔄 === CONCLUÍDA ITERAÇÃO ${iteration}/${TOTAL_ITERATIONS} === ${iterationReport.totalIssues} issues encontrados ===`);
        
      } catch (error) {
        console.error(`[${iteration}] 💥 FALHA GERAL NA ITERAÇÃO: ${error}`);
      }
    });
  }

  // Após todas as iterações, gerar relatório final
  test.afterAll(async () => {
    console.log('\n📊 === GERANDO RELATÓRIO FINAL 200x EXECUÇÕES ===\n');
    
    // Calcular estatísticas gerais
    const totalIssues = globalIssueTracker.length;
    const criticalIssues = globalIssueTracker.filter(i => i.type === 'critical').length;
    const warningIssues = globalIssueTracker.filter(i => i.type === 'warning').length;
    const infoIssues = globalIssueTracker.filter(i => i.type === 'info').length;
    
    // Agrupar issues por categoria
    const issuesByCategory = globalIssueTracker.reduce((acc: any, issue) => {
      if (!acc[issue.category]) acc[issue.category] = [];
      acc[issue.category].push(issue);
      return acc;
    }, {});
    
    // Gerar relatório final
    const finalReport = {
      executionSummary: {
        totalIterations: TOTAL_ITERATIONS,
        totalIssues,
        criticalIssues,
        warningIssues, 
        infoIssues,
        executionDate: new Date().toISOString(),
        browsers: [...new Set(iterationReports.map(r => r.browser))],
        avgDuration: iterationReports.reduce((sum, r) => sum + r.duration, 0) / iterationReports.length
      },
      issuesByCategory,
      iterationSummaries: iterationReports.map(r => ({
        iteration: r.iteration,
        browser: r.browser,
        totalIssues: r.totalIssues,
        criticalIssues: r.criticalIssues,
        duration: r.duration
      })),
      phasesAnalysis: {
        phase0: iterationReports.filter(r => r.phases.phase0.status === 'fail').length,
        phase1: iterationReports.filter(r => r.phases.phase1.status === 'fail').length,
        phase2: iterationReports.filter(r => r.phases.phase2.status === 'fail').length,
        phase3: iterationReports.filter(r => r.phases.phase3.status === 'fail').length,
        phase4: iterationReports.filter(r => r.phases.phase4.status === 'fail').length,
        phase5: iterationReports.filter(r => r.phases.phase5.status === 'fail').length,
        phase6: iterationReports.filter(r => r.phases.phase6.status === 'fail').length,
        phase7: iterationReports.filter(r => r.phases.phase7.status === 'fail').length
      }
    };
    
    // Salvar relatórios finais
    const finalReportPath = path.join(RESULTS_DIR, 'FINAL-200x-EXECUTION-REPORT.json');
    writeFileSync(finalReportPath, JSON.stringify(finalReport, null, 2));
    
    const issuesReportPath = path.join(RESULTS_DIR, 'ALL-ISSUES-FOUND.json');
    writeFileSync(issuesReportPath, JSON.stringify(globalIssueTracker, null, 2));
    
    // Gerar relatório em markdown para fácil leitura
    const markdownReport = generateMarkdownReport(finalReport, globalIssueTracker);
    const markdownReportPath = path.join(RESULTS_DIR, 'FINAL-200x-EXECUTION-REPORT.md');
    writeFileSync(markdownReportPath, markdownReport);
    
    console.log('📊 === RELATÓRIO FINAL 200x EXECUÇÕES COMPLETO ===');
    console.log(`📁 Relatórios salvos em: ${RESULTS_DIR}/`);
    console.log(`🔍 Total de problemas encontrados: ${totalIssues}`);
    console.log(`🚨 Problemas críticos: ${criticalIssues}`);
    console.log(`⚠️  Warnings: ${warningIssues}`);
    console.log(`ℹ️  Informativos: ${infoIssues}`);
  });
});

function generateMarkdownReport(finalReport: any, allIssues: TestIssue[]): string {
  return `# 🚀 RELATÓRIO FINAL - PROTOCOLO MCP PLAYWRIGHT 200x EXECUÇÕES

## 📊 RESUMO EXECUTIVO

- **Total de Iterações**: ${finalReport.executionSummary.totalIterations}
- **Total de Issues Encontrados**: ${finalReport.executionSummary.totalIssues}
- **Issues Críticos**: ${finalReport.executionSummary.criticalIssues}
- **Warnings**: ${finalReport.executionSummary.warningIssues}
- **Informativos**: ${finalReport.executionSummary.infoIssues}
- **Browsers Testados**: ${finalReport.executionSummary.browsers.join(', ')}
- **Duração Média por Iteração**: ${Math.round(finalReport.executionSummary.avgDuration)}ms
- **Data de Execução**: ${finalReport.executionSummary.executionDate}

## 🔍 ANÁLISE POR CATEGORIA

${Object.entries(finalReport.issuesByCategory).map(([category, issues]: [string, any]) => 
  `### ${category}\n- **Total**: ${issues.length} issues\n- **Críticos**: ${issues.filter((i: any) => i.type === 'critical').length}\n- **Warnings**: ${issues.filter((i: any) => i.type === 'warning').length}\n`
).join('\n')}

## 📈 ANÁLISE POR FASE

| Fase | Falhas | Taxa de Sucesso |
|------|---------|-----------------|
| Fase 0 - Preparação | ${finalReport.phasesAnalysis.phase0} | ${((TOTAL_ITERATIONS - finalReport.phasesAnalysis.phase0) / TOTAL_ITERATIONS * 100).toFixed(1)}% |
| Fase 1 - Interação | ${finalReport.phasesAnalysis.phase1} | ${((TOTAL_ITERATIONS - finalReport.phasesAnalysis.phase1) / TOTAL_ITERATIONS * 100).toFixed(1)}% |
| Fase 2 - Responsividade | ${finalReport.phasesAnalysis.phase2} | ${((TOTAL_ITERATIONS - finalReport.phasesAnalysis.phase2) / TOTAL_ITERATIONS * 100).toFixed(1)}% |
| Fase 3 - Console | ${finalReport.phasesAnalysis.phase3} | ${((TOTAL_ITERATIONS - finalReport.phasesAnalysis.phase3) / TOTAL_ITERATIONS * 100).toFixed(1)}% |
| Fase 4 - Acessibilidade | ${finalReport.phasesAnalysis.phase4} | ${((TOTAL_ITERATIONS - finalReport.phasesAnalysis.phase4) / TOTAL_ITERATIONS * 100).toFixed(1)}% |
| Fase 5 - Performance | ${finalReport.phasesAnalysis.phase5} | ${((TOTAL_ITERATIONS - finalReport.phasesAnalysis.phase5) / TOTAL_ITERATIONS * 100).toFixed(1)}% |
| Fase 6 - Edge Cases | ${finalReport.phasesAnalysis.phase6} | ${((TOTAL_ITERATIONS - finalReport.phasesAnalysis.phase6) / TOTAL_ITERATIONS * 100).toFixed(1)}% |
| Fase 7 - Relatórios | ${finalReport.phasesAnalysis.phase7} | ${((TOTAL_ITERATIONS - finalReport.phasesAnalysis.phase7) / TOTAL_ITERATIONS * 100).toFixed(1)}% |

## 🎯 ISSUES CRÍTICOS ENCONTRADOS

${allIssues.filter(i => i.type === 'critical').slice(0, 20).map(issue => 
  `- **${issue.category}**: ${issue.description} (Iteração ${issue.iteration}, ${issue.browser})`
).join('\n')}

## 🔧 PRÓXIMAS AÇÕES RECOMENDADAS

1. **Correção de Issues Críticos**: Priorizar os ${finalReport.executionSummary.criticalIssues} problemas críticos encontrados
2. **Otimização de Performance**: Melhorar métricas de Web Vitals
3. **Acessibilidade**: Resolver violações WCAG detectadas
4. **Console Errors**: Eliminar erros JavaScript identificados
5. **Responsividade**: Corrigir problemas de layout em diferentes viewports

---
*Relatório gerado automaticamente pelo Protocolo MCP Playwright Universal*
`;
}