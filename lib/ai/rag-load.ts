// import OpenAI from "openai";
// import crypto from "node:crypto";
// import { prisma } from "@/lib/db";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// export async function upsertRagDoc(opts: {
//   tenantId: string;
//   title: string;
//   content: string;
//   metadata?: any;
// }) {
//   const id = crypto.randomUUID();

//   const doc = await prisma.ragDoc.create({
//     data: {
//       id,
//       tenantId: opts.tenantId,
//       title: opts.title,
//       content: opts.content,
//       metadata: opts.metadata,
//     },
//   });

//   const emb = await openai.embeddings.create({
//     model: "text-embedding-3-small",
//     input: opts.content,
//   });
//   const vector = emb.data[0].embedding;

//   await prisma.$executeRawUnsafe(
//     `update "RagDoc" set embedding = $1 where id = $2`,
//     `[${vector.join(",")}]`,
//     doc.id
//   );

//   return doc.id;
// }
