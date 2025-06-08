import "reflect-metadata";
import express, { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import reportRoutes from "./routes/report.routes";

const app = express();
app.use(express.json());

app.use("/api", reportRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("API rodando!");
});

AppDataSource.initialize()
  .then(() => {
    console.log("Banco conectado com sucesso!");
    app.listen(3000, () => {
      console.log("Servidor rodando na porta 3000");
    });
  })
  .catch((error) => console.error("Erro ao conectar no banco:", error));
