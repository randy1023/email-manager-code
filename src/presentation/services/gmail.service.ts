import { google, Auth } from 'googleapis'
import { CustomError } from '../../domain'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
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
  async getLatestEmails(limit: number = 10) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })

      // Obtener lista de mensajes
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: limit,
        labelIds: ['INBOX'],
      })

      const messages = response.data.messages || []

      console.log(`Found ${messages.length} messages`)

      // Obtener detalles de cada mensaje
      const emailPromises = messages.map(async (message) => {
        try {
          const emailDetail = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
          })

          return this.formatEmail(emailDetail.data)
        } catch (error) {
          console.error(`Error fetching message ${message.id}:`, error)
          return null
        }
      })

      const emails = await Promise.all(emailPromises)
      return emails.filter((email) => email !== null)
    } catch (error) {
      console.error('Error in getLatestEmails:', error)
      throw CustomError.internalServerError('Failed to fetch emails from Gmail')
    }
  }

  // Formatear email para respuesta limpia
  private formatEmail(emailData: any) {
    const headers = emailData.payload?.headers || []

    const getHeader = (name: string) => {
      return (
        headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())
          ?.value || ''
      )
    }

    return {
      id: emailData.id,
      subject: getHeader('Subject') || '(Sin asunto)',
      from: getHeader('From'),
      date: getHeader('Date'),
      snippet: emailData.snippet || '',
      isRead: !emailData.labelIds?.includes('UNREAD'),
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
