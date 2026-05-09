import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are a smart business assistant for small business owners. You help with:
- Drafting professional emails and customer responses
- Writing social media content and captions
- Creating product descriptions
- Answering customer service questions
- Generating marketing ideas and copy
- Summarizing information quickly
- Writing invoices and professional documents

Keep responses practical, actionable, and professional. Speak like a smart business advisor, not a robot. Always be helpful and direct.`;

const SUGGESTIONS = [
"Draft a follow-up email to a client who hasn't responded",
"Write 3 Instagram captions for a new product",
"Create a professional response to a negative review",
"Write a cold email to a potential customer",
"Generate 5 marketing ideas to boost sales",
];

const API_KEY = "PASTE_YOUR_API_KEY_HERE";

async function callClaude(messages) {
const res = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",
headers: {
"Content-Type": "application/json",
"x-api-key": API_KEY,
},
body: JSON.stringify({
model: "claude-haiku-4-5-20251001",
max_tokens: 1000,
system: SYSTEM_PROMPT,
messages,
}),
});

const data = await res.json();

if (!res.ok) {
throw new Error(data?.error?.message || `HTTP ${res.status}`);
}

return data.content?.[0]?.text || "No response.";
}

export default function BizAssistant() {
const [messages, setMessages] = useState([]);
const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);
const [started, setStarted] = useState(false);
const bottomRef = useRef(null);
const inputRef = useRef(null);

useEffect(() => {
bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, loading]);

const sendMessage = async (text) => {
const userText = (text || input).trim();
if (!userText || loading) return;

setStarted(true);
setInput("");
const newMessages = [...messages, { role: "user", content: userText }];
setMessages(newMessages);
setLoading(true);

try {
const reply = await callClaude(newMessages);
setMessages([...newMessages, { role: "assistant", content: reply }]);
} catch (err) {
setMessages([...newMessages, { role: "assistant", content: `Error: ${err.message}` }]);
}
setLoading(false);
setTimeout(() => inputRef.current?.focus(), 100);
};

const handleKey = (e) => {
if (e.key === "Enter" && !e.shiftKey) {
e.preventDefault();
sendMessage();
}
};

return (
<div style={styles.container}>
<div style={styles.header}>
<h1 style={styles.title}>Business Assistant</h1>
<p style={styles.subtitle}>Your AI-powered business helper</p>
</div>

{!started && (
<div style={styles.suggestions}>
<p style={styles.suggestionsTitle}>Try one of these:</p>
{SUGGESTIONS.map((suggestion, i) => (
<button
key={i}
onClick={() => sendMessage(suggestion)}
style={styles.suggestionBtn}
>
{suggestion}
</button>
))}
</div>
)}

<div style={styles.messagesContainer}>
{messages.map((msg, i) => (
<div key={i} style={msg.role === "user" ? styles.userMsg : styles.assistantMsg}>
<p style={styles.msgText}>{msg.content}</p>
</div>
))}
{loading && <div style={styles.loading}>Thinking...</div>}
<div ref={bottomRef} />
</div>

<div style={styles.inputArea}>
<textarea
ref={inputRef}
value={input}
onChange={(e) => setInput(e.target.value)}
onKeyDown={handleKey}
placeholder="Ask me anything about your business..."
style={styles.input}
/>
<button onClick={() => sendMessage()} style={styles.sendBtn} disabled={loading}>
Send
</button>
</div>
</div>
);
}

const styles = {
container: {
display: "flex",
flexDirection: "column",
height: "100vh",
backgroundColor: "#0f172a",
color: "#e2e8f0",
fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
},
header: {
padding: "20px",
borderBottom: "1px solid #1e293b",
textAlign: "center",
},
title: {
margin: "0 0 5px 0",
fontSize: "28px",
fontWeight: "700",
},
subtitle: {
margin: "0",
fontSize: "14px",
color: "#94a3b8",
},
suggestions: {
padding: "20px",
overflowY: "auto",
},
suggestionsTitle: {
fontSize: "14px",
color: "#cbd5e1",
marginTop: "0",
marginBottom: "12px",
},
suggestionBtn: {
display: "block",
width: "100%",
padding: "12px",
marginBottom: "10px",
backgroundColor: "#1e293b",
border: "1px solid #334155",
borderRadius: "8px",
color: "#e2e8f0",
cursor: "pointer",
textAlign: "left",
fontSize: "14px",
transition: "all 0.2s",
},
messagesContainer: {
flex: 1,
overflowY: "auto",
padding: "20px",
display: "flex",
flexDirection: "column",
gap: "12px",
},
userMsg: {
alignSelf: "flex-end",
backgroundColor: "#3b82f6",
borderRadius: "8px",
padding: "12px 16px",
maxWidth: "70%",
},
assistantMsg: {
alignSelf: "flex-start",
backgroundColor: "#1e293b",
borderRadius: "8px",
padding: "12px 16px",
maxWidth: "70%",
border: "1px solid #334155",
},
msgText: {
margin: "0",
fontSize: "14px",
lineHeight: "1.5",
},
loading: {
padding: "12px 16px",
color: "#94a3b8",
fontSize: "14px",
},
inputArea: {
padding: "20px",
borderTop: "1px solid #1e293b",
display: "flex",
gap: "10px",
},
input: {
flex: 1,
padding: "12px",
backgroundColor: "#1e293b",
border: "1px solid #334155",
borderRadius: "8px",
color: "#e2e8f0",
fontSize: "14px",
fontFamily: "inherit",
resize: "none",
maxHeight: "100px",
},
sendBtn: {
padding: "12px 24px",
backgroundColor: "#3b82f6",
border: "none",
borderRadius: "8px",
color: "white",
cursor: "pointer",
fontSize: "14px",
fontWeight: "600",
},
};
