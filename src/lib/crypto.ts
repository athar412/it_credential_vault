import crypto from "crypto";
import bcrypt from "bcryptjs";

// In production, this should be a secure 32-byte key loaded from environment variables
const SECRET_KEY = process.env.ENCRYPTION_KEY || "12345678901234567890123456789012";

export function encryptPassword(text: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(SECRET_KEY), iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  
  return {
    encryptedPassword: encrypted,
    iv: iv.toString("hex"),
    authTag
  };
}

export function decryptPassword(encryptedText: string, ivHex: string, authTagHex: string) {
  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm", 
      Buffer.from(SECRET_KEY), 
      Buffer.from(ivHex, "hex")
    );
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
    
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}

export async function hashText(text: string) {
  return bcrypt.hash(text, 10);
}

export async function verifyHash(text: string, hash: string) {
  return bcrypt.compare(text, hash);
}
