import { regularExps } from '../../../config'

export class RegisterUserDto {
  private constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string
  ) {}

  static create(object: {
    [key: string]: any
  }): [string | undefined, RegisterUserDto | undefined] {
    const { name, email, password } = object

    if (!name) return ['Missing Name', undefined]
    if (!email) return ['Missing Email', undefined]
    if (!regularExps.email.test(email)) return ['Invalid Email', undefined]
    if (!password) return ['Missing Password', undefined]
    if (password.length < 6)
      return ['Password must be at least 6 characters', undefined]

    return [undefined, new RegisterUserDto(name, email, password)]
  }
}
