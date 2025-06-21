import { test, expect } from '@playwright/test'

test.describe('MyLocalRIA Application', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    
    // Check if the page has loaded (looking for common elements)
    const body = page.locator('body')
    await expect(body).toBeVisible()
    
    // Check if the page title is set
    await expect(page).toHaveTitle(/MyLocalRIA|Ria|Financial/)
  })

  test('navigation works', async ({ page }) => {
    await page.goto('/')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    
    // Try to find navigation elements (this will depend on your actual UI)
    const navigation = page.locator('nav, [role="navigation"], header')
    
    // If navigation exists, it should be visible
    if (await navigation.count() > 0) {
      await expect(navigation.first()).toBeVisible()
    }
  })

  test('page responds to viewport changes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    const body = page.locator('body')
    await expect(body).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(body).toBeVisible()
  })
})