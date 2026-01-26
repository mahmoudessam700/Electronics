const { IncomingForm } = require('formidable');
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

// Helper to disable bodyParser for this function
// Vercel handles this automatically if bodyParser: false is set in vercel.json or exported config
// For plain Node functions on Vercel, it's safer to provide a handler that doesn't expect bodyParser to be off, 
// OR explicitly disable it in vercel.json if possible.

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const form = new IncomingForm({
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    try {
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.error('Formidable Error:', err);
                    return reject(err);
                }
                resolve([fields, files]);
            });
        });

        const file = files.file?.[0] || files.image?.[0];
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded. Use "file" or "image" field.' });
        }

        const client = new ftp.Client();
        // client.ftp.verbose = true;

        try {
            await client.access({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                password: process.env.FTP_PASSWORD,
                secure: false // Freehostia often requires non-secure or explicit TLS handled by server
            });

            // Ensure directory exists (optional, depends on FTP setup)
            // await client.ensureDir(process.env.FTP_UPLOAD_DIR);

            const timestamp = Date.now();
            const originalName = path.basename(file.originalFilename || 'upload.png');
            const safeName = originalName.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
            const fileName = `${timestamp}_${safeName}`;

            // Construct remote path correctly
            const uploadDir = (process.env.FTP_UPLOAD_DIR || '').replace(/\/$/, '');
            const remotePath = `${uploadDir}/${fileName}`;

            await client.uploadFrom(file.filepath, fileName); // Upload to current dir first if root, or use remotePath
            // If the user wants specific directory:
            await client.cd(uploadDir);
            await client.uploadFrom(file.filepath, fileName);

            const baseUrl = (process.env.FTP_BASE_URL || '').replace(/\/$/, '');
            const publicUrl = `${baseUrl}/${fileName}`;

            return res.status(200).json({
                success: true,
                files: [{
                    url: publicUrl,
                    name: fileName,
                    originalName: file.originalFilename,
                    size: file.size
                }]
            });
        } catch (ftpError) {
            console.error('FTP Error:', ftpError);
            return res.status(500).json({ error: 'FTP storage failed: ' + ftpError.message });
        } finally {
            client.close();
            // Clean up temp file
            if (fs.existsSync(file.filepath)) {
                fs.unlinkSync(file.filepath);
            }
        }
    } catch (error) {
        console.error('General Upload Error:', error);
        res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
};
