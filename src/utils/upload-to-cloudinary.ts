import { cloudinary } from "@/lib/cloudinary"

export const uploadToCloudinary = async (filePath: string, folderName: string) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: `whisper/${folderName}`,
            resource_type: 'auto'
        })
        return result;
    } catch (error) {
        console.log(`Cloudinary upload Error:`, error)
        throw error;
    }
}
