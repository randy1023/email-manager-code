import { CustomError } from '../errors/custom.error'

export class EmailEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string,
    public readonly service: string,
    public readonly createdAt: Date
  ) {}

  get values() {
    const returnObj: { [key: string]: any } = {}
    if (this.id) returnObj.id = this.id
    if (this.email) returnObj.email = this.email
    if (this.service) returnObj.service = this.service
    if (this.createdAt) returnObj.createdAt = this.createdAt
    return returnObj
  }

  static fromObject(object: { [key: string]: any }): EmailEntity {
    const { id, _id, email, password, service, createdAt } = object

    if (!id && !_id) throw CustomError.badRequest('Missing Id')
    if (!email) throw CustomError.badRequest('Missing Email')
    if (!password) throw CustomError.badRequest('Missing Password')
    if (!service) throw CustomError.badRequest('Missing Service')
    if (!createdAt) throw CustomError.badRequest('Missing CreatedAt')
    if (new Date(createdAt).toString() === 'Invalid Date')
      throw CustomError.badRequest('Invalid CreatedAt')

    return new EmailEntity(
      id || _id,

      email,
      password,
      service,
      new Date(createdAt)
    )
  }
}
