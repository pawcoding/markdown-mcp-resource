import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod/v4";
import { indexSchema } from "../src/read-index.file";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const jsonSchema = z.toJSONSchema(indexSchema, {
  io: "input"
});
const filePath = join(__dirname, "../schema.json");

writeFileSync(filePath, JSON.stringify(jsonSchema, null, 2));
console.log(`Wrote JSON schema to ${filePath}`);
