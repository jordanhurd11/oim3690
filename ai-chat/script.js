const chatEl = document.querySelector("#chat");
const promptEl = document.querySelector("#prompt");
const askBtn = document.querySelector("#askBtn");

const history = [];

async function askAI(prompt) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: "gpt-5-nano", input: prompt }),
  });
  const data = await response.json();
  const message = data.output.find((item) => item.type === "message");
  return message.content[0].text;
}

function clearEmptyState() {
  const emptyState = document.querySelector("#empty-state");
  if (emptyState) emptyState.remove();
}

function addMessage(role, text) {
  clearEmptyState();

  const row = document.createElement("div");
  row.className = `row ${role}`;

  const inner = document.createElement("div");
  inner.className = "row-inner";

  const avatar = document.createElement("div");
  avatar.className = `avatar ${role}`;
  avatar.textContent = role === "user" ? "You" : "AI";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  inner.appendChild(avatar);
  inner.appendChild(bubble);
  row.appendChild(inner);
  chatEl.appendChild(row);
  chatEl.scrollTop = chatEl.scrollHeight;

  return bubble;
}

function autoResize() {
  promptEl.style.height = "auto";
  promptEl.style.height = Math.min(promptEl.scrollHeight, 200) + "px";
}

async function sendMessage() {
  const prompt = promptEl.value.trim();
  if (!prompt) return;

  addMessage("user", prompt);
  promptEl.value = "";
  autoResize();
  askBtn.disabled = true;

  const answerBubble = addMessage("assistant", "Thinking...");
  answerBubble.classList.add("thinking");

  try {
    const reply = await askAI(prompt);
    answerBubble.classList.remove("thinking");
    answerBubble.textContent = reply;
    history.push({ role: "user", content: prompt }, { role: "assistant", content: reply });
  } catch (error) {
    answerBubble.classList.remove("thinking");
    answerBubble.textContent = "Error: " + error.message;
  } finally {
    askBtn.disabled = false;
    promptEl.focus();
  }
}

askBtn.addEventListener("click", sendMessage);

promptEl.addEventListener("input", autoResize);

promptEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});
