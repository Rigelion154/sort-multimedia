"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortRouter = void 0;
const express_1 = __importDefault(require("express"));
const MultimediaSorter_1 = require("../sort-multimedia/MultimediaSorter");
exports.sortRouter = express_1.default.Router();
exports.sortRouter.post('/', MultimediaSorter_1.MultimediaSorter.gallerySort);
exports.sortRouter.post('/path', MultimediaSorter_1.MultimediaSorter.getPathFiles);
exports.sortRouter.post('/extension', MultimediaSorter_1.MultimediaSorter.addExtension);
