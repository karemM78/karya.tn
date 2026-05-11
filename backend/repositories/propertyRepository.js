const Property = require('../models/Property');
const User = require('../models/User');

class PropertyRepository {
  async findAll(filters = {}) {
    const query = {};

    if (filters.propertyType) {
      query.propertyType = filters.propertyType;
    }

    if (filters.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }

    if (filters.userId) {
      query.user = filters.userId;
    }

    const properties = await Property.find(query)
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 });

    return properties.map(p => this._mapProperty(p));
  }

  async findById(id) {
    const property = await Property.findById(id).populate('user', 'name email avatar');
    return property ? this._mapProperty(property) : null;
  }

  async create(propertyData) {
    const property = await Property.create({
      user: propertyData.user,
      title: propertyData.title,
      description: propertyData.description,
      price: propertyData.price,
      location: propertyData.location,
      propertyType: propertyData.propertyType,
      contactMethod: propertyData.contactMethod,
      phoneNumber: propertyData.phoneNumber,
      latitude: propertyData.latitude,
      longitude: propertyData.longitude,
      currency: propertyData.currency || 'TND',
      isFurnished: propertyData.isFurnished || false,
      hasParking: propertyData.hasParking || false,
      hasWifi: propertyData.hasWifi || false,
      hasAC: propertyData.hasAC || false,
      hasHeating: propertyData.hasHeating || false,
      hasBalcony: propertyData.hasBalcony || false,
      roomType: propertyData.roomType,
      occupants: propertyData.occupants || 0,
      tenantsSharing: propertyData.tenantsSharing || 1,
      requiredCapacity: propertyData.requiredCapacity || 1,
      isFeatured: propertyData.isFeatured || false,
      images: propertyData.images || [],
    });

    return property._id.toString();
  }

  async update(id, propertyData) {
    const property = await Property.findById(id);
    if (!property) return null;

    if (propertyData.title !== undefined) property.title = propertyData.title;
    if (propertyData.description !== undefined) property.description = propertyData.description;
    if (propertyData.price !== undefined) property.price = propertyData.price;
    if (propertyData.location !== undefined) property.location = propertyData.location;
    if (propertyData.propertyType !== undefined) property.propertyType = propertyData.propertyType;
    if (propertyData.contactMethod !== undefined) property.contactMethod = propertyData.contactMethod;
    if (propertyData.phoneNumber !== undefined) property.phoneNumber = propertyData.phoneNumber;
    if (propertyData.latitude !== undefined) property.latitude = propertyData.latitude;
    if (propertyData.longitude !== undefined) property.longitude = propertyData.longitude;
    if (propertyData.currency !== undefined) property.currency = propertyData.currency;
    if (propertyData.isFurnished !== undefined) property.isFurnished = propertyData.isFurnished;
    if (propertyData.hasParking !== undefined) property.hasParking = propertyData.hasParking;
    if (propertyData.hasWifi !== undefined) property.hasWifi = propertyData.hasWifi;
    if (propertyData.hasAC !== undefined) property.hasAC = propertyData.hasAC;
    if (propertyData.hasHeating !== undefined) property.hasHeating = propertyData.hasHeating;
    if (propertyData.hasBalcony !== undefined) property.hasBalcony = propertyData.hasBalcony;
    if (propertyData.roomType !== undefined) property.roomType = propertyData.roomType;
    if (propertyData.occupants !== undefined) property.occupants = propertyData.occupants;
    if (propertyData.tenantsSharing !== undefined) property.tenantsSharing = propertyData.tenantsSharing;
    if (propertyData.requiredCapacity !== undefined) property.requiredCapacity = propertyData.requiredCapacity;
    if (propertyData.images !== undefined) property.images = propertyData.images;

    await property.save();
    return property._id.toString();
  }

  async delete(id) {
    const result = await Property.findByIdAndDelete(id);
    return !!result;
  }

  _mapProperty(property) {
    const pObj = property.toObject();
    return {
      ID: pObj._id.toString(),
      USER_ID: pObj.user?._id?.toString() || pObj.user?.toString(),
      TITLE: pObj.title,
      DESCRIPTION: pObj.description,
      PRICE: pObj.price,
      LOCATION: pObj.location,
      PROPERTY_TYPE: pObj.propertyType,
      CONTACT_METHOD: pObj.contactMethod,
      PHONE_NUMBER: pObj.phoneNumber,
      LATITUDE: pObj.latitude,
      LONGITUDE: pObj.longitude,
      CURRENCY: pObj.currency,
      IS_FURNISHED: pObj.isFurnished ? 1 : 0,
      HAS_PARKING: pObj.hasParking ? 1 : 0,
      HAS_WIFI: pObj.hasWifi ? 1 : 0,
      HAS_AC: pObj.hasAC ? 1 : 0,
      HAS_HEATING: pObj.hasHeating ? 1 : 0,
      HAS_BALCONY: pObj.hasBalcony ? 1 : 0,
      ROOM_TYPE: pObj.roomType,
      OCCUPANTS: pObj.occupants,
      TENANTS_SHARING: pObj.tenantsSharing,
      REQUIRED_CAPACITY: pObj.requiredCapacity,
      IS_FEATURED: pObj.isFeatured ? 1 : 0,
      CREATED_AT: pObj.createdAt,
      UPDATED_AT: pObj.updatedAt,
      IMAGES: pObj.images || [],
      LIKES: pObj.likes?.map(l => l.toString()) || [],
      OWNER_NAME: pObj.user?.name,
      OWNER_EMAIL: pObj.user?.email,
      OWNER_AVATAR: pObj.user?.avatar,
    };
  }
}

module.exports = new PropertyRepository();
