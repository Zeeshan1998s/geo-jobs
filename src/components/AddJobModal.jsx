import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';

export default function AddJobModal({ isOpen, onClose, coordinates, onAddJob }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    logo: '💼',
    industry: 'Tech',
    type: 'Full-time',
    experience: '2+ years',
    salary: '',
    location: '',
    description: '',
    requirements: '',
    benefits: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.location || !formData.salary || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }

    const newJob = {
      id: `custom-${Date.now()}`,
      title: formData.title,
      company: formData.company,
      logo: formData.logo,
      industry: formData.industry,
      type: formData.type,
      experience: formData.experience,
      salary: formData.salary,
      postedDate: "Just now",
      location: formData.location,
      coordinates: coordinates,
      description: formData.description,
      requirements: formData.requirements ? formData.requirements.split('\n').filter(r => r.trim() !== '') : [],
      benefits: formData.benefits ? formData.benefits.split('\n').filter(b => b.trim() !== '') : []
    };

    onAddJob(newJob);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Post a New Job Pin</h3>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            {error && <div style={{ color: 'var(--accent-crimson)', marginBottom: '15px', fontSize: '0.85rem' }}>{error}</div>}
            
            <div className="form-group">
              <label>Location Coordinates</label>
              <div className="coordinates-display">
                <MapPin size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Latitude: {coordinates.lat.toFixed(6)}, Longitude: {coordinates.lng.toFixed(6)}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Job Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  placeholder="e.g., Senior React Developer"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="company">Company Name *</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="form-input"
                  placeholder="e.g., Acme Corp"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="logo">Company Icon (Emoji) *</label>
                <select
                  id="logo"
                  name="logo"
                  className="form-select"
                  value={formData.logo}
                  onChange={handleChange}
                >
                  <option value="💼">💼 Office/General</option>
                  <option value="💻">💻 Tech/Code</option>
                  <option value="🎨">🎨 Design/Art</option>
                  <option value="📈">📈 Marketing/Growth</option>
                  <option value="🧠">🧠 AI/Research</option>
                  <option value="💳">💳 Fintech/Finance</option>
                  <option value="🚀">🚀 Space/Startup</option>
                  <option value="☕">☕ Cafe/Social</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="industry">Industry *</label>
                <select
                  id="industry"
                  name="industry"
                  className="form-select"
                  value={formData.industry}
                  onChange={handleChange}
                >
                  <option value="Tech">Tech</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Job Type *</label>
                <select
                  id="type"
                  name="type"
                  className="form-select"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="salary">Salary Range *</label>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  className="form-input"
                  placeholder="e.g. $100k - $120k or ₹12L - ₹15L"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Exact Office Location Address *</label>
              <input
                type="text"
                id="location"
                name="location"
                className="form-input"
                placeholder="e.g. Rent A Desk, Madhapur, Hyderabad, India"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Job Description *</label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                placeholder="Describe the job responsibility and details..."
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="requirements">Requirements (One per line)</label>
              <textarea
                id="requirements"
                name="requirements"
                className="form-textarea"
                placeholder="e.g.&#10;5+ years experience with React&#10;Knowledge of Leaflet maps&#10;Strong communication skills"
                value={formData.requirements}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="benefits">Benefits & Perks (One per line)</label>
              <textarea
                id="benefits"
                name="benefits"
                className="form-textarea"
                placeholder="e.g.&#10;Premium health insurance&#10;Free catered lunch daily&#10;Latest MacBook Pro setup"
                value={formData.benefits}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit">Publish Pin</button>
          </div>
        </form>
      </div>
    </div>
  );
}
