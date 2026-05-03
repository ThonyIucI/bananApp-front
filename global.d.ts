import { type ZodGlobalRegistry } from "zod"; // O el tipo correspondiente si lo conoces

declare global {
    var __zod_globalRegistry: any; // Usamos var para que se asigne al objeto global
}

export { }