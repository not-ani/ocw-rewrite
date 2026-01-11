import { type } from "arktype";

const test = type({
  name: "string",
}).configure({
  description: "name",
});
