#!/usr/bin/env node

import { execSync } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
}

const log = (message, color = 'white') => {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`)
}

const runCommand = (command, description) => {
  log(`\n🚀 ${description}`, 'cyan')
  log(`   Command: ${command}`, 'blue')
  
  try {
    const start = Date.now()
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      maxBuffer: 1024 * 1024 * 50 // 50MB buffer
    })
    const duration = Date.now() - start
    
    log(`✅ ${description} completed in ${duration}ms`, 'green')
    return { success: true, output, duration }
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red')
    return { success: false, error: error.message, output: error.stdout || '' }
  }
}

const analyzeTestResults = (output) => {
  const stats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    coverage: 0
  }

  // Parse vitest output
  const vitestMatch = output.match(/(\d+) passed.*?(\d+) failed/)
  if (vitestMatch) {
    stats.passed = parseInt(vitestMatch[1])
    stats.failed = parseInt(vitestMatch[2])
    stats.total = stats.passed + stats.failed
  }

  // Parse coverage
  const coverageMatch = output.match(/All files.*?(\d+\.?\d*)%/)
  if (coverageMatch) {
    stats.coverage = parseFloat(coverageMatch[1])
  }

  return stats
}

const generateTestReport = async (results) => {
  const timestamp = new Date().toISOString()
  const report = {
    timestamp,
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      successRate: 0,
      averageCoverage: 0
    },
    testSuites: results,
    recommendations: []
  }

  // Calculate summary
  results.forEach(result => {
    if (result.stats) {
      report.summary.totalTests += result.stats.total
      report.summary.passedTests += result.stats.passed
      report.summary.failedTests += result.stats.failed
    }
  })

  if (report.summary.totalTests > 0) {
    report.summary.successRate = (report.summary.passedTests / report.summary.totalTests * 100).toFixed(2)
  }

  // Generate recommendations
  if (report.summary.successRate < 80) {
    report.recommendations.push('⚠️  Success rate below 80%. Review failing tests and fix critical issues.')
  }
  
  if (report.summary.successRate >= 80 && report.summary.successRate < 95) {
    report.recommendations.push('📈 Good progress! Focus on edge cases and error handling to reach 95%.')
  }
  
  if (report.summary.successRate >= 95) {
    report.recommendations.push('🎉 Excellent test coverage! Consider adding performance and security tests.')
  }

  // Save detailed report
  const reportPath = path.join(process.cwd(), 'comprehensive-test-report.json')
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
  
  return report
}

const printSummary = (report) => {
  log('\n' + '='.repeat(80), 'cyan')
  log('📊 COMPREHENSIVE TEST EXECUTION SUMMARY', 'cyan')
  log('='.repeat(80), 'cyan')
  
  log(`\n📈 Overall Statistics:`, 'white')
  log(`   Total Tests: ${report.summary.totalTests}`, 'blue')
  log(`   Passed: ${report.summary.passedTests}`, 'green')
  log(`   Failed: ${report.summary.failedTests}`, report.summary.failedTests > 0 ? 'red' : 'green')
  log(`   Success Rate: ${report.summary.successRate}%`, 
      report.summary.successRate >= 80 ? 'green' : 'yellow')

  log(`\n🎯 Test Suite Breakdown:`, 'white')
  report.testSuites.forEach(suite => {
    const status = suite.success ? '✅' : '❌'
    const rate = suite.stats ? 
      `(${((suite.stats.passed / suite.stats.total) * 100).toFixed(1)}%)` : ''
    log(`   ${status} ${suite.name} ${rate}`, suite.success ? 'green' : 'red')
  })

  if (report.recommendations.length > 0) {
    log(`\n💡 Recommendations:`, 'yellow')
    report.recommendations.forEach(rec => log(`   ${rec}`, 'yellow'))
  }

  log('\n🔗 Detailed report saved to: comprehensive-test-report.json', 'cyan')
  log('='.repeat(80), 'cyan')
}

const main = async () => {
  log('🎯 Starting Comprehensive Test Suite Execution', 'magenta')
  log('This will run all implemented test priorities with detailed analysis\n', 'white')

  const testSuites = [
    {
      name: 'Core Unit Tests (Services & Hooks)',
      command: 'npm run test:unit -- --reporter=verbose',
      priority: 'HIGH'
    },
    {
      name: 'Component Integration Tests',
      command: 'npx vitest run src/__tests__/components --reporter=verbose',
      priority: 'HIGH'
    },
    {
      name: 'Error Boundary & Resilience Tests',
      command: 'npx vitest run src/__tests__/error-boundary --reporter=verbose',
      priority: 'MEDIUM'
    },
    {
      name: 'Performance Optimization Tests',
      command: 'npx vitest run src/__tests__/performance --reporter=verbose',
      priority: 'MEDIUM'
    },
    {
      name: 'Security Validation Tests',
      command: 'npx vitest run src/__tests__/security --reporter=verbose',
      priority: 'MEDIUM'
    },
    {
      name: 'Build Verification',
      command: 'npm run build',
      priority: 'HIGH'
    },
    {
      name: 'Linting & Code Quality',
      command: 'npm run lint',
      priority: 'LOW'
    }
  ]

  const results = []

  for (const suite of testSuites) {
    log(`\n🔍 Priority: ${suite.priority}`, 'magenta')
    const result = runCommand(suite.command, suite.name)
    
    result.name = suite.name
    result.priority = suite.priority
    
    if (result.success && result.output) {
      result.stats = analyzeTestResults(result.output)
    }
    
    results.push(result)

    // Short pause between test suites
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Generate and display final report
  const report = await generateTestReport(results)
  printSummary(report)

  // Determine exit code based on critical failures
  const criticalFailures = results.filter(r => 
    !r.success && (r.priority === 'HIGH')
  ).length

  if (criticalFailures > 0) {
    log(`\n❌ ${criticalFailures} critical test suite(s) failed. Deployment not recommended.`, 'red')
    process.exit(1)
  } else if (report.summary.successRate >= 80) {
    log(`\n✅ Test suite passed with ${report.summary.successRate}% success rate. Ready for deployment!`, 'green')
    process.exit(0)
  } else {
    log(`\n⚠️  Test suite has ${report.summary.successRate}% success rate. Review failures before deployment.`, 'yellow')
    process.exit(1)
  }
}

main().catch(error => {
  log(`\n❌ Test execution failed: ${error.message}`, 'red')
  process.exit(1)
})