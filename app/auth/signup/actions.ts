'use server';

import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Store from '@/models/Store';

export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const phone = formData.get('phone') as string;
  const role = formData.get('role') as string;

  if (!email || !password || !role) {
    return { error: 'All fields are required.' };
  }

  await dbConnect();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return { error: 'Email already registered.' };

  const hash = await bcrypt.hash(password, 12);

  const user = await User.create({
    email: email.toLowerCase(),
    phone: phone || undefined,
    passwordHash: hash,
    role,
    isVerified: role !== 'business',
  });

  if (role === 'business') {
    await Store.create({
      userId: user._id.toString(),
      verificationStatus: 'pending',
    });
  }

  return { success: true };
}
