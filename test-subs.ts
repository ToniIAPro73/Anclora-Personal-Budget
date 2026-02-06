import { SubscriptionService } from './src/server/services/subscription-service';
const service = new SubscriptionService();
async function main() {
  try {
    const userId = 'cml8zvemo0000n800h38pab55';
    console.log('Fetching subscriptions for:', userId);
    const subs = await service.getSubscriptions(userId);
    console.log('Subscriptions found:', subs.length);
    console.log('Data:', JSON.stringify(subs, null, 2));
  } catch (error) {
    console.error('Error in service:', error);
  }
}
main();
