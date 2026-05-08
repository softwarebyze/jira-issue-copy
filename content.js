function firstText(selectors) {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    const text = el?.textContent?.trim();
    if (text) {
      return text;
    }
  }

  return "";
}

function issueKeyFromUrl() {
  const regex = /\/browse\/([A-Z][A-Z0-9_]+-\d+)/i;
  const match = regex.exec(globalThis.location.pathname);
  return match?.[1]?.toUpperCase() || "";
}

function showFeedback(message, isSuccess) {
  const existing = document.getElementById("jira-issue-copy-feedback");
  if (existing) {
    existing.remove();
  }

  const feedback = document.createElement("div");
  feedback.id = "jira-issue-copy-feedback";
  feedback.textContent = message;
  feedback.style.position = "fixed";
  feedback.style.top = "16px";
  feedback.style.right = "16px";
  feedback.style.zIndex = "2147483647";
  feedback.style.padding = "10px 14px";
  feedback.style.borderRadius = "8px";
  feedback.style.background = isSuccess ? "#1f7a3d" : "#b42318";
  feedback.style.color = "#ffffff";
  feedback.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  feedback.style.fontSize = "14px";
  feedback.style.fontWeight = "600";
  feedback.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.18)";

  document.body.appendChild(feedback);

  globalThis.setTimeout(function() {
    feedback.remove();
  }, 1800);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.warn("Clipboard write failed", error);
    return false;
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action !== "copy") {
    return false;
  }

  const issueKey = firstText([
    "#key-val",
    "#issuekey-val",
    "[data-testid='issue.views.issue-base.foundation.breadcrumbs.current-issue.item']"
  ]) || issueKeyFromUrl();

  const issueTitle = firstText([
    "#summary-val",
    "[data-testid='issue.views.issue-base.foundation.summary.heading']",
    "h1[data-testid='issue.views.issue-base.foundation.summary.heading']"
  ]);

  if (!issueKey || !issueTitle) {
    sendResponse({ copied: false, error: "Could not find Jira issue key/title on this page" });
    return false;
  }

  const output = issueKey + ": " + issueTitle;

  copyToClipboard(output)
    .then(function(copied) {
      showFeedback(copied ? "Copied Jira issue" : "Copy failed", copied);
      sendResponse({ copied: copied, text: output });
    })
    .catch(function(error) {
      showFeedback("Copy failed", false);
      sendResponse({ copied: false, error: String(error) });
    });

  return true;
});
