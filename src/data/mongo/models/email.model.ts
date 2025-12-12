import { create } from 'domain'
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
  service: {
    type: String,
    required: [true, 'Service is required'],
    enum: ['netflix', 'disney', 'hbo', 'amazon', 'spotify', 'crunchyroll'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const EmailModel = mongoose.model('Email', emailSchema)
