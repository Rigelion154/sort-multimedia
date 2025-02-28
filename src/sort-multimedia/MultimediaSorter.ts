import {Request, Response} from 'express'
import {readdir, stat} from "node:fs/promises";
import {join} from 'node:path';

class MultimediaSorterClient {
    sourcePath: string | null = null;
    destinationPath: string | null = null;
    photoExtensions: string[] = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    videoExtensions: string[] = ['mp4', 'mov', 'avi', 'mkv', 'webm'];

    constructor() {
    }

    setPath = async (req: Request, res: Response) => {
        const {folderPath, type} = req.body

        if (!type) {
            res.status(404).send({hasErrors: true, message: 'Укажите тип пути'})
            return
        }

        if (type === 'source') {
            this.sourcePath = folderPath
        }

        if (type === 'target') {
            this.destinationPath = folderPath
        }

        try {
            const folderFiles = await readdir(folderPath)
            const filesStatList = []

            for (const folderFile of folderFiles) {
                const folderFilePath = join(folderPath, folderFile)

                try {
                const folderFileStat = await stat(folderFilePath)
                filesStatList.push({
                    fileName: folderFile,
                    isDirectory: folderFileStat.isDirectory(),
                    createdAt: folderFileStat.mtime
                })
                } catch (error) {
                    console.log(error)
                }
            }

            res.status(200).send({hasErrors: false, folderPath, filesStatList})
        } catch (error) {
            console.log(error)
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