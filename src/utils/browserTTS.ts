export function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (!("speechSynthesis" in window)) return;

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onstart = onStart || null;
  utterance.onend = onEnd || null;

  speechSynthesis.speak(utterance);
}
