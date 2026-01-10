// server/routes/survey.route.js


import express from 'express';
import auth from '../middleware/auth.js';
import Survey from '../models/survey.model.js';

const surveyRouter = express.Router();

// Check if survey completed
surveyRouter.get('/status', auth, async (req, res) => {
  try {
    const survey = await Survey.findOne({ user: req.userId });
    res.json({ completed: !!survey });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit survey
surveyRouter.post('/submit', auth, async (req, res) => {
  try {
    const { ageRange, gender, concerns, otherConcern, diagnosed, diagnosisDetails } = req.body;
    
    if (!ageRange || !gender || !concerns || !diagnosed) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['Yes', 'No', 'Unsure'].includes(diagnosed)) {
      return res.status(400).json({ error: 'Invalid value for diagnosed field' });
    }

    if (diagnosed === 'Yes' && !diagnosisDetails) {
      return res.status(400).json({ error: 'Diagnosis details required' });
    }

    const existingSurvey = await Survey.findOne({ user: req.userId });
    if (existingSurvey) {
      return res.status(400).json({ error: 'Survey already submitted' });
    }

    const newSurvey = new Survey({
      user: req.userId,
      ageRange,
      gender,
      concerns,
      otherConcern,
      diagnosed,
      diagnosisDetails
    });

    await newSurvey.save();
    res.json({ message: 'Survey submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default surveyRouter;