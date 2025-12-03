import { bcryptAdapter, envs, JwtAdapter } from '../../config'
import { UserModel } from '../../data'
import {
  CustomError,
  LoginUserDto,
  RegisterUserDto,
  UserEntity,
} from '../../domain'

export class AuthService {
  constructor() {} // DI // Replace 'any' with the actual type of your UserRepository

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({
      email: registerUserDto.email,
    })
    if (existUser) throw CustomError.badRequest('Email already exists')
    try {
      const user = new UserModel(registerUserDto)

      // Encriptar la contraseña
      user.password = await bcryptAdapter.hash(registerUserDto.password)
      await user.save()

      //JWT <---- para mantener la autenticación del usuario
      const payload = {
        id: user.id,
      }
      const token = await JwtAdapter.generateToken(payload)

      if (!token)
        throw CustomError.internalServerError('Error while creating JWT')

      // No devolver la contraseña
      const userEntity = UserEntity.fromObject(user)
      return {
        user: userEntity.values,
        token,
      }
    } catch (error) {
      throw CustomError.internalServerError(`${error}`)
    }
  }
  public async loginUser(loginUserDto: LoginUserDto) {
    const existUser = await UserModel.findOne({
      email: loginUserDto.email,
    })
    if (!existUser) throw CustomError.badRequest('User not found')
    try {
      // Verificar la contraseña
      const isPasswordValid = await bcryptAdapter.compare(
        loginUserDto.password,
        existUser.password
      )
      if (!isPasswordValid) throw CustomError.badRequest('Invalid password')
      const userEntity = UserEntity.fromObject(existUser)
      const payload = {
        id: existUser.id,
      }
      const token = await JwtAdapter.generateToken(payload)

      if (!token)
        throw CustomError.internalServerError('Error while creating JWT')

      return {
        user: userEntity.values,
        token, // Aquí deberías generar un token JWT real
      }
    } catch (error) {
      throw CustomError.internalServerError(`${error}`)
    }
  }

  public async checkStatus(user: UserEntity) {
    const payload = {
      id: user.id,
    }

    try {
      const token = await JwtAdapter.generateToken(payload)

      return {
        user,
        token,
      }
    } catch (error) {
      throw CustomError.internalServerError(`${error}`)
    }
  }
}
