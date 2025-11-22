import { envs } from './config'
import { Server } from './presentation/server'

void (async () => {
  await main()
})()

async function main() {
  const server = new Server({
    port: envs.PORT,
    public_path: envs.PUBLIC_PATH,
  })
   server.start()
}
