import { regularExps } from '../../../config'

export class LoginUserDto {
  private constructor(
    public readonly email: string,
    public readonly password: string
  ) {}

  static create(object: {
    [key: string]: any
  }): [string | undefined, LoginUserDto | undefined] {
    const { email, password } = object

    if (!email) return ['Missing Email', undefined]
    if (!regularExps.email.test(email)) return ['Invalid Email', undefined]
    if (!password) return ['Missing Password', undefined]
    if (password.length < 6)
      return ['Password must be at least 6 characters', undefined]

    return [undefined, new LoginUserDto(email, password)]
  }
}
