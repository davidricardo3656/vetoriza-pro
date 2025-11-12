import express from "express";
import multer from "multer";
import sharp from "sharp";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors());
const upload = multer({ dest: "/tmp" });

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 200 }, (err, stdout, stderr) => {
      if (err) return reject({ err, stderr });
      resolve({ stdout, stderr });
    });
  });
}

app.post("/api/vectorize", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Envie um arquivo no campo 'image'." });

  const inputPath = req.file.path;
  const base = `/tmp/vectorizer-${Date.now()}`;
  const pngPath = `${base}.png`;
  const pnmPath = `${base}.pnm`;
  const svgPath = `${base}.svg`;

  try {
    // Preprocess: resize to very large width for max fidelity, flatten background, sharpen
    await sharp(inputPath)
      .resize({ width: 4000, withoutEnlargement: true })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .sharpen()
      .toFile(pngPath);

    // Convert PNG to PNM via ImageMagick 'convert' (installed in container)
    // Use -colors to reduce small color noise if needed, but keep full for fidelity
    await run(`convert "${pngPath}" "${pnmPath}"`);

    // Run potrace to generate SVG with high fidelity
    // flags: -s (svg), --turdsize 0 (preserve tiny details), --opttolerance for smoother curves
    await run(`potrace "${pnmPath}" -s -o "${svgPath}" --turdsize 0 --opttolerance 0.2 --alphamax 1`);

    const svg = await fs.readFile(svgPath, "utf8");
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg);
  } catch (e) {
    console.error("Pipeline error:", e);
    res.status(500).json({ error: "Falha ao vetorizar a imagem", details: e?.stderr ?? e });
  } finally {
    // cleanup
    for (const p of [inputPath, pngPath, pnmPath, svgPath]) {
      try { await fs.unlink(p); } catch (err) { /* ignore */ }
    }
  }
});

// Serve frontend build
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Vetoriza backend listening on port ${port}`));
