"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultimediaSorter = void 0;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const moment_1 = __importDefault(require("moment"));
require("moment/locale/ru");
const sortFunction = (a, b) => a.isDirectory === b.isDirectory ? 0 : a.isDirectory ? -1 : 1;
class MultimediaSorterClient {
    constructor() {
        this.photoExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']);
        this.videoExtensions = new Set(['mp4', 'mov', 'avi', 'mkv', 'webm']);
        this.getFilesFromPath = async (folderPath) => {
            try {
                const folderFiles = await (0, promises_1.readdir)(folderPath);
                const fileStatsPromises = folderFiles.map(file => {
                    const filePath = (0, node_path_1.join)(folderPath, file);
                    return this.getFileStats(filePath, file);
                });
                const resultStatList = await Promise.all(fileStatsPromises);
                const sortedFiles = resultStatList.sort(sortFunction);
                return { hasErrors: false, folderPath, filesStatList: sortedFiles };
            }
            catch (error) {
                return { hasErrors: true, message: 'Указанный путь не существует' };
            }
        };
        this.getPathFiles = async (req, res) => {
            const files = await this.getFilesFromPath(req.body.folderPath);
            const statusCode = files.hasErrors ? 404 : 200;
            res.status(statusCode).send(files);
        };
        this.addExtension = async (req, res) => {
            const { extension, type } = req.body;
            if (type === 'video') {
                this.videoExtensions.add(extension);
            }
            else if (type === 'photo') {
                this.photoExtensions.add(extension);
            }
            else {
                res.status(404).send({ hasErrors: true, message: 'Ошибка при добавлении расширения' });
                return;
            }
            res.send({
                hasErrors: false,
                data: { extensions: type === 'video' ? [...this.videoExtensions] : [...this.photoExtensions] }
            });
        };
        this.gallerySort = async (req, res) => {
            const { sourcePath, destinationPath } = req.body;
            if (!sourcePath) {
                res.status(404).send({ hasErrors: true, message: 'Укажите путь к исходным данным' });
                return;
            }
            if (!destinationPath) {
                res.status(404).send({ hasErrors: true, message: 'Укажите путь к конечной папке' });
                return;
            }
            try {
                const files = await this.getFilesFromPath(sourcePath);
                if (files.hasErrors || !files.filesStatList || files.filesStatList.length === 0) {
                    res.status(404).send({ hasErrors: true, message: 'Файлы отсутствуют' });
                    return;
                }
                for (const file of files.filesStatList) {
                    if (!file.isDirectory && (this.photoExtensions.has(file.extension) || this.videoExtensions.has(file.extension))) {
                        const createdAtYear = (0, moment_1.default)(file.createdAt).format("YYYY");
                        const createdAtMonth = (0, moment_1.default)(file.createdAt).format("MMMM");
                        const formattedMonth = createdAtMonth[0].toUpperCase() + createdAtMonth.slice(1);
                        const yearFolderPath = (0, node_path_1.join)(destinationPath, createdAtYear);
                        const monthFolderPath = (0, node_path_1.join)(yearFolderPath, formattedMonth);
                        await this.checkOrCreateDirectory(yearFolderPath);
                        await this.checkOrCreateDirectory(monthFolderPath);
                        const newFilePath = (0, node_path_1.join)(monthFolderPath, file.fileName);
                        try {
                            await (0, promises_1.stat)(newFilePath);
                            console.log(`Файл ${file.fileName} уже существует в ${monthFolderPath}. Пропуск.`);
                        }
                        catch {
                            await (0, promises_1.rename)((0, node_path_1.join)(sourcePath, file.fileName), newFilePath);
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
            }
            catch (error) {
                console.error(error);
                res.status(500).send({ hasErrors: true, message: 'Внутренняя ошибка сервера' });
            }
        };
        (0, moment_1.default)().locale('ru');
    }
    async getFileStats(filePath, fileName) {
        try {
            const fileStat = await (0, promises_1.stat)(filePath);
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
        }
        catch (error) {
            return {
                fileName,
                extension: fileName.split('.').pop()?.toLowerCase() ?? '',
                isLocked: true,
                filetype: 'warning'
            };
        }
    }
    async checkOrCreateDirectory(path) {
        try {
            await (0, promises_1.stat)(path);
        }
        catch (error) {
            await (0, promises_1.mkdir)(path, { recursive: true });
        }
    }
}
exports.MultimediaSorter = new MultimediaSorterClient();
