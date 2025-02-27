import {Request, Response} from 'express'
import {readdir, stat} from "node:fs/promises";
import {join} from 'node:path';
import * as os from "node:os";


class MultimediaSorterClient {
    sourcePath: string | null = null;
    targetPath: string | null = null;
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
            this.targetPath = folderPath
        }

        try {
            const folderFiles = await readdir(folderPath)
            const resultStatList = []

            for (const file of folderFiles) {
                const filePath = join(folderPath, file)
                const extension = file.split('.').pop()?.toLowerCase();
                const isImage = this.photoExtensions.includes(extension ?? '');
                const isVideo = this.videoExtensions.includes(extension ?? '');

                try {
                    const fileStat = await stat(filePath)
                    const filetype = fileStat.isDirectory() ? 'directory' : isImage ? 'image' : isVideo ? 'video' : 'file'

                    resultStatList.push({
                        fileName: file,
                        isDirectory: fileStat.isDirectory(),
                        createdAt: fileStat.mtime,
                        isLocked: false,
                        filetype
                    })
                } catch (error) {
                    resultStatList.push({
                        fileName: file,
                        isLocked: true,
                        filetype: 'warning'
                    })
                    console.error(error)
                }

            }

            const filesStatList = resultStatList.sort((a, b) => {
                if (a.isDirectory === b.isDirectory) {
                    return 0;
                }
                return a.isDirectory ? -1 : 1;
            })

            res.status(200).send({hasErrors: false, folderPath, filesStatList})
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