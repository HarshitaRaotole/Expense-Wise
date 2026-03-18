const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [{ user: null }, { user: req.user.userId }]
    }).sort({ name: 1 }); 
    
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const trimmedName = name.trim();


    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
      $or: [{ user: null }, { user: req.user.userId }]
    });

    if (existing) {
      return res.status(400).json({ message: 'This category already exists.' });
    }

   
    const category = new Category({ 
        name: trimmedName, 
        icon: icon || '📁', 
        user: req.user.userId 
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};