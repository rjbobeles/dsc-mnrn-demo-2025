import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyKeys, FilterQuery, Model, ProjectionType, SortOrder, Types } from 'mongoose';
import { FriendSchema } from '../../schema';

@Injectable()
export class FriendService {
  constructor(@InjectModel(FriendSchema.SCHEMA_NAME) private friendModel: Model<FriendSchema.FriendDocument>) {}

  public async create_friend(
    first_name: string,
    last_name: string,
    email: string,
    hobbies: string[]
  ): Promise<FriendSchema.Friend> {
    return this.friendModel.create({
     first_name,
     last_name,
     email,hobbies,
      created_at: new Date(),
      updated_at: new Date(),
    })
  }

  public async delete_friend(query: FilterQuery<FriendSchema.FriendDocument>): Promise<number> {
    const deleteAck = await this.friendModel.deleteMany(query)
    return deleteAck.deletedCount
  }

  public async get_friend(
    friend_id: Types.ObjectId,
    query?: FilterQuery<FriendSchema.FriendDocument>,
    projection?: ProjectionType<FriendSchema.FriendDocument>,
  ): Promise<FriendSchema.Friend | null> {
    return this.friendModel
      .findOne(
        query
          ? {
              ...query,
              _id: friend_id,
            }
          : {
              _id: friend_id,
            },
        projection,
      )
      .lean()
      .exec()
  }

  public async list_friends(
    query: FilterQuery<FriendSchema.FriendDocument>,
    projection?: ProjectionType<FriendSchema.FriendDocument>,
    pagination?: { skip: number; limit: number } | null,
    sort_by?: [string, SortOrder][],
  ): Promise<{ count: number; data: FriendSchema.FriendDocument[] }> {
    return {
      count: await this.friendModel.countDocuments(query),
      data: await this.friendModel
        .find(query, projection, {
          skip: pagination?.skip || undefined,
          limit: pagination?.limit || undefined,
        })
        .sort(sort_by),
    }
  }

  public async update_enterprise(
    friend_id: Types.ObjectId,
    data?: { first_name: string,
      last_name: string,
      email: string,
      hobbies: string[]},
  ): Promise<boolean> {
    if (!data) return false

    const enterprise = await this.get_friend(friend_id)
    if (!enterprise) return false

    const updatePayload: AnyKeys<FriendSchema.Friend> = {}

    if (data.last_name) updatePayload.last_name = data.last_name
    if (data.first_name) updatePayload.first_name = data.first_name
    if (data.email) updatePayload.email = data.email
    if (data.hobbies) updatePayload.hobbies = data.hobbies

    if (Object.keys(updatePayload).length > 0) updatePayload.updated_at = new Date()

    const updateAck = await this.friendModel.updateOne({ _id: enterprise._id }, { $set: updatePayload })
    return updateAck.modifiedCount === 1
  }
}
