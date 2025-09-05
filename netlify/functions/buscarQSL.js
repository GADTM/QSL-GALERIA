const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = async (event) => {
  const callSign = event.queryStringParameters.callSign;

  if (!callSign) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Indicativo no proporcionado" })
    };
  }

  try {
    const result = await cloudinary.search
      .expression(`folder=${callSign}`)
      .sort_by('public_id', 'desc')
      .max_results(30)
      .execute();

    const images = result.resources.map(img => ({
      url: img.secure_url,
      public_id: img.public_id
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(images)
    };

  } catch (error) {
    console.error("Error al buscar imágenes:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno al buscar imágenes" })
    };
  }
};
