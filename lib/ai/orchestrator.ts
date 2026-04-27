// import OpenAI from "openai";
// import type {
//   ChatCompletionMessageParam,
//   ChatCompletionMessageToolCall,
//   ChatCompletionTool,
// } from "openai/resources/chat/completions";
// import { getTenantContext, getCustomerProfileByFrom } from "./tools";
// import { toolDefs as rawToolDefs, toolExecutor } from "./tools";
// import { searchDocs } from "./rag";

// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// // Ensure tools are mutable (not readonly) for the SDK type
// const tools: ChatCompletionTool[] = rawToolDefs.map((t) => ({ ...t }));

// type FunctionToolCall = ChatCompletionMessageToolCall & {
//   type: "function";
//   function: { name: string; arguments: string };
// };

// const SYSTEM = (ctx: {
//   tenant?: { id: string; name: string };
//   settings: any;
//   services?: { id: string; name: string; duration: number; price: number }[];
// }) => `
// You are Flowity, a warm, concise WhatsApp assistant for a hair & beauty salon.

// Rules:
// - Answer ONLY salon-related topics (services, prices, hours, policies, availability, bookings).
// - For facts, ALWAYS use tools; never invent info.
// - Tenant timezone: ${ctx.settings.timezone}. Week starts on ${ctx.settings.weekStartsOn}.
// - Understand relative dates in tenant timezone.
// - If user asks “any slot at X?”, assume their last-used service unless they say otherwise, and ask for one-tap confirmation.
// - If a requested time is busy, propose 2–3 nearest alternatives.
// - Keep messages short, friendly, natural (1–2 sentences). If out-of-scope, say you can only help with salon questions.
// `;

// export async function orchestrateReply(input: {
//   tenantId: string;
//   from: string; // "whatsapp:+385..."
//   waId?: string;
//   profileName?: string;
//   text: string;
// }) {
//   const tenantCtx = await getTenantContext(input.tenantId);
//   const customer = await getCustomerProfileByFrom(input.tenantId, input.from);

//   // Optional RAG hints
//   const ragChunks = await searchDocs(input.tenantId, input.text, 3);

//   const condensedCtx = JSON.stringify({
//     tenant: {
//       name: tenantCtx.tenant.name,
//       timezone: tenantCtx.settings.timezone,
//       address: tenantCtx.settings.address,
//     },
//     customer: customer && {
//       name: customer.name,
//       lastServiceName: customer.lastServiceName,
//       preferredStaffName: customer.preferredStaffName,
//       lastVisitAt: customer.lastVisitAt,
//     },
//     ragHints: ragChunks.map((c) => ({
//       title: c.title,
//       snippet: (c.content ?? "").slice(0, 240),
//     })),
//   });

//   // Use the SDK’s message type
//   const messages: ChatCompletionMessageParam[] = [
//     { role: "system", content: SYSTEM(tenantCtx) },
//     {
//       role: "assistant",
//       content: `Context snapshot (for reference only): ${condensedCtx}`,
//     },
//     { role: "user", content: input.text },
//   ];

//   // 1st call (let the model decide tool usage)
//   const resp = await client.chat.completions.create({
//     model: "gpt-4o-mini",
//     temperature: 0.2,
//     messages,
//     tools,
//     tool_choice: "auto",
//   });

//   let outputText: string | null = null;
//   const firstMsg = resp.choices[0].message;
//   const toolCalls = (firstMsg.tool_calls ??
//     []) as ChatCompletionMessageToolCall[];

//   if (toolCalls.length > 0) {
//     const toolResults: ChatCompletionMessageParam[] = [];
//     const safeParse = (s: string) => {
//       try {
//         return JSON.parse(s);
//       } catch {
//         return {};
//       }
//     };

//     for (const call of toolCalls) {
//       if (call.type !== "function" || !("function" in call)) continue;

//       const fnCall = call as FunctionToolCall;
//       const id = fnCall.id;
//       const name = fnCall.function.name;
//       const args = fnCall.function.arguments
//         ? safeParse(fnCall.function.arguments)
//         : {};

//       const result = await toolExecutor({
//         name,
//         args,
//         input,
//         tenantCtx,
//         customer,
//       });

//       toolResults.push({
//         role: "tool",
//         tool_call_id: id,
//         content: JSON.stringify(result),
//       });
//     }

//     const follow = await client.chat.completions.create({
//       model: "gpt-4o-mini",
//       temperature: 0.2,
//       messages: [
//         ...messages,
//         firstMsg as ChatCompletionMessageParam, // the assistant msg that called tools
//         ...toolResults,
//       ],
//     });

//     outputText = follow.choices[0].message.content ?? null;
//   } else {
//     outputText = firstMsg.content ?? null;
//   }
//   if (!outputText) {
//     outputText =
//       "Hvala! Kako mogu pomoći s rezervacijom ili informacijama o salonu?";
//   }

//   return { text: outputText };
// }
