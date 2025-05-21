const validateUserInput = (req, res, next) => {
  const user = req.body;
  const required = ['firstname', 'lastname', 'email', 'password'];
  const missing = required.filter((field) => !(field in user));
  if (missing.length) {
    return res.status(400).json({
      code: 400,
      message: 'Champs obligatoires manquants',
      errors: missing
    });
  }

  if (typeof user.firstname !== 'string' || user.firstname.length < 2 || user.firstname.length > 40) {
    return res.status(400).json({ code: 400, message: 'Entrées invalides', errors: ['firstname invalide'] });
  }
  if (typeof user.lastname !== 'string' || user.lastname.length < 2 || user.lastname.length > 40) {
    return res.status(400).json({ code: 400, message: 'Entrées invalides', errors: ['lastname invalide'] });
  }
  if (typeof user.email !== 'string' || !user.email.includes('@') || user.email.length > 80) {
    return res.status(400).json({ code: 400, message: 'Entrées invalides', errors: ['email invalide'] });
  }
  if (typeof user.password !== 'string' || user.password.length < 6 || user.password.length > 100) {
    return res.status(400).json({ code: 400, message: 'Entrées invalides', errors: ['password invalide'] });
  }
  if ('city' in user && (typeof user.city !== 'string' || user.city.length > 50)) {
    return res.status(400).json({ code: 400, message: 'Entrées invalides', errors: ['city invalide'] });
  }

  return next();
};

export default validateUserInput;
