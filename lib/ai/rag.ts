// // lib/ai/rag.ts
// import OpenAI from "openai";
// import { prisma } from "@/lib/db";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// export async function searchDocs(tenantId: string, query: string, topK = 5) {
//   const emb = await openai.embeddings.create({
//     model: "text-embedding-3-small",
//     input: query,
//   });
//   const v = emb.data[0].embedding;

//   return prisma.$queryRawUnsafe<
//     Array<{ id: string; title: string; content: string; score: number }>
//   >(
//     `
//       select id, title, content, (embedding <-> $1)::float as score
//       from "RagDoc"
//       where "tenantId" = $2 and embedding is not null
//       order by embedding <-> $1
//       limit $3
//     `,
//     `[${v.join(",")}]`,
//     tenantId,
//     topK
//   );
// }
