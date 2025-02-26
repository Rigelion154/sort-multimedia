import {Request, Response} from 'express'
import {readdir} from "node:fs/promises";

class MultimediaSorterClient {
    sourcePath: string | null = null;
    targetPath: string | null = null;

    constructor() {
    }

    setPath = async (req: Request, res: Response, type: 'source' | 'target') => {
        const { newPath } = req.body

        if (type === 'source') {
            this.sourcePath = newPath
        }

        if (type === 'target') {
            this.targetPath = newPath
        }

        try {
            const items = await readdir(newPath)

            res.status(200).send({data: {newPath, items}, hasErrors: false})
        } catch (e) {
            res.status(404).send({hasErrors: true, message: 'Указанный путь не существует'})
        }
    }

}

export const MultimediaSorter = new MultimediaSorterClient()