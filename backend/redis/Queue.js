const Bull = require('bull');
const redisConfig = require('./redis.config');

const notificationQueue = new Bull('notificationQueue', {
  redis: redisConfig
});

notificationQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});

notificationQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

module.exports = { notificationQueue };
