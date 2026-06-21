"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

const resend = process.env.AUTH_RESEND_KEY
  ? new Resend(process.env.AUTH_RESEND_KEY)
  : null;

export const sendVerificationEmail = action({
  args: {
    email: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    if (!resend) {
      console.warn("AUTH_RESEND_KEY not set — skipping email send");
      console.log(`[DEV] Verification code for ${args.email}: ${args.code}`);
      return { success: true, dev: true };
    }

    await resend.emails.send({
      from: "TimoTrack <noreply@timotrack.app>",
      to: args.email,
      subject: "Verify your TimoTrack account",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h2>Verify your email</h2>
          <p>Enter this code to verify your TimoTrack account:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f4f4f5; border-radius: 8px;">
            ${args.code}
          </div>
          <p style="color: #71717a; font-size: 14px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });

    return { success: true };
  },
});
