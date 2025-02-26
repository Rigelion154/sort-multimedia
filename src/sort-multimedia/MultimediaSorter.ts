import {Request, Response} from 'express'
import {readdir} from "node:fs/promises";

class MultimediaSorterClient {
    sourcePath: string | null = null;
    targetPath: string | null = null;
    photoExtensions: string[] = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    videoExtensions: string[] = ['mp4', 'mov', 'avi', 'mkv', 'webm'];

    constructor() {
    }

    setPath = async (req: Request, res: Response) => {
        const {newPath, type} = req.body

        if (!type) {
            res.status(404).send({hasErrors: true, message: 'Укажите тип пути'})
            return
        }

        if (type === 'source') {
            this.sourcePath = newPath
        }

        if (type === 'target') {
            this.targetPath = newPath
        }

        try {
            const items = await readdir(newPath)
            res.status(200).send({hasErrors: false, data: {newPath, items}})
        } catch (error) {
            res.status(404).send({hasErrors: true, message: 'Указанный путь не существует'})
        }
    }

    addExtension = async (req: Request, res: Response) => {
        const {extension, type} = req.body

        if (type === 'video') {
            this.videoExtensions.push(extension)
            res.send({hasErrors: false, data: {extensions: this.videoExtensions}})
            return
        }

        if (type === 'photo') {
            this.photoExtensions.push(extension)
            res.send({hasErrors: false, data: {extensions: this.photoExtensions}})
            return
        }

        res.status(404).send({hasErrors: true, message: 'Ошибка при добавлении расширения'})
    }

}

export const MultimediaSorter = new MultimediaSorterClient()