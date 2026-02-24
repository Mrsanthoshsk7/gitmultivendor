const { sendMail } = require('../config/email');
require('dotenv').config();

exports.sendEmail = async (req, res) => {
    const { to, subject, text } = req.body;
    try {
        if (!to || !subject || !text) {
            return res.status(400).json({ message: "To, subject, and text are required" });
        }
        await sendMail(to, subject, text);
        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error sending email", error: error.message });
    }
};