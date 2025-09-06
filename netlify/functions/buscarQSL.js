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
    // Obtener las primeras 30 imágenes
    let result = await cloudinary.search
      .expression(`folder=QSL/${callSign}`)
      .sort_by('created_at', 'desc')
      .max_results(60)
      .execute();

   let images = result.resources.map(img => ({
  url: img.secure_url,
  public_id: img.public_id,
  format: img.format,
  width: img.width,
  height: img.height,
  created_at: img.created_at // ✅ esto es clave
}));


    // Si hay más imágenes, agregar un cursor para la siguiente solicitud
    if (result.next_cursor) {
      images.push({
        next_cursor: result.next_cursor
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify(images)
    };

  } catch (error) {
    console.error("Error al buscar imágenes:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error interno al buscar imágenes",
        details: error.message || error
      })
    };
  }
};
