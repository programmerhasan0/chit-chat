import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class OtpService {
  // generate otp
  public async genOtp(): Promise<{
    otp: string;
    expire: Date;
    otpHash: string;
  }> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // hasing the otp
    const otpHash = await argon2.hash(otp);

    // setting expire time for the otp --> 5 minutes
    const now = new Date();
    const expire = new Date(now.getTime() + 5 * 60 * 1000);
    return { otp, expire, otpHash };
  }

  // validating the otp
  public async isOtpValid(hash: string, otp: string): Promise<boolean> {
    const isValid = await argon2.verify(hash, otp);

    if (isValid) return true;
    return false;
  }
}
