import React, { useEffect, useState } from "react";
import {
  initializeApp
} from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDpBLEkqQsLdYfXBJSz-PizkpghUJu9UjY",
  authDomain: "projects-6f7c1.firebaseapp.com",
  projectId: "projects-6f7c1",
  storageBucket: "projects-6f7c1.firebasestorage.app",
  messagingSenderId: "379253534301",
  appId: "1:379253534301:web:6b0f37a3820fa1ce2767b4",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user]);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      alert(err.message);
    }
  };

  const signOutUser = () => {
    signOut(auth);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addDoc(collection(db, "tasks"), {
      title: title.trim(),
      status: "To-Do",
      createdBy: user.uid,
      assignedTo: user.email,
      createdAt: serverTimestamp(),
    });
    setTitle("");
  };

  const updateStatus = async (task) => {
    const nextStatus =
      task.status === "To-Do" ? "Doing" : task.status === "Doing" ? "Done" : "Done";
    const taskRef = doc(db, "tasks", task.id);
    await updateDoc(taskRef, { status: nextStatus });
  };

  if (!user)
    return (
      <div style={{ padding: 20 }}>
        <h1>FireTask - Sign In</h1>
        <button onClick={signIn}>Sign in with Google</button>
      </div>
    );

  return (
    <div style={{ padding: 20 }}>
      <h1>FireTask - Welcome, {user.displayName}</h1>
      <button onClick={signOutUser}>Sign Out</button>

      <form onSubmit={addTask} style={{ marginTop: 20 }}>
        <input
          placeholder="New task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: 8, width: "300px" }}
        />
        <button type="submit" style={{ marginLeft: 10, padding: "8px 12px" }}>
          Add Task
        </button>
      </form>

      <div style={{ display: "flex", marginTop: 30, gap: 40 }}>
        {["To-Do", "Doing", "Done"].map((status) => (
          <div key={status} style={{ flex: 1 }}>
            <h2>{status}</h2>
            {tasks.filter((t) => t.status === status).length === 0 && (
              <p>No tasks</p>
            )}
            {tasks
              .filter((t) => t.status === status)
              .map((task) => (
                <div
                  key={task.id}
                  style={{
                    border: "1px solid #ccc",
                    padding: 10,
                    marginBottom: 10,
                    borderRadius: 5,
                  }}
                >
                  <p>
                    <strong>{task.title}</strong>
                  </p>
                  <p>Assigned to: {task.assignedTo}</p>
                  {status !== "Done" && (
                    <button onClick={() => updateStatus(task)}>
                      Move to {status === "To-Do" ? "Doing" : "Done"}
                    </button>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
