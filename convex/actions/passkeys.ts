"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/types";
import { internal } from "../_generated/api";

const rpName = "TimoTrack";
const rpID = process.env.PASSKEY_RP_ID ?? "localhost";
const origin = process.env.PASSKEY_ORIGIN ?? "http://localhost:3000";

export const generateRegistrationOptionsAction = action({
  handler: async (ctx): Promise<{
    options: object;
    challengeId: string;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existingCredentials = await ctx.runQuery(
      internal.queries.passkeys.getByUserId,
      { userId: identity.tokenIdentifier }
    );

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: identity.tokenIdentifier,
      userName: identity.email ?? "user",
      userDisplayName: identity.name ?? identity.email ?? "user",
      attestationType: "none",
      excludeCredentials: existingCredentials.map((cred: { credentialId: string }) => ({
        id: new TextEncoder().encode(cred.credentialId),
        type: "public-key" as const,
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    const challengeId = await ctx.runMutation(
      internal.mutations.passkeys.storeChallenge,
      {
        userId: identity.tokenIdentifier,
        challenge: options.challenge,
        type: "registration",
      }
    );

    return { options, challengeId };
  },
});

export const verifyRegistrationAction = action({
  args: {
    response: v.any(),
    challengeId: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const challengeDoc = await ctx.runQuery(
      internal.queries.passkeys.getChallenge,
      { challengeId: args.challengeId }
    ) as { userId: string; challenge: string } | null;

    if (!challengeDoc || challengeDoc.userId !== identity.tokenIdentifier) {
      throw new Error("Invalid challenge");
    }

    const verification = await verifyRegistrationResponse({
      response: args.response as RegistrationResponseJSON,
      expectedChallenge: challengeDoc.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new Error("Registration verification failed");
    }

    const { credentialID, credentialPublicKey } = verification.registrationInfo;

    await ctx.runMutation(internal.mutations.passkeys.storeCredential, {
      userId: identity.tokenIdentifier,
      credentialId: Buffer.from(credentialID).toString("base64url"),
      publicKey: credentialPublicKey.buffer as ArrayBuffer,
      counter: BigInt(verification.registrationInfo.counter),
    });

    await ctx.runMutation(internal.mutations.passkeys.deleteChallenge, {
      challengeId: args.challengeId,
    });

    const appUser = await ctx.runQuery(internal.queries.passkeys.getAppUser, {
      authId: identity.tokenIdentifier,
    });

    if (appUser) {
      await ctx.runMutation(internal.mutations.passkeys.updateUser2FA, {
        userId: appUser._id,
        has2FA: true,
      });
    }

    return { success: true };
  },
});

export const generateAuthenticationOptionsAction = action({
  handler: async (ctx): Promise<{
    options: object;
    challengeId: string;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const credentials = await ctx.runQuery(
      internal.queries.passkeys.getByUserId,
      { userId: identity.tokenIdentifier }
    );

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: credentials.map((cred: { credentialId: string }) => ({
        id: new TextEncoder().encode(cred.credentialId),
        type: "public-key" as const,
      })),
      userVerification: "preferred",
    });

    const challengeId = await ctx.runMutation(
      internal.mutations.passkeys.storeChallenge,
      {
        userId: identity.tokenIdentifier,
        challenge: options.challenge,
        type: "authentication",
      }
    );

    return { options, challengeId };
  },
});

export const verifyAuthenticationAction = action({
  args: {
    response: v.any(),
    challengeId: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const challengeDoc = await ctx.runQuery(
      internal.queries.passkeys.getChallenge,
      { challengeId: args.challengeId }
    ) as { userId: string; challenge: string } | null;

    if (!challengeDoc || challengeDoc.userId !== identity.tokenIdentifier) {
      throw new Error("Invalid challenge");
    }

    const credential = await ctx.runQuery(
      internal.queries.passkeys.getByCredentialId,
      {
        credentialId: (args.response as AuthenticationResponseJSON).id,
      }
    );

    if (!credential) {
      throw new Error("Credential not found");
    }

    const verification = await verifyAuthenticationResponse({
      response: args.response as AuthenticationResponseJSON,
      expectedChallenge: challengeDoc.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: new TextEncoder().encode(credential.credentialId),
        credentialPublicKey: new Uint8Array(credential.publicKey),
        counter: Number(credential.counter),
      },
    });

    if (!verification.verified) {
      throw new Error("Authentication verification failed");
    }

    await ctx.runMutation(internal.mutations.passkeys.updateCounter, {
      credentialId: credential.credentialId,
      counter: BigInt(verification.authenticationInfo.newCounter),
    });

    await ctx.runMutation(internal.mutations.passkeys.deleteChallenge, {
      challengeId: args.challengeId,
    });

    return { success: true };
  },
});
