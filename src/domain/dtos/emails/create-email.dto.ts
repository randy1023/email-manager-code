import { regularExps } from '../../../config'

export class CreatedEmailServiceDto {
  private constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly service: string
  ) {}

  static create(object: {
    [key: string]: any
  }): [string | undefined, CreatedEmailServiceDto | undefined] {
    const { email, password, service } = object

    if (!service) return ['Missing Service', undefined]
    if (!email) return ['Missing Email', undefined]
    if (!regularExps.email.test(email)) return ['Invalid Email', undefined]
    if (!password) return ['Missing Password', undefined]

    return [undefined, new CreatedEmailServiceDto(email, password, service)]
  }
}
