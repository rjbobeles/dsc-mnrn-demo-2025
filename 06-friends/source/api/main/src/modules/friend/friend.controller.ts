import { ErrorCodes } from '@dsc-demo/utils/ErrorCodes';
import { HttpException } from '@dsc-demo/utils/exception';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Types } from 'mongoose';

import { DeviceIdGuard, JwtAccessTokenGuard } from '../../guards';
import { Gpt4AllService } from '../gpt4all/gpt4all.service';
import { DeleteFriendParam } from './dto/delete_friend-param';
import { DeleteFriendResponse } from './dto/delete_friend-response';
import { GetListFriendsQuery } from './dto/get_list_friends-query';
import { GetListFriendsResponse } from './dto/get_list_friends-response';
import { GetReadFriendParam } from './dto/get_read_friend-param';
import { GetReadFriendResponse } from './dto/get_read_friend-response';
import { PostChatAboutFriendBody } from './dto/post_chat_about_friend-body';
import { PostChatAboutFriendParam } from './dto/post_chat_about_friend-param';
import { PostChatAboutFriendResponse } from './dto/post_chat_about_friend-response';
import { PostCreateFriendBody } from './dto/post_create_friend-body';
import { PostCreateFriendResponse } from './dto/post_create_friend-response';
import { FriendService } from './friend.service';

@ApiTags('Friend')
@ApiHeader({
  name: 'device_id',
  description: 'The device id assigned to your device',
  schema: {
    example: '860da268-f82e-4df9-9059-64a23758431e',
  },
  required: true,
})
@UseGuards(DeviceIdGuard)
@ApiBearerAuth('ACCESS_TOKEN')
@UseGuards(JwtAccessTokenGuard)
@Controller('friend')
export class FriendController {
  constructor(@Inject() private readonly enterpriseService: FriendService, @Inject() private readonly gpt4AllService: Gpt4AllService){}

  @ApiOperation({ summary: 'Delete a friend' })
  @ApiResponse({ status: 200, description: 'Successfully deleted a friend', type: DeleteFriendResponse })
  @HttpCode(HttpStatus.OK)
  @Delete('/:friend_id')
  public async delete_friend(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Param() param: DeleteFriendParam,
  ): Promise<DeleteFriendResponse> {
    const deleteAck = await this.enterpriseService.delete_friend({ _id: new Types.ObjectId(param.friend_id) })
    if(deleteAck == 0) throw new HttpException(ErrorCodes.FRIEND_DELETION_FAILED, 'Unable to delete friend record', HttpStatus.BAD_REQUEST)

    return res.send({
      status_code: res.statusCode,
      message: 'Successfully deleted friend!',
    })
  }

  @ApiOperation({ summary: 'Find a friend' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved a friend', type: GetReadFriendResponse })
  @HttpCode(HttpStatus.OK)
  @Get('/:friend_id')
  public async get_read_friend(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Param() param: GetReadFriendParam,
  ): Promise<GetReadFriendResponse> {
    const friend = await this.enterpriseService.get_friend(new Types.ObjectId(param.friend_id))
    if(!friend) throw new HttpException(ErrorCodes.FRIEND_NOT_FOUND, 'Friend not found!', HttpStatus.NOT_FOUND)

    return res.send({
      status_code: res.statusCode,
      message: 'Successfully retrieved a friend!',
      data: friend
    })
  }

  @ApiOperation({ summary: 'Create a friend' })
  @ApiResponse({ status: 200, description: 'Successfully created a friend', type: PostCreateFriendResponse })
  @HttpCode(HttpStatus.OK)
  @Post('/')
  public async post_create_friend(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Body() body: PostCreateFriendBody,
  ): Promise<GetReadFriendResponse> {
    return res.send({
      status_code: res.statusCode,
      message: 'Successfully created friend!',
      data:  await this.enterpriseService.create_friend(body.first_name, body.last_name, body.email, body.hobbies)
    })
  }

  @ApiOperation({ summary: 'Use AI to chat about a friend' })
  @ApiResponse({ status: 200, description: 'Successfully generated AI text about a friend', type: PostChatAboutFriendResponse })
  @HttpCode(HttpStatus.OK)
  @Post('/:friend_id')
  public async post_chat_about_friend(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Param() param: PostChatAboutFriendParam,
    @Body() body: PostChatAboutFriendBody,
  ): Promise<PostChatAboutFriendResponse> {
    const friend = await this.enterpriseService.get_friend(new Types.ObjectId(param.friend_id))
    if(!friend) throw new HttpException(ErrorCodes.FRIEND_NOT_FOUND, 'Friend not found!', HttpStatus.NOT_FOUND)

    const gptResponse = await this.gpt4AllService.create_completion([
      {
        role: 'system',
        content: `User has a friend with the following details: \n
                  First Name: ${friend.first_name} \n
                  Last Name: ${friend.last_name} \n
                  Email: ${friend.email} \n
                  Hobbies: ${friend.hobbies.join(', ')} \n
                 `
      },
      {
        role: 'user',
        content: body.question
      }
    ])

    return res.send({
      status_code: res.statusCode,
      message: 'Successfully generated chat about friends!',
      data: gptResponse.choices[0].message.content
    })
  }

  @ApiOperation({ summary: 'List friends' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved friends', type: GetListFriendsResponse })
  @HttpCode(HttpStatus.OK)
  @Get('/')
  public async get_list_friends(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @Query() query: GetListFriendsQuery,
  ): Promise<GetListFriendsResponse> {
    const friends = await this.enterpriseService.list_friends(undefined, undefined, { skip: query.skip || 0, limit: query.limit || 10 }, undefined)

    return res.send({
      status_code: res.statusCode,
      message: 'Successfully retrieved friend!',
      data: {
        count: friends.count,
        friends: friends.data
      }
    })
  }
}
