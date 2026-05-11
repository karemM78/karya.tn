const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const propertyRepository = require('../repositories/propertyRepository');
const { protect, owner } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Setup
const uploadDir = path.join(process.cwd(), 'uploads');
if (!require('fs').existsSync(uploadDir)) {
  require('fs').mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Images only!');
    }
  },
});


// @desc    Get all properties (or user specific if query param provided)
// @route   GET /api/properties
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { userId, propertyType, location } = req.query;
  const filter = userId ? { user: userId } : { propertyType, location };
  
  try {
    const properties = await propertyRepository.findAll(filter);
    const formatted = properties.map(p => ({
        _id: p.ID,
        user: p.USER_ID,
        title: p.TITLE,
        description: p.DESCRIPTION,
        price: p.PRICE,
        location: p.LOCATION,
        propertyType: p.PROPERTY_TYPE,
        images: p.IMAGES,
        contactMethod: p.CONTACT_METHOD,
        phoneNumber: p.PHONE_NUMBER,
        isFeatured: p.IS_FEATURED === 1,
        createdAt: p.CREATED_AT
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}));

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    const property = await propertyRepository.findById(req.params.id);
    if (property) {
      res.json({
        _id: property.ID,
        user: { _id: property.USER_ID, name: property.OWNER_NAME, avatar: property.OWNER_AVATAR },
        title: property.TITLE,
        description: property.DESCRIPTION,
        price: property.PRICE,
        location: property.LOCATION,
        propertyType: property.PROPERTY_TYPE,
        images: property.IMAGES,
        contactMethod: property.CONTACT_METHOD,
        phoneNumber: property.PHONE_NUMBER,
        latitude: property.LATITUDE,
        longitude: property.LONGITUDE,
        currency: property.CURRENCY,
        isFurnished: property.IS_FURNISHED === 1,
        hasParking: property.HAS_PARKING === 1,
        hasWifi: property.HAS_WIFI === 1,
        hasAC: property.HAS_AC === 1,
        hasHeating: property.HAS_HEATING === 1,
        hasBalcony: property.HAS_BALCONY === 1,
        roomType: property.ROOM_TYPE,
        occupants: property.OCCUPANTS,
        tenantsSharing: property.TENANTS_SHARING,
        isFeatured: property.IS_FEATURED === 1,
        likes: property.LIKES,
        createdAt: property.CREATED_AT
      });
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}));

// @desc    Upload images
// @route   POST /api/properties/upload
// @access  Private
router.post('/upload', protect, upload.array('images', 15), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  const filePaths = req.files.map((file) => `/uploads/${file.filename}`);
  res.json(filePaths);
});

// @desc    Create a property
// @route   POST /api/properties
// @access  Private
router.post('/', protect, owner, asyncHandler(async (req, res) => {
  try {
    const propertyId = await propertyRepository.create({
      ...req.body,
      user: req.user._id
    });
    const createdProperty = await propertyRepository.findById(propertyId);
    res.status(201).json(createdProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}));

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private
router.put('/:id', protect, owner, asyncHandler(async (req, res) => {
  try {
    const property = await propertyRepository.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Ensure the user owns the property (already checked by 'owner' middleware, but let's be double sure)
    if (property.USER_ID !== req.user._id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await propertyRepository.update(req.params.id, req.body);
    const updatedProperty = await propertyRepository.findById(req.params.id);
    res.json(updatedProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}));

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private
router.delete('/:id', protect, owner, asyncHandler(async (req, res) => {
  try {
    const property = await propertyRepository.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.USER_ID !== req.user._id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await propertyRepository.delete(req.params.id);
    res.json({ message: 'Property removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}));

module.exports = router;
