import { chromium, Browser, Page, BrowserContext } from 'playwright';

export interface PlaywrightConfig {
  headless: boolean;
  slowMo: number;
  viewport: { width: number; height: number };
}

export interface TestStep {
  action: 'click' | 'type' | 'wait' | 'screenshot' | 'navigate' | 'select';
  selector?: string;
  text?: string;
  url?: string;
  delay?: number;
  value?: string;
}

export interface AutomationResult {
  success: boolean;
  screenshots: string[];
  logs: string[];
  error?: string;
  duration: number;
}

export class PlaywrightAutomation {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private screenshots: string[] = [];
  private logs: string[] = [];

  constructor(private config: PlaywrightConfig) {}

  async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: this.config.headless,
        slowMo: this.config.slowMo
      });

      this.context = await this.browser.newContext({
        viewport: this.config.viewport,
        userAgent: 'YarnMarket-AI-Tester/1.0'
      });

      this.page = await this.context.newPage();
      
      // Setup console logging
      this.page.on('console', (msg) => {
        this.logs.push(`Console: ${msg.text()}`);
      });

      // Setup request/response logging
      this.page.on('request', (request) => {
        this.logs.push(`Request: ${request.method()} ${request.url()}`);
      });

      this.page.on('response', (response) => {
        this.logs.push(`Response: ${response.status()} ${response.url()}`);
      });

      this.logs.push('Playwright browser initialized');
    } catch (error) {
      throw new Error(`Failed to initialize Playwright: ${error}`);
    }
  }

  async runAutomationScript(steps: TestStep[]): Promise<AutomationResult> {
    const startTime = Date.now();
    
    try {
      if (!this.page) {
        throw new Error('Playwright not initialized. Call initialize() first.');
      }

      this.logs.push(`Starting automation with ${steps.length} steps`);

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        this.logs.push(`Step ${i + 1}: ${step.action}`);

        switch (step.action) {
          case 'navigate':
            if (step.url) {
              await this.page.goto(step.url);
              this.logs.push(`Navigated to: ${step.url}`);
            }
            break;

          case 'click':
            if (step.selector) {
              await this.page.waitForSelector(step.selector, { timeout: 10000 });
              await this.page.click(step.selector);
              this.logs.push(`Clicked: ${step.selector}`);
            }
            break;

          case 'type':
            if (step.selector && step.text) {
              await this.page.waitForSelector(step.selector, { timeout: 10000 });
              await this.page.fill(step.selector, step.text);
              this.logs.push(`Typed "${step.text}" into: ${step.selector}`);
            }
            break;

          case 'select':
            if (step.selector && step.value) {
              await this.page.waitForSelector(step.selector, { timeout: 10000 });
              await this.page.selectOption(step.selector, step.value);
              this.logs.push(`Selected "${step.value}" from: ${step.selector}`);
            }
            break;

          case 'wait':
            const delay = step.delay || 1000;
            await this.page.waitForTimeout(delay);
            this.logs.push(`Waited ${delay}ms`);
            break;

          case 'screenshot':
            const screenshot = await this.page.screenshot({ 
              fullPage: true
            });
            const screenshotBase64 = screenshot.toString('base64');
            this.screenshots.push(screenshotBase64);
            this.logs.push(`Screenshot captured (${screenshotBase64.length} bytes)`);
            break;
        }

        // Small delay between steps
        await this.page.waitForTimeout(500);
      }

      const duration = Date.now() - startTime;
      this.logs.push(`Automation completed successfully in ${duration}ms`);

      return {
        success: true,
        screenshots: this.screenshots,
        logs: this.logs,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      this.logs.push(`Automation failed: ${errorMsg}`);
      
      // Capture error screenshot
      try {
        if (this.page) {
          const errorScreenshot = await this.page.screenshot({ 
            fullPage: true
          });
          const errorScreenshotBase64 = errorScreenshot.toString('base64');
          this.screenshots.push(errorScreenshotBase64);
        }
      } catch (screenshotError) {
        this.logs.push('Failed to capture error screenshot');
      }

      return {
        success: false,
        screenshots: this.screenshots,
        logs: this.logs,
        error: errorMsg,
        duration
      };
    }
  }

  async testYarnMarketConversation(
    merchantId: string,
    messages: string[]
  ): Promise<AutomationResult> {
    const steps: TestStep[] = [
      { action: 'navigate' as const, url: 'http://localhost:3001/conversation-tester' },
      { action: 'wait' as const, delay: 2000 },
      { action: 'screenshot' as const },
      
      // Select merchant if provided
      ...(merchantId ? [
        { action: 'click' as const, selector: '[data-testid="merchant-selector"]' },
        { action: 'click' as const, selector: `[data-value="${merchantId}"]` }
      ] : []),
      
      // Send each message
      ...messages.flatMap((message, _index) => [
        { action: 'type' as const, selector: '[data-testid="message-input"]', text: message },
        { action: 'click' as const, selector: '[data-testid="send-button"]' },
        { action: 'wait' as const, delay: 3000 },
        { action: 'screenshot' as const }
      ])
    ];

    return this.runAutomationScript(steps);
  }

  async testDashboardNavigation(): Promise<AutomationResult> {
    const navigationTests = [
      '/dashboard',
      '/merchants', 
      '/messages',
      '/conversations',
      '/queues',
      '/settings'
    ];

    const steps: TestStep[] = [
      { action: 'navigate' as const, url: 'http://localhost:3001' },
      { action: 'wait' as const, delay: 2000 },
      { action: 'screenshot' as const },
      
      ...navigationTests.flatMap(route => [
        { action: 'navigate' as const, url: `http://localhost:3001${route}` },
        { action: 'wait' as const, delay: 1500 },
        { action: 'screenshot' as const }
      ])
    ];

    return this.runAutomationScript(steps);
  }

  async testConversationFlow(testScenario: {
    name: string;
    steps: Array<{ input: string; type: 'text' | 'image' }>;
  }): Promise<AutomationResult> {
    const automationSteps: TestStep[] = [
      { action: 'navigate' as const, url: 'http://localhost:3001/conversation-tester' },
      { action: 'wait' as const, delay: 2000 },
      { action: 'screenshot' as const },
      
      // Enable RAG and Debug mode
      { action: 'click' as const, selector: '[data-testid="rag-toggle"]' },
      { action: 'click' as const, selector: '[data-testid="debug-toggle"]' },
      
      // Run through test scenario steps
      ...testScenario.steps.flatMap((step, _index) => [
        { action: 'type' as const, selector: '[data-testid="message-input"]', text: step.input },
        { action: 'click' as const, selector: '[data-testid="send-button"]' },
        { action: 'wait' as const, delay: 2000 },
        { action: 'screenshot' as const }
      ]),
      
      // Final screenshot
      { action: 'wait' as const, delay: 1000 },
      { action: 'screenshot' as const }
    ];

    return this.runAutomationScript(automationSteps);
  }

  async close(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
      }
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      this.logs.push('Playwright browser closed');
    } catch (error) {
      this.logs.push(`Error closing browser: ${error}`);
    }
  }

  getScreenshots(): string[] {
    return this.screenshots;
  }

  getLogs(): string[] {
    return this.logs;
  }

  clearResults(): void {
    this.screenshots = [];
    this.logs = [];
  }
}

// Utility functions
export const createPlaywrightConfig = (
  headless: boolean = true,
  slowMo: number = 0
): PlaywrightConfig => ({
  headless,
  slowMo,
  viewport: { width: 1920, height: 1080 }
});

export const createConversationTest = (
  merchantId: string,
  messages: string[]
) => async (): Promise<AutomationResult> => {
  const playwright = new PlaywrightAutomation(createPlaywrightConfig(false, 100));
  
  try {
    await playwright.initialize();
    return await playwright.testYarnMarketConversation(merchantId, messages);
  } finally {
    await playwright.close();
  }
};

export default PlaywrightAutomation;
