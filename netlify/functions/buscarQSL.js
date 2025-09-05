const cloudinary = require('cloudinary').v2;

// Configuración de Cloudinary usando variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Manejador de la función serverless
exports.handler = async (event) => {
  const callSign = event.queryStringParameters.callSign;

  // Validación del parámetro callSign
  if (!callSign) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Indicativo no proporcionado" })
    };
  }

  try {
    // Búsqueda de imágenes en la carpeta del callSign
    const result = await cloudinary.search
      .expression(`folder=QSL/${callSign}`)  // Asegúrate que la carpeta esté bien especificada
      .sort_by('created_at', 'desc')  // Ordenar por fecha de creación (más reciente primero)
      .max_results(30)  // Limitar la cantidad de resultados
      .execute();

    // Verificar si hay imágenes
    if (result.resources.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No se encontraron imágenes para este indicativo" })
      };
    }

    // Formatear las imágenes a devolver
    const images = result.resources.map(img => ({
      url: img.secure_url,
      public_id: img.public_id,
      format: img.format,  // Agregar formato para ayudar con la visualización si es necesario
      width: img.width,    // Información adicional sobre la imagen (opcional)
      height: img.height   // Información adicional sobre la imagen (opcional)
    }));

    // Devolver las imágenes encontradas
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
