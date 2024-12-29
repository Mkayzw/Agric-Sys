const express = require('express');
const router = express.Router();
const {
    createJob,
    getJobs,
    getJob,
    updateJob,
    deleteJob
} = require('../controllers/job.controller');
const { protect } = require('../middleware/auth.middleware');

// Job routes
router.post('/', protect, createJob);
router.get('/', getJobs);
router.get('/:id', getJob);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);

module.exports = router; 