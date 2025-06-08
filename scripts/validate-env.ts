import { config } from 'dotenv';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Load root environment
config();

// Define environment schemas for each component
const searchEnvSchema = z.object({
  OPENSEARCH_DOMAIN: z.string().url(),
  OPENSEARCH_USERNAME: z.string().min(1),
  OPENSEARCH_PASSWORD: z.string().min(1),
  OPENSEARCH_INDEX_PREFIX: z.string().min(1),
});

const apiEnvSchema = z.object({
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  API_URL: z.string().url(),
});

const webEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_MAPS_API_KEY: z.string().min(1),
});

const mobileEnvSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_MAPS_API_KEY: z.string().min(1),
});

// Map of components to their schema validators
const validators = {
  'packages/search': searchEnvSchema,
  'packages/api': apiEnvSchema,
  'apps/web': webEnvSchema,
  'apps/mobile': mobileEnvSchema,
};

function validateComponent(component: string, envPath: string) {
  console.log(`\nValidating ${component}...`);
  
  if (!fs.existsSync(envPath)) {
    console.error(`❌ No .env file found at ${envPath}`);
    return false;
  }

  const env = config({ path: envPath }).parsed;
  if (!env) {
    console.error(`❌ Failed to parse .env file at ${envPath}`);
    return false;
  }

  const validator = validators[component as keyof typeof validators];
  if (!validator) {
    console.error(`❌ No validator defined for ${component}`);
    return false;
  }

  try {
    validator.parse(env);
    console.log(`✅ Environment validation passed for ${component}`);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('❌ Unexpected error during validation:', error);
    }
    return false;
  }
}

// Main validation function
function validateEnvironments() {
  console.log('🔍 Starting environment validation...');
  
  let hasErrors = false;
  
  // Validate each component
  Object.keys(validators).forEach(component => {
    const envPath = path.join(process.cwd(), component, '.env');
    if (!validateComponent(component, envPath)) {
      hasErrors = true;
    }
  });

  if (hasErrors) {
    console.error('\n❌ Environment validation failed');
    process.exit(1);
  } else {
    console.log('\n✅ All environment validations passed');
  }
}

validateEnvironments();
