// "use client";

// import { useTransition } from "react";
// import { useFormik } from "formik";
// import {
//   AcceptInviteSchema,
//   type AcceptInviteInput,
// } from "@/schemas/accept-invite";
// import { acceptInviteAction } from "@/actions/staff-invite-actions";
// import { routes } from "@/constants/routes";
// import { toast } from "sonner";

// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { zodToFormik } from "@/lib/validation-helper";

// export default function InviteAcceptClient({ token }: { token: string }) {
//   const [pending, start] = useTransition();

//   const formik = useFormik<AcceptInviteInput>({
//     initialValues: { name: "", password: "", confirmPassword: "" },
//     validate: (values) => zodToFormik(AcceptInviteSchema, values),
//     onSubmit: (values) => {
//       start(async () => {
//         try {
//           await acceptInviteAction({
//             token,
//             name: values.name,
//             password: values.password,
//           });
//           toast.success("Invite accepted. You can sign in now.");
//           window.location.href = routes.login;
//         } catch (err: any) {
//           toast.error(err?.message ?? "Failed to accept invite");
//         }
//       });
//     },
//   });

//   return (
//     <main className="min-h-screen grid place-items-center p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle className="text-2xl">Accept your invite</CardTitle>
//           <CardDescription>
//             Create your account to join the salon.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={formik.handleSubmit} className="space-y-4">
//             {/* Name */}
//             <div className="grid gap-2">
//               <Label htmlFor="name">Full name</Label>
//               <Input
//                 id="name"
//                 name="name"
//                 autoComplete="name"
//                 value={formik.values.name}
//                 onChange={formik.handleChange}
//                 onBlur={formik.handleBlur}
//                 disabled={pending}
//                 placeholder="Jane Doe"
//               />
//               {formik.touched.name && formik.errors.name && (
//                 <p className="text-sm text-destructive">{formik.errors.name}</p>
//               )}
//             </div>

//             {/* Password */}
//             <div className="grid gap-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="new-password"
//                 value={formik.values.password}
//                 onChange={formik.handleChange}
//                 onBlur={formik.handleBlur}
//                 disabled={pending}
//                 placeholder="••••••••"
//               />
//               {formik.touched.password && formik.errors.password && (
//                 <p className="text-sm text-destructive">
//                   {formik.errors.password}
//                 </p>
//               )}
//               <p className="text-xs text-muted-foreground">
//                 Min 8 chars, with upper, lower and a number.
//               </p>
//             </div>

//             {/* Confirm Password */}
//             <div className="grid gap-2">
//               <Label htmlFor="confirmPassword">Confirm password</Label>
//               <Input
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 type="password"
//                 autoComplete="new-password"
//                 value={formik.values.confirmPassword}
//                 onChange={formik.handleChange}
//                 onBlur={formik.handleBlur}
//                 disabled={pending}
//                 placeholder="••••••••"
//               />
//               {formik.touched.confirmPassword &&
//                 formik.errors.confirmPassword && (
//                   <p className="text-sm text-destructive">
//                     {formik.errors.confirmPassword}
//                   </p>
//                 )}
//             </div>

//             <Button type="submit" className="w-full" disabled={pending}>
//               {pending ? "Creating…" : "Create account"}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </main>
//   );
// }
