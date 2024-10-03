// scheduler.js

const { notificationQueue } = require('../redis/Queue');

// Function to schedule a new reminder
const scheduleReminder = async (reminderData) => {
  try {
    const { message, email, user, reminderTime } = reminderData;
    const delay = new Date(reminderTime).getTime() - Date.now();

    if (delay < 0) {
      throw new Error('Reminder time must be in the future');
    }

    const job = await notificationQueue.add(
      {
        message,
        email,
        user
      },
      {
        delay,
        removeOnComplete: true
      }
    );

    console.log(`Reminder scheduled: Job ID ${job.id}`);
    return job.id;
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    throw error;
  }
};

module.exports = { scheduleReminder };
