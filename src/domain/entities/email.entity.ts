import { CustomError } from '../errors/custom.error'

export class EmailEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string
  ) {}

  get values() {
    const returnObj: { [key: string]: any } = {}
    if (this.id) returnObj.id = this.id
    if (this.email) returnObj.email = this.email

    return returnObj
  }

  static fromObject(object: { [key: string]: any }): EmailEntity {
    const { id, _id, email, password } = object

    if (!id && !_id) throw CustomError.badRequest('Missing Id')
    if (!email) throw CustomError.badRequest('Missing Email')
    if (!password) throw CustomError.badRequest('Missing Password')

    return new EmailEntity(
      id || _id,

      email,
      password
    )
  }
}
