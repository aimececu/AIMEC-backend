const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Configurar AWS SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Configuración del bucket
const bucketConfig = {
  bucket: process.env.AWS_S3_BUCKET,
  region: process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-east-1'
};

// Función para subir archivo a S3
const uploadToS3 = async (file, key, contentType = 'application/octet-stream') => {
  if (!bucketConfig.bucket) {
    throw new Error('AWS_S3_BUCKET no está configurado');
  }

  const command = new PutObjectCommand({
    Bucket: bucketConfig.bucket,
    Key: key,
    Body: file.buffer || file,
    ContentType: contentType,
    ACL: 'public-read'
  });

  try {
    const result = await s3Client.send(command);
    return {
      success: true,
      url: `https://${bucketConfig.bucket}.s3.${bucketConfig.region}.amazonaws.com/${key}`,
      key: key,
      bucket: bucketConfig.bucket
    };
  } catch (error) {
    console.error('Error subiendo archivo a S3:', error);
    throw new Error('Error al subir archivo a S3');
  }
};

// Función para eliminar archivo de S3
const deleteFromS3 = async (key) => {
  if (!bucketConfig.bucket) {
    throw new Error('AWS_S3_BUCKET no está configurado');
  }

  const command = new DeleteObjectCommand({
    Bucket: bucketConfig.bucket,
    Key: key
  });

  try {
    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    console.error('Error eliminando archivo de S3:', error);
    throw new Error('Error al eliminar archivo de S3');
  }
};

// Función para obtener URL firmada
const getSignedFileUrl = async (key, operation = 'getObject', expiresIn = 3600) => {
  if (!bucketConfig.bucket) {
    throw new Error('AWS_S3_BUCKET no está configurado');
  }

  const command = new GetObjectCommand({
    Bucket: bucketConfig.bucket,
    Key: key
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generando URL firmada:', error);
    throw new Error('Error al generar URL firmada');
  }
};

module.exports = {
  s3Client,
  bucketConfig,
  uploadToS3,
  deleteFromS3,
  getSignedFileUrl
};
