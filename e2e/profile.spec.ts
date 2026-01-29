import { test, expect } from '@playwright/test'

test.describe('Profile Page', () => {
  // Generate unique test email for this test run
  const testEmail = `test-${Date.now()}@test.example.com`
  const testPassword = 'testpassword123'
  const testUsername = `testuser${Date.now()}`

  test('complete profile workflow: sign up, update username, change password', async ({ page }) => {
    // Step 1: Navigate to home page
    await page.goto('/')

    // Step 2: Sign up with new account
    await page.getByRole('tab', { name: 'Sign Up' }).click()
    await page.getByLabel('Email').fill(testEmail)
    await page.getByLabel('Password').fill(testPassword)
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Wait for successful sign up (header should show email or redirect)
    await expect(page.getByText(testEmail)).toBeVisible({ timeout: 10000 })

    // Step 3: Navigate to profile page
    await page.goto('/profile')

    // Verify profile page loaded
    await expect(page.getByRole('heading', { name: /Your Profile/i })).toBeVisible()

    // Verify email is displayed and disabled
    const emailInput = page.locator('input#email')
    await expect(emailInput).toHaveValue(testEmail)
    await expect(emailInput).toBeDisabled()

    // Step 4: Update username
    await page.getByLabel('Username').fill(testUsername)
    await page.getByRole('button', { name: 'Save Changes' }).click()

    // Verify success message
    await expect(page.getByText('Profile updated successfully')).toBeVisible()

    // Step 5: Verify header shows updated username
    await expect(page.getByText(testUsername)).toBeVisible()

    // Step 6: Change password
    const newPassword = 'newpassword456'
    await page.getByLabel('New Password').fill(newPassword)
    await page.getByLabel('Confirm Password').fill(newPassword)
    await page.getByRole('button', { name: 'Change Password' }).click()

    // Verify success message
    await expect(page.getByText('Password changed successfully')).toBeVisible()
  })

  test('shows validation error for invalid username', async ({ page }) => {
    // Sign up with new account first
    const email = `test-invalid-${Date.now()}@test.example.com`
    await page.goto('/')

    await page.getByRole('tab', { name: 'Sign Up' }).click()
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(testPassword)
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Wait for successful sign up
    await expect(page.getByText(email)).toBeVisible({ timeout: 10000 })

    // Navigate to profile
    await page.goto('/profile')

    // Try invalid username (contains special characters)
    await page.getByLabel('Username').fill('invalid@user!')
    await page.getByRole('button', { name: 'Save Changes' }).click()

    // Verify error message
    await expect(page.getByText(/Username can only contain/)).toBeVisible()
  })

  test('shows validation error for password mismatch', async ({ page }) => {
    // Sign up with new account first
    const email = `test-mismatch-${Date.now()}@test.example.com`
    await page.goto('/')

    await page.getByRole('tab', { name: 'Sign Up' }).click()
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(testPassword)
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Wait for successful sign up
    await expect(page.getByText(email)).toBeVisible({ timeout: 10000 })

    // Navigate to profile
    await page.goto('/profile')

    // Try mismatched passwords
    await page.getByLabel('New Password').fill('password123')
    await page.getByLabel('Confirm Password').fill('password456')
    await page.getByRole('button', { name: 'Change Password' }).click()

    // Verify error message
    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })

  test('shows validation error for short password', async ({ page }) => {
    // Sign up with new account first
    const email = `test-short-${Date.now()}@test.example.com`
    await page.goto('/')

    await page.getByRole('tab', { name: 'Sign Up' }).click()
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(testPassword)
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Wait for successful sign up
    await expect(page.getByText(email)).toBeVisible({ timeout: 10000 })

    // Navigate to profile
    await page.goto('/profile')

    // Try short password
    await page.getByLabel('New Password').fill('12345')
    await page.getByLabel('Confirm Password').fill('12345')
    await page.getByRole('button', { name: 'Change Password' }).click()

    // Verify error message
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible()
  })
})
