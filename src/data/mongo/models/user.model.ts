import mongoose from 'mongoose'
const { Schema } = mongoose

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: [String],
    enum: ['USER_ROLE', 'ADMIN_ROLE'],
    default: ['USER_ROLE'],
  },
})

export const UserModel = mongoose.model('User', userSchema)
