import { regularExps } from '../../../config'

export class UpdateUserDto {
  constructor(
    public readonly name?: string,
    public readonly email?: string,
    public readonly role?: string[],
    public readonly assignedEmails?: string[],
    public readonly isActive?: boolean,
    public readonly updatedAt?: Date
  ) {}

  get values() {
    const returnObj: { [key: string]: any } = {}
    if (this.name) returnObj.name = this.name
    if (this.email) returnObj.email = this.email
    if (this.role) returnObj.role = this.role
    if (this.assignedEmails) returnObj.assignedEmails = this.assignedEmails
    if (typeof this.isActive === 'boolean') returnObj.isActive = this.isActive
    if (this.updatedAt) returnObj.updatedAt = new Date(this.updatedAt)
    return returnObj
  }

  static create(props: {
    [key: string]: any
  }): [string | undefined, UpdateUserDto | undefined] {
    const {
      name,
      email,
      role,
      assignedEmails,
      isActive = true,
      updatedAt = Date.now(),
    } = props

    if (!email) return ['email is required ', undefined]
    if (!regularExps.email.test(email)) return ['Invalid Email', undefined]
    if (isActive && typeof isActive !== 'boolean')
      return ['isActive must be a boolean', undefined]
    if (new Date(updatedAt).toString() === 'Invalid Date')
      return ['updatedAt must be a valid date', undefined]
    if (assignedEmails) {
      if (!Array.isArray(assignedEmails))
        return ['Assigned Emails should be an array', undefined]
      if (assignedEmails.some((em: string) => !regularExps.email.test(em)))
        return ['One or more Assigned Emails are invalid', undefined]
      if (assignedEmails.length === 0)
        return ['At least one Assigned Email is required', undefined]
    }
    if (role) {
      if (!Array.isArray(role)) return ['Role should be an array', undefined]
    }
    return [
      undefined,
      new UpdateUserDto(name, email, role, assignedEmails, isActive, updatedAt),
    ]
  }
}
