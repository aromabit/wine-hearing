"use client"

import { CSSProperties, useEffect, useRef, useState } from "react"
import { inputStyle } from "@/components/elements/form"

type SpeechRecognitionResultLike = {
  [index: number]: { transcript: string }
}

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>
}

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

const getSpeechRecognitionConstructor = (): SpeechRecognitionConstructor | undefined => {
  if (typeof window === "undefined") return undefined
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition
}

export const SpeechTextarea = ({
  id,
  name,
  defaultValue,
  placeholder,
  style,
}: {
  id: string
  name: string
  defaultValue?: string
  placeholder?: string
  style?: CSSProperties
}) => {
  const [value, setValue] = useState(defaultValue ?? "")
  const [listening, setListening] = useState(false)
  const [supported] = useState(() => !!getSpeechRecognitionConstructor())
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const baseValueRef = useRef("")

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop()
      return
    }

    const Recognition = getSpeechRecognitionConstructor()
    if (!Recognition) return

    const recognition = new Recognition()
    recognition.lang = "ja-JP"
    recognition.continuous = true
    recognition.interimResults = true
    baseValueRef.current = value ? `${value} ` : ""

    recognition.onresult = (event) => {
      let transcript = ""
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setValue(baseValueRef.current + transcript)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  return (
    <div style={{ position: "relative" }}>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputStyle, ...style, paddingRight: supported ? "2.75rem" : style?.paddingRight }}
      />
      {supported && (
        <button
          type="button"
          onClick={toggleListening}
          aria-label={listening ? "音声入力を停止" : "音声入力を開始"}
          title={listening ? "音声入力を停止" : "音声入力を開始"}
          style={{
            position: "absolute",
            top: ".5rem",
            right: ".5rem",
            width: "1.9rem",
            height: "1.9rem",
            borderRadius: "50%",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            background: listening ? "#b3261e" : "var(--color-primary)",
            color: "#fff",
          }}
        >
          {listening ? "■" : "🎤"}
        </button>
      )}
    </div>
  )
}
