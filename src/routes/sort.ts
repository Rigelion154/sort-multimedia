import express from "express";
import {MultimediaSorter} from "../sort-multimedia/MultimediaSorter";

export const sortRouter = express.Router()

sortRouter.post('/', MultimediaSorter.gallerySort)
sortRouter.post('/path', MultimediaSorter.getPathFiles)
sortRouter.post('/extension', MultimediaSorter.addExtension)