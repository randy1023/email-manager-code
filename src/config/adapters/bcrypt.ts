import bcrypt from 'bcrypt'

export const bcryptAdapter = {
  hash: async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
  },
  compare: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash)
  },
}
