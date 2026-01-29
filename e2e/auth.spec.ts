import { test, expect } from '@playwright/test'

test.describe('Sign-up Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows error for invalid email format', async ({ page }) => {
    // Click Sign Up tab
    await page.getByRole('tab', { name: 'Sign Up' }).click()

    // Fill invalid email
    await page.getByLabel('Email').fill('invalid-email')
    await page.getByLabel('Password').fill('password123')

    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Expect error message
    await expect(page.getByText('Please enter a valid email')).toBeVisible()
  })

  test('shows error for password less than 6 characters', async ({ page }) => {
    // Click Sign Up tab
    await page.getByRole('tab', { name: 'Sign Up' }).click()

    // Fill valid email but short password
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('12345')

    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Expect error message
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible()
  })

  test('allows sign-up with valid credentials', async ({ page }) => {
    // Click Sign Up tab
    await page.getByRole('tab', { name: 'Sign Up' }).click()

    // Fill valid credentials
    await page.getByLabel('Email').fill('valid@example.com')
    await page.getByLabel('Password').fill('password123')

    // Submit form - should not show validation error
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Should not show validation errors (may show Supabase error for duplicate email)
    await expect(page.getByText('Please enter a valid email')).not.toBeVisible()
    await expect(page.getByText('Password must be at least 6 characters')).not.toBeVisible()
  })
})
