import { app } from "./app.js";
import { configDotenv } from "dotenv";
import { connectDb } from "./db/index.db.js";
import { seedAdmin } from "./controllers/admin.controller.js";
import { agenda } from "./db/agenda.db.js";

configDotenv({
  path: "./.env",
});

//connect mongodb
connectDb()
  .then(async () => {
    // Register Agenda jobs FIRST
    await import("./jobs/emailJob.js");

    // Start Agenda AFTER jobs are registered
    await agenda.start();

    console.log("[INFO] Agenda started");

    app.listen(process.env.PORT, () => {
      console.log("Server is listening at port ", process.env.PORT);
    });

    // admin seeding
    await seedAdmin();
  })
  .catch((error) => {
    console.log(error);
  });