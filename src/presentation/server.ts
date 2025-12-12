import express, { Router } from 'express'
import path from 'path'
import cors from 'cors'
import multer from 'multer'

interface Options {
  port: number
  routes: Router
  public_path?: string
}

export class Server {
  public readonly app = express()
  private serverListener?: any
  private readonly port: number
  private readonly publicPath: string
  private readonly routes: Router

  constructor(options: Options) {
    const { port, routes, public_path = 'public' } = options
    this.port = port
    this.publicPath = public_path
    this.routes = routes
  }

  async start() {
    //* Middlewares
    this.app.use(express.json()) // raw
    this.app.use(express.urlencoded({ extended: true })) // x-www-form-urlencoded
    this.app.use(
      cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      })
    )

    //* Public Folder
    this.app.use(express.static(this.publicPath))

    //* Routes
    this.app.use(this.routes)

    // Middleware para errores de multer
    this.app.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({
              error: 'El tamaño del archivo excede el límite permitido',
            })
            return
          }
          console.log(err.message)
          res.status(400).json({ error: err.message })
          return
        }
        next(err)
      }
    )

    //* SPA /^\/(?!api).*/  <== Únicamente si no empieza con la palabra api
    this.app.get('/{*splat}', (req, res) => {
      const indexPath = path.join(
        __dirname + `../../../${this.publicPath}/index.html`
      )
      res.sendFile(indexPath)
    })

    this.serverListener = this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`)
    })
  }

  public close() {
    this.serverListener?.close()
  }
}
