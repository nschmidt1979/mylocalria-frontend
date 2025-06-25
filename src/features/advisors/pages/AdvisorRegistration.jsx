import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../features/auth/contexts/AuthContext';
import { LoadingSpinner } from '../shared/components/common/LoadingSpinner';
import { db } from '../config/firebase';

const STEPS = {
  PERSONAL_INFO: 'personal_info',
  PROFESSIONAL_INFO: 'professional_info',
  SERVICES: 'services',
  DOCUMENTS: 'documents',
  REVIEW: 'review'
};

const SPECIALIZATIONS = [
  'Retirement Planning',
  'Investment Management',
  'Estate Planning',
  'Tax Planning',
  'Education Planning',
  'Insurance Planning',
  'Debt Management',
  'Business Planning',
  'Divorce Planning',
  'Social Security Planning'
];

const CERTIFICATIONS = [
  'CFP (Certified Financial Planner)',
  'CFA (Chartered Financial Analyst)',
  'CPA (Certified Public Accountant)',
  'ChFC (Chartered Financial Consultant)',
  'CLU (Chartered Life Underwriter)',
  'PFS (Personal Financial Specialist)',
  'AAMS (Accredited Asset Management Specialist)',
  'CRPC (Chartered Retirement Planning Counselor)',
  'CRPS (Chartered Retirement Plans Specialist)',
  'CIMA (Certified Investment Management Analyst)'
];

const AdvisorRegistration = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(STEPS.PERSONAL_INFO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Professional Information
    company: '',
    companyWebsite: '',
    crdNumber: '',
    yearsOfExperience: '',
    feeOnly: false,
    minimumAccountSize: '',
    assetsUnderManagement: '',
    
    // Services and Specializations
    services: [],
    specializations: [],
    certifications: [],
    
    // Documents
    resume: null,
    licenses: [],
    
    // Additional Information
    bio: '',
    investmentPhilosophy: '',
    clientTypes: [],
    languages: []
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else if (type === 'select-multiple') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({
        ...prev,
        [name]: selectedOptions
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]
    }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case STEPS.PERSONAL_INFO:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
          setError('Please fill in all required fields.');
          return false;
        }
        break;
      case STEPS.PROFESSIONAL_INFO:
        if (!formData.company || !formData.crdNumber) {
          setError('Please provide your company name and CRD number.');
          return false;
        }
        break;
      case STEPS.SERVICES:
        if (formData.services.length === 0 || formData.specializations.length === 0) {
          setError('Please select at least one service and specialization.');
          return false;
        }
        break;
      case STEPS.DOCUMENTS:
        if (!formData.resume) {
          setError('Please upload your resume.');
          return false;
        }
        break;
      default:
        break;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      const steps = Object.values(STEPS);
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  };

  const handleBack = () => {
    const steps = Object.values(STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    try {
      setLoading(true);
      setError(null);

      const advisorData = {
        ...formData,
        userId: currentUser.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // TODO: Upload files to Firebase Storage
      // const resumeUrl = await uploadFile(formData.resume, 'resumes');
      // advisorData.resumeUrl = resumeUrl;

      const docRef = await addDoc(collection(db, 'state_adv_part_1_data'), advisorData);
      
      // Update user role
      // await updateUserRole(currentUser.uid, 'advisor');

      navigate(`/advisor/${docRef.id}/onboarding-complete`);
    } catch (err) {
      console.error('Error submitting advisor registration:', err);
      setError('Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = Object.values(STEPS);
    const currentIndex = steps.indexOf(currentStep);

    return (
      <nav aria-label="Progress" className="mb-8">
        <ol className="flex items-center">
          {steps.map((step, index) => (
            <li
              key={step}
              className={`relative ${
                index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    index <= currentIndex
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                {index !== steps.length - 1 && (
                  <div
                    className={`absolute top-4 left-8 -ml-px h-0.5 w-full ${
                      index < currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
              <span className="mt-2 block text-sm font-medium text-gray-900">
                {step.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address *
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number *
        </label>
        <input
          type="tel"
          name="phone"
          id="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Street Address
        </label>
        <input
          type="text"
          name="address"
          id="address"
          value={formData.address}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            name="city"
            id="city"
            value={formData.city}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State
          </label>
          <input
            type="text"
            name="state"
            id="state"
            value={formData.state}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
            ZIP Code
          </label>
          <input
            type="text"
            name="zipCode"
            id="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderProfessionalInfo = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
          Company Name *
        </label>
        <input
          type="text"
          name="company"
          id="company"
          value={formData.company}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700">
          Company Website
        </label>
        <input
          type="url"
          name="companyWebsite"
          id="companyWebsite"
          value={formData.companyWebsite}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="crdNumber" className="block text-sm font-medium text-gray-700">
          CRD Number *
        </label>
        <input
          type="text"
          name="crdNumber"
          id="crdNumber"
          value={formData.crdNumber}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
            Years of Experience
          </label>
          <input
            type="number"
            name="yearsOfExperience"
            id="yearsOfExperience"
            value={formData.yearsOfExperience}
            onChange={handleInputChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="minimumAccountSize" className="block text-sm font-medium text-gray-700">
            Minimum Account Size
          </label>
          <input
            type="text"
            name="minimumAccountSize"
            id="minimumAccountSize"
            value={formData.minimumAccountSize}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="assetsUnderManagement" className="block text-sm font-medium text-gray-700">
          Assets Under Management
        </label>
        <input
          type="text"
          name="assetsUnderManagement"
          id="assetsUnderManagement"
          value={formData.assetsUnderManagement}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="feeOnly"
          id="feeOnly"
          checked={formData.feeOnly}
          onChange={handleInputChange}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="feeOnly" className="ml-2 block text-sm text-gray-900">
          I am a fee-only advisor
        </label>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Services Offered *
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            'Financial Planning',
            'Investment Management',
            'Retirement Planning',
            'Estate Planning',
            'Tax Planning',
            'Insurance Planning',
            'Education Planning',
            'Business Planning'
          ].map((service) => (
            <div key={service} className="flex items-center">
              <input
                type="checkbox"
                id={`service-${service}`}
                checked={formData.services.includes(service)}
                onChange={() => handleMultiSelect('services', service)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={`service-${service}`} className="ml-2 block text-sm text-gray-900">
                {service}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specializations *
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SPECIALIZATIONS.map((specialization) => (
            <div key={specialization} className="flex items-center">
              <input
                type="checkbox"
                id={`specialization-${specialization}`}
                checked={formData.specializations.includes(specialization)}
                onChange={() => handleMultiSelect('specializations', specialization)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={`specialization-${specialization}`} className="ml-2 block text-sm text-gray-900">
                {specialization}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certifications
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CERTIFICATIONS.map((certification) => (
            <div key={certification} className="flex items-center">
              <input
                type="checkbox"
                id={`certification-${certification}`}
                checked={formData.certifications.includes(certification)}
                onChange={() => handleMultiSelect('certifications', certification)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={`certification-${certification}`} className="ml-2 block text-sm text-gray-900">
                {certification}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
          Resume/CV *
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="resume"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload a file</span>
                <input
                  id="resume"
                  name="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleInputChange}
                  className="sr-only"
                  required
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PDF, DOC, or DOCX up to 10MB</p>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="licenses" className="block text-sm font-medium text-gray-700">
          Licenses
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="licenses"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload files</span>
                <input
                  id="licenses"
                  name="licenses"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleInputChange}
                  className="sr-only"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PDF, JPG, or PNG up to 10MB each</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.firstName} {formData.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.phone}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.address}
              <br />
              {formData.city}, {formData.state} {formData.zipCode}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Company</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.company}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">CRD Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.crdNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Years of Experience</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.yearsOfExperience}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fee Structure</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.feeOnly ? 'Fee-Only' : 'Fee-Based'}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Services & Specializations</h3>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Services</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.services.join(', ')}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Specializations</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.specializations.join(', ')}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Certifications</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.certifications.join(', ')}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case STEPS.PERSONAL_INFO:
        return renderPersonalInfo();
      case STEPS.PROFESSIONAL_INFO:
        return renderProfessionalInfo();
      case STEPS.SERVICES:
        return renderServices();
      case STEPS.DOCUMENTS:
        return renderDocuments();
      case STEPS.REVIEW:
        return renderReview();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Advisor Registration</h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete your profile to join our network of financial advisors
          </p>
        </div>

        {renderStepIndicator()}

        <div className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            {renderCurrentStep()}

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              {currentStep !== STEPS.PERSONAL_INFO && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
              )}
              <div className="flex-1" />
              {currentStep !== STEPS.REVIEW ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner className="h-5 w-5 mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Registration'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdvisorRegistration; 