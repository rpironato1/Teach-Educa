# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
```bash
# Development
npm run dev              # Start development server on port 5000
npm run build            # TypeScript check + Vite build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint checks
npm run lint:fix         # Auto-fix ESLint issues

# Testing
npm run test             # Run all Playwright tests
npm run test:e2e         # Run end-to-end tests
npm run test:integration # Run integration tests
npm run test:accessibility # Run accessibility tests
npm run test:performance # Run performance tests
npm run test:headed      # Run tests with browser visible
npm run test:debug       # Run tests in debug mode
npm run test:ui          # Open Playwright test UI
npm run test:report      # Show test report

# Validation & CI
npm run validate         # Lint + Build + E2E tests
npm run health-check     # Full validation + performance tests
npm run test:ci          # Install Playwright + run all tests
```

### Single Test Execution
```bash
# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run test with specific title
npx playwright test -g "should login successfully"

# Debug specific test
npx playwright test tests/e2e/auth.spec.ts --debug
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Radix UI Components
- **State Management**: React Context API (AuthContext, CreditContext, AnalyticsContext)
- **Testing**: Playwright for E2E/Integration/A11y/Performance
- **Build Tool**: Vite with SWC for fast compilation
- **UI Components**: Custom components built on Radix UI primitives

### Project Structure
```
src/
├── api/              # API integration layer
│   ├── auth.ts       # Authentication endpoints
│   └── payments.ts   # Payment processing
├── components/       # React components
│   ├── ui/           # Reusable UI components (Radix-based)
│   ├── auth/         # Authentication components
│   └── registration/ # Registration flow components
├── contexts/         # React Context providers
├── hooks/            # Custom React hooks
├── services/         # Business logic services
└── types/            # TypeScript type definitions
```

### Key Architectural Patterns

#### 1. Component Lazy Loading
The application uses React.lazy() with Suspense for code splitting and performance optimization. Major features are loaded on-demand.

#### 2. Context-Based State Management
Three main contexts manage application state:
- **AuthContext**: User authentication and session management
- **CreditContext**: Credit system and usage tracking  
- **AnalyticsContext**: Analytics and tracking data

#### 3. Error Boundaries
ErrorBoundary components wrap lazy-loaded sections to gracefully handle failures and provide fallback UI.

#### 4. Path Aliases
TypeScript path alias `@/*` maps to `src/*` directory for cleaner imports.

#### 5. Testing Strategy
- **E2E Tests**: Complete user journeys in `tests/e2e/`
- **Integration Tests**: API and storage integration in `tests/integration/`
- **Accessibility Tests**: WCAG compliance in `tests/accessibility/`
- **Performance Tests**: Lighthouse metrics in `tests/performance/`

### Component Architecture

#### UI Components (`src/components/ui/`)
Built on Radix UI primitives with Tailwind styling. Components follow compound component patterns for flexibility.

#### Feature Components
Major features are self-contained with their own state management:
- `AdminDashboard`: Admin panel with analytics
- `RegistrationFlow`: Multi-step registration process
- `PaymentFlow`: Payment processing workflow
- `DashboardDemo`: Demo dashboard for showcasing features

#### Authentication Flow
- `AuthFlow`: Main authentication wrapper
- `LoginForm`, `RegistrationForm`: Form components
- `SessionManager`: Token and session handling
- Protected routes via `ProtectedRoute` component

### Bundle Optimization
Vite configuration splits code into logical chunks:
- `vendor`: React core libraries
- `ui`: Radix UI components
- `charts`: Data visualization (recharts, d3)
- `icons`: Icon libraries
- `utils`: Utility functions

### Performance Considerations
- Lazy loading for major route components
- Manual chunk splitting for optimal bundle sizes
- Image and asset optimization via Vite
- Component-level code splitting for large features

### Testing Approach
All tests use Playwright with:
- Base URL: `http://localhost:5000`
- Automatic dev server startup
- Chrome as primary test browser
- Screenshots on failure
- HTML, JSON, and JUnit report formats