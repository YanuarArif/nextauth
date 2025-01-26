import { Resend } from "resend";
import VerifyEmailScreen from "@/components/auth/send-verify-email";

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.NEXTAUTH_URL;

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `${domain}/verify-email?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "Verifikasi <no-reply@yourdomain.com>",
      to: email,
      subject: "Verifikasi Email Anda",
      react: VerifyEmailScreen({ verificationLink }),
    });

    if (error) {
      console.error("Gagal mengirim email:", error);
      throw new Error("Gagal mengirim email verifikasi");
    }

    return data;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};
