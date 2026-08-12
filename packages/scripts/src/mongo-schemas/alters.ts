import z from "zod";
import zodMongoSchema from "@udohjeremiah/zod-mongo-schema";
import { PAlterObject } from "plurography";

const mongoSchema = zodMongoSchema(PAlterObject);
console.log(JSON.stringify(mongoSchema, null, 2));