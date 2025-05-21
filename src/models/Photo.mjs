import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true },
  created_at: { type: Date, default: Date.now }
}, {
  collection: 'photos',
  minimize: false,
  versionKey: false
}).set('toJSON', {
  transform: (doc, ret) => {
    const obj = { ...ret, id: ret._id };
    delete obj._id;
    return obj;
  }
});

export default photoSchema;
