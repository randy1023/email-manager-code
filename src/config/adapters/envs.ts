import 'dotenv/config'
import * as env from 'env-var'

export const envs = {
  PORT: env.get('PORT').default('3000').asPortNumber(),
  PUBLIC_PATH: env.get('PUBLIC_PATH').default('public').asString(),
  JWT_SEED: env.get('JWT_SEED').required().asString(),
  MONGO_URL: env.get('MONGO_URL').required().asString(),
  MONGO_DB_NAME: env.get('MONGO_DB_NAME').required().asString(),
  MONGO_USER: env.get('MONGO_USER').required().asString(),
  MONGO_PASS: env.get('MONGO_PASS').required().asString(),
  GOOGLE_CLIENT_ID: env.get('GOOGLE_CLIENT_ID').required().asString(),
  GOOGLE_CLIENT_SECRET: env.get('GOOGLE_CLIENT_SECRET').required().asString(),
  GOOGLE_REDIRECT_URI: env.get('GOOGLE_REDIRECT_URI').required().asString(),
}
