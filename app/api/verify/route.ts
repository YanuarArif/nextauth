import { Resend } from "resend";
import crypto from "crypto";
import { prisma } from "@/lib/database";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

const domain = process.env.NEXT_PUBLIC_DOMAIN;

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmationLink = `${domain}/verify-email?token=${token}`;

  await resend.emails.send({
    from: "Braling Print Studio <onboarding@resend.dev>",
    to: email,
    subject: "Verifikasi Email",
    html: `<p>Klik <a href="${confirmationLink}">disini</a> untuk verifikasi email Anda.</p>`,
  });
};

// export async function POST(req: Request) {
//   const { email } = await req.json();

//   // Generate verifikasi kode
//   const token = crypto.randomBytes(32).toString("hex");

//   // Simpan token ke database (expires in 24 jam)
//   await prisma.user.update({
//     where: { email },
//     data: { token, emailVerified: null },
//   });

//   // Kirim email verifikasi
//   await resend.emails.send({
//     from: "Braling Print Studio <noreply@bralingprintstudio.com>",
//     to: email,
//     subject: "Verifikasi Email",
//     html: `<p>Klik <a href="http://localhost:3000/verify-email?token=${token}">disini</a> untuk verifikasi email Anda.</p>`,
//   });

//   return NextResponse.json({
//     success: "Email verifikasi telah dikirim. Silakan cek email Anda.",
//   });
// }
