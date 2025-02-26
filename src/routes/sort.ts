import express from "express";
import {MultimediaSorter} from "../sort-multimedia/MultimediaSorter";

export const sortRouter = express.Router()

sortRouter.post('/src', (req, res) => MultimediaSorter.setPath(req, res, 'source'))
sortRouter.post('/target', (req, res) => MultimediaSorter.setPath(req, res, 'target'))