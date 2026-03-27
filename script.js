const OWNER = "jelen5377";
const REPO = "test3";
const BRANCH = "main";

const form = document.getElementById("entry-form");
const tokenInput = document.getElementById("token-input");
const entryInput = document.getElementById("entry-input");
const targetFile = document.getElementById("target-file");
const statusText = document.getElementById("status-text");
const resultOutput = document.getElementById("result-output");

function getDateParts() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");

  return {
    fileDate: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  };
}

function getEntryPath() {
  return `entries/${getDateParts().fileDate}.txt`;
}

function updateTargetFile() {
  targetFile.textContent = `Cilovy soubor: ${getEntryPath()}`;
}

function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function fromBase64(base64) {
  const binary = atob(base64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function getExistingFile(token, path) {
  const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Nepodarilo se nacist existujici soubor.");
  }

  return response.json();
}

async function saveFile(token, path, content, sha) {
  const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    body: JSON.stringify({
      message: `Add daily entry to ${path}`,
      content: toBase64(content),
      branch: BRANCH,
      sha
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Nepodarilo se ulozit soubor.");
  }

  return data;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const token = tokenInput.value.trim();
  const entry = entryInput.value.trim();
  const path = getEntryPath();
  const { time } = getDateParts();

  if (!token || !entry) {
    statusText.textContent = "Vypln token i text zaznamu.";
    return;
  }

  statusText.textContent = "Ukladam do GitHub repozitare...";
  resultOutput.textContent = "";

  try {
    const existingFile = await getExistingFile(token, path);
    const previousContent = existingFile?.content ? fromBase64(existingFile.content) : "";
    const newLine = `[${time}] ${entry}`;
    const mergedContent = previousContent ? `${previousContent.trimEnd()}\n${newLine}\n` : `${newLine}\n`;

    const saveResult = await saveFile(token, path, mergedContent, existingFile?.sha);

    statusText.textContent = "Hotovo. Zaznam byl ulozen.";
    resultOutput.textContent = [
      `Soubor: ${path}`,
      `Commit: ${saveResult.commit?.html_url || "n/a"}`,
      "",
      mergedContent
    ].join("\n");

    entryInput.value = "";
  } catch (error) {
    statusText.textContent = "Ulozeni se nepodarilo.";
    resultOutput.textContent = error instanceof Error ? error.message : "Neznama chyba.";
  }
});

updateTargetFile();
