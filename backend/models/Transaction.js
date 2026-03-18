const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
    user:{type: mongoose.Schema.Types.ObjectId,ref:'User',required: true},
    amount:{type: Number, required: true},
    category: {type: mongoose.Schema.Types.ObjectId, ref:'Category',required: true},
    description: {type: String},
    transactionType: {type: String, enum: ['income', 'expense'], required: true},
    date: {type: Date, default: Date.now}
},{timestamps: true});

module.exports = mongoose.model('Transaction',transactionSchema);
