import os, tempfile, requests
from gtts import gTTS
from pydub import AudioSegment
text = "Hello Nalam assistant. This is a test."
mp3 = tempfile.mktemp(suffix=".mp3"); wav = tempfile.mktemp(suffix=".wav")
gTTS(text=text, lang="en", slow=False).save(mp3)
seg = AudioSegment.from_file(mp3).set_channels(1).set_frame_rate(16000)
seg.export(wav, format="wav")
files = {"audio": ("test.wav", open(wav, "rb"), "audio/wav")}
data = {"language": "en"}
r = requests.post("http://localhost:5000/api/transcribe", files=files, data=data)
print(r.status_code); print(r.text)
os.unlink(mp3); os.unlink(wav)
