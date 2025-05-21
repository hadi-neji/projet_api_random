import mongoose from 'mongoose';
import PhotoModel from '../models/Photo.mjs';
import AlbumModel from '../models/Album.mjs';
import verifyToken from '../middleware/auth.mjs';
import validatePhotoInput from '../middleware/validatePhoto.mjs';

const Photos = class Photos {
  constructor(app, connect) {
    this.app = app;
    this.PhotoModel = connect.model('Photo', PhotoModel);
    this.AlbumModel = connect.model('Album', AlbumModel);
    this.run();
  }

  create() {
    this.app.post('/album/:idalbum/photo', verifyToken, validatePhotoInput, async (req, res) => {
      const { idalbum } = req.params;
      if (!mongoose.Types.ObjectId.isValid(idalbum)) {
        return res.status(400).json({ code: 400, message: 'Invalid Album ID format' });
      }
      const data = Array.isArray(req.body) ? req.body : [req.body];
      try {
        const photos = await this.PhotoModel.insertMany(
          data.map((p) => ({ ...p, album: idalbum }))
        );
        const ids = photos.map((p) => p._id);
        await this.AlbumModel.findByIdAndUpdate(
          idalbum,
          { $push: { photos: { $each: ids } } }
        );
        return res.status(201).json(photos);
      } catch (err) {
        return res.status(400).json({ code: 400, message: err.message });
      }
    });
  }

  getAllFromAlbum() {
    this.app.get('/album/:idalbum/photos', verifyToken, async (req, res) => {
      const { idalbum } = req.params;
      if (!mongoose.Types.ObjectId.isValid(idalbum)) {
        return res.status(400).json({ code: 400, message: 'Invalid Album ID format' });
      }
      try {
        const photos = await this.PhotoModel.find({ album: idalbum }).populate('album');
        return res.status(200).json(photos);
      } catch (err) {
        return res.status(500).json({ code: 500, message: err.message });
      }
    });
  }

  getByIdFromAlbum() {
    this.app.get('/album/:idalbum/photo/:idphotos', verifyToken, async (req, res) => {
      const { idalbum, idphotos } = req.params;
      if (
        !mongoose.Types.ObjectId.isValid(idalbum)
        || !mongoose.Types.ObjectId.isValid(idphotos)
      ) {
        return res.status(400).json({ code: 400, message: 'Invalid ID format' });
      }
      try {
        const foundPhoto = await this.PhotoModel.findOne({ _id: idphotos, album: idalbum }).populate('album');
        if (!foundPhoto) {
          return res.status(404).json({ code: 404, message: 'Photo not found' });
        }
        return res.status(200).json(foundPhoto);
      } catch (err) {
        return res.status(500).json({ code: 500, message: err.message });
      }
    });
  }

  deleteById() {
    this.app.delete('/album/:idalbum/photo/:idphotos', verifyToken, async (req, res) => {
      const { idalbum, idphotos } = req.params;
      if (
        !mongoose.Types.ObjectId.isValid(idalbum)
        || !mongoose.Types.ObjectId.isValid(idphotos)
      ) {
        return res.status(400).json({ code: 400, message: 'Invalid ID format' });
      }
      try {
        const deletedPhoto = await this.PhotoModel.findByIdAndDelete(idphotos);
        if (!deletedPhoto) {
          return res.status(404).json({ code: 404, message: 'Photo not found' });
        }
        await this.AlbumModel.findByIdAndUpdate(
          idalbum,
          {
            $pull: {
              photos: deletedPhoto._id
            }
          }
        );

        return res.status(200).json({ message: 'Photo deleted' });
      } catch (err) {
        return res.status(500).json({ code: 500, message: err.message });
      }
    });
  }

  updateById() {
    this.app.put('/album/:idalbum/photo/:idphotos', verifyToken, validatePhotoInput, async (req, res) => {
      const { idalbum, idphotos } = req.params;
      if (
        !mongoose.Types.ObjectId.isValid(idalbum)
        || !mongoose.Types.ObjectId.isValid(idphotos)
      ) {
        return res.status(400).json({ code: 400, message: 'Invalid ID format' });
      }
      try {
        const updatedPhoto = await this.PhotoModel.findByIdAndUpdate(
          idphotos,
          req.body,
          { new: true }
        );
        if (!updatedPhoto) {
          return res.status(404).json({ code: 404, message: 'Photo not found' });
        }
        return res.status(200).json(updatedPhoto);
      } catch (err) {
        return res.status(400).json({ code: 400, message: err.message });
      }
    });
  }

  run() {
    this.create();
    this.getAllFromAlbum();
    this.getByIdFromAlbum();
    this.updateById();
    this.deleteById();
  }
};

export default Photos;
