const sharp = require('sharp');
const ISTTimezoneOffset = 5.5 * 60 * 60 * 1000;
const ISTTimezoneString = 'Asia/Kolkata';

// ... (rest of your code remains the same)

app.post('/upload/image', async (req, res) => {
    try {
        const imageBuffer = await sharp(req.body.image)
            .composite([
                {
                    input: {
                        text: {
                            text: `Date: ${new Date(Date.now() + ISTTimezoneOffset).toISOString().split('T')[0]} Time: ${new Date(Date.now() + ISTTimezoneOffset).toLocaleTimeString('en-IN', { timeZone: ISTTimezoneString })} Punch Type: ${req.body.punchType}`,
                            fontSize: 20,
                            color: 'white',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                        },
                    },
                    top: 10,
                    left: 10,
                },
            ])
            .toFormat('jpeg', {
                quality: 90,
            })
            .toBuffer();
        // ... (rest of your code remains the same)
    } catch (error) {
        console.error(error);
    }
});