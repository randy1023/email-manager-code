import { EmailModel } from '../../data/mongo/models/email.model'
import { CreatedEmailServiceDto, CustomError, EmailEntity } from '../../domain'

export class EmailsService {
  constructor() {} // DI

  // Aquí puedes agregar métodos relacionados con la gestión de emails

  public async createEmailByService(
    createdEmailServiceDto: CreatedEmailServiceDto
  ): Promise<EmailEntity> {
    // Lógica para crear un email basado en el servicio (netflix,disney,etc )
    try {
      const emailByServiceExisted = await EmailModel.findOne({
        email: createdEmailServiceDto.email,
        service: createdEmailServiceDto.service,
      })
      if (emailByServiceExisted)
        throw CustomError.badRequest('Email by service already exists')

      const newEmail = new EmailModel(createdEmailServiceDto)
      await newEmail.save()

      return EmailEntity.fromObject(newEmail)
    } catch (error) {
      throw CustomError.internalServerError('Error creating email by service')
    }
  }
}
