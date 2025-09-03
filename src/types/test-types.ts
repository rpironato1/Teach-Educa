// Test-specific type definitions to replace 'any' types

export interface TestIssue {
  id: string;
  type: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  impact: string;
  nodes: number;
  help?: string;
  helpUrl?: string;
}

export interface TestEvidence {
  screenshot?: string;
  logs?: string[];
  metrics?: Record<string, number>;
  timestamp: string;
}

export interface AxeViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    target: string[];
    html: string;
    impact: string;
    any: unknown[];
    all: unknown[];
    none: unknown[];
  }>;
}

export interface WebVitals {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

export interface UserAnalytics {
  userId: string;
  sessionId: string;
  actions: Array<{
    type: string;
    timestamp: Date;
    metadata: Record<string, unknown>;
  }>;
  performance: WebVitals;
}

export interface AuditTrailAction {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface ConsoleMessage {
  type: 'log' | 'error' | 'warn' | 'info';
  text: string;
  timestamp: number;
  location?: {
    url: string;
    lineNumber: number;
    columnNumber: number;
  };
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold?: number;
  status: 'pass' | 'fail' | 'warning';
}

export interface CoverageData {
  functions: {
    total: number;
    covered: number;
    percentage: number;
  };
  lines: {
    total: number;
    covered: number;
    percentage: number;
  };
  statements: {
    total: number;
    covered: number;
    percentage: number;
  };
  branches: {
    total: number;
    covered: number;
    percentage: number;
  };
}

export interface FinalReport {
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  issues: TestIssue[];
  evidence: TestEvidence[];
  metrics: PerformanceMetric[];
  coverage?: CoverageData;
  timestamp: string;
}

// Network and HTTP types
export interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body?: string;
  timing: {
    start: number;
    end: number;
    duration: number;
  };
}

// Browser and page types
export interface BrowserContext {
  viewport: {
    width: number;
    height: number;
  };
  userAgent: string;
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
  }>;
}

// Performance API with memory extension
export interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

// Mock function types for tests
export type MockFunction<T extends (...args: unknown[]) => unknown> = T & {
  mockReturnValue: (value: ReturnType<T>) => MockFunction<T>;
  mockResolvedValue: (value: Awaited<ReturnType<T>>) => MockFunction<T>;
  mockRejectedValue: (error: unknown) => MockFunction<T>;
  mockImplementation: (fn: T) => MockFunction<T>;
  mockClear: () => void;
  mockReset: () => void;
  calls: Parameters<T>[];
};

// Page interaction types
export interface ElementHandle {
  textContent: () => Promise<string | null>;
  getAttribute: (name: string) => Promise<string | null>;
  click: () => Promise<void>;
  type: (text: string) => Promise<void>;
  focus: () => Promise<void>;
  hover: () => Promise<void>;
}

// Performance API with memory extension
export interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}