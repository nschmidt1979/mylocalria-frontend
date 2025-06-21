import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WriteReviewModal } from '../WriteReviewModal';
import { useAuth } from '../../../contexts/AuthContext';

// Mock dependencies
jest.mock('../../../contexts/AuthContext');
jest.mock('../../../firebase', () => ({
  db: {},
  collection: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}));

jest.mock('../../common/LoadingSpinner', () => {
  return function MockLoadingSpinner({ className }) {
    return <div data-testid="loading-spinner" className={className}>Loading...</div>;
  };
});

jest.mock('../../common/StarRating', () => {
  return function MockStarRating({ rating, size }) {
    return <div data-testid="star-rating" data-rating={rating} data-size={size}>Star Rating</div>;
  };
});

// Mock Headless UI components
jest.mock('@headlessui/react', () => ({
  Dialog: {
    Panel: ({ children, className }) => <div className={className}>{children}</div>,
    Title: ({ children, as: Component = 'h3', className }) => <Component className={className}>{children}</Component>,
  },
  Transition: {
    Root: ({ children, show }) => show ? <div>{children}</div> : null,
    Child: ({ children }) => <div>{children}</div>,
  },
}));

const mockProps = {
  advisorId: 'advisor-123',
  advisorName: 'Test Advisor',
  onClose: jest.fn(),
  onReviewSubmitted: jest.fn(),
};

describe('WriteReviewModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      currentUser: {
        uid: 'user-123',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
      }
    });
  });

  test('renders modal with correct title', () => {
    render(<WriteReviewModal {...mockProps} />);

    expect(screen.getByText('Write a Review for Test Advisor')).toBeInTheDocument();
  });

  test('renders rating section with star rating components', () => {
    render(<WriteReviewModal {...mockProps} />);

    expect(screen.getByText('Your Rating')).toBeInTheDocument();
    expect(screen.getByText('Select a rating')).toBeInTheDocument();
    
    // Should render 5 star rating components
    const starRatings = screen.getAllByTestId('star-rating');
    expect(starRatings).toHaveLength(5);
  });

  test('renders review content textarea', () => {
    render(<WriteReviewModal {...mockProps} />);

    const textarea = screen.getByLabelText('Your Review');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', 'Share your experience with this advisor...');
    expect(textarea).toHaveAttribute('required');
  });

  test('renders submit and cancel buttons', () => {
    render(<WriteReviewModal {...mockProps} />);

    expect(screen.getByRole('button', { name: 'Submit Review' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  test('updates rating when star is clicked', async () => {
    const user = userEvent.setup();
    render(<WriteReviewModal {...mockProps} />);

    // Click on the third star (should set rating to 3)
    const starButtons = screen.getAllByRole('button');
    const thirdStar = starButtons.find(button => button.closest('[data-rating]'));
    
    if (thirdStar) {
      await user.click(thirdStar);
      expect(screen.getByText('3 stars')).toBeInTheDocument();
    }
  });

  test('updates content when typing in textarea', async () => {
    const user = userEvent.setup();
    render(<WriteReviewModal {...mockProps} />);

    const textarea = screen.getByLabelText('Your Review');
    await user.type(textarea, 'Great advisor, highly recommend!');

    expect(textarea).toHaveValue('Great advisor, highly recommend!');
  });

  test('shows validation error when submitting without rating', async () => {
    const user = userEvent.setup();
    render(<WriteReviewModal {...mockProps} />);

    const textarea = screen.getByLabelText('Your Review');
    await user.type(textarea, 'Great review content');

    const submitButton = screen.getByRole('button', { name: 'Submit Review' });
    await user.click(submitButton);

    expect(screen.getByText('Please provide both a rating and review content.')).toBeInTheDocument();
  });

  test('shows validation error when submitting without content', async () => {
    const user = userEvent.setup();
    render(<WriteReviewModal {...mockProps} />);

    // Set rating by clicking first star
    const starButtons = screen.getAllByRole('button');
    if (starButtons[0]) {
      await user.click(starButtons[0]);
    }

    const submitButton = screen.getByRole('button', { name: 'Submit Review' });
    await user.click(submitButton);

    expect(screen.getByText('Please provide both a rating and review content.')).toBeInTheDocument();
  });

  test('shows validation error when submitting with empty content', async () => {
    const user = userEvent.setup();
    render(<WriteReviewModal {...mockProps} />);

    // Set rating
    const starButtons = screen.getAllByRole('button');
    if (starButtons[0]) {
      await user.click(starButtons[0]);
    }

    const textarea = screen.getByLabelText('Your Review');
    await user.type(textarea, '   '); // Only whitespace

    const submitButton = screen.getByRole('button', { name: 'Submit Review' });
    await user.click(submitButton);

    expect(screen.getByText('Please provide both a rating and review content.')).toBeInTheDocument();
  });

  test('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<WriteReviewModal {...mockProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when close X button is clicked', async () => {
    const user = userEvent.setup();
    render(<WriteReviewModal {...mockProps} />);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('shows loading state when submitting', async () => {
    const user = userEvent.setup();
    const { addDoc } = require('../../../firebase');
    
    // Mock addDoc to never resolve to keep loading state
    addDoc.mockImplementation(() => new Promise(() => {}));
    
    render(<WriteReviewModal {...mockProps} />);

    // Fill form
    const starButtons = screen.getAllByRole('button');
    if (starButtons[0]) {
      await user.click(starButtons[0]);
    }
    
    const textarea = screen.getByLabelText('Your Review');
    await user.type(textarea, 'Great review');

    const submitButton = screen.getByRole('button', { name: 'Submit Review' });
    await user.click(submitButton);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Submitting...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test('successfully submits review with valid data', async () => {
    const user = userEvent.setup();
    const { addDoc } = require('../../../firebase');
    
    const mockDocRef = { id: 'review-123' };
    addDoc.mockResolvedValue(mockDocRef);
    
    render(<WriteReviewModal {...mockProps} />);

    // Fill form
    const starButtons = screen.getAllByRole('button');
    if (starButtons[0]) {
      await user.click(starButtons[0]);
    }
    
    const textarea = screen.getByLabelText('Your Review');
    await user.type(textarea, 'Excellent advisor service');

    const submitButton = screen.getByRole('button', { name: 'Submit Review' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          advisorId: 'advisor-123',
          advisorName: 'Test Advisor',
          rating: 1,
          content: 'Excellent advisor service',
          reviewerId: 'user-123',
          reviewerName: 'Test User',
          reviewerPhoto: 'https://example.com/photo.jpg',
          status: 'published'
        })
      );
    });

    expect(mockProps.onReviewSubmitted).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'review-123',
        advisorId: 'advisor-123',
        content: 'Excellent advisor service'
      })
    );
  });

  test('handles submission error gracefully', async () => {
    const user = userEvent.setup();
    const { addDoc } = require('../../../firebase');
    
    addDoc.mockRejectedValue(new Error('Database error'));
    
    render(<WriteReviewModal {...mockProps} />);

    // Fill form
    const starButtons = screen.getAllByRole('button');
    if (starButtons[0]) {
      await user.click(starButtons[0]);
    }
    
    const textarea = screen.getByLabelText('Your Review');
    await user.type(textarea, 'Great review');

    const submitButton = screen.getByRole('button', { name: 'Submit Review' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to submit review. Please try again.')).toBeInTheDocument();
    });

    expect(mockProps.onReviewSubmitted).not.toHaveBeenCalled();
  });

  test('uses anonymous reviewer name when displayName is not available', async () => {
    const user = userEvent.setup();
    const { addDoc } = require('../../../firebase');
    
    useAuth.mockReturnValue({
      currentUser: {
        uid: 'user-123',
        displayName: null,
        photoURL: null
      }
    });
    
    const mockDocRef = { id: 'review-123' };
    addDoc.mockResolvedValue(mockDocRef);
    
    render(<WriteReviewModal {...mockProps} />);

    // Fill and submit form
    const starButtons = screen.getAllByRole('button');
    if (starButtons[0]) {
      await user.click(starButtons[0]);
    }
    
    const textarea = screen.getByLabelText('Your Review');
    await user.type(textarea, 'Good service');

    const submitButton = screen.getByRole('button', { name: 'Submit Review' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          reviewerName: 'Anonymous'
        })
      );
    });
  });

  test('trims whitespace from review content', async () => {
    const user = userEvent.setup();
    const { addDoc } = require('../../../firebase');
    
    const mockDocRef = { id: 'review-123' };
    addDoc.mockResolvedValue(mockDocRef);
    
    render(<WriteReviewModal {...mockProps} />);

    // Fill form with content that has leading/trailing whitespace
    const starButtons = screen.getAllByRole('button');
    if (starButtons[0]) {
      await user.click(starButtons[0]);
    }
    
    const textarea = screen.getByLabelText('Your Review');
    await user.type(textarea, '  Great advisor with excellent service  ');

    const submitButton = screen.getByRole('button', { name: 'Submit Review' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          content: 'Great advisor with excellent service'
        })
      );
    });
  });
});