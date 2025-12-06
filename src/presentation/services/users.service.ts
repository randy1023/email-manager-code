import { bcryptAdapter, envs, JwtAdapter } from '../../config'
import { UserModel } from '../../data'
import { CustomError, UserEntity } from '../../domain'

export class UsersService {
  constructor() {} // DI // Replace 'any' with the actual type of your UserRepository

  public async getUsers(): Promise<UserEntity[]> {
    const users = await UserModel.find()
    return users.map((user) => UserEntity.fromObject(user))
  }
  public async getUserById(userId: string): Promise<UserEntity> {
    const user = await UserModel.findById(userId)
    if (!user) throw CustomError.badRequest(`User with id ${userId} no found`)
    return UserEntity.fromObject(user)
  }
}
