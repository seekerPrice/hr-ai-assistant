declare module "pdf-parse" {
  import { Buffer } from "buffer";

  export interface PdfParseResult {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown> | null;
    text: string;
    version: string;
  }

  export default function pdfParse(data: Buffer | Uint8Array | ArrayBuffer): Promise<PdfParseResult>;
}
