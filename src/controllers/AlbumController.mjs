import mongoose from 'mongoose';
import Album from '../models/Album.mjs';
import verifyToken from '../middleware/auth.mjs';
import validateAlbumInput from '../middleware/validateAlbum.mjs';

const Albums = class Albums {
  constructor(app, connect) {
    this.app = app;
    this.Album = connect.model('Album', Album);
    this.run();
  }

  create() {
    this.app.post('/album', verifyToken, validateAlbumInput, async (req, res) => {
      try {
        const album = new this.Album(req.body);
        const savedAlbum = await album.save();
        return res.status(201).json(savedAlbum);
      } catch (err) {
        return res.status(400).json({ code: 400, message: err.message });
      }
    });
  }

  getAll() {
    this.app.get('/albums', verifyToken, async (req, res) => {
      try {
        const filter = req.query.title ? { title: new RegExp(req.query.title, 'i') } : {};
        const albums = await this.Album.find(filter).populate('photos');
        return res.status(200).json(albums);
      } catch (err) {
        return res.status(500).json({ code: 500, message: err.message });
      }
    });
  }

  showById() {
    this.app.get('/album/:id', verifyToken, async (req, res) => {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ code: 400, message: 'Invalid Album ID format' });
      }
      try {
        const foundAlbum = await this.Album.findById(id).populate('photos');
        if (!foundAlbum) {
          return res.status(404).json({ code: 404, message: 'Album not found' });
        }
        return res.status(200).json(foundAlbum);
      } catch (err) {
        return res.status(500).json({ code: 500, message: err.message });
      }
    });
  }

  updateById() {
    this.app.put('/album/:id', verifyToken, validateAlbumInput, async (req, res) => {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ code: 400, message: 'Invalid Album ID format' });
      }
      try {
        const updatedAlbum = await this.Album.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedAlbum) {
          return res.status(404).json({ code: 404, message: 'Album not found' });
        }
        return res.status(200).json(updatedAlbum);
      } catch (err) {
        return res.status(400).json({ code: 400, message: err.message });
      }
    });
  }

  deleteById() {
    this.app.delete('/album/:id', verifyToken, async (req, res) => {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ code: 400, message: 'Invalid Album ID format' });
      }
      try {
        const deletedAlbum = await this.Album.findByIdAndDelete(id);
        if (!deletedAlbum) {
          return res.status(404).json({ code: 404, message: 'Album not found' });
        }
        return res.status(200).json({ message: 'Album deleted successfully' });
      } catch (err) {
        return res.status(500).json({ code: 500, message: err.message });
      }
    });
  }

  run() {
    this.create();
    this.getAll();
    this.showById();
    this.updateById();
    this.deleteById();
  }
};

export default Albums;
