import prisma from '@/lib/prisma';
import { Alert } from '@prisma/client';

export class AlertService {
  /**
   * Create a new alert
   */
  async createAlert(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    priority?: string;
  }): Promise<Alert> {
    return await prisma.alert.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority || 'medium',
      },
    });
  }

  /**
   * Get all alerts for a user
   */
  async getAlerts(userId: string, limit = 10): Promise<Alert[]> {
    return await prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get unread alerts count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await prisma.alert.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Mark an alert as read
   */
  async markAsRead(alertId: string): Promise<Alert> {
    return await prisma.alert.update({
      where: { id: alertId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all alerts as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await prisma.alert.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
  
  /**
   * Delete an alert
   */
  async deleteAlert(alertId: string): Promise<void> {
    await prisma.alert.delete({
      where: { id: alertId },
    });
  }
}
