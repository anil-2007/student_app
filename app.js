// ================= IMPORT FIREBASE =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyDicSrO-L4q6_dT-at7Nh2kV53f-F_LV2o",
  authDomain: "smartstudyhub-d9383.firebaseapp.com",
  projectId: "smartstudyhub-d9383",
  storageBucket: "smartstudyhub-d9383.firebasestorage.app",
  messagingSenderId: "286795960390",
  appId: "1:286795960390:web:beb8692c312273316fba47",
  measurementId: "G-CSMBNMT9W3",
};

// Initialize Firebase + Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= SNACKBAR =================
function showSnackbar(message) {
  const bar = document.getElementById("snackbar");
  bar.textContent = message;
  bar.className = "show";
  setTimeout(() => {
    bar.className = bar.className.replace("show", "");
  }, 3000);
}

// ================= NOTES MANAGER =================
window.addNote = async function () {
  const noteInput = document.getElementById("noteInput");
  const noteText = noteInput.value.trim();

  if (noteText) {
    await addDoc(collection(db, "notes"), {
      text: noteText,
      timestamp: Date.now(),
    });
    noteInput.value = "";
    showSnackbar("✅ Note added!");
  }
};

// Real-time notes
const notesQuery = query(collection(db, "notes"), orderBy("timestamp", "desc"));
onSnapshot(notesQuery, (snapshot) => {
  const notesList = document.getElementById("notesList");
  notesList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const note = docSnap.data();
    const li = document.createElement("li");
    li.textContent = note.text;

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.style.marginLeft = "10px";
    delBtn.onclick = async () => {
      await deleteDoc(doc(db, "notes", docSnap.id));
      showSnackbar("🗑️ Note deleted!");
    };

    li.appendChild(delBtn);
    notesList.appendChild(li);
  });
});

// ================= DEADLINE TRACKER =================
window.addDeadline = async function () {
  const titleInput = document.getElementById("deadlineTitle");
  const dateInput = document.getElementById("deadlineDate");

  const title = titleInput.value.trim();
  const dateValue = dateInput.value;

  if (title && dateValue) {
    await addDoc(collection(db, "deadlines"), {
      title: title,
      date: Timestamp.fromDate(new Date(dateValue)),
      createdAt: Date.now(),
    });
    titleInput.value = "";
    dateInput.value = "";
    showSnackbar("✅ Deadline added!");
  }
};

// Real-time deadlines
const dq = query(collection(db, "deadlines"), orderBy("date", "asc"));
onSnapshot(dq, (snapshot) => {
  const deadlinesList = document.getElementById("deadlinesList");
  deadlinesList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const deadline = docSnap.data();
    const li = document.createElement("li");

    const formattedDate = deadline.date.toDate().toDateString();
    li.textContent = `${deadline.title} - ${formattedDate}`;

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.style.marginLeft = "10px";
    delBtn.onclick = async () => {
      await deleteDoc(doc(db, "deadlines", docSnap.id));
      showSnackbar("🗑️ Deadline deleted!");
    };

    li.appendChild(delBtn);
    deadlinesList.appendChild(li);
  });
});

// ================= MOTIVATION BOOSTER =================
const fallbackQuotes = [
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Success is not in what you have, but who you are.", author: "Bo Bennett" },
  { text: "Dream bigger. Do bigger.", author: "Unknown" },
  { text: "Your limitation—it’s only your imagination.", author: "Unknown" },
  { text: "Don’t stop when you’re tired. Stop when you’re done.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Little things make big days.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Unknown" },
  { text: "It’s going to be hard, but hard does not mean impossible.", author: "Unknown" },
  { text: "Don’t wait for opportunity. Create it.", author: "Unknown" },
  { text: "Sometimes later becomes never. Do it now.", author: "Unknown" },
  { text: "Stay focused and never give up.", author: "Unknown" },
  { text: "Believe in yourself and all that you are.", author: "Christian D. Larson" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "With the new day comes new strength and new thoughts.", author: "Eleanor Roosevelt" },
  { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
  { text: "Keep your face always toward the sunshine—and shadows will fall behind you.", author: "Walt Whitman" },
  { text: "It always seems impossible until it’s done.", author: "Nelson Mandela" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
];

window.getQuote = function () {
  const outputEl = document.getElementById("quoteText");
  const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
  const quoteObj = fallbackQuotes[randomIndex];
  outputEl.textContent = `"${quoteObj.text}" — ${quoteObj.author}`;
  showSnackbar("✨ New quote loaded!");
};

// ================= AI STUDY ASSISTANT (Gemini) =================
const GEMINI_API_KEY = ""; // 🔑 Replace with your key

window.askAI = async function () {
  const inputEl = document.getElementById("aiInput");
  const outputEl = document.getElementById("aiOutput");
  const question = inputEl.value.trim();

  if (!question) {
    showSnackbar("⚠️ Please enter a question!");
    return;
  }

  outputEl.textContent = "⏳ Thinking...";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: question }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error("❌ Gemini API request failed");
    }

    const data = await response.json();
    const aiReply =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response from Gemini.";
    outputEl.textContent = aiReply;
    showSnackbar("✅ Answer received!");
  } catch (error) {
    console.error(error);
    outputEl.textContent = "⚠️ No response from AI.";
    showSnackbar("⚠️ Failed to reach AI");
  }
};
