import { test, expect } from '@playwright/test';

test.describe('Conversation Tester', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/conversation-tester');
    await page.waitForLoadState('networkidle');
  });

  test('should load conversation tester page', async ({ page }) => {
    // Check if the main elements are visible
    await expect(page.locator('h1')).toContainText('Conversation Tester');
    await expect(page.locator('text=Test YarnMarket AI conversations')).toBeVisible();
  });

  test('should display test scenarios', async ({ page }) => {
    // Check if test scenarios are visible
    await expect(page.locator('text=Test Scenarios')).toBeVisible();
    await expect(page.locator('text=Basic Greeting Flow')).toBeVisible();
    await expect(page.locator('text=Pidgin Negotiation')).toBeVisible();
    await expect(page.locator('text=Image Product Search')).toBeVisible();
  });

  test('should send a text message', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');

    // Type a message
    await messageInput.fill('Hello! Wetin you dey sell?');
    
    // Send the message
    await sendButton.click();

    // Wait for the message to appear
    await expect(page.locator('text=Hello! Wetin you dey sell?')).toBeVisible();
    
    // Wait for AI response (should appear within a few seconds)
    await page.waitForSelector('.glass.text-slate-100', { timeout: 10000 });
  });

  test('should toggle RAG and Debug modes', async ({ page }) => {
    // Check initial state
    const ragToggle = page.locator('[data-testid="rag-toggle"]');
    const debugToggle = page.locator('[data-testid="debug-toggle"]');

    // Toggle RAG mode
    await ragToggle.click();
    
    // Toggle Debug mode
    await debugToggle.click();

    // Both should be visible and clickable
    await expect(ragToggle).toBeVisible();
    await expect(debugToggle).toBeVisible();
  });

  test('should run a test scenario', async ({ page }) => {
    // Click on first scenario
    const firstScenario = page.locator('text=Basic Greeting Flow').first();
    await firstScenario.click();

    // Run the scenario
    const runButton = page.locator('button:has-text("Run")').first();
    await runButton.click();

    // Wait for scenario to complete
    await page.waitForTimeout(5000);

    // Check if messages appeared
    await expect(page.locator('text=Good morning!')).toBeVisible();
  });

  test('should handle file upload', async ({ page }) => {
    // Create a test file
    const fileChooserPromise = page.waitForEvent('filechooser');
    
    // Click the upload button
    await page.locator('button:has([data-testid="upload-icon"])').click();
    
    const fileChooser = await fileChooserPromise;
    
    // We would upload a file here in a real test
    // For now, just ensure the file chooser opened
    expect(fileChooser).toBeTruthy();
  });
});

test.describe('Visual Tests', () => {
  test('should match conversation tester screenshot', async ({ page }) => {
    await page.goto('/conversation-tester');
    await page.waitForLoadState('networkidle');
    
    // Wait for animations to complete
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await expect(page).toHaveScreenshot('conversation-tester.png');
  });
});
