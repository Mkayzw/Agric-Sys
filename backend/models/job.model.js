const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    serviceType: {
        type: String,
        required: [true, 'Service type is required'],
        enum: [
            'transport',
            'equipment',
            'labor',
            'repair',
            'irrigation',
            'harvesting',
            'storage',
            'processing',
            'pest-control',
            'consultancy'
        ]
    },
    pickupLocation: {
        type: String,
        required: [true, 'Pickup location is required'],
        trim: true
    },
    deliveryLocation: {
        type: String,
        required: [true, 'Delivery location is required'],
        trim: true
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    budget: {
        amount: {
            type: Number,
            required: [true, 'Budget amount is required'],
            min: [0, 'Budget cannot be negative']
        },
        currency: {
            type: String,
            required: [true, 'Currency is required'],
            enum: ['USD', 'ZWL']
        }
    },
    description: {
        type: String,
        required: [true, 'Job description is required'],
        trim: true
    },
    requirements: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'completed', 'cancelled'],
        default: 'open'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp
jobSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job; 