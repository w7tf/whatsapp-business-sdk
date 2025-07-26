import path from "path";
import { config } from "dotenv";
config({ path: path.resolve(__dirname, "..", ".env"), override: true });

//Import all mocks
import "./mocks";
