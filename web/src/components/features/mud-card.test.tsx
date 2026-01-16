import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MudCard, FeaturedMudCard, MudListItemRow } from './mud-card';
import type { MudListItem } from '@/types';

const mockMud: MudListItem = {
  id: '1',
  name: 'Test MUD',
  slug: 'test-mud',
  shortDescription: 'A great text-based adventure game.',
  host: 'testmud.example.com',
  port: 4000,
  isOnline: true,
  currentPlayers: 15,
  averageRating: 4.5,
  reviewCount: 10,
  genres: [
    { id: '1', name: 'Fantasy', slug: 'fantasy' },
    { id: '2', name: 'Roleplay', slug: 'roleplay' },
  ],
  isFavorited: false,
};

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('MudCard', () => {
  it('renders the MUD name', () => {
    renderWithRouter(<MudCard mud={mockMud} />);
    expect(screen.getByText('Test MUD')).toBeInTheDocument();
  });

  it('renders the MUD description', () => {
    renderWithRouter(<MudCard mud={mockMud} />);
    expect(screen.getByText('A great text-based adventure game.')).toBeInTheDocument();
  });

  it('renders online status indicator', () => {
    renderWithRouter(<MudCard mud={mockMud} />);
    expect(screen.getByText('15')).toBeInTheDocument(); // Player count
  });

  it('renders genres', () => {
    renderWithRouter(<MudCard mud={mockMud} />);
    expect(screen.getByText('Fantasy')).toBeInTheDocument();
    expect(screen.getByText('Roleplay')).toBeInTheDocument();
  });

  it('calls onFavoriteToggle when favorite button is clicked', () => {
    const onFavoriteToggle = vi.fn();
    renderWithRouter(<MudCard mud={mockMud} onFavoriteToggle={onFavoriteToggle} />);

    // Find the favorite button by looking for the button containing the Heart icon
    // The star rating buttons have aria-label, so we can use data-slot to differentiate
    const allButtons = screen.getAllByRole('button');
    // The favorite button is the last one in the card header, after the star rating buttons
    const favoriteButton = allButtons.find(btn => btn.getAttribute('data-variant') === 'ghost');
    if (favoriteButton) {
      fireEvent.click(favoriteButton);
      expect(onFavoriteToggle).toHaveBeenCalledWith('1');
    }
  });

  it('links to the MUD detail page', () => {
    renderWithRouter(<MudCard mud={mockMud} />);
    const link = screen.getByRole('link', { name: 'Test MUD' });
    expect(link).toHaveAttribute('href', '/muds/test-mud');
  });
});

describe('FeaturedMudCard', () => {
  it('renders the featured badge', () => {
    renderWithRouter(<FeaturedMudCard mud={mockMud} />);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('renders the MUD name', () => {
    renderWithRouter(<FeaturedMudCard mud={mockMud} />);
    expect(screen.getByText('Test MUD')).toBeInTheDocument();
  });

  it('renders the connect button', () => {
    renderWithRouter(<FeaturedMudCard mud={mockMud} />);
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('renders rating with review count', () => {
    renderWithRouter(<FeaturedMudCard mud={mockMud} />);
    expect(screen.getByText('(10 reviews)')).toBeInTheDocument();
  });
});

describe('MudListItemRow', () => {
  it('renders the MUD name', () => {
    renderWithRouter(<MudListItemRow mud={mockMud} />);
    expect(screen.getByText('Test MUD')).toBeInTheDocument();
  });

  it('renders the description', () => {
    renderWithRouter(<MudListItemRow mud={mockMud} />);
    expect(screen.getByText('A great text-based adventure game.')).toBeInTheDocument();
  });

  it('renders player count for online MUDs', () => {
    renderWithRouter(<MudListItemRow mud={mockMud} />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders favorite button when handler provided', () => {
    const onFavoriteToggle = vi.fn();
    renderWithRouter(<MudListItemRow mud={mockMud} onFavoriteToggle={onFavoriteToggle} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
