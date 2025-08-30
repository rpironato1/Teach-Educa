#!/usr/bin/env node

const { execSync } = require('child_process')
const { readFileSync, writeFileSync, existsSync } = require('fs')
const { resolve } = require('path')

// Coverage thresholds
const COVERAGE_THRESHOLDS = {
  statements: 85,
  branches: 80,
  functions: 100, // 100% for critical functions
  lines: 85
}

class TestCoverageAnalyzer {
  constructor() {
    this.projectRoot = process.cwd()
    this.sourceDir = resolve(this.projectRoot, 'src')
    this.testDir = resolve(this.projectRoot, 'src/__tests__')
  }

  async analyzeCoverage() {
    console.log('🔍 Analyzing test coverage...\n')

    // Run tests with coverage
    let coverage = null
    try {
      console.log('Running tests with coverage...')
      execSync('npx vitest --coverage --run --reporter=basic', {
        stdio: 'inherit',
        cwd: this.projectRoot
      })

      // Try to read coverage data from coverage folder
      const coverageFile = resolve(this.projectRoot, 'coverage/coverage-summary.json')
      if (existsSync(coverageFile)) {
        const coverageData = readFileSync(coverageFile, 'utf8')
        coverage = JSON.parse(coverageData)
      }
    } catch (error) {
      console.warn('Could not run coverage analysis:', error.message)
    }

    // Analyze source files for missing tests
    const gaps = this.findTestGaps()
    const recommendations = this.generateRecommendations(gaps, coverage)
    const metrics = this.calculateMetrics(gaps, coverage)

    return { coverage, gaps, recommendations, metrics }
  }

  findTestGaps() {
    const gaps = []

    try {
      // Find all source files
      const sourceFiles = this.getAllSourceFiles()
      
      for (const file of sourceFiles) {
        const testFile = this.getExpectedTestFile(file)
        const exists = existsSync(testFile)
        
        if (!exists) {
          const gap = this.analyzeFileForTestGap(file)
          if (gap) {
            gaps.push(gap)
          }
        } else {
          // File has tests, check if they're comprehensive
          const incompleteness = this.checkTestCompleteness(file, testFile)
          if (incompleteness) {
            gaps.push(incompleteness)
          }
        }
      }
    } catch (error) {
      console.warn('Error finding test gaps:', error.message)
    }

    return gaps.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  getAllSourceFiles() {
    const files = []
    
    try {
      const findCommand = `find "${this.sourceDir}" -name "*.ts" -o -name "*.tsx" | grep -v __tests__ | grep -v test-setup.ts | head -20`
      const output = execSync(findCommand, { encoding: 'utf8' })
      files.push(...output.trim().split('\n').filter(f => f.trim()))
    } catch (error) {
      console.warn('Error finding source files:', error.message)
    }

    return files
  }

  getExpectedTestFile(sourceFile) {
    const relativePath = sourceFile.replace(this.sourceDir + '/', '')
    const testPath = relativePath.replace(/\.(ts|tsx)$/, '.test.$1')
    return resolve(this.testDir, testPath)
  }

  analyzeFileForTestGap(file) {
    try {
      const content = readFileSync(file, 'utf8')
      const fileName = file.replace(this.sourceDir + '/', '')
      
      // Determine file type and priority
      let type, priority, estimatedTests

      if (file.includes('/components/')) {
        type = 'component'
        priority = 'high'
        estimatedTests = this.countReactComponents(content) * 8 // 8 tests per component average
      } else if (file.includes('/hooks/')) {
        type = 'hook'
        priority = 'high'
        estimatedTests = this.countHooks(content) * 6 // 6 tests per hook average
      } else if (file.includes('/services/')) {
        type = 'service'
        priority = 'high'
        estimatedTests = this.countServiceMethods(content) * 3 // 3 tests per method
      } else if (file.includes('/schemas/')) {
        type = 'schema'
        priority = 'medium'
        estimatedTests = this.countSchemas(content) * 5 // 5 tests per schema
      } else if (file.includes('/utils/') || file.includes('/lib/')) {
        type = 'utility'
        priority = 'medium'
        estimatedTests = this.countFunctions(content) * 4 // 4 tests per utility function
      } else {
        type = 'utility'
        priority = 'low'
        estimatedTests = 2
      }

      const missing = this.identifyMissingTestTypes(content, type)

      return {
        file: fileName,
        type,
        missing,
        priority,
        estimatedTests
      }
    } catch (error) {
      console.warn(`Error analyzing file ${file}:`, error.message)
      return null
    }
  }

  checkTestCompleteness(sourceFile, testFile) {
    try {
      const sourceContent = readFileSync(sourceFile, 'utf8')
      const testContent = readFileSync(testFile, 'utf8')
      
      const fileName = sourceFile.replace(this.sourceDir + '/', '')
      const missingTests = []

      // Check for common test patterns that might be missing
      if (sourceContent.includes('export') && !testContent.includes('describe')) {
        missingTests.push('Basic test structure')
      }

      if (sourceContent.includes('useState') && !testContent.includes('act(')) {
        missingTests.push('State management tests')
      }

      if (sourceContent.includes('useEffect') && !testContent.includes('waitFor')) {
        missingTests.push('Effect testing')
      }

      if (sourceContent.includes('async') && !testContent.includes('async')) {
        missingTests.push('Async behavior tests')
      }

      if (sourceContent.includes('throw') && !testContent.includes('toThrow')) {
        missingTests.push('Error handling tests')
      }

      if (missingTests.length > 0) {
        return {
          file: fileName,
          type: this.getFileType(sourceFile),
          missing: missingTests,
          priority: 'medium',
          estimatedTests: missingTests.length * 2
        }
      }
    } catch (error) {
      console.warn(`Error checking test completeness for ${sourceFile}:`, error.message)
    }

    return null
  }

  getFileType(file) {
    if (file.includes('/components/')) return 'component'
    if (file.includes('/hooks/')) return 'hook'
    if (file.includes('/services/')) return 'service'
    if (file.includes('/schemas/')) return 'schema'
    return 'utility'
  }

  countReactComponents(content) {
    const componentMatches = content.match(/export\s+(default\s+)?function\s+[A-Z]\w*|export\s+const\s+[A-Z]\w*\s*=/g)
    return componentMatches ? componentMatches.length : 1
  }

  countHooks(content) {
    const hookMatches = content.match(/export\s+(function\s+)?use[A-Z]\w*/g)
    return hookMatches ? hookMatches.length : 1
  }

  countServiceMethods(content) {
    const methodMatches = content.match(/async\s+\w+\s*\(|^\s*\w+\s*\(/gm)
    return methodMatches ? methodMatches.length : 3
  }

  countSchemas(content) {
    const schemaMatches = content.match(/export\s+const\s+\w+Schema\s*=/g)
    return schemaMatches ? schemaMatches.length : 1
  }

  countFunctions(content) {
    const functionMatches = content.match(/export\s+(function\s+)?\w+/g)
    return functionMatches ? functionMatches.length : 1
  }

  identifyMissingTestTypes(content, type) {
    const missing = []

    switch (type) {
      case 'component':
        missing.push('Render tests', 'User interaction tests', 'Props validation', 'State management')
        if (content.includes('useEffect')) missing.push('Effect testing')
        if (content.includes('onSubmit')) missing.push('Form submission tests')
        break
      
      case 'hook':
        missing.push('Initial state tests', 'State updates', 'Return value validation')
        if (content.includes('useEffect')) missing.push('Effect testing')
        if (content.includes('async')) missing.push('Async behavior tests')
        break
      
      case 'service':
        missing.push('Success scenarios', 'Error handling', 'Parameter validation', 'Return value tests')
        if (content.includes('async')) missing.push('Promise resolution/rejection')
        break
      
      case 'schema':
        missing.push('Valid data validation', 'Invalid data rejection', 'Edge cases', 'Error messages')
        break
      
      case 'utility':
        missing.push('Input/output validation', 'Edge cases', 'Error scenarios')
        break
    }

    return missing
  }

  generateRecommendations(gaps, coverage) {
    const recommendations = []

    // Coverage-based recommendations
    if (coverage && coverage.total) {
      const { statements, functions, branches, lines } = coverage.total
      
      if (statements.pct < COVERAGE_THRESHOLDS.statements) {
        recommendations.push(`📊 Statement coverage is ${statements.pct.toFixed(1)}% (target: ${COVERAGE_THRESHOLDS.statements}%). Add ${Math.ceil((COVERAGE_THRESHOLDS.statements - statements.pct) / 100 * statements.total)} more statement tests.`)
      }
      
      if (functions.pct < COVERAGE_THRESHOLDS.functions) {
        recommendations.push(`🎯 Function coverage is ${functions.pct.toFixed(1)}% (target: ${COVERAGE_THRESHOLDS.functions}%). Add tests for ${functions.total - functions.covered} uncovered functions.`)
      }
      
      if (branches.pct < COVERAGE_THRESHOLDS.branches) {
        recommendations.push(`🌿 Branch coverage is ${branches.pct.toFixed(1)}% (target: ${COVERAGE_THRESHOLDS.branches}%). Add tests for ${branches.total - branches.covered} uncovered branches.`)
      }
    }

    // Gap-based recommendations
    const highPriorityGaps = gaps.filter(g => g.priority === 'high')
    const totalEstimatedTests = gaps.reduce((sum, gap) => sum + gap.estimatedTests, 0)

    if (highPriorityGaps.length > 0) {
      recommendations.push(`🔥 ${highPriorityGaps.length} high-priority files need tests. Focus on: ${highPriorityGaps.slice(0, 3).map(g => g.file).join(', ')}`)
    }

    recommendations.push(`📝 Estimated ${totalEstimatedTests} additional tests needed for full coverage`)

    // Specific recommendations by category
    const componentGaps = gaps.filter(g => g.type === 'component')
    const hookGaps = gaps.filter(g => g.type === 'hook')
    const serviceGaps = gaps.filter(g => g.type === 'service')

    if (componentGaps.length > 0) {
      recommendations.push(`⚛️  Add React component tests for: ${componentGaps.slice(0, 3).map(g => g.file).join(', ')}`)
    }

    if (hookGaps.length > 0) {
      recommendations.push(`🪝 Add custom hook tests for: ${hookGaps.slice(0, 3).map(g => g.file).join(', ')}`)
    }

    if (serviceGaps.length > 0) {
      recommendations.push(`🔧 Add service layer tests for: ${serviceGaps.slice(0, 3).map(g => g.file).join(', ')}`)
    }

    return recommendations
  }

  calculateMetrics(gaps, coverage) {
    const totalFiles = this.getAllSourceFiles().length
    const missingTests = gaps.length
    const testedFiles = totalFiles - missingTests

    let coverageScore = 0
    if (coverage && coverage.total) {
      const { statements, functions, branches, lines } = coverage.total
      coverageScore = Math.round((statements.pct + functions.pct + branches.pct + lines.pct) / 4)
    }

    return {
      totalFiles,
      testedFiles,
      missingTests,
      coverageScore
    }
  }

  generateReport(analysis) {
    const { coverage, gaps, recommendations, metrics } = analysis

    let report = `# 🧪 Test Coverage Analysis Report\n\n`
    report += `**Generated:** ${new Date().toISOString()}\n\n`

    // Executive Summary
    report += `## 📊 Executive Summary\n\n`
    report += `- **Total Source Files:** ${metrics.totalFiles}\n`
    report += `- **Files with Tests:** ${metrics.testedFiles}\n`
    report += `- **Missing Tests:** ${metrics.missingTests}\n`
    report += `- **Overall Coverage Score:** ${metrics.coverageScore}%\n\n`

    // Coverage Details
    if (coverage && coverage.total) {
      report += `## 📈 Coverage Metrics\n\n`
      report += `| Metric | Current | Target | Status |\n`
      report += `|--------|---------|--------|---------|\n`
      report += `| Statements | ${coverage.total.statements.pct.toFixed(1)}% | ${COVERAGE_THRESHOLDS.statements}% | ${coverage.total.statements.pct >= COVERAGE_THRESHOLDS.statements ? '✅' : '❌'} |\n`
      report += `| Functions | ${coverage.total.functions.pct.toFixed(1)}% | ${COVERAGE_THRESHOLDS.functions}% | ${coverage.total.functions.pct >= COVERAGE_THRESHOLDS.functions ? '✅' : '❌'} |\n`
      report += `| Branches | ${coverage.total.branches.pct.toFixed(1)}% | ${COVERAGE_THRESHOLDS.branches}% | ${coverage.total.branches.pct >= COVERAGE_THRESHOLDS.branches ? '✅' : '❌'} |\n`
      report += `| Lines | ${coverage.total.lines.pct.toFixed(1)}% | ${COVERAGE_THRESHOLDS.lines}% | ${coverage.total.lines.pct >= COVERAGE_THRESHOLDS.lines ? '✅' : '❌'} |\n\n`
    }

    // Test Gaps
    report += `## 🔍 Missing Tests by Priority\n\n`
    
    const priorityGroups = {
      high: gaps.filter(g => g.priority === 'high'),
      medium: gaps.filter(g => g.priority === 'medium'),
      low: gaps.filter(g => g.priority === 'low')
    }

    for (const [priority, groupGaps] of Object.entries(priorityGroups)) {
      if (groupGaps.length > 0) {
        const emoji = priority === 'high' ? '🔥' : priority === 'medium' ? '⚠️' : '📝'
        report += `### ${emoji} ${priority.toUpperCase()} Priority (${groupGaps.length} files)\n\n`
        
        for (const gap of groupGaps.slice(0, 10)) { // Show top 10
          report += `**${gap.file}** (${gap.type})\n`
          report += `- Estimated tests needed: ${gap.estimatedTests}\n`
          report += `- Missing: ${gap.missing.join(', ')}\n\n`
        }
      }
    }

    // Recommendations
    report += `## 🎯 Recommendations\n\n`
    for (const recommendation of recommendations) {
      report += `- ${recommendation}\n`
    }

    // Test Implementation Guide
    report += `\n## 📋 Implementation Priority\n\n`
    report += `### Phase 1: Critical Functions (Week 1)\n`
    const phase1 = gaps.filter(g => g.priority === 'high' && g.type === 'service').slice(0, 5)
    for (const gap of phase1) {
      report += `- [ ] ${gap.file} - ${gap.estimatedTests} tests\n`
    }

    report += `\n### Phase 2: Components & Hooks (Week 2)\n`
    const phase2 = gaps.filter(g => g.priority === 'high' && ['component', 'hook'].includes(g.type)).slice(0, 8)
    for (const gap of phase2) {
      report += `- [ ] ${gap.file} - ${gap.estimatedTests} tests\n`
    }

    report += `\n### Phase 3: Validation & Utilities (Week 3)\n`
    const phase3 = gaps.filter(g => ['schema', 'utility'].includes(g.type)).slice(0, 10)
    for (const gap of phase3) {
      report += `- [ ] ${gap.file} - ${gap.estimatedTests} tests\n`
    }

    return report
  }
}

// Main execution
async function main() {
  const analyzer = new TestCoverageAnalyzer()
  
  try {
    const analysis = await analyzer.analyzeCoverage()
    const report = analyzer.generateReport(analysis)
    
    // Write report to file
    writeFileSync('TEST_COVERAGE_ANALYSIS.md', report)
    
    // Console output
    console.log('✅ Test Coverage Analysis Complete!\n')
    console.log('📊 Summary:')
    console.log(`   Total Files: ${analysis.metrics.totalFiles}`)
    console.log(`   Files with Tests: ${analysis.metrics.testedFiles}`)
    console.log(`   Missing Tests: ${analysis.metrics.missingTests}`)
    console.log(`   Coverage Score: ${analysis.metrics.coverageScore}%\n`)
    
    console.log('🎯 Top Recommendations:')
    analysis.recommendations.slice(0, 5).forEach(rec => console.log(`   ${rec}`))
    
    console.log(`\n📄 Full report saved to: TEST_COVERAGE_ANALYSIS.md`)
    
    // Exit with appropriate code
    const coverageTarget = 85
    const currentScore = analysis.metrics.coverageScore
    
    if (currentScore < coverageTarget) {
      console.log(`\n❌ Coverage target not met (${currentScore}% < ${coverageTarget}%)`)
      process.exit(1)
    } else {
      console.log(`\n✅ Coverage target met (${currentScore}% >= ${coverageTarget}%)`)
      process.exit(0)
    }
    
  } catch (error) {
    console.error('❌ Error during analysis:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { TestCoverageAnalyzer, COVERAGE_THRESHOLDS }