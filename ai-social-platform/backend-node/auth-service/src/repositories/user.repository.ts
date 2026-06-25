import { UserModel, IUser } from '../models/user.model';
import mongoose from 'mongoose';

export const UserRepository = {
  async create(payload: Partial<IUser>) {
    const user = new UserModel(payload);
    return user.save();
  },

  async findByEmail(email: string) {
    return UserModel.findOne({ email }).exec();
  },

  async findById(id: string | mongoose.Types.ObjectId) {
    return UserModel.findById(id).exec();
  },

  async findByPhone(phone: string) {
    return UserModel.findOne({ phone }).exec();
  },

  async findOrCreateByGoogle(payload: { email?: string; name?: string }) {
    if (!payload.email) return null;
    let user = await UserModel.findOne({ email: payload.email }).exec();
    if (!user) {
      user = new UserModel({ email: payload.email, name: payload.name, emailVerified: true });
      await user.save();
    }
    return user;
  },

  async updateEmailVerified(userId: string, val = true) {
    return UserModel.findByIdAndUpdate(userId, { emailVerified: val }, { new: true }).exec();
  },

  async updatePassword(userId: string, passwordHash: string) {
    return UserModel.findByIdAndUpdate(userId, { passwordHash }, { new: true }).exec();
  },
};
