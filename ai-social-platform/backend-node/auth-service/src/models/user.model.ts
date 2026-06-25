import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email?: string;
  passwordHash?: string;
  name?: string;
  phone?: string;
  roles: string[];
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, index: true, unique: true, sparse: true },
    passwordHash: { type: String },
    name: { type: String },
    phone: { type: String, index: true, unique: true, sparse: true },
    roles: { type: [String], default: ['user'] },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
