import mongoose from 'mongoose'
const { Schema } = mongoose

const emailSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
})

export const EmailModel = mongoose.model('Email', emailSchema)
