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
  white: '\x1b[37m',
  gray: '\x1b[90m'
}

const log = (message, color = 'white') => {
  const timestamp = new Date().toISOString().slice(11, 23)
  console.log(`${COLORS.gray}[${timestamp}]${COLORS.reset} ${COLORS[color]}${message}${COLORS.reset}`)
}

const logSeparator = (char = '=', length = 80, color = 'cyan') => {
  log(char.repeat(length), color)
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
    
    // Log detailed output for failed tests
    if (output.includes('failed') || output.includes('error')) {
      log(`📝 Output contains failures/errors`, 'yellow')
    }
    
    return { success: true, output, duration }
  } catch (error) {
    const duration = Date.now() - Date.now()
    log(`❌ ${description} failed: ${error.message}`, 'red')
    
    // Log error details for debugging
    if (error.stdout) {
      log(`📋 Error output available`, 'yellow')
    }
    
    return { 
      success: false, 
      error: error.message, 
      output: error.stdout || '', 
      stderr: error.stderr || '',
      duration
    }
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

  // Parse vitest output - multiple patterns for robustness
  const vitestPatterns = [
    /Test Files\s+(\d+) passed.*?(\d+) failed/,
    /(\d+) passed.*?(\d+) failed/,
    /(\d+) passed/,
    /✓ (\d+) passed/,
    /Tests (\d+) passed/
  ]

  for (const pattern of vitestPatterns) {
    const match = output.match(pattern)
    if (match) {
      stats.passed = parseInt(match[1])
      stats.failed = match[2] ? parseInt(match[2]) : 0
      stats.total = stats.passed + stats.failed
      break
    }
  }

  // Parse failure count separately if not found
  if (stats.total === 0) {
    const failedMatch = output.match(/(\d+) failed/)
    if (failedMatch) {
      stats.failed = parseInt(failedMatch[1])
      stats.total = stats.failed
    }
  }

  // Parse coverage
  const coveragePatterns = [
    /All files.*?(\d+\.?\d*)%/,
    /Coverage.*?(\d+\.?\d*)%/,
    /Lines.*?(\d+\.?\d*)%/
  ]
  
  for (const pattern of coveragePatterns) {
    const match = output.match(pattern)
    if (match) {
      stats.coverage = parseFloat(match[1])
      break
    }
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
      averageCoverage: 0,
      totalDuration: 0,
      criticalFailures: 0
    },
    testSuites: results,
    recommendations: [],
    deployment: {
      ready: false,
      blockers: [],
      warnings: []
    }
  }

  // Calculate summary
  let totalCoverage = 0
  let coverageCount = 0
  
  results.forEach(result => {
    report.summary.totalDuration += result.duration || 0
    
    if (result.stats) {
      report.summary.totalTests += result.stats.total
      report.summary.passedTests += result.stats.passed
      report.summary.failedTests += result.stats.failed
      
      if (result.stats.coverage > 0) {
        totalCoverage += result.stats.coverage
        coverageCount++
      }
    }
    
    // Count critical failures
    if (!result.success && result.priority === 'HIGH') {
      report.summary.criticalFailures++
      report.deployment.blockers.push(`${result.name} (${result.priority})`)
    } else if (!result.success && result.priority === 'MEDIUM') {
      report.deployment.warnings.push(`${result.name} (${result.priority})`)
    }
  })

  if (report.summary.totalTests > 0) {
    report.summary.successRate = parseFloat((report.summary.passedTests / report.summary.totalTests * 100).toFixed(2))
  }
  
  if (coverageCount > 0) {
    report.summary.averageCoverage = parseFloat((totalCoverage / coverageCount).toFixed(2))
  }

  // Deployment readiness assessment
  report.deployment.ready = (
    report.summary.criticalFailures === 0 && 
    report.summary.successRate >= 80
  )

  // Generate recommendations based on comprehensive analysis
  if (report.summary.successRate < 50) {
    report.recommendations.push('🚨 CRITICAL: Success rate below 50%. Immediate action required.')
  } else if (report.summary.successRate < 80) {
    report.recommendations.push('⚠️  Success rate below 80%. Review failing tests and fix critical issues.')
  } else if (report.summary.successRate < 95) {
    report.recommendations.push('📈 Good progress! Focus on edge cases and error handling to reach 95%.')
  } else {
    report.recommendations.push('🎉 Excellent test coverage! Consider adding performance and security tests.')
  }

  if (report.summary.averageCoverage < 70) {
    report.recommendations.push('📊 Code coverage below 70%. Add more unit tests.')
  } else if (report.summary.averageCoverage < 90) {
    report.recommendations.push('📈 Good coverage! Focus on testing edge cases and error paths.')
  }

  if (report.summary.criticalFailures > 0) {
    report.recommendations.push(`🔧 ${report.summary.criticalFailures} critical test suite(s) failing. Fix before deployment.`)
  }

  if (report.deployment.warnings.length > 0) {
    report.recommendations.push(`⚠️  ${report.deployment.warnings.length} medium priority issues detected. Review when possible.`)
  }

  // Save detailed report with enhanced metadata
  const reportPath = path.join(process.cwd(), 'comprehensive-test-report.json')
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
  
  return report
}

const printSummary = (report) => {
  logSeparator()
  log('📊 COMPREHENSIVE TEST EXECUTION SUMMARY', 'cyan')
  logSeparator()
  
  log(`\n📈 Overall Statistics:`, 'white')
  log(`   Total Tests: ${report.summary.totalTests}`, 'blue')
  log(`   Passed: ${report.summary.passedTests}`, 'green')
  log(`   Failed: ${report.summary.failedTests}`, report.summary.failedTests > 0 ? 'red' : 'green')
  log(`   Success Rate: ${report.summary.successRate}%`, 
      report.summary.successRate >= 80 ? 'green' : 'yellow')
  
  if (report.summary.averageCoverage > 0) {
    log(`   Average Coverage: ${report.summary.averageCoverage}%`, 
        report.summary.averageCoverage >= 80 ? 'green' : 'yellow')
  }
  
  log(`   Total Duration: ${(report.summary.totalDuration / 1000).toFixed(1)}s`, 'blue')

  log(`\n🎯 Test Suite Breakdown:`, 'white')
  report.testSuites.forEach(suite => {
    const status = suite.success ? '✅' : '❌'
    const rate = suite.stats && suite.stats.total > 0 ? 
      `(${((suite.stats.passed / suite.stats.total) * 100).toFixed(1)}%)` : ''
    const duration = suite.duration ? `[${(suite.duration / 1000).toFixed(1)}s]` : ''
    const priority = suite.priority ? `[${suite.priority}]` : ''
    
    log(`   ${status} ${suite.name} ${rate} ${duration} ${priority}`, 
        suite.success ? 'green' : 'red')
    
    // Show error details for failed suites
    if (!suite.success && suite.error) {
      log(`      Error: ${suite.error}`, 'gray')
    }
  })

  // Deployment readiness section
  log(`\n🚀 Deployment Readiness:`, 'white')
  if (report.deployment.ready) {
    log(`   ✅ READY FOR DEPLOYMENT`, 'green')
    log(`   🎯 Success rate: ${report.summary.successRate}%`, 'green')
    log(`   🏆 All critical requirements met`, 'green')
  } else {
    log(`   ❌ NOT READY FOR DEPLOYMENT`, 'red')
    log(`   📊 Success rate: ${report.summary.successRate}% (target: ≥80%)`, 'yellow')
    
    if (report.deployment.blockers.length > 0) {
      log(`   🚫 Blockers:`, 'red')
      report.deployment.blockers.forEach(blocker => {
        log(`      • ${blocker}`, 'red')
      })
    }
    
    if (report.deployment.warnings.length > 0) {
      log(`   ⚠️  Warnings:`, 'yellow')
      report.deployment.warnings.forEach(warning => {
        log(`      • ${warning}`, 'yellow')
      })
    }
  }

  if (report.recommendations.length > 0) {
    log(`\n💡 Recommendations:`, 'yellow')
    report.recommendations.forEach(rec => log(`   ${rec}`, 'yellow'))
  }

  log('\n🔗 Detailed report saved to: comprehensive-test-report.json', 'cyan')
  logSeparator()
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
      name: 'Performance Tests (Simplified)',
      command: 'npx vitest run src/__tests__/performance/performance-simple.test.tsx --reporter=verbose',
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