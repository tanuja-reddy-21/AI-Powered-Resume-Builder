import ImageKit from 'imagekit';

let imagekit = null;

// Only initialize ImageKit if credentials are provided
if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
  imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
  });
}

export const uploadImage = async (req, res) => {
  try {
    if (!imagekit) {
      return res.status(503).json({ message: 'Image upload service not configured' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: '/resume-profiles'
    });

    res.status(200).json({ url: result.url, fileId: result.fileId });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image' });
  }
};

export const getAuthParams = (req, res) => {
  if (!imagekit) {
    return res.status(503).json({ message: 'Image upload service not configured' });
  }
  const authenticationParameters = imagekit.getAuthenticationParameters();
  res.status(200).json(authenticationParameters);
};
