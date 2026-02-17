/**
 * Startup Validation
 * Validates critical environment variables and connections on server start
 */

export async function validateStartup() {
  const errors: string[] = []
  const warnings: string[] = []

  console.log('\n[STARTUP] Validating OneselfAI Platform...\n')

  // 1. Check JWT_SECRET
  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET environment variable is not set')
  } else if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === 'dev_secret_key_change_in_production') {
    errors.push('JWT_SECRET is using development default in PRODUCTION')
  }

  // 2. Check POSTGRES_URL
  if (!process.env.POSTGRES_URL) {
    warnings.push('POSTGRES_URL not set - Database features will be unavailable')
  } else {
    try {
      // Test connection
      const { getPool } = await import('./postgres')
      const pool = getPool()
      const result = await pool.query('SELECT NOW()')
      console.log('[STARTUP] ✓ PostgreSQL connection successful')
    } catch (err) {
      warnings.push(`PostgreSQL connection failed: ${(err as Error).message}`)
    }
  }

  // 3. Node environment
  console.log(`[STARTUP] ✓ NODE_ENV: ${process.env.NODE_ENV || 'development'}`)

  // 4. Report errors
  if (errors.length > 0) {
    console.error('[STARTUP] ❌ CRITICAL ERRORS:\n')
    errors.forEach((err) => console.error(`  - ${err}`))
    console.error('\n[STARTUP] Please fix these errors before running the application.\n')
    process.exit(1)
  }

  // 5. Report warnings
  if (warnings.length > 0) {
    console.warn('[STARTUP] ⚠️  WARNINGS:\n')
    warnings.forEach((warn) => console.warn(`  - ${warn}`))
    console.warn('\n')
  }

  console.log('[STARTUP] ✓ All critical validations passed\n')
}
