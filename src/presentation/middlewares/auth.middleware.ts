import { NextFunction, Request, Response } from 'express'
import { JwtAdapter } from '../../config'
import { UserModel } from '../../data'
import { UserEntity } from '../../domain'

export class AuthMiddleware {
  static async validateJWT(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.header('Authorization')

    if (!authHeader) {
      res.status(401).json({ error: 'No token provided' })
      return
    }
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Invalid token format' })
      return
    }
    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) {
      res.status(401).json({ error: 'Token is empty' })
      return
    }

    try {
      const payload = await JwtAdapter.validateToken<{ id: string }>(token)
      if (!payload) {
        res.status(401).json({ error: 'Invalid token' })
        return
      }
      const user = await UserModel.findById(payload.id)

      if (!user) {
        res.status(401).json({ error: 'User not found' })
        return
      }
      //INICIALIZAR req.body SI ES UNDEFINED porque al usar el formato form-data puede venir undefined y da un error al asignar user
      if (!req.body) {
        req.body = {}
      }
      // TODO: validar si el usuario esta activo
      const userEntity = UserEntity.fromObject(user)
      req.body.user = userEntity.values
      next()
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
