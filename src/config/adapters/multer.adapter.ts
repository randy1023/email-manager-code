import multer from 'multer'
import path from 'path'
// Configuración para almacenamiento en memoria
const storage = multer.memoryStorage()

// Filtro para aceptar solo archivos CSV
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const filetypes = /csv/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)
  console.log({ extname, mimetype })
  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error('Solo se permiten archivos CSV'))
  }
}

export const multerAdapter = {
  upload: multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB límite
    fileFilter: fileFilter,
  }),
}
