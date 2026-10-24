#!/usr/bin/env bash
# Crea el proyecto api-tienda-comics en la carpeta actual del Codespace
set -e
mkdir -p api-tienda-comics && cd api-tienda-comics
mkdir -p data src/config src/models src/controllers src/routes
cat > package.json <<'FIN_ARCHIVO_COMICS'
{
  "name": "api-tienda-comics",
  "version": "1.0.0",
  "description": "API REST de una tienda de cómics (Node.js + Express + MongoDB Atlas)",
  "main": "src/app.js",
  "type": "module",
  "scripts": {
    "start": "node src/app.js",
    "dev": "node --watch src/app.js",
    "seed": "node src/seed.js"
  },
  "license": "ISC",
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "mongoose": "^8.7.0"
  }
}
FIN_ARCHIVO_COMICS
cat > .gitignore <<'FIN_ARCHIVO_COMICS'
node_modules
.env
FIN_ARCHIVO_COMICS
cat > .env.example <<'FIN_ARCHIVO_COMICS'
PORT=3000
MONGODB_URI=mongodb+srv://USUARIO:CONTRASEÑA@cluster0.xxxxx.mongodb.net/tienda_comics
FIN_ARCHIVO_COMICS
cat > src/config/db.js <<'FIN_ARCHIVO_COMICS'
import mongoose from "mongoose";

export async function conectarDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conectado a MongoDB Atlas");
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error.message);
    process.exit(1); // Termina la app si no hay base de datos
  }
}
FIN_ARCHIVO_COMICS
cat > src/models/Autor.js <<'FIN_ARCHIVO_COMICS'
import mongoose from "mongoose";

const autorSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, "El nombre es obligatorio"], trim: true },
    nacionalidad: { type: String, trim: true },
    fechaNacimiento: { type: Date }
  },
  { timestamps: true } // agrega createdAt y updatedAt automáticamente
);

export default mongoose.model("Autor", autorSchema, "autores");
FIN_ARCHIVO_COMICS
cat > src/models/Comic.js <<'FIN_ARCHIVO_COMICS'
import mongoose from "mongoose";

const comicSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: [true, "El título es obligatorio"], trim: true, unique: true },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Autor", // referencia a la colección de autores
      required: [true, "El autor es obligatorio"]
    },
    editorial: { type: String, trim: true },
    anioPublicacion: { type: Number, min: 1900 },
    precio: { type: Number, required: [true, "El precio es obligatorio"], min: 0 },
    stock: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Comic", comicSchema, "comics");
FIN_ARCHIVO_COMICS
cat > src/controllers/autores.controller.js <<'FIN_ARCHIVO_COMICS'
import mongoose from "mongoose";
import Autor from "../models/Autor.js";

// POST /api/autores  → crear un autor
export async function crearAutor(req, res) {
  try {
    const autor = await Autor.create(req.body);
    res.status(201).json(autor);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
}

// GET /api/autores  → listar todos los autores
export async function listarAutores(req, res) {
  try {
    const autores = await Autor.find().sort({ nombre: 1 });
    res.json(autores);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

// GET /api/autores/:id  → consultar un autor por su id
export async function obtenerAutor(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ mensaje: "ID inválido" });
    }

    const autor = await Autor.findById(id);
    if (!autor) {
      return res.status(404).json({ mensaje: "Autor no encontrado" });
    }

    res.json(autor);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}
FIN_ARCHIVO_COMICS
cat > src/controllers/comics.controller.js <<'FIN_ARCHIVO_COMICS'
import mongoose from "mongoose";
import Comic from "../models/Comic.js";
import Autor from "../models/Autor.js";

// POST /api/comics  → crear un cómic
export async function crearComic(req, res) {
  try {
    const { autor } = req.body;

    // Validamos que el autor referenciado exista
    if (!mongoose.isValidObjectId(autor) || !(await Autor.exists({ _id: autor }))) {
      return res.status(400).json({ mensaje: "El autor indicado no existe" });
    }

    const comic = await Comic.create(req.body);
    res.status(201).json(comic);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
}

// GET /api/comics  → listar cómics (con filtros opcionales)
// Ejemplos: /api/comics?editorial=DC Comics   |   /api/comics?autor=<idAutor>
export async function listarComics(req, res) {
  try {
    const filtro = {};
    if (req.query.editorial) filtro.editorial = req.query.editorial;
    if (req.query.autor) filtro.autor = req.query.autor;

    // populate() reemplaza el id del autor por el documento completo
    const comics = await Comic.find(filtro).populate("autor", "nombre nacionalidad");
    res.json(comics);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

// GET /api/comics/:id  → consultar un cómic por su id
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
FIN_ARCHIVO_COMICS
cat > src/routes/autores.routes.js <<'FIN_ARCHIVO_COMICS'
import { Router } from "express";
import { crearAutor, listarAutores, obtenerAutor } from "../controllers/autores.controller.js";

const router = Router();

router.post("/", crearAutor);
router.get("/", listarAutores);
router.get("/:id", obtenerAutor);

export default router;
FIN_ARCHIVO_COMICS
cat > src/routes/comics.routes.js <<'FIN_ARCHIVO_COMICS'
import { Router } from "express";
import { crearComic, listarComics, obtenerComic } from "../controllers/comics.controller.js";

const router = Router();

router.post("/", crearComic);
router.get("/", listarComics);
router.get("/:id", obtenerComic);

export default router;
FIN_ARCHIVO_COMICS
cat > src/app.js <<'FIN_ARCHIVO_COMICS'
import "dotenv/config";
import express from "express";
import { conectarDB } from "./config/db.js";
import autoresRoutes from "./routes/autores.routes.js";
import comicsRoutes from "./routes/comics.routes.js";

const app = express();

// Middleware: permite leer el cuerpo de las peticiones en formato JSON
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "API de la Tienda de Cómics funcionando" });
});

// Rutas de la API
app.use("/api/autores", autoresRoutes);
app.use("/api/comics", comicsRoutes);

// Middleware para rutas inexistentes
app.use((req, res) => {
  res.status(404).json({ mensaje: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 3000;

// Primero conectamos a la base de datos y luego levantamos el servidor
conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
});
FIN_ARCHIVO_COMICS
cat > src/seed.js <<'FIN_ARCHIVO_COMICS'
import "dotenv/config";
import { readFile } from "node:fs/promises";
import mongoose from "mongoose";
import Autor from "./models/Autor.js";
import Comic from "./models/Comic.js";

// Lee un archivo JSON relativo a este archivo
async function leerJSON(ruta) {
  const contenido = await readFile(new URL(ruta, import.meta.url), "utf-8");
  return JSON.parse(contenido);
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Conectado a MongoDB Atlas");

  const autoresData = await leerJSON("../data/autores.json");
  const comicsData = await leerJSON("../data/comics.json");

  // Borra lo que haya, para poder ejecutar el seed varias veces
  await Comic.deleteMany();
  await Autor.deleteMany();

  // 1. Insertar autores
  const autores = await Autor.insertMany(autoresData);

  // 2. Diccionario nombre → _id
  const idPorNombre = Object.fromEntries(autores.map((a) => [a.nombre, a._id]));

  // 3. Reemplazar autorNombre por la referencia real
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
FIN_ARCHIVO_COMICS
cat > data/autores.json <<'FIN_ARCHIVO_COMICS'
[
  {
    "nombre": "Alan Moore",
    "nacionalidad": "Británica",
    "fechaNacimiento": "1953-11-18"
  },
  {
    "nombre": "Frank Miller",
    "nacionalidad": "Estadounidense",
    "fechaNacimiento": "1957-01-27"
  },
  {
    "nombre": "Neil Gaiman",
    "nacionalidad": "Británica",
    "fechaNacimiento": "1960-11-10"
  },
  {
    "nombre": "Art Spiegelman",
    "nacionalidad": "Estadounidense",
    "fechaNacimiento": "1948-02-15"
  },
  {
    "nombre": "Brian K. Vaughan",
    "nacionalidad": "Estadounidense",
    "fechaNacimiento": "1976-07-17"
  }
]
FIN_ARCHIVO_COMICS
cat > data/comics.json <<'FIN_ARCHIVO_COMICS'
[
  {
    "titulo": "Watchmen",
    "autorNombre": "Alan Moore",
    "editorial": "DC Comics",
    "anioPublicacion": 1986,
    "precio": 65000,
    "stock": 10
  },
  {
    "titulo": "V for Vendetta",
    "autorNombre": "Alan Moore",
    "editorial": "DC Comics",
    "anioPublicacion": 1982,
    "precio": 55000,
    "stock": 7
  },
  {
    "titulo": "From Hell",
    "autorNombre": "Alan Moore",
    "editorial": "Eddie Campbell Comics",
    "anioPublicacion": 1989,
    "precio": 70000,
    "stock": 3
  },
  {
    "titulo": "Batman: The Dark Knight Returns",
    "autorNombre": "Frank Miller",
    "editorial": "DC Comics",
    "anioPublicacion": 1986,
    "precio": 52000,
    "stock": 8
  },
  {
    "titulo": "Batman: Year One",
    "autorNombre": "Frank Miller",
    "editorial": "DC Comics",
    "anioPublicacion": 1987,
    "precio": 48000,
    "stock": 6
  },
  {
    "titulo": "Sin City: The Hard Goodbye",
    "autorNombre": "Frank Miller",
    "editorial": "Dark Horse Comics",
    "anioPublicacion": 1991,
    "precio": 58000,
    "stock": 4
  },
  {
    "titulo": "The Sandman: Preludes & Nocturnes",
    "autorNombre": "Neil Gaiman",
    "editorial": "DC Comics",
    "anioPublicacion": 1989,
    "precio": 60000,
    "stock": 9
  },
  {
    "titulo": "Maus",
    "autorNombre": "Art Spiegelman",
    "editorial": "Pantheon Books",
    "anioPublicacion": 1986,
    "precio": 72000,
    "stock": 5
  },
  {
    "titulo": "Saga, Vol. 1",
    "autorNombre": "Brian K. Vaughan",
    "editorial": "Image Comics",
    "anioPublicacion": 2012,
    "precio": 50000,
    "stock": 12
  },
  {
    "titulo": "Y: The Last Man, Vol. 1",
    "autorNombre": "Brian K. Vaughan",
    "editorial": "DC Comics",
    "anioPublicacion": 2002,
    "precio": 54000,
    "stock": 2
  }
]
FIN_ARCHIVO_COMICS
echo "Instalando dependencias..."
npm install
echo ""
echo "Listo. Siguientes pasos:"
echo "  1) cp .env.example .env   y pega tu MONGODB_URI en .env"
echo "  2) npm run seed"
echo "  3) npm run dev"
