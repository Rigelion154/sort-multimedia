import {Request, Response} from 'express'
import {mkdir, readdir, rename, stat} from "node:fs/promises";
import {join} from 'node:path';
import moment from "moment";
import 'moment/locale/ru';

const sortFunction = (a: any, b: any) => a.isDirectory === b.isDirectory ? 0 : a.isDirectory ? -1 : 1

class MultimediaSorterClient {
    private photoExtensions: Set<string> = new Set(['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']);
    private videoExtensions: Set<string> = new Set(['mp4', 'mov', 'avi', 'mkv', 'webm']);

    constructor() {
        moment().locale('ru');
    }

    private async getFileStats(filePath: string, fileName: string) {
        try {
            const fileStat = await stat(filePath);
            const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
            const isImage = this.photoExtensions.has(extension);
            const isVideo = this.videoExtensions.has(extension);

            return {
                fileName,
                isDirectory: fileStat.isDirectory(),
                createdAt: fileStat.mtime,
                isLocked: false,
                extension,
                filetype: fileStat.isDirectory() ? 'directory' : isImage ? 'image' : isVideo ? 'video' : 'file'
            };
        } catch (error) {
            return {
                fileName,
                extension: fileName.split('.').pop()?.toLowerCase() ?? '',
                isLocked: true,
                filetype: 'warning'
            };
        }
    }

    private getFilesFromPath = async (folderPath: string) => {
        try {
            const folderFiles = await readdir(folderPath);
            const fileStatsPromises = folderFiles.map(file => {
                const filePath = join(folderPath, file);
                return this.getFileStats(filePath, file);
            });

            const resultStatList = await Promise.all(fileStatsPromises);
            const sortedFiles = resultStatList.sort(sortFunction);

            return {hasErrors: false, folderPath, filesStatList: sortedFiles};
        } catch (error) {
            return {hasErrors: true, message: 'Указанный путь не существует'};
        }
    }

    private async checkOrCreateDirectory(path: string) {
        try {
            await stat(path);
        } catch (error) {
            await mkdir(path, {recursive: true});
        }
    }

    getPathFiles = async (req: Request, res: Response) => {
        const files = await this.getFilesFromPath(req.body.folderPath);
        const statusCode = files.hasErrors ? 404 : 200;
        res.status(statusCode).send(files);
    }

    addExtension = async (req: Request, res: Response) => {
        const {extension, type} = req.body;

        if (type === 'video') {
            this.videoExtensions.add(extension);
        } else if (type === 'photo') {
            this.photoExtensions.add(extension);
        } else {
            res.status(404).send({hasErrors: true, message: 'Ошибка при добавлении расширения'});
            return;
        }

        res.send({
            hasErrors: false,
            data: {extensions: type === 'video' ? [...this.videoExtensions] : [...this.photoExtensions]}
        });
    }

    gallerySort = async (req: Request, res: Response) => {
        const {sourcePath, destinationPath} = req.body

        if (!sourcePath) {
            res.status(404).send({hasErrors: true, message: 'Укажите путь к исходным данным'})
            return
        }

        if (!destinationPath) {
            res.status(404).send({hasErrors: true, message: 'Укажите путь к конечной папке'})
            return
        }

        try {
            const files = await this.getFilesFromPath(sourcePath);

            if (files.hasErrors || !files.filesStatList || files.filesStatList.length === 0) {
                res.status(404).send({hasErrors: true, message: 'Файлы отсутствуют'});
                return;
            }

            for (const file of files.filesStatList) {
                if (!file.isDirectory && (this.photoExtensions.has(file.extension) || this.videoExtensions.has(file.extension))) {
                    const createdAtYear = moment(file.createdAt).format("YYYY");
                    const createdAtMonth = moment(file.createdAt).format("MMMM");
                    const formattedMonth = createdAtMonth[0].toUpperCase() + createdAtMonth.slice(1);

                    const yearFolderPath = join(destinationPath, createdAtYear);
                    const monthFolderPath = join(yearFolderPath, formattedMonth);

                    await this.checkOrCreateDirectory(yearFolderPath);
                    await this.checkOrCreateDirectory(monthFolderPath);

                    const newFilePath = join(monthFolderPath, file.fileName);

                    try {
                        await stat(newFilePath);
                        console.log(`Файл ${file.fileName} уже существует в ${monthFolderPath}. Пропуск.`);
                    } catch {
                        await rename(join(sourcePath, file.fileName), newFilePath);
                        console.log(`Файл ${file.fileName} перемещен в ${monthFolderPath}.`);
                    }
                }
            }

            const newSourceFiles = await this.getFilesFromPath(sourcePath);
            const newDestinationFiles = await this.getFilesFromPath(destinationPath);

            res.status(200).send({
                hasErrors: false,
                message: `Файлы перемещены в ${destinationPath}.`,
                newSourceFiles,
                newDestinationFiles
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({hasErrors: true, message: 'Внутренняя ошибка сервера'});
        }
    }
}

export const MultimediaSorter = new MultimediaSorterClient()