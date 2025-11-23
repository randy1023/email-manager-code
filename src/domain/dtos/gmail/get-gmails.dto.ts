export class GetEmailsDto {
  private constructor(public readonly limit: number) {}

  static create(object: {
    [key: string]: any
  }): [string | undefined, GetEmailsDto | undefined] {
    const { limit = 10 } = object

    let limitNumber = Number(limit)
    if (isNaN(limitNumber)) limitNumber = 10

    if (limitNumber < 1 || limitNumber > 20) {
      return ['El límite debe estar entre 1 y 20', undefined]
    }

    return [undefined, new GetEmailsDto(limitNumber)]
  }
}
