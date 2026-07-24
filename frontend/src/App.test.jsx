import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders Vite and React logos', () => {
    render(<App />);
    const heading = screen.getByText(/Get started/i);
    expect(heading).toBeInTheDocument();
  });
});
