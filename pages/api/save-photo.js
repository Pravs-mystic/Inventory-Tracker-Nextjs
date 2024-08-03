import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { photo } = req.body;

      if (!photo) {
        console.error('No photo data received');
        return res.status(400).json({ error: 'No photo data received' });
      }

      // Extract the base64 data
      const base64Data = photo.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');

      // Generate a unique filename
      const filename = `photo_${Date.now()}.jpg`;
      const filepath = path.join(process.cwd(), 'public', 'images', filename);

      // Save the file
      fs.writeFileSync(filepath, buffer);

      console.log('Photo saved successfully');
      res.status(200).json({ message: 'Photo saved successfully', filename });
    } catch (error) {
      console.error('Error saving photo:', error);
      res.status(500).json({ error: 'Error saving photo' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};