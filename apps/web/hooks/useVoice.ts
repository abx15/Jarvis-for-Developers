"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseVoiceOptions {
    onTranscript?: (transcript: string) => void;
    onFinalTranscript?: (transcript: string) => void;
    language?: string;
    continuous?: boolean;
    interimResults?: boolean;
}

export const useVoice = (options: UseVoiceOptions = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    const {
        onTranscript,
        onFinalTranscript,
        language = "en-US",
        continuous = true,
        interimResults = true,
    } = options;

    useEffect(() => {
        // Check for browser support
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError("Web Speech API is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onerror = (event: any) => {
            setError(event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            let currentTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                currentTranscript += result[0].transcript;

                if (result.isFinal && onFinalTranscript) {
                    onFinalTranscript(result[0].transcript);
                }
            }

            setTranscript(currentTranscript);
            if (onTranscript) {
                onTranscript(currentTranscript);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [language, continuous, interimResults, onTranscript, onFinalTranscript]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript("");
            recognitionRef.current.start();
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript("");
    }, []);

    return {
        isListening,
        transcript,
        error,
        startListening,
        stopListening,
        resetTranscript,
    };
};
