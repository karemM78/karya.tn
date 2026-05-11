const mongoose = require('mongoose');

const propertySchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    propertyType: {
      type: String,
      required: true,
    },
    contactMethod: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    latitude: Number,
    longitude: Number,
    currency: {
      type: String,
      default: 'TND',
    },
    isFurnished: { type: Boolean, default: false },
    hasParking: { type: Boolean, default: false },
    hasWifi: { type: Boolean, default: false },
    hasAC: { type: Boolean, default: false },
    hasHeating: { type: Boolean, default: false },
    hasBalcony: { type: Boolean, default: false },
    roomType: String,
    occupants: { type: Number, default: 0 },
    tenantsSharing: { type: Number, default: 1 },
    requiredCapacity: { type: Number, default: 1 },
    isFeatured: { type: Boolean, default: false },
    images: [
      {
        type: String,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
