const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['operational', 'maintenance', 'critical'],
      default: 'operational'
    },
    dangerLevel: { type: Number, min: 0, max: 10, default: 0 },
    description: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Zone', zoneSchema);