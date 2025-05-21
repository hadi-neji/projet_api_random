const validatePhotoInput = (req, res, next) => {
  const data = Array.isArray(req.body) ? req.body : [req.body];

  const isUpdate = req.method === 'PUT';

  for (const photo of data) {
    if (!isUpdate) {
      if (!photo.url || typeof photo.url !== 'string' || photo.url.length < 5 || photo.url.length > 200) {
        return res.status(400).json({ code: 400, message: 'Entrées invalides', errors: ['url invalide'] });
      }
    } else if ('url' in photo && (typeof photo.url !== 'string' || photo.url.length < 5 || photo.url.length > 200)) {
      return res.status(400).json({ code: 400, message: 'Entrées invalides', errors: ['url invalide'] });
    }

    if ('description' in photo && (typeof photo.description !== 'string' || photo.description.length > 200)) {
      return res.status(400).json({ code: 400, message: 'Entrées invalides', errors: ['description invalide'] });
    }
  }
  return next();
};

export default validatePhotoInput;
