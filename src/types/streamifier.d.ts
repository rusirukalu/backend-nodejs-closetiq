// src/types/streamifier.d.ts - Type declaration for streamifier
declare module 'streamifier' {
    import { Readable } from 'stream';
    
    export function createReadStream(buffer: Buffer): Readable;
    export function createWriteStream(callback?: (error: Error | null, data?: Buffer) => void): NodeJS.WritableStream;
  }
  