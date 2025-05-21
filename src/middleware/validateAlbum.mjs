const validateAlbumInput = (req, res, next) => {
  const album = req.body;
  if (!album.title || typeof album.title !== 'string' || album.title.length < 1 || album.title.length > 100) {
    return res.status(400).json({ code: 400, message: 'Entrées invalides', errors: ['title invalide'] });
  }
  if ('description' in album && (typeof album.description !== 'string' || album.description.length > 200)) {
    return res.status(400).json({ code: 400, message: 'Entrées invalides', errors: ['description invalide'] });
  }
  return next();
};

export default validateAlbumInput;
