/// <reference types="vite/client" />
declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string

// Spark LLM API types
interface SparkLLM {
  llm: (prompt: any, model: string) => Promise<string>
  llmPrompt: (template: TemplateStringsArray, ...values: any[]) => any
}

declare global {
  interface Window {
    spark?: SparkLLM
  }
}