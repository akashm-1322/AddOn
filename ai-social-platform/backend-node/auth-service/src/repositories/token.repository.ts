import { RefreshTokenModel } from '../models/token.model';
import mongoose from 'mongoose';

export const TokenRepository = {
  async create(tokenDoc: any) {
    const doc = new RefreshTokenModel(tokenDoc);
    return doc.save();
  },

  async findByHash(hash: string) {
    return RefreshTokenModel.findOne({ tokenHash: hash }).exec();
  },

  async revoke(tokenId: string) {
    return RefreshTokenModel.findByIdAndUpdate(tokenId, { revoked: true }, { new: true }).exec();
  },

  async listForUser(userId: string) {
    return RefreshTokenModel.find({ userId, revoked: false }).sort({ createdAt: -1 }).exec();
  },

  async revokeAllForUser(userId: string) {
    return RefreshTokenModel.updateMany({ userId }, { revoked: true }).exec();
  },
};
