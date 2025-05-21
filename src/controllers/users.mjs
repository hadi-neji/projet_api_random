import jwt from 'jsonwebtoken';
import UserModel from '../models/user.mjs';
import validateUserInput from '../middleware/validate.mjs';
import verifyToken from '../middleware/auth.mjs';

const Users = class Users {
  constructor(app, connect) {
    this.app = app;
    this.UserModel = connect.model('User', UserModel);
    this.run();
  }

  deleteById() {
    this.app.delete('/user/:id', verifyToken, async (req, res) => {
      try {
        const user = await this.UserModel.findByIdAndDelete(req.params.id);
        if (!user) {
          return res.status(404).json({ code: 404, message: 'User not found' });
        }
        return res.status(200).json({ code: 200, message: 'User deleted', user });
      } catch (err) {
        console.error(`[ERROR] users/:id [DELETE] -> ${err}`);
        return res.status(500).json({
          code: 500,
          message: 'Internal Server error'
        });
      }
    });
  }

  getAll() {
    this.app.get('/users', verifyToken, async (req, res) => {
      try {
        const users = await this.UserModel.find().select('-password'); // on exclut le mot de passe
        return res.status(200).json(users);
      } catch (err) {
        console.error(`[ERROR] users [GET all] -> ${err}`);
        return res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  showById() {
    this.app.get('/user/:id', verifyToken, async (req, res) => {
      try {
        const user = await this.UserModel.findById(req.params.id);
        if (!user) {
          return res.status(404).json({ code: 404, message: 'User not found' });
        }
        return res.status(200).json(user);
      } catch (err) {
        console.error(`[ERROR] users/:id [GET] -> ${err}`);
        return res.status(500).json({
          code: 500,
          message: 'Internal Server error'
        });
      }
    });
  }

  create() {
    this.app.post('/user/', validateUserInput, async (req, res) => {
      try {
        const existingUser = await this.UserModel.findOne({ email: req.body.email });
        if (existingUser) {
          return res.status(409).json({ code: 409, message: 'Email already exists' });
        }

        const userModel = new this.UserModel(req.body);
        const user = await userModel.save();
        const { password, ...userData } = user.toObject();
        return res.status(201).json(userData);
      } catch (err) {
        console.error(`[ERROR] users/create -> ${err}`);
        return res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  login() {
    this.app.post('/login', async (req, res) => {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ code: 400, message: 'Email et mot de passe requis' });
      }
      try {
        const user = await this.UserModel.findOne({ email });
        if (!user) {
          return res.status(401).json({ code: 401, message: 'Utilisateur introuvable ou mauvais identifiants' });
        }
        if (user.password !== password) {
          return res.status(401).json({ code: 401, message: 'Utilisateur introuvable ou mauvais identifiants' });
        }
        const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.status(200).json({
          token,
          user: {
            id: user._id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname
          }
        });
      } catch (err) {
        console.error(`[ERROR] users/login -> ${err}`);
        return res.status(500).json({ code: 500, message: 'Erreur serveur' });
      }
    });
  }

  run() {
    this.login();
    this.create();
    this.getAll();
    this.showById();
    this.deleteById();
  }
};

export default Users;
