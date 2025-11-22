import { envs } from './config'
import { MongoDatabase } from './data'
import { AppRoutes } from './presentation/routes'
import { Server } from './presentation/server'

void (async () => {
  await main()
})()

async function main() {
  await MongoDatabase.connect({
    mongoUrl: envs.MONGO_URL,
    dbName: envs.MONGO_DB_NAME,
  })
  const server = new Server({
    port: envs.PORT,
    public_path: envs.PUBLIC_PATH,
    routes: AppRoutes.routes,
  })
  server.start()
}
