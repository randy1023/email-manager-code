import { regularExps } from '../../../config'

export class DeletedUserDto {
  constructor(public readonly email?: string) {}

  get values() {
    const returnObj: { [key: string]: any } = {}
    if (this.email) returnObj.email = this.email
    return returnObj
  }

  static create(props: {
    [key: string]: any
  }): [string | undefined, DeletedUserDto | undefined] {
    const { email } = props

    if (!email) return ['email is required ', undefined]
    if (!regularExps.email.test(email)) return ['Invalid Email', undefined]

    return [undefined, new DeletedUserDto(email)]
  }
}
