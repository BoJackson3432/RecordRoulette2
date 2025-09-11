import { requireAuthentication } from '../shared/auth';

export default function handler(req: any, res: any) {
  try {
    const user = requireAuthentication(req, res);
    if (!user) return;

    if (req.method === 'POST') {
      const { spinId } = req.body;

      // Stub share image generation - return placeholder image as blob
      // In production, this would generate an actual social sharing image
      const dummyImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      
      // Convert to buffer for blob response
      const base64Data = dummyImageData.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Length', buffer.length);
      res.status(200).send(buffer);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API /share error:', error);
    res.status(500).json({ error: 'Failed to generate share image' });
  }
}