import { CustomError } from '../errors/custom.error'

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly role: string[],
    public readonly assignedEmails: string[],
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  get values() {
    const returnObj: { [key: string]: any } = {}
    if (this.id) returnObj.id = this.id
    if (this.name) returnObj.name = this.name
    if (this.email) returnObj.email = this.email
    if (this.role) returnObj.role = this.role
    if (this.assignedEmails) returnObj.assignedEmails = this.assignedEmails
    if (this.isActive !== undefined) returnObj.isActive = this.isActive
    if (this.createdAt) returnObj.createdAt = this.createdAt
    if (this.updatedAt) returnObj.updatedAt = this.updatedAt

    return returnObj
  }

  static fromObject(object: { [key: string]: any }): UserEntity {
    const {
      id,
      _id,
      name,
      email,
      password,
      role,
      assignedEmails,
      isActive,
      createdAt,
      updatedAt,
    } = object

    if (!id && !_id) throw CustomError.badRequest('Missing Id')
    if (!name) throw CustomError.badRequest('Missing Name')
    if (!email) throw CustomError.badRequest('Missing Email')
    if (!password) throw CustomError.badRequest('Missing Password')
    if (!assignedEmails) throw CustomError.badRequest('Missing Assigned Emails')
    if (!role) throw CustomError.badRequest('Missing Role')
    if (!createdAt) throw CustomError.badRequest('Missing CreatedAt')
    if (new Date(createdAt).toString() === 'Invalid Date')
      throw CustomError.badRequest('Invalid CreatedAt')
    if (new Date(updatedAt).toString() === 'Invalid Date')
      throw CustomError.badRequest('Invalid UpdatedAt')
    if (!updatedAt) throw CustomError.badRequest('Missing UpdatedAt')

    return new UserEntity(
      id || _id,
      name,
      email,
      password,
      Array.isArray(role) ? role : [role],
      Array.isArray(assignedEmails) ? assignedEmails : [assignedEmails],
      isActive !== undefined ? isActive : true,
      new Date(createdAt),
      new Date(updatedAt)
    )
  }
}
