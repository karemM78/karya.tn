const asyncHandler = require('express-async-handler');
const propertyRepository = require('../repositories/propertyRepository');

// @desc    Fetch all properties
// @route   GET /api/properties
// @access  Public
const getProperties = asyncHandler(async (req, res) => {
  const { propertyType, location } = req.query;
  const properties = await propertyRepository.findAll({ propertyType, location });
  
  // Map Oracle results to camelCase expected by frontend
  const formattedProperties = properties.map(p => ({
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
    latitude: p.LATITUDE,
    longitude: p.LONGITUDE,
    currency: p.CURRENCY,
    isFurnished: p.IS_FURNISHED === 1,
    hasParking: p.HAS_PARKING === 1,
    hasWifi: p.HAS_WIFI === 1,
    hasAC: p.HAS_AC === 1,
    hasHeating: p.HAS_HEATING === 1,
    hasBalcony: p.HAS_BALCONY === 1,
    roomType: p.ROOM_TYPE,
    occupants: p.OCCUPANTS,
    tenantsSharing: p.TENANTS_SHARING,
    requiredCapacity: p.REQUIRED_CAPACITY,
    isFeatured: p.IS_FEATURED === 1,
    createdAt: p.CREATED_AT,
    ownerName: p.OWNER_NAME
  }));

  res.json(formattedProperties);
});

// @desc    Fetch single property
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = asyncHandler(async (req, res) => {
  const property = await propertyRepository.findById(req.params.id);

  if (property) {
    res.json({
      _id: property.ID,
      user: {
        _id: property.USER_ID,
        name: property.OWNER_NAME,
        avatar: property.OWNER_AVATAR
      },
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
      requiredCapacity: property.REQUIRED_CAPACITY,
      isFeatured: property.IS_FEATURED === 1,
      likes: property.LIKES,
      createdAt: property.CREATED_AT
    });
  } else {
    res.status(404);
    throw new Error('Property not found');
  }
});

// @desc    Create a property
// @route   POST /api/properties
// @access  Private
const createProperty = asyncHandler(async (req, res) => {
  const propertyData = {
    ...req.body,
    user: req.user._id
  };

  const propertyId = await propertyRepository.create(propertyData);
  const createdProperty = await propertyRepository.findById(propertyId);

  res.status(201).json(createdProperty);
});

module.exports = {
  getProperties,
  getPropertyById,
  createProperty
};
