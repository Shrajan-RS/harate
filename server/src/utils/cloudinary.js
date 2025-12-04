const cloudinary = require('cloudinary').v2;

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

const uploadImageBuffer = async (buffer, folder = 'harate_uploads') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: 'image',
          folder,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        },
      )
      .end(buffer);
  });
};

module.exports = {
  configureCloudinary,
  uploadImageBuffer,
};

