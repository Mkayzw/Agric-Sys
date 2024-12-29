const Job = require('../models/job.model');

// Create a new job
exports.createJob = async (req, res) => {
    try {
        const {
            title,
            serviceType,
            pickupLocation,
            deliveryLocation,
            startDate,
            budget,
            description,
            requirements
        } = req.body;

        const job = new Job({
            title,
            serviceType,
            pickupLocation,
            deliveryLocation,
            startDate,
            budget: {
                amount: budget,
                currency: req.body.budgetCurrency
            },
            description,
            requirements,
            postedBy: req.user._id
        });

        await job.save();

        res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            data: job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating job',
            error: error.message
        });
    }
};

// Get all jobs with filters
exports.getJobs = async (req, res) => {
    try {
        const {
            serviceType,
            status,
            minBudget,
            maxBudget,
            currency,
            startDate
        } = req.query;

        const filter = {};

        if (serviceType) filter.serviceType = serviceType;
        if (status) filter.status = status;
        if (startDate) filter.startDate = { $gte: new Date(startDate) };
        if (currency) filter['budget.currency'] = currency;
        if (minBudget || maxBudget) {
            filter['budget.amount'] = {};
            if (minBudget) filter['budget.amount'].$gte = Number(minBudget);
            if (maxBudget) filter['budget.amount'].$lte = Number(maxBudget);
        }

        const jobs = await Job.find(filter)
            .populate('postedBy', 'firstName lastName email')
            .populate('assignedTo', 'firstName lastName email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching jobs',
            error: error.message
        });
    }
};

// Get single job
exports.getJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('postedBy', 'firstName lastName email')
            .populate('assignedTo', 'firstName lastName email');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching job',
            error: error.message
        });
    }
};

// Update job
exports.updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if user is job owner
        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this job'
            });
        }

        job = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating job',
            error: error.message
        });
    }
};

// Delete job
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if user is job owner
        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this job'
            });
        }

        await job.remove();

        res.status(200).json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting job',
            error: error.message
        });
    }
}; 