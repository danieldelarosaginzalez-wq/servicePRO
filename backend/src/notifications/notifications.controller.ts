import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async getMyNotifications(@Request() req, @Query() query) {
        const userId = req.user.userId;
        return this.notificationsService.findByUser(userId, query);
    }

    @Get('unread-count')
    async getUnreadCount(@Request() req) {
        const userId = req.user.userId;
        const result = await this.notificationsService.findByUser(userId, { limit: 1 });
        return { unread: result.unread };
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string, @Request() req) {
        const userId = req.user.userId;
        const notification = await this.notificationsService.markAsRead(id, userId);
        return { success: true, data: notification };
    }

    @Patch('read-all')
    async markAllAsRead(@Request() req) {
        const userId = req.user.userId;
        const result = await this.notificationsService.markAllAsRead(userId);
        return { success: true, ...result };
    }

    @Post('send-message')
    async sendDirectMessage(@Request() req, @Body() body: { recipientId: string; message: string }) {
        const senderId = req.user.userId;
        const notification = await this.notificationsService.sendDirectMessage(
            senderId,
            body.recipientId,
            body.message
        );
        return { success: true, data: notification };
    }

    @Delete('cleanup')
    async cleanupOldNotifications(@Query('days') days: string) {
        const daysOld = parseInt(days) || 30;
        const result = await this.notificationsService.deleteOld(daysOld);
        return { success: true, ...result };
    }
}
