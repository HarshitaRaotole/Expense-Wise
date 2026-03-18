const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    icon: { type: String, default: '📁' }, 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });


categorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);