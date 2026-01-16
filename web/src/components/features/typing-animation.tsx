import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TypingAnimationProps {
  text: string;
  typingSpeed?: number;
  startDelay?: number;
  showCursor?: boolean;
  cursorBlinkSpeed?: number;
  onComplete?: () => void;
  className?: string;
}

export function TypingAnimation({
  text,
  typingSpeed = 50,
  startDelay = 500,
  showCursor = true,
  cursorBlinkSpeed = 530,
  onComplete,
  className,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursorBlink, setShowCursorBlink] = useState(true);
  const indexRef = useRef(0);

  useEffect(() => {
    // Start delay before typing
    const startTimer = setTimeout(() => {
      setIsTyping(true);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [startDelay]);

  useEffect(() => {
    if (!isTyping) return;

    if (indexRef.current < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      }, typingSpeed);

      return () => clearTimeout(timer);
    } else {
      onComplete?.();
    }
  }, [isTyping, displayedText, text, typingSpeed, onComplete]);

  // Cursor blink effect
  useEffect(() => {
    if (!showCursor) return;

    const blinkTimer = setInterval(() => {
      setShowCursorBlink((prev) => !prev);
    }, cursorBlinkSpeed);

    return () => clearInterval(blinkTimer);
  }, [showCursor, cursorBlinkSpeed]);

  return (
    <span className={cn('inline-block', className)}>
      {displayedText}
      {showCursor && (
        <span
          className={cn(
            'ml-0.5 inline-block w-[3px] h-[1em] bg-primary align-middle',
            showCursorBlink ? 'opacity-100' : 'opacity-0',
            'transition-opacity duration-100'
          )}
          aria-hidden="true"
        />
      )}
    </span>
  );
}

interface TerminalCursorProps {
  className?: string;
}

export function TerminalCursor({ className }: TerminalCursorProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible((prev) => !prev);
    }, 530);

    return () => clearInterval(timer);
  }, []);

  return (
    <span
      className={cn(
        'inline-block w-2 h-5 bg-primary ml-0.5 align-middle',
        visible ? 'opacity-100' : 'opacity-0',
        'transition-opacity duration-100',
        className
      )}
      aria-hidden="true"
    />
  );
}

interface TypewriterLoopProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export function TypewriterLoop({
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  className,
}: TypewriterLoopProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);

      return () => clearTimeout(pauseTimer);
    }

    if (isDeleting) {
      if (displayedText.length === 0) {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
        return;
      }

      const deleteTimer = setTimeout(() => {
        setDisplayedText((prev) => prev.slice(0, -1));
      }, deletingSpeed);

      return () => clearTimeout(deleteTimer);
    }

    if (displayedText.length < currentText.length) {
      const typeTimer = setTimeout(() => {
        setDisplayedText(currentText.slice(0, displayedText.length + 1));
      }, typingSpeed);

      return () => clearTimeout(typeTimer);
    }

    // Text is fully typed
    setIsPaused(true);
  }, [displayedText, isDeleting, isPaused, textIndex, texts, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={cn('inline-block', className)}>
      {displayedText}
      <TerminalCursor />
    </span>
  );
}
