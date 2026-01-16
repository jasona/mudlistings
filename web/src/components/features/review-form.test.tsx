import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewForm } from './review-form';

describe('ReviewForm', () => {
  it('renders the form', () => {
    render(<ReviewForm onSubmit={vi.fn()} />);

    expect(screen.getByText('Write a Review')).toBeInTheDocument();
    expect(screen.getByText('Your Rating')).toBeInTheDocument();
    expect(screen.getByLabelText('Title (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Your Review')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Review' })).toBeInTheDocument();
  });

  it('renders edit mode title when initialData is provided', () => {
    render(
      <ReviewForm
        onSubmit={vi.fn()}
        initialData={{ title: 'Test', body: 'Test body', rating: 4 }}
      />
    );

    expect(screen.getByText('Edit Your Review')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update Review' })).toBeInTheDocument();
  });

  it('shows validation error when submitting without rating', async () => {
    const onSubmit = vi.fn();
    render(<ReviewForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Your Review'), 'This is a great MUD with lots of features.');
    fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

    expect(screen.getByText('Please select a rating')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error when review body is empty', async () => {
    const onSubmit = vi.fn();
    render(<ReviewForm onSubmit={onSubmit} />);

    // Click on a star to set rating
    const stars = screen.getAllByRole('button').filter((btn) => !btn.textContent?.includes('Submit'));
    fireEvent.click(stars[3]); // Click 4th star

    fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

    expect(screen.getByText('Please write a review')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error when review body is too short', async () => {
    const onSubmit = vi.fn();
    render(<ReviewForm onSubmit={onSubmit} />);

    // Click on a star to set rating
    const stars = screen.getAllByRole('button').filter((btn) => !btn.textContent?.includes('Submit'));
    fireEvent.click(stars[3]); // Click 4th star

    await userEvent.type(screen.getByLabelText('Your Review'), 'Too short');
    fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

    expect(screen.getByText('Review must be at least 20 characters')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the form with valid data', async () => {
    const onSubmit = vi.fn();
    render(<ReviewForm onSubmit={onSubmit} />);

    // Click on a star to set rating
    const stars = screen.getAllByRole('button').filter((btn) => !btn.textContent?.includes('Submit'));
    fireEvent.click(stars[3]); // Click 4th star for rating of 4

    await userEvent.type(screen.getByLabelText('Title (optional)'), 'Great MUD');
    await userEvent.type(
      screen.getByLabelText('Your Review'),
      'This is an amazing MUD with great gameplay and community.'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Great MUD',
        body: 'This is an amazing MUD with great gameplay and community.',
        rating: 4,
      });
    });
  });

  it('submits without title when not provided', async () => {
    const onSubmit = vi.fn();
    render(<ReviewForm onSubmit={onSubmit} />);

    // Click on a star to set rating
    const stars = screen.getAllByRole('button').filter((btn) => !btn.textContent?.includes('Submit'));
    fireEvent.click(stars[4]); // Click 5th star for rating of 5

    await userEvent.type(
      screen.getByLabelText('Your Review'),
      'This is a review without a title but still valid.'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: undefined,
        body: 'This is a review without a title but still valid.',
        rating: 5,
      });
    });
  });

  it('shows character count', async () => {
    render(<ReviewForm onSubmit={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Your Review'), 'Test review');

    expect(screen.getByText('11/2000')).toBeInTheDocument();
  });

  it('disables submit button when isSubmitting is true', () => {
    render(<ReviewForm onSubmit={vi.fn()} isSubmitting />);

    expect(screen.getByRole('button', { name: 'Submitting...' })).toBeDisabled();
  });

  it('populates form with initial data', () => {
    render(
      <ReviewForm
        onSubmit={vi.fn()}
        initialData={{ title: 'My Title', body: 'My review body text here', rating: 5 }}
      />
    );

    expect(screen.getByLabelText('Title (optional)')).toHaveValue('My Title');
    expect(screen.getByLabelText('Your Review')).toHaveValue('My review body text here');
  });
});
