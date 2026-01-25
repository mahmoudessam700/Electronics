import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'basic-ftp';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const config = {
    api: {
        bodyParser: false,
    },
};

interface UploadedFile {
    filepath: string;
    originalFilename: string;
    mimetype: string;
    size: number;
}

async function parseForm(req: VercelRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
    const form = formidable({
        maxFileSize: 10 * 1024 * 1024, // 10MB limit
        keepExtensions: true,
        allowEmptyFiles: false,
    });

    return new Promise((resolve, reject) => {
        form.parse(req as any, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
        });
    });
}

async function uploadToFTP(localPath: string, remotePath: string): Promise<void> {
    const client = new Client();
    client.ftp.verbose = false;

    try {
        await client.access({
            host: process.env.FTP_HOST!,
            user: process.env.FTP_USER!,
            password: process.env.FTP_PASSWORD!,
            secure: true,
            secureOptions: {
                rejectUnauthorized: false, // Allow self-signed certificates
            },
        });

        // Ensure upload directory exists
        const uploadDir = process.env.FTP_UPLOAD_DIR || '/uploads';
        try {
            await client.ensureDir(uploadDir);
        } catch {
            // Directory may already exist
        }

        // Upload file
        await client.uploadFrom(localPath, remotePath);
    } finally {
        client.close();
    }
}

function generateUniqueFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename);
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    return `${timestamp}-${uniqueId}${ext}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { files } = await parseForm(req);

        const uploadedFiles = files.file;
        if (!uploadedFiles) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];
        const results: { filename: string; url: string; originalName: string }[] = [];

        for (const file of fileArray) {
            const uploadedFile = file as unknown as UploadedFile;
            const uniqueFilename = generateUniqueFilename(uploadedFile.originalFilename || 'file');
            const uploadDir = process.env.FTP_UPLOAD_DIR || '/uploads';
            const remotePath = `${uploadDir}/${uniqueFilename}`;

            // Upload to FTP
            await uploadToFTP(uploadedFile.filepath, remotePath);

            // Cleanup temp file
            try {
                fs.unlinkSync(uploadedFile.filepath);
            } catch {
                // Ignore cleanup errors
            }

            const baseUrl = process.env.FTP_BASE_URL || 'https://electronics.adsolutions-eg.com/uploads';
            results.push({
                filename: uniqueFilename,
                url: `${baseUrl}/${uniqueFilename}`,
                originalName: uploadedFile.originalFilename || 'file',
            });
        }

        return res.status(200).json({
            success: true,
            files: results,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            error: 'Failed to upload file',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
