import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref as dbRef,
  onValue,
  set,
  update
} from 'firebase/database';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDbdP8mA5GGOasjuZNsOuL2qxpPr2IXS9g",
  authDomain: "eventpulse-970ac.firebaseapp.com",
  projectId: " eventpulse-970ac",
  storageBucket: "eventpulse-970ac.firebasestorage.app",
  messagingSenderId: "591916853980",
  appId: "1:591916853980:web:218461d99c34d0ddbe2219",
  databaseURL: "https://eventpulse-970ac-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const firestore = getFirestore(app);

export default function App() {
  const [poll, setPoll] = useState({
    question: "What's your favorite language?",
    options: { JavaScript: 0, Python: 0, Java: 0 }
  });

  const [selected, setSelected] = useState('');

  useEffect(() => {
    const pollRef = dbRef(db, 'poll');
    onValue(pollRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setPoll(data);
    });
  }, []);

  const vote = () => {
    if (!selected) return;
    const optionPath = `poll/options/${selected}`;
    const optionRef = dbRef(db, optionPath);
    set(optionRef, poll.options[selected] + 1);
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    const feedback = e.target.elements.feedback.value;
    if (feedback) {
      await addDoc(collection(firestore, 'feedbacks'), { feedback, time: Date.now() });
      alert('Thanks for your feedback!');
      e.target.reset();
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h2>{poll.question}</h2>
      {Object.keys(poll.options).map((opt) => (
        <div key={opt}>
          <label>
            <input
              type="radio"
              name="option"
              value={opt}
              onChange={(e) => setSelected(e.target.value)}
            />
            {opt} ({poll.options[opt]})
          </label>
        </div>
      ))}
      <button onClick={vote} style={{ marginTop: 10 }}>Vote</button>

      <hr />
      <h3>Anonymous Feedback</h3>
      <form onSubmit={handleFeedback}>
        <textarea name="feedback" rows="4" cols="40" required></textarea><br />
        <button type="submit">Submit Feedback</button>
      </form>
    </div>
  );
}
