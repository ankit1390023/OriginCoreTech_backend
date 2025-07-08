

const otpStore = {}; 
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

exports.sendOtp = (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 2 * 60 * 1000; 

    otpStore[phoneNumber] = { otp, expiresAt };

    console.log(`Generated OTP for ${phoneNumber}: ${otp}`);

    res.status(200).json({
        message: 'OTP sent successfully',
        otp 
    });
};

exports.verifyOtp = (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
        return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    const stored = otpStore[phoneNumber];

    if (!stored) {
        return res.status(400).json({ message: 'OTP not found or expired. Please request again.' });
    }

    if (Date.now() > stored.expiresAt) {
        delete otpStore[phoneNumber];
        return res.status(400).json({ message: 'OTP expired. Please request again.' });
    }

    if (stored.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
    }

    delete otpStore[phoneNumber]; 
    res.status(200).json({ message: 'OTP verified successfully. You are logged in.' });
};
