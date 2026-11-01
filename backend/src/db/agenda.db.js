// agenda.js
import { MongoBackend } from "@agendajs/mongo-backend";
import { Agenda } from "agenda";
import { DB_NAME } from "../constant.js";

const url = new URL(process.env.MONGODB_URI);
url.pathname = `/${DB_NAME}`;
if (process.env.MONGODB_AUTH_SOURCE) {
    url.searchParams.set("authSource", process.env.MONGODB_AUTH_SOURCE);
}

const agenda = new Agenda({
    backend: new MongoBackend({ address: url.toString() }),
});

export { agenda };