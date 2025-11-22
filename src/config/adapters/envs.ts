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
}
