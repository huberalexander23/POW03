import mongoose from "mongoose";
import Comic from "../models/Comic.js";
import Autor from "../models/Autor.js";

export async function crearComic(req, res) {
  try {
    const { autor } = req.body;

    if (!mongoose.isValidObjectId(autor) || !(await Autor.exists({ _id: autor }))) {
      return res.status(400).json({ mensaje: "El autor indicado no existe" });
    }

    const comic = await Comic.create(req.body);
    res.status(201).json(comic);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
}

export async function listarComics(req, res) {
  try {
    const filtro = {};
    if (req.query.editorial) filtro.editorial = req.query.editorial;
    if (req.query.autor) filtro.autor = req.query.autor;

    const comics = await Comic.find(filtro).populate("autor", "nombre nacionalidad");
    res.json(comics);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

export async function obtenerComic(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ mensaje: "ID inválido" });
    }

    const comic = await Comic.findById(id).populate("autor", "nombre nacionalidad");
    if (!comic) {
      return res.status(404).json({ mensaje: "Cómic no encontrado" });
    }

    res.json(comic);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}
