// import type { JSONSchema7 } from "json-schema";
// import { prisma } from "../db";

// export const toolDefs = [
//   {
//     type: "function",
//     function: {
//       name: "get_opening_hours",
//       description: "Get weekly opening hours and exceptions (holidays).",
//       parameters: { type: "object", properties: {} },
//     },
//   },
//   {
//     type: "function",
//     function: {
//       name: "get_prices",
//       description: "Get service prices; optionally filter by name.",
//       parameters: {
//         type: "object",
//         properties: { serviceName: { type: "string" } },
//       },
//     },
//   },
//   {
//     type: "function",
//     function: {
//       name: "get_availability",
//       description:
//         "Return available start slots for a service on a given date.",
//       parameters: {
//         type: "object",
//         properties: {
//           serviceId: { type: "string" },
//           staffId: { type: "string" },
//           dayISO: {
//             type: "string",
//             description: "YYYY-MM-DD in tenant timezone",
//           },
//         },
//         required: ["serviceId", "dayISO"],
//       },
//     },
//   },
//   {
//     type: "function",
//     function: {
//       name: "create_appointment",
//       description: "Create appointment once user confirms a slot.",
//       parameters: {
//         type: "object",
//         properties: {
//           clientName: { type: "string" },
//           phone: { type: "string" },
//           staffId: { type: "string" },
//           serviceId: { type: "string" },
//           startISO: {
//             type: "string",
//             description: "ISO datetime in tenant timezone",
//           },
//         },
//         required: ["clientName", "phone", "serviceId", "startISO"],
//       },
//     },
//   },
//   {
//     type: "function",
//     function: {
//       name: "cancel_appointment",
//       description: "Cancel a future appointment by ID after confirmation.",
//       parameters: {
//         type: "object",
//         properties: { appointmentId: { type: "string" } },
//         required: ["appointmentId"],
//       },
//     },
//   },
//   {
//     type: "function",
//     function: {
//       name: "search_docs",
//       description: "RAG search in tenant knowledge base.",
//       parameters: {
//         type: "object",
//         properties: { query: { type: "string" }, topK: { type: "number" } },
//         required: ["query"],
//       },
//     },
//   },
// ] as const;

// // ---------- Context Loaders (cache-friendly) ----------
// export async function getTenantContext(tenantId: string) {
//   // TODO: replace these with your Prisma data-access calls (and add caching)
//   // Assume you already have Tenant + TenantSettings + Services + Staff
//   return {
//     tenant: { id: tenantId, name: "Salon" },
//     settings: {
//       timezone: "Europe/Zagreb",
//       weekStartsOn: 1,
//       address: "Address ...",
//       bufferMinBetweenAppointments: 15,
//       minLeadTimeMin: 0,
//       maxAdvanceDays: 90,
//       allowOverlaps: false,
//       businessHours: [], // your stored JSON
//       autoConfirmBookings: true,
//     },
//     services: [
//       // example
//       { id: "svc_mens_cut", name: "Men's haircut", duration: 30, price: 15.0 },
//     ] as Array<{ id: string; name: string; duration: number; price: number }>,
//     staff: [
//       // example
//       // { id: "stf_ivan", name: "Ivan", startTime: "09:00", endTime: "18:00", workingDays:[1,2,3,4,5]}
//     ],
//   };
// }

// export async function getCustomerProfile(input: {
//   tenantId: string;
//   phone: string;
// }) {
//   // TODO: Prisma query by tenantId + normalized phone (client table)
//   // return preferred staff, last service, name, etc.
//   return null as null | {
//     name: string;
//     preferredStaff?: string;
//     lastService?: string;
//   };
// }

// // ---------- Availability + CRUD (stubs to fill with your DB) ----------
// async function computeAvailability({
//   tenantCtx,
//   serviceId,
//   staffId,
//   dayISO,
// }: {
//   tenantCtx: Awaited<ReturnType<typeof getTenantContext>>;
//   serviceId: string;
//   staffId?: string;
//   dayISO: string; // YYYY-MM-DD
// }) {
//   // TODO: Use TenantSettings (buffer/minLead/maxAdvance/allowOverlaps),
//   // service duration, staff working hours, and existing appointments
//   // Return ISO start times (array) for the day
//   return [
//     // "2025-11-10T10:30:00+01:00", "2025-11-10T11:00:00+01:00"
//   ];
// }

// async function createAppointmentInDB({
//   tenantId,
//   clientName,
//   phone,
//   staffId,
//   serviceId,
//   startISO,
// }: {
//   tenantId: string;
//   clientName: string;
//   phone: string;
//   staffId?: string;
//   serviceId: string;
//   startISO: string;
// }) {
//   // TODO: upsert client by phone, create appointment via Prisma
//   // Must enforce constraints (lead time, maxAdvance, buffer, overlap)
//   return {
//     id: "apt_xxx",
//     startISO,
//     staffId: staffId ?? null,
//     serviceId,
//     clientName,
//   };
// }

// async function cancelAppointmentInDB({
//   tenantId,
//   appointmentId,
// }: {
//   tenantId: string;
//   appointmentId: string;
// }) {
//   // TODO: Prisma update -> status CANCELLED
//   return { ok: true };
// }

// // ---------- Tool Executor ----------
// export async function toolExecutor({
//   name,
//   args,
//   input,
//   tenantCtx,
//   customer,
// }: {
//   name: string;
//   args: any;
//   input: {
//     tenantId: string;
//     from: string;
//     waId?: string;
//     profileName?: string;
//     text: string;
//   };
//   tenantCtx: Awaited<ReturnType<typeof getTenantContext>>;
//   customer: Awaited<ReturnType<typeof getCustomerProfile>>;
// }) {
//   switch (name) {
//     case "get_opening_hours":
//       return {
//         hours: tenantCtx.settings.businessHours,
//         timezone: tenantCtx.settings.timezone,
//       };

//     case "get_prices": {
//       const q = (args?.serviceName ?? "").toLowerCase();
//       const all = tenantCtx.services;
//       const filtered = q
//         ? all.filter((s) => s.name.toLowerCase().includes(q))
//         : all;
//       return {
//         services: filtered.map((s) => ({
//           id: s.id,
//           name: s.name,
//           price: s.price,
//           duration: s.duration,
//         })),
//       };
//     }

//     case "get_availability": {
//       const slots = await computeAvailability({
//         tenantCtx,
//         serviceId: args.serviceId,
//         staffId: args.staffId,
//         dayISO: args.dayISO,
//       });
//       return { slots };
//     }

//     case "create_appointment": {
//       const res = await createAppointmentInDB({
//         tenantId: input.tenantId,
//         clientName:
//           args.clientName ?? customer?.name ?? input.profileName ?? "Guest",
//         phone: args.phone ?? input.from,
//         staffId: args.staffId,
//         serviceId: args.serviceId,
//         startISO: args.startISO,
//       });
//       return res;
//     }

//     case "cancel_appointment": {
//       const res = await cancelAppointmentInDB({
//         tenantId: input.tenantId,
//         appointmentId: args.appointmentId,
//       });
//       return res;
//     }

//     case "search_docs": {
//       // Server-side RAG
//       // Prefer doing RAG pre-step; this lets the model pull more on demand
//       const { query, topK = 3 } = args;
//       // You can import from ../rag if you want to reuse; shown inline for simplicity:
//       return { results: [] };
//     }

//     default:
//       return { error: `Unknown tool ${name}` };
//   }
// }

// export async function getCustomerProfileByFrom(tenantId: string, from: string) {
//   const address = from.toLowerCase().trim(); // "whatsapp:+385..."
//   const idn = await prisma.clientIdentity.findUnique({
//     where: {
//       tenantId_channel_address: { tenantId, channel: "whatsapp", address },
//     },
//     include: {
//       client: { include: { lastService: true, preferredStaff: true } },
//     },
//   });
//   if (!idn?.client) return null;

//   const c = idn.client;
//   return {
//     id: c.id,
//     name: c.name,
//     phone: c.phone,
//     lastServiceName: c.lastService?.name ?? null,
//     preferredStaffName: c.preferredStaff?.name ?? null,
//     lastVisitAt: c.lastVisitAt ?? null,
//   };
// }
