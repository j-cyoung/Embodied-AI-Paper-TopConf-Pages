/* global Zotero */

var pluginID = null;
var SERVICE_BASE_URL = "http://127.0.0.1:20341";
var cleanupHandlers = [];

function getServiceBaseUrl() {
  if (SERVICE_BASE_URL && typeof SERVICE_BASE_URL === "string") {
    return SERVICE_BASE_URL;
  }
  return "http://127.0.0.1:20341";
}

function getStoredPdfAttachment(item) {
  const attachmentIDs = item.getAttachments();
  for (const id of attachmentIDs) {
    const attachment = Zotero.Items.get(id);
    if (!attachment || !attachment.isAttachment()) continue;
    if (attachment.attachmentContentType !== "application/pdf") continue;
    if (
      attachment.attachmentLinkMode !==
      Zotero.Attachments.LINK_MODE_IMPORTED_FILE
    ) {
      continue;
    }
    let path = null;
    if (typeof attachment.getFilePath === "function") {
      path = attachment.getFilePath();
    }
    if (!path && typeof attachment.getFile === "function") {
      const file = attachment.getFile();
      if (file) path = file.path;
    }
    if (path) {
      return {
        pdf_path: path,
        attachment_key: attachment.key,
        attachment_item_id: attachment.id,
        attachment_link_mode: attachment.attachmentLinkMode
      };
    }
  }
  return null;
}

function extractYear(dateStr) {
  const m = (dateStr || "").match(/\b(\d{4})\b/);
  return m ? m[1] : null;
}

function buildItemPayload(item) {
  const creators = item.getCreators ? item.getCreators() : [];
  const date = item.getField ? item.getField("date") : "";
  const attachment = getStoredPdfAttachment(item);
  const publicationTitle = item.getField ? item.getField("publicationTitle") : "";
  const conferenceName = item.getField ? item.getField("conferenceName") : "";
  const proceedingsTitle = item.getField ? item.getField("proceedingsTitle") : "";
  const bookTitle = item.getField ? item.getField("bookTitle") : "";
  const series = item.getField ? item.getField("series") : "";
  const volume = item.getField ? item.getField("volume") : "";
  const issue = item.getField ? item.getField("issue") : "";
  const pages = item.getField ? item.getField("pages") : "";
  const publisher = item.getField ? item.getField("publisher") : "";
  const place = item.getField ? item.getField("place") : "";
  const abstractNote = item.getField ? item.getField("abstractNote") : "";
  const extra = item.getField ? item.getField("extra") : "";
  const language = item.getField ? item.getField("language") : "";
  const venue =
    conferenceName ||
    proceedingsTitle ||
    publicationTitle ||
    bookTitle ||
    series ||
    "";
  return {
    item_key: item.key,
    item_id: item.id,
    library_id: item.libraryID,
    item_type: item.itemType,
    title: item.getField ? item.getField("title") : "",
    creators,
    year: extractYear(date),
    date,
    doi: item.getField ? item.getField("DOI") : "",
    url: item.getField ? item.getField("url") : "",
    venue,
    publication_title: publicationTitle,
    conference_name: conferenceName,
    proceedings_title: proceedingsTitle,
    book_title: bookTitle,
    series,
    volume,
    issue,
    pages,
    publisher,
    place,
    abstract: abstractNote,
    extra,
    language,
    pdf_path: attachment ? attachment.pdf_path : null,
    pdf_missing: !attachment,
    attachment_key: attachment ? attachment.attachment_key : null,
    attachment_item_id: attachment ? attachment.attachment_item_id : null,
    attachment_link_mode: attachment ? attachment.attachment_link_mode : null
  };
}

function promptQueryText() {
  try {
    const win = Zotero.getMainWindow();
    const text = win.prompt("请输入查询内容：", "");
    return text && text.trim() ? text.trim() : null;
  } catch (err) {
    Zotero.debug(`[PaperView] prompt error: ${err}`);
    return null;
  }
}

async function ingestItems(items) {
  const baseUrl = getServiceBaseUrl();
  const payload = {
    items: items.map(buildItemPayload),
    client: {
      plugin_id: pluginID,
      zotero_version: Zotero.version
    }
  };
  const resp = await Zotero.HTTP.request("POST", `${baseUrl}/ingest`, {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" }
  });
  const text = resp.responseText || resp.response || "";
  return JSON.parse(text);
}

async function queryService(itemKeys, queryText) {
  const baseUrl = getServiceBaseUrl();
  const payload = { item_keys: itemKeys, query: queryText };
  const resp = await Zotero.HTTP.request("POST", `${baseUrl}/query`, {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" }
  });
  const text = resp.responseText || resp.response || "";
  const data = JSON.parse(text);
  if (!data || !data.result_url) {
    throw new Error("Missing result_url in response");
  }
  Zotero.launchURL(data.result_url);
}

function attachMenuToWindow(win) {
  try {
    if (!win || !win.document) return;
    const doc = win.document;
    const menu = doc.getElementById("zotero-itemmenu");
    if (!menu) return;
    if (doc.getElementById("paperview-query-menuitem")) return;

    const menuitem = doc.createXULElement
      ? doc.createXULElement("menuitem")
      : doc.createElement("menuitem");
    menuitem.setAttribute("id", "paperview-query-menuitem");
    menuitem.setAttribute("label", "Query");

    const onCommand = async () => {
      try {
        const items = Zotero.getActiveZoteroPane().getSelectedItems();
        const keys = items.map((item) => item.key);
        Zotero.debug(
          `[PaperView] Selected ${keys.length} item(s): ${keys.join(", ")}`
        );
        const queryText = promptQueryText();
        if (!queryText) {
          Zotero.debug("[PaperView] Query cancelled");
          return;
        }
        const ingest = await ingestItems(items);
        Zotero.debug(`[PaperView] Ingested: ${JSON.stringify(ingest)}`);
        await queryService(keys, queryText);
      } catch (err) {
        Zotero.debug(`[PaperView] onCommand error: ${err}`);
      }
    };

    const onPopupShowing = () => {
      const items = Zotero.getActiveZoteroPane().getSelectedItems();
      menuitem.hidden = !items || items.length === 0;
    };

    menuitem.addEventListener("command", onCommand);
    menu.addEventListener("popupshowing", onPopupShowing);
    menu.appendChild(menuitem);

    cleanupHandlers.push(() => {
      menu.removeEventListener("popupshowing", onPopupShowing);
      menuitem.removeEventListener("command", onCommand);
      if (menuitem.parentNode) menuitem.parentNode.removeChild(menuitem);
    });
  } catch (err) {
    Zotero.debug(`[PaperView] attachMenuToWindow error: ${err}`);
  }
}

function initMenus() {
  try {
    const windows = Zotero.getMainWindows();
    for (const win of windows) {
      attachMenuToWindow(win);
    }
  } catch (err) {
    Zotero.debug(`[PaperView] initMenus error: ${err}`);
  }
}

function startup({ id }) {
  pluginID = id;
  Zotero.debug(`[PaperView] service_base_url=${getServiceBaseUrl()}`);
  initMenus();
}

function shutdown() {
  for (const cleanup of cleanupHandlers) {
    try {
      cleanup();
    } catch (err) {
      // ignore cleanup errors
    }
  }
  cleanupHandlers = [];
}

function install() {}
function uninstall() {}

function onMainWindowLoad({ window }) {
  attachMenuToWindow(window);
}
