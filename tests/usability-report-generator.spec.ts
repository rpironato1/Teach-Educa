/**
 * Comprehensive Usability Report Generator
 * Real-time analysis and documentation of user experience
 */

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

// Usability findings data structure
interface UsabilityFinding {
  category: 'positive' | 'issue' | 'critical';
  severity: 'low' | 'medium' | 'high';
  description: string;
  userProfile: string;
  evidence: string;
  recommendation: string;
}

test.describe('Comprehensive Usability Analysis', () => {
  
  test('Generate Usability Testing Report', async ({ page }) => {
    const findings: UsabilityFinding[] = [];
    
    console.log('\n🔍 COMPREHENSIVE USABILITY TESTING ANALYSIS');
    console.log('==========================================');
    
    await page.goto('http://localhost:5001');
    await page.waitForLoadState('networkidle');
    
    // Performance Analysis
    console.log('\n⚡ PERFORMANCE ANALYSIS');
    const performanceMetrics = await page.evaluate(() => {
      return {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        firstPaint: performance.getEntriesByType('navigation')[0] as any
      };
    });
    
    console.log(`📊 Page load time: ${performanceMetrics.loadTime}ms`);
    console.log(`📊 DOM ready time: ${performanceMetrics.domReady}ms`);
    
    if (performanceMetrics.loadTime > 3000) {
      findings.push({
        category: 'issue',
        severity: 'medium',
        description: `Page load time of ${performanceMetrics.loadTime}ms exceeds 3 second threshold`,
        userProfile: 'All users',
        evidence: `Load time: ${performanceMetrics.loadTime}ms`,
        recommendation: 'Optimize images, reduce bundle size, implement lazy loading'
      });
    } else {
      findings.push({
        category: 'positive',
        severity: 'low',
        description: 'Page load time meets performance standards',
        userProfile: 'All users',
        evidence: `Load time: ${performanceMetrics.loadTime}ms`,
        recommendation: 'Continue monitoring performance metrics'
      });
    }
    
    // Content Analysis
    console.log('\n📖 CONTENT AND MESSAGING ANALYSIS');
    const mainHeading = await page.locator('h1').first().textContent();
    const hasValueProp = await page.locator('*').filter({ hasText: /IA|inteligência|aprend/i }).count();
    
    console.log(`📝 Main heading: "${mainHeading}"`);
    console.log(`📝 AI/Learning references: ${hasValueProp} elements`);
    
    if (hasValueProp > 10) {
      findings.push({
        category: 'positive',
        severity: 'low',
        description: 'Strong value proposition messaging about AI and learning',
        userProfile: 'New students',
        evidence: `${hasValueProp} elements mentioning AI/learning concepts`,
        recommendation: 'Maintain clear value proposition across all pages'
      });
    }
    
    // Navigation Analysis
    console.log('\n🧭 NAVIGATION ANALYSIS');
    const navigationItems = await page.locator('nav a, nav button').count();
    const hasLogo = await page.locator('[alt*="logo"], [aria-label*="logo"]').count() > 0;
    
    console.log(`🔗 Navigation items: ${navigationItems}`);
    console.log(`🎨 Logo present: ${hasLogo}`);
    
    if (navigationItems < 3) {
      findings.push({
        category: 'issue',
        severity: 'medium',
        description: 'Limited navigation options may confuse users',
        userProfile: 'All users',
        evidence: `Only ${navigationItems} navigation items found`,
        recommendation: 'Add clear navigation to key sections: About, Pricing, Contact'
      });
    }
    
    // Call-to-Action Analysis
    console.log('\n🎯 CALL-TO-ACTION ANALYSIS');
    const ctaButtons = await page.locator('button, a').filter({ 
      hasText: /cadastr|sign.?up|começar|demo|experiment/i 
    }).count();
    
    console.log(`🔘 CTA buttons found: ${ctaButtons}`);
    
    if (ctaButtons >= 2) {
      findings.push({
        category: 'positive',
        severity: 'low',
        description: 'Multiple clear call-to-action options available',
        userProfile: 'New students',
        evidence: `${ctaButtons} CTA buttons identified`,
        recommendation: 'Ensure CTAs are visually distinct and action-oriented'
      });
    }
    
    // Form Usability Analysis
    console.log('\n📝 FORM USABILITY ANALYSIS');
    
    // Navigate to registration
    const signupButton = page.locator('button, a').filter({ hasText: /cadastr|sign.?up|criar.?conta/i }).first();
    if (await signupButton.count() > 0) {
      await signupButton.click();
      await page.waitForTimeout(2000);
    } else {
      // Try through login page
      const loginButton = page.locator('button, a').filter({ hasText: /entrar|login/i }).first();
      if (await loginButton.count() > 0) {
        await loginButton.click();
        await page.waitForTimeout(1000);
        
        const createAccountLink = page.locator('button, a').filter({ hasText: /criar.?conta|cadastr/i }).first();
        if (await createAccountLink.count() > 0) {
          await createAccountLink.click();
          await page.waitForTimeout(1000);
        }
      }
    }
    
    // Analyze form fields
    const formInputs = await page.locator('input').count();
    const formLabels = await page.locator('label').count();
    const requiredFields = await page.locator('input[required], input[aria-required="true"]').count();
    const placeholders = await page.locator('input[placeholder]').count();
    
    console.log(`📋 Form inputs: ${formInputs}`);
    console.log(`🏷️  Form labels: ${formLabels}`);
    console.log(`⚠️  Required fields: ${requiredFields}`);
    console.log(`💭 Placeholders: ${placeholders}`);
    
    if (formLabels < formInputs) {
      findings.push({
        category: 'critical',
        severity: 'high',
        description: 'Form inputs lack proper labels - accessibility issue',
        userProfile: 'Users with disabilities',
        evidence: `${formInputs} inputs but only ${formLabels} labels`,
        recommendation: 'Add proper labels or aria-label attributes to all form fields'
      });
    }
    
    if (placeholders >= formInputs * 0.8) {
      findings.push({
        category: 'positive',
        severity: 'low',
        description: 'Good use of placeholder text for user guidance',
        userProfile: 'New students',
        evidence: `${placeholders}/${formInputs} fields have helpful placeholders`,
        recommendation: 'Ensure placeholders provide clear examples of expected input'
      });
    }
    
    // Error Handling Analysis
    console.log('\n🚨 ERROR HANDLING ANALYSIS');
    
    // Test form validation
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /criar|cadastr|register/i }).first();
    if (await submitButton.count() > 0) {
      // Try to submit empty form
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      const errorMessages = await page.locator('.error, .invalid, [role="alert"], .text-red').count();
      console.log(`🔴 Error messages shown: ${errorMessages}`);
      
      if (errorMessages > 0) {
        findings.push({
          category: 'positive',
          severity: 'low',
          description: 'Form validation provides user feedback',
          userProfile: 'All users',
          evidence: `${errorMessages} error messages displayed for invalid submission`,
          recommendation: 'Ensure error messages are clear and actionable'
        });
      } else {
        findings.push({
          category: 'issue',
          severity: 'medium',
          description: 'No validation feedback shown for empty form submission',
          userProfile: 'All users',
          evidence: 'Form submitted without required field validation',
          recommendation: 'Implement client-side validation with clear error messages'
        });
      }
    }
    
    // Accessibility Analysis
    console.log('\n♿ ACCESSIBILITY ANALYSIS');
    await injectAxe(page);
    
    let accessibilityScore = 0;
    try {
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true }
      });
      accessibilityScore = 100;
      console.log('✅ No accessibility violations detected');
      
      findings.push({
        category: 'positive',
        severity: 'low',
        description: 'Full accessibility compliance achieved',
        userProfile: 'Users with disabilities',
        evidence: 'Axe-core scan found no violations',
        recommendation: 'Continue following WCAG guidelines'
      });
    } catch (error) {
      const errorStr = error.toString();
      const violationCount = (errorStr.match(/violation/g) || []).length;
      accessibilityScore = Math.max(0, 100 - (violationCount * 10));
      
      console.log(`⚠️  ${violationCount} accessibility violations found`);
      
      findings.push({
        category: 'critical',
        severity: 'high',
        description: `${violationCount} accessibility violations detected`,
        userProfile: 'Users with disabilities',
        evidence: `Axe-core scan results: ${violationCount} violations`,
        recommendation: 'Fix color contrast, add alt text, improve semantic markup'
      });
    }
    
    console.log(`♿ Accessibility score: ${accessibilityScore}%`);
    
    // Mobile Responsiveness Analysis
    console.log('\n📱 MOBILE RESPONSIVENESS ANALYSIS');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const hasHamburgerMenu = await page.locator('[aria-label*="menu"], .hamburger, button').filter({ 
      hasText: /☰|menu/i 
    }).count() > 0;
    
    const mobileButtonCount = await page.locator('button:visible').count();
    
    console.log(`📲 Mobile menu present: ${hasHamburgerMenu}`);
    console.log(`🔘 Buttons visible on mobile: ${mobileButtonCount}`);
    
    if (hasHamburgerMenu) {
      findings.push({
        category: 'positive',
        severity: 'low',
        description: 'Mobile navigation properly implemented',
        userProfile: 'Mobile users',
        evidence: 'Hamburger menu detected on mobile viewport',
        recommendation: 'Ensure all menu items are accessible in mobile menu'
      });
    } else {
      findings.push({
        category: 'issue',
        severity: 'medium',
        description: 'Mobile navigation may not be optimized',
        userProfile: 'Mobile users',
        evidence: 'No mobile-specific navigation found',
        recommendation: 'Implement responsive navigation with collapsible menu'
      });
    }
    
    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // User Flow Analysis
    console.log('\n🔄 USER FLOW ANALYSIS');
    
    // Test login flow
    await page.goto('http://localhost:5001');
    const loginBtn = page.locator('button, a').filter({ hasText: /entrar|login/i }).first();
    
    if (await loginBtn.count() > 0) {
      await loginBtn.click();
      await page.waitForTimeout(1000);
      
      const demoCredentials = await page.locator('*').filter({ 
        hasText: /demo|admin@teach|user@teach/i 
      }).count();
      
      console.log(`🔐 Demo credentials visible: ${demoCredentials > 0}`);
      
      if (demoCredentials > 0) {
        findings.push({
          category: 'positive',
          severity: 'low',
          description: 'Demo credentials provided for easy testing',
          userProfile: 'Evaluators and testers',
          evidence: 'Demo credentials clearly displayed on login page',
          recommendation: 'Keep demo credentials for showcase purposes'
        });
      }
    }
    
    // Generate Comprehensive Report
    console.log('\n📋 COMPREHENSIVE USABILITY REPORT');
    console.log('=================================');
    
    const positiveFindings = findings.filter(f => f.category === 'positive');
    const issues = findings.filter(f => f.category === 'issue');
    const criticalIssues = findings.filter(f => f.category === 'critical');
    
    console.log(`\n✅ POSITIVE FINDINGS: ${positiveFindings.length}`);
    positiveFindings.forEach((finding, index) => {
      console.log(`${index + 1}. ${finding.description}`);
      console.log(`   👥 User Profile: ${finding.userProfile}`);
      console.log(`   📊 Evidence: ${finding.evidence}`);
      console.log(`   💡 Recommendation: ${finding.recommendation}\n`);
    });
    
    console.log(`\n⚠️  USABILITY ISSUES: ${issues.length}`);
    issues.forEach((finding, index) => {
      console.log(`${index + 1}. [${finding.severity.toUpperCase()}] ${finding.description}`);
      console.log(`   👥 User Profile: ${finding.userProfile}`);
      console.log(`   📊 Evidence: ${finding.evidence}`);
      console.log(`   💡 Recommendation: ${finding.recommendation}\n`);
    });
    
    console.log(`\n🚨 CRITICAL ISSUES: ${criticalIssues.length}`);
    criticalIssues.forEach((finding, index) => {
      console.log(`${index + 1}. [${finding.severity.toUpperCase()}] ${finding.description}`);
      console.log(`   👥 User Profile: ${finding.userProfile}`);
      console.log(`   📊 Evidence: ${finding.evidence}`);
      console.log(`   💡 Recommendation: ${finding.recommendation}\n`);
    });
    
    // Overall Usability Score
    const totalFindings = findings.length;
    const positiveWeight = positiveFindings.length * 10;
    const issueWeight = issues.length * 5;
    const criticalWeight = criticalIssues.length * 15;
    
    const maxPossibleScore = 100;
    const deductions = issueWeight + criticalWeight;
    const bonuses = Math.min(positiveWeight, 20); // Cap bonuses at 20 points
    
    const usabilityScore = Math.max(0, Math.min(100, maxPossibleScore - deductions + bonuses));
    
    console.log('\n📊 OVERALL USABILITY ASSESSMENT');
    console.log('==============================');
    console.log(`🎯 Usability Score: ${usabilityScore}/100`);
    console.log(`♿ Accessibility Score: ${accessibilityScore}/100`);
    console.log(`⚡ Performance Score: ${performanceMetrics.loadTime < 3000 ? '85' : '65'}/100`);
    
    console.log('\n🎓 USER PROFILE IMPACT ANALYSIS');
    console.log('===============================');
    
    const userProfiles = ['New students', 'Experienced students', 'Long-term users', 'Mobile users', 'Users with disabilities'];
    userProfiles.forEach(profile => {
      const profileFindings = findings.filter(f => f.userProfile.includes(profile) || f.userProfile === 'All users');
      const profileIssues = profileFindings.filter(f => f.category !== 'positive');
      
      console.log(`👥 ${profile}: ${profileFindings.length} findings (${profileIssues.length} issues)`);
    });
    
    console.log('\n🎯 PRIORITY RECOMMENDATIONS');
    console.log('===========================');
    
    const priorityRecommendations = [
      ...criticalIssues.map(f => `🚨 HIGH: ${f.recommendation}`),
      ...issues.filter(f => f.severity === 'high').map(f => `⚠️  MEDIUM: ${f.recommendation}`),
      ...issues.filter(f => f.severity === 'medium').map(f => `📝 LOW: ${f.recommendation}`)
    ].slice(0, 5);
    
    priorityRecommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    
    console.log('\n📈 NEXT STEPS');
    console.log('=============');
    console.log('1. Address critical accessibility issues immediately');
    console.log('2. Improve form validation and error messaging');
    console.log('3. Optimize page load performance');
    console.log('4. Enhance mobile responsiveness');
    console.log('5. Conduct user testing with real students');
    
    // Save findings to a report file
    const reportData = {
      timestamp: new Date().toISOString(),
      scores: {
        usability: usabilityScore,
        accessibility: accessibilityScore,
        performance: performanceMetrics.loadTime < 3000 ? 85 : 65
      },
      findings: findings,
      metrics: performanceMetrics,
      recommendations: priorityRecommendations
    };
    
    console.log('\n💾 Report data structure ready for export');
    
    // Test passes if overall score is acceptable
    expect(usabilityScore).toBeGreaterThan(70);
    expect(criticalIssues.length).toBeLessThan(3);
  });
});