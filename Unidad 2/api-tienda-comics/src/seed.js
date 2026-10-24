import "dotenv/config";
import { readFile } from "node:fs/promises";
import mongoose from "mongoose";
import Autor from "./models/Autor.js";
import Comic from "./models/Comic.js";

async function leerJSON(ruta) {
  const contenido = await readFile(new URL(ruta, import.meta.url), "utf-8");
  return JSON.parse(contenido);
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Conectado a MongoDB Atlas");

  const autoresData = await leerJSON("../data/autores.json");
  const comicsData = await leerJSON("../data/comics.json");

  await Comic.deleteMany();
  await Autor.deleteMany();

  const autores = await Autor.insertMany(autoresData);

  const idPorNombre = Object.fromEntries(autores.map((a) => [a.nombre, a._id]));

  const comics = comicsData.map(({ autorNombre, ...resto }) => ({
    ...resto,
    autor: idPorNombre[autorNombre]
  }));
  await Comic.insertMany(comics);

  console.log(`📚 Insertados ${autores.length} autores y ${comics.length} cómics`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error("Error en el seed:", error.message);
  process.exit(1);
});
