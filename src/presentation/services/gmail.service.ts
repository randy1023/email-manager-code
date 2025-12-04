import { google, Auth } from 'googleapis'
import { CustomError, GetEmailsDto } from '../../domain'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { UserModel } from '../../data'
export class GmailService {
  private oauth2Client: Auth.OAuth2Client
  private tokenPath: string
  constructor(
    google_client_id: string,
    google_client_secret: string,
    google_redirect_uri: string,
    tokenPath: string
  ) {
    this.oauth2Client = new google.auth.OAuth2({
      clientId: google_client_id,
      clientSecret: google_client_secret,
      redirectUri: google_redirect_uri,
    })
    this.tokenPath = tokenPath
    // Cargar token automáticamente al inicializar
    this.loadTokensFromFile()
  }

  // Configurar tokens directamente (para desarrollo rápido)
  setAccessToken(token: string) {
    this.oauth2Client.setCredentials({
      access_token: token,
    })
  }

  // Obtener últimos emails (MÉTODO PRINCIPAL)
  async getLatestEmails(getEmailsDto: GetEmailsDto) {
    const isAssignedEmail = await UserModel.findOne({
      assignedEmails: getEmailsDto.email,
    })
    if (!isAssignedEmail)
      throw CustomError.badRequest('Email was not assigned to you')
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })

      // Obtener lista de mensajes
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: getEmailsDto.limit,
        q: `to:${getEmailsDto.email} -category:promotions -category:forums -category:social -category:notifications category:primary`,
      })
      //bryanppg@gmail.com
      const messages = response.data.messages || []

      console.log(`Found ${messages.length} messages`)

      // Obtener detalles de cada mensaje
      const emailPromises = messages.map(async (message) => {
        try {
          const emailDetail = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'full',
          })

          return this.processEmailPayload(emailDetail.data)
        } catch (error) {
          console.error(`Error fetching message ${message.id}:`, error)
          return null
        }
      })

      const emails = await Promise.all(emailPromises)

      return emails.filter(
        (email) => email !== null && email.service !== 'Otro'
      )
    } catch (error) {
      console.error('Error in getLatestEmails:', error)
      throw CustomError.internalServerError('Failed to fetch emails from Gmail')
    }
  }

  // Cargar tokens desde token.json
  private loadTokensFromFile(): void {
    try {
      if (existsSync(this.tokenPath)) {
        const tokenData = readFileSync(this.tokenPath, 'utf8')
        const tokens = JSON.parse(tokenData)

        this.oauth2Client.setCredentials(tokens)
        console.log('✅ Tokens cargados desde:', this.tokenPath)

        // Verificar si el token necesita refresh
        this.checkAndRefreshToken()
      } else {
        console.log('⚠️ No se encontró token.json, necesita autenticación')
      }
    } catch (error) {
      console.error('❌ Error cargando tokens:', error)
    }
  }

  // Procesar el payload completo del email - MEJORADO
  private processEmailPayload(emailData: any) {
    const headers = emailData.payload?.headers || []

    const subject = this.cleanHeader(
      headers.find((header: any) => header.name === 'Subject')?.value ||
        'Sin asunto'
    )
    const from = this.cleanHeader(
      headers.find((header: any) => header.name === 'From')?.value ||
        'Desconocido'
    )
    const to = this.cleanHeader(
      headers.find((header: any) => header.name === 'To')?.value ||
        'Desconocido'
    )
    const date =
      headers.find((header: any) => header.name === 'Date')?.value || ''

    // Extraer el contenido del cuerpo del email CON MEJOR LIMPIEZA
    const bodyContent = this.extractEmailBody(emailData.payload)

    // Extraer códigos específicos
    const codes = this.extractCodes(bodyContent)

    // Detectar servicio
    const service = this.detectService(from, subject, bodyContent)

    return {
      id: emailData.id,
      threadId: emailData.threadId,
      subject,
      from: this.cleanFromField(from),
      to,
      date,
      service,
      code: codes[0] || null, // Solo el primer código encontrado
      // body:
      //   this.cleanEmailContent(bodyContent.substring(0, 500)) +
      //   (bodyContent.length > 500 ? '...' : ''), // Primeros 500 caracteres LIMPIOS
      // fullBody: this.cleanEmailContent(bodyContent), // Contenido completo LIMPIO
      snippet: this.cleanEmailContent(emailData.snippet || ''),
      // labelIds: emailData.labelIds,
      // internalDate: emailData.internalDate,
    }
  }

  // NUEVA FUNCIÓN: Limpiar headers de encoded words
  private cleanHeader(header: string): string {
    if (!header) return ''

    return (
      header
        // Decodificar encoded-words (ej: =?UTF-8?B?...
        .replace(
          /=\?([^?]+)\?([BQ])\?([^?]*)\?=/gi,
          (match, charset, encoding, text) => {
            try {
              if (encoding.toUpperCase() === 'B') {
                return Buffer.from(text, 'base64').toString(charset)
              } else if (encoding.toUpperCase() === 'Q') {
                return text
                  .replace(/_/g, ' ')
                  .replace(/=([A-Fa-f0-9]{2})/g, (m: any, hex: any) => {
                    return String.fromCharCode(parseInt(hex, 16))
                  })
              }
              return text
            } catch {
              return text
            }
          }
        )
        .trim()
    )
  }

  // NUEVA FUNCIÓN: Limpieza completa del contenido del email
  private cleanEmailContent(text: string): string {
    if (!text) return ''

    return (
      text
        // Decodificar Quoted-Printable (secuencias =XX que se convierten en símbolos raros)
        .replace(/=([A-Fa-f0-9]{2})/g, (match, hex) => {
          return String.fromCharCode(parseInt(hex, 16))
        })
        // Remover caracteres de control y espacios raros
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
        // Normalizar espacios y saltos de línea
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n+/g, '\n')
        .replace(/[ \t]+/g, ' ')
        // Limpiar espacios alrededor de saltos
        .replace(/ *\n */g, '\n')
        // Remover espacios al inicio y final de cada línea
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        // Limpiar espacios múltiples
        .replace(/ +/g, ' ')
        // Remover líneas vacías consecutivas
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim()
    )
  }
  private detectService(from: string, subject: string, body: string): string {
    const servicePatterns = [
      { pattern: /netflix|netflix\.com/i, service: 'Netflix' },
      { pattern: /disney|disneyplus|disney\+/i, service: 'Disney+' },
      { pattern: /hbo|hbomax/i, service: 'HBO Max' },
      { pattern: /amazon|prime video/i, service: 'Prime Video' },
      { pattern: /spotify/i, service: 'Spotify' },
      { pattern: /steam|valve/i, service: 'Steam' },
      { pattern: /epic games/i, service: 'Epic Games' },
      { pattern: /xbox|microsoft/i, service: 'Xbox' },
      { pattern: /playstation|sony/i, service: 'PlayStation' },
      // { pattern: /google|gmail/i, service: 'Google' },
      // { pattern: /facebook|meta/i, service: 'Facebook' },
      // { pattern: /instagram/i, service: 'Instagram' },
      // { pattern: /twitter|x\.com/i, service: 'Twitter' },
      // { pattern: /whatsapp/i, service: 'WhatsApp' },
      // { pattern: /telegram/i, service: 'Telegram' },
      // { pattern: /discord/i, service: 'Discord' },
    ]

    const searchText = `${from} ${subject} ${body}`

    for (const { pattern, service } of servicePatterns) {
      if (pattern.test(searchText)) {
        return service
      }
    }

    return 'Otro'
  }

  // Extraer el contenido del cuerpo del email - MEJORADO
  private extractEmailBody(payload: any): string {
    if (!payload) return ''

    let body = ''

    // Si tiene partes (emails multipart)
    if (payload.parts && payload.parts.length > 0) {
      for (const part of payload.parts) {
        // PRIORIDAD: Buscar la parte de texto plano primero (más limpio)
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = this.decodeBase64(part.body.data)
          break
        }
        // SEGUNDA OPCIÓN: Usar HTML pero limpiarlo mejor
        else if (part.mimeType === 'text/html' && part.body?.data) {
          body = this.decodeBase64(part.body.data)
          // Limpieza mejorada de HTML
          body = this.cleanHtmlContent(body)
          break
        }

        // Recursivamente buscar en sub-partes
        if (part.parts) {
          const subBody = this.extractEmailBody(part)
          if (subBody) {
            body = subBody
            break
          }
        }
      }
    }
    // Si es un email simple sin partes
    else if (payload.body?.data) {
      body = this.decodeBase64(payload.body.data)
    }

    return body
  }
  // NUEVA FUNCIÓN: Limpieza mejorada de contenido HTML
  private cleanHtmlContent(html: string): string {
    if (!html) return ''

    return (
      html
        // Remover scripts y styles
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        // Remover todos los tags HTML pero preservar el contenido
        .replace(/<[^>]*>/g, ' ')
        // Decodificar entidades HTML comunes
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#(\d+);/g, (match, dec) => {
          return String.fromCharCode(parseInt(dec, 10))
        })
        .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
          return String.fromCharCode(parseInt(hex, 16))
        })
        // Aplicar limpieza general
        .replace(/\s+/g, ' ')
        .trim()
    )
  }

  // Decodificar Base64 - MEJORADA
  private decodeBase64(data: string): string {
    try {
      if (!data) return ''

      // Limpieza más robusta de la cadena Base64
      const base64 = data
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .replace(/\s/g, '')

      // Asegurar padding correcto
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        '='
      )

      const decoded = Buffer.from(padded, 'base64').toString('utf-8')
      return decoded
    } catch (error) {
      console.error('Error decodificando Base64:', error)
      return ''
    }
  }

  // Limpiar campo "From"
  private cleanFromField(from: string): string | undefined {
    const emailMatch = from.match(/<([^>]+)>/)
    return emailMatch ? emailMatch[1] : from
  }

  // Extraer códigos del contenido - MEJORADO
  private extractCodes(body: string): string[] {
    const codes: string[] = []

    if (!body) return codes

    // Patrones comunes de códigos MEJORADOS
    const patterns = [
      // Códigos numéricos solos (4-8 dígitos) - contexto más amplio
      /\b\d{4,8}\b/g,

      // Patrones con contexto mejorado
      /(código|codigo|code|pin|contraseña|password|verification|verificación)[\s:]*[#]?[\s]*[":]?[\s]*(\d{4,8})/gi,
      /(\d{4,8})[\s]*(es tu|es el|código|codigo|code|pin|contraseña|password|de verificación|verification)/gi,
      /(verification code|código de verificación|code de vérification)[\s:]*(\d{4,8})/gi,

      // Patrones específicos de servicios
      /(netflix pin|perfil pin|pin del perfil)[\s:]*(\d{4})/gi,
      // /(twitter code|código twitter|código de twitter)[\s:]*(\d{6})/gi,
      // /(google verification|verificación de google)[\s:]*(\d{6})/gi,
      // /(facebook code|código facebook)[\s:]*(\d{5})/gi,
    ]

    for (const pattern of patterns) {
      const matches = body.match(pattern)
      if (matches) {
        // Extraer solo los números de manera más precisa
        const numbers = matches
          .map((match) => {
            const numberMatch = match.match(/\d{4,8}/)
            return numberMatch ? numberMatch[0] : null
          })
          .filter(Boolean) as string[]

        codes.push(...numbers)
      }
    }

    // Eliminar duplicados y filtrar códigos muy comunes
    return [...new Set(codes)]
      .filter(
        (code) =>
          !['1234', '0000', '1111', '9999', '123456', '000000'].includes(code)
      )
      .filter((code) => code.length >= 4)
  }

  // Verificar y refrescar token si es necesario
  private async checkAndRefreshToken(): Promise<void> {
    try {
      const credentials = this.oauth2Client.credentials

      if (!credentials.expiry_date) {
        console.log('⚠️ No hay fecha de expiración en el token')
        return
      }

      const now = Date.now()
      const expiresIn = credentials.expiry_date - now

      // Si expira en menos de 5 minutos, refrescar
      if (expiresIn < 300000) {
        console.log('🔄 Token expirando pronto, refrescando...')
        const { credentials: newCredentials } =
          await this.oauth2Client.refreshAccessToken()

        // Guardar nuevos tokens
        this.saveTokensToFile(newCredentials)
        console.log('✅ Token refrescado exitosamente')
      } else {
        console.log(
          `✅ Token válido por ${Math.round(expiresIn / 60000)} minutos`
        )
      }
    } catch (error) {
      console.error('❌ Error refrescando token:', error)
    }
  }
  // Guardar tokens en archivo
  private saveTokensToFile(tokens: any): void {
    try {
      writeFileSync(this.tokenPath, JSON.stringify(tokens, null, 2))
      this.oauth2Client.setCredentials(tokens)
      console.log('💾 Tokens guardados en:', this.tokenPath)
    } catch (error) {
      console.error('❌ Error guardando tokens:', error)
    }
  }

  // Configurar tokens manualmente (si necesitas actualizarlos)
  setTokens(tokens: any): void {
    this.saveTokensToFile(tokens)
  }
}
