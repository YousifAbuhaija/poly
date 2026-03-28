import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AskPolyChat from '../../components/AskPolyChat';
import * as chatService from '../../services/AskPolyChatService';
import type { ChatMessage, LocationResult } from '../../types';

// Mock AppContext
const mockLocation: LocationResult = {
  city: 'Beverly Hills',
  county: 'Los Angeles',
  state: 'CA',
};

let mockChatHistory: ChatMessage[] = [];
const mockSetChatHistory = vi.fn((history: ChatMessage[]) => {
  mockChatHistory = history;
});

vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({
    location: mockLocation,
    chatHistory: mockChatHistory,
    setChatHistory: mockSetChatHistory,
  }),
}));

beforeEach(() => {
  vi.restoreAllMocks();
  mockChatHistory = [];
  mockSetChatHistory.mockClear();
});

describe('AskPolyChat', () => {
  it('renders text input and send button', () => {
    render(<AskPolyChat />);
    expect(screen.getByPlaceholderText('Ask Poly a question…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('shows example prompts when chat history is empty', () => {
    render(<AskPolyChat />);
    expect(screen.getByText("What's on my ballot?")).toBeInTheDocument();
    expect(screen.getByText('Explain ranked choice voting')).toBeInTheDocument();
    expect(screen.getByText('Who represents me?')).toBeInTheDocument();
  });

  it('disables send button when input is empty', () => {
    render(<AskPolyChat />);
    const sendBtn = screen.getByRole('button', { name: 'Send' });
    expect(sendBtn).toBeDisabled();
  });

  it('enables send button when input has text', () => {
    render(<AskPolyChat />);
    const input = screen.getByPlaceholderText('Ask Poly a question…');
    fireEvent.change(input, { target: { value: 'Hello' } });
    const sendBtn = screen.getByRole('button', { name: 'Send' });
    expect(sendBtn).not.toBeDisabled();
  });

  it('adds user message to history and calls sendMessage on submit', async () => {
    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: 'Here is info about your ballot.',
      timestamp: 2000,
    };
    vi.spyOn(chatService, 'sendMessage').mockResolvedValueOnce(assistantMsg);

    render(<AskPolyChat />);
    const input = screen.getByPlaceholderText('Ask Poly a question…');
    fireEvent.change(input, { target: { value: 'What is on my ballot?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(mockSetChatHistory).toHaveBeenCalled();
    });

    // First call adds user message
    const firstCall = mockSetChatHistory.mock.calls[0][0];
    expect(firstCall).toHaveLength(1);
    expect(firstCall[0].role).toBe('user');
    expect(firstCall[0].content).toBe('What is on my ballot?');

    // Second call adds assistant response
    await waitFor(() => {
      expect(mockSetChatHistory).toHaveBeenCalledTimes(2);
    });
    const secondCall = mockSetChatHistory.mock.calls[1][0];
    expect(secondCall).toHaveLength(2);
    expect(secondCall[1]).toEqual(assistantMsg);
  });

  it('shows error with retry button on failure', async () => {
    vi.spyOn(chatService, 'sendMessage').mockRejectedValueOnce(
      new Error('Could not generate a response. Please try again.'),
    );

    render(<AskPolyChat />);
    const input = screen.getByPlaceholderText('Ask Poly a question…');
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(
        screen.getByText('Could not generate a response. Please try again.'),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('sends example prompt when clicked', async () => {
    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: 'Your ballot includes...',
      timestamp: 3000,
    };
    vi.spyOn(chatService, 'sendMessage').mockResolvedValueOnce(assistantMsg);

    render(<AskPolyChat />);
    fireEvent.click(screen.getByText("What's on my ballot?"));

    await waitFor(() => {
      expect(mockSetChatHistory).toHaveBeenCalled();
    });

    const firstCall = mockSetChatHistory.mock.calls[0][0];
    expect(firstCall[0].content).toBe("What's on my ballot?");
  });

  it('clears input after sending', async () => {
    vi.spyOn(chatService, 'sendMessage').mockResolvedValueOnce({
      role: 'assistant',
      content: 'Response',
      timestamp: 4000,
    });

    render(<AskPolyChat />);
    const input = screen.getByPlaceholderText('Ask Poly a question…') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'My question' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });
});
