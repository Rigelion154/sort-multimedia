import express from "express";
import {MultimediaSorter} from "../sort-multimedia/MultimediaSorter";

export const sortRouter = express.Router()

sortRouter.post('/path', MultimediaSorter.setPath)
sortRouter.post('/extension', MultimediaSorter.addExtension)