import { Types } from 'mongoose'
import { UserModel } from '../../data'
import { CustomError, UpdateUserDto, UserEntity } from '../../domain'

export class UsersService {
  constructor() {} // DI // Replace 'any' with the actual type of your UserRepository

  public async getUsers() {
    const users = await UserModel.find()
    return users.map((user) => UserEntity.fromObject(user).values)
  }
  public async getUserById(userId: string) {
    const id = new Types.ObjectId(userId)

    try {
      const user = await UserModel.findById(id)

      return UserEntity.fromObject(user!).values
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'CastError')
          throw CustomError.badRequest(`User with id ${userId} no found`)
      }
      throw error
    }
  }
  public async updateUserByEmail(updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await UserModel.findOneAndUpdate(
        { email: updateUserDto.email! },
        {
          $set: {
            ...updateUserDto.values,
          },
        },
        {
          new: true,
        }
      )

      if (!updatedUser)
        throw CustomError.badRequest(
          `User with email ${updateUserDto.email} no was updated`
        )

      return UserEntity.fromObject(updatedUser).values
    } catch (error) {
      console.log({ error })
      throw error
    }
  }
  public async deleteUserByEmail(email: string) {
    try {
      const deletedUser = await UserModel.deleteOne({ email })

      console.log({ deletedUser })
    } catch (error) {
      console.log({ error })
      throw error
    }
  }
}
