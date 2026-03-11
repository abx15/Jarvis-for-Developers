import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAIStreamOptions {
    onToken?: (token: string) => void;
    onComplete?: (fullText: string) => void;
    onError?: (error: string) => void;
    userId?: number;
}

export function useAIStream(options: UseAIStreamOptions = {}) {
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentResponse, setCurrentResponse] = useState('');
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<WebSocket | null>(null);

    const connect = useCallback(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Using a default port 8000 for FastAPI if not specified
        const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/ai-stream?user_id=${options.userId || 1}`;

        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('AI Stream WebSocket connected');
            setError(null);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.error) {
                setError(data.error);
                setIsStreaming(false);
                options.onError?.(data.error);
                return;
            }

            if (data.status === 'started') {
                setIsStreaming(true);
                setCurrentResponse('');
            } else if (data.status === 'completed') {
                setIsStreaming(false);
                options.onComplete?.(currentResponse);
            } else if (data.token) {
                setCurrentResponse((prev) => {
                    const next = prev + data.token;
                    options.onToken?.(data.token);
                    return next;
                });
            }
        };

        socket.onclose = () => {
            console.log('AI Stream WebSocket disconnected');
            setIsStreaming(false);
        };

        socket.onerror = (err) => {
            console.error('WebSocket error:', err);
            setError('Connection failed');
            setIsStreaming(false);
        };

        socketRef.current = socket;
    }, [options]);

    useEffect(() => {
        connect();
        return () => {
            socketRef.current?.close();
        };
    }, [connect]);

    const stream = useCallback((prompt: string, type: string = 'chat') => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            connect();
            // Wait for open
            const interval = setInterval(() => {
                if (socketRef.current?.readyState === WebSocket.OPEN) {
                    socketRef.current.send(JSON.stringify({ prompt, type }));
                    clearInterval(interval);
                }
            }, 100);
            return;
        }

        socketRef.current.send(JSON.stringify({ prompt, type }));
    }, [connect]);

    const reset = useCallback(() => {
        setCurrentResponse('');
        setError(null);
        setIsStreaming(false);
    }, []);

    return {
        stream,
        isStreaming,
        currentResponse,
        error,
        reset
    };
}
