chrome.action.onClicked.addListener(async function(tab) {
	if (!tab?.id) {
		return;
	}

	try {
		const response = await chrome.tabs.sendMessage(tab.id, { action: "copy" });

		if (!response?.copied) {
			console.warn("Copy failed:", response?.error || "Unknown error");
		}
	} catch (error) {
		console.warn("Message failed, attempting to inject content script and retry.", error);

		try {
			await chrome.scripting.executeScript({
				target: { tabId: tab.id },
				files: ["content.js"]
			});

			const retryResponse = await chrome.tabs.sendMessage(tab.id, { action: "copy" });
			if (!retryResponse?.copied) {
				console.warn("Copy failed after retry:", retryResponse?.error || "Unknown error");
			}
		} catch (retryError) {
			console.warn("Cannot run copy on this page.", retryError);
		}
	}
});
