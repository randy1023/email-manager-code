import 'dotenv/config'
import * as env from 'env-var'

export const envs = {
  PORT: env.get('PORT').default('3000').asPortNumber(),
  PUBLIC_PATH: env.get('PUBLIC_PATH').default('public').asString(),
}
