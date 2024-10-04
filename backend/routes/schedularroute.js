const express = require('express');
const { scheduleReminder } = require('../controllers/Schedular');
const router = express.Router();

router.post('/', async (req, res) => {
    const { message, email, user, reminderTime } = req.body;

    if (!message || !email || !user || !reminderTime) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const jobId = await scheduleReminder({ message, email, user, reminderTime });
        res.status(200).json({ message: 'Reminder scheduled successfully', jobId });
    } catch (err) {
        res.status(500).json({ error: `Error scheduling reminder: ${err.message}` });
    }
});

module.exports = router;
