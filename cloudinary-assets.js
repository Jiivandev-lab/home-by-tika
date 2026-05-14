/* =====================================================================
   Netlify Function — Cloudinary Admin API (resources by tag)
   ---------------------------------------------------------------------
   Variables d'environnement requises sur Netlify (Site settings →
   Environment variables) :
     - CLOUDINARY_CLOUD_NAME   ex. dcj4xsp83
     - CLOUDINARY_API_KEY      visible dans Cloudinary Dashboard → API
     - CLOUDINARY_API_SECRET   visible dans Cloudinary Dashboard → API
                               (À NE JAMAIS METTRE DANS LE CODE FRONT)

   Appel depuis le site :
     GET /api/cloudinary-assets?tag=hbt_portes
     GET /api/cloudinary-assets?tag=hbt_videos&type=video

   Retour : { resources: [ ... ], total_count: N }
   ===================================================================== */

exports.handler = async function (event) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=60', // CDN cache 1 min
    'Access-Control-Allow-Origin': '*'
  };

  const params = event.queryStringParameters || {};
  const tag = (params.tag || '').trim();
  const type = (params.type || 'image').toLowerCase();
  const maxResults = Math.min(parseInt(params.max || '100', 10) || 100, 500);

  if (!tag) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Paramètre "tag" requis. Ex: /api/cloudinary-assets?tag=hbt_portes' })
    };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Variables Cloudinary manquantes sur Netlify',
        missing: {
          CLOUDINARY_CLOUD_NAME: !cloudName,
          CLOUDINARY_API_KEY:    !apiKey,
          CLOUDINARY_API_SECRET: !apiSecret
        },
        hint: 'Netlify → Site settings → Environment variables → ajoutez les 3 variables puis redéployez.'
      })
    };
  }

  // Admin API : resources par tag
  const adminUrl =
    'https://api.cloudinary.com/v1_1/' + cloudName +
    '/resources/' + encodeURIComponent(type) +
    '/tags/' + encodeURIComponent(tag) +
    '?max_results=' + maxResults +
    '&context=true&tags=true&metadata=true';

  const auth = Buffer.from(apiKey + ':' + apiSecret).toString('base64');

  try {
    const res = await fetch(adminUrl, {
      headers: { Authorization: 'Basic ' + auth }
    });
    const text = await res.text();

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers,
        body: JSON.stringify({
          error: 'Cloudinary Admin API error',
          status: res.status,
          tag: tag,
          type: type,
          response: text.slice(0, 1000)
        })
      };
    }

    // Réponse Cloudinary OK : on la transmet telle quelle au frontend
    return {
      statusCode: 200,
      headers,
      body: text
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Network error', message: e.message })
    };
  }
};
