import multer from "multer";


const storage = multer.diskStorage({
    filename: (_req, file, cb) => {
        cb(null, `${file.filename}-${Date.now()}-${Math.floor(Math.random() * 1000)}`)
    },
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/')
    }
});

export const upload = multer({ storage })