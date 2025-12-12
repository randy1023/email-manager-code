import { regularExps } from '../../config'
import { EmailModel } from '../../data/mongo/models/email.model'
import { CustomError, EmailEntity, UserEntity } from '../../domain'
import csv from 'csv-parse'
import csvStrinfigy from 'csv-stringify'

interface CsvRow {
  id?: string
  email: string
  password: string
}
interface ProcessResult {
  success: boolean
  created: number
  updated: number
  errors: Array<{
    row: number
    email: string
    error: string
  }>
}

export class CsvService {
  constructor() {} // DI // Replace 'any' with the actual type of your UserRepository

  // Método para importar CSV
  public async importCSV(file: Express.Multer.File) {
    const fileContent = file.buffer.toString('utf-8')
    const parsedData = await this.parseCSV(fileContent)
    // console.log(await this.processEmailRows(parsedData))

    return this.processEmailRows(parsedData)
  }

  // Método para exportar CSV
  public async exportCSV(): Promise<string> {
    // Obtener todos los emails de la base de datos
    const emails = await EmailModel.find().lean()

    if (emails.length === 0) {
      throw CustomError.notFound('No hay registros para exportar')
    }

    // Generar CSV
    const csvData = await this.generateCSV(emails)

    return csvData
  }

  private async generateCSV(data: any[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const options = {
        header: true,
        columns: [
          { key: '_id', header: 'id' },
          { key: 'email', header: 'email' },
          { key: 'password', header: 'password' },
        ],
        // ¡AÑADE ESTAS OPCIONES!
        quoted: true, // Esto pone todos los campos entre comillas
        quoted_empty: true, // También campos vacíos
        quoted_string: true, // Solo strings entre comillas
        escape: '\\', // Carácter de escape
        cast: {
          date: (value: Date) => value.toISOString(),
          // Añade un cast para ObjectId si usas MongoDB
          object: (value: any) => {
            if (value && value.toString) {
              return value.toString()
            }
            return String(value)
          },
        },
      }

      csvStrinfigy.stringify(data, options, (error, output) => {
        if (error) {
          reject(error)
        } else {
          console.log(output)
          resolve(output)
        }
      })
    })
  }
  private parseCSV(csvContent: string): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
      const options = {
        columns: true as const, // Usar primera fila como headers
        skip_empty_lines: true,
        trim: true,
        cast: (value: string, context: any) => {
          // Convertir valores vacíos a undefined
          if (value === '' || value === 'null') return undefined
          return value
        },
      }
      csv.parse(
        csvContent,
        options,
        (error: Error | undefined, data: CsvRow[]) => {
          if (error) {
            reject(error)
          } else {
            resolve(data)
          }
        }
      )
    })
  }

  private async processEmailRows(parsedData: CsvRow[]): Promise<ProcessResult> {
    const result: ProcessResult = {
      success: true,
      created: 0,
      updated: 0,
      errors: [],
    }

    // Usar for...of en lugar de forEach para manejar async/await correctamente
    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i]
      const rowNumber = i + 2 // +1 para base 1, +1 para header

      try {
        // Validaciones
        if (!row || !row.email || !row.email.trim()) {
          throw CustomError.badRequest('Email es requerido')
        }

        if (!row.password || row.password.trim() === '') {
          throw CustomError.badRequest('Password es requerido')
        }

        if (!regularExps.email.test(row.email.trim())) {
          throw CustomError.badRequest('Email no tiene formato válido')
        }

        // Preparar datos limpios
        const cleanEmail = row.email.trim()
        const cleanPassword = row.password.trim()

        // Si no tiene ID, crear nuevo
        if (!row.id || row.id.trim() === '') {
          const emailCreated = new EmailModel({
            email: cleanEmail,
            password: cleanPassword,
          })
          await emailCreated.save()
          result.created++
        }
        // Si tiene ID, actualizar
        else {
          const emailUpdated = await EmailModel.findByIdAndUpdate(
            row.id.trim(),
            {
              email: cleanEmail,
              password: cleanPassword,
              updatedAt: new Date(),
            },
            { new: true, runValidators: true }
          )

          if (!emailUpdated) {
            throw new Error(`No se encontró registro con ID: ${row.id}`)
          }

          result.updated++
        }
      } catch (error: any) {
        result.errors.push({
          row: rowNumber,
          email: !row ? 'Sin email' : row.email,
          error: error.message,
        })
        result.success = false
      }
    }

    return result
  }
}
