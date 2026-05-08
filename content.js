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

  const output = issueKey + " " + issueTitle;

  copyToClipboard(output)
    .then(function(copied) {
      sendResponse({ copied: copied, text: output });
    })
    .catch(function(error) {
      sendResponse({ copied: false, error: String(error) });
    });

  return true;
});
