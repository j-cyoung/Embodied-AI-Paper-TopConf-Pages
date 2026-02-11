/* global Zotero, Cc, Ci, Services, ChromeUtils */

const PAPER_VIEW_MODULE_REL_PATH = "modules/paperview-plugin.js";
const BOOTSTRAP_LOG_REL_PATH = ["paperview", "logs", "bootstrap.log"];
const LOG_PREFIX = "[PaperView/bootstrap]";
const MAX_LOG_CHARS = 1200;

var paperViewPlugin = null;
var paperViewPluginScope = null;
var paperViewModuleURI = null;

function getMaybeConsole() {
  try {
    if (typeof console !== "undefined") {
      return console;
    }
  } catch (err) {
    // ignore
  }
  return null;
}

function nowISO() {
  try {
    return new Date().toISOString();
  } catch (err) {
    return "unknown-time";
  }
}

function asErrorText(err) {
  if (!err) return "";
  try {
    if (err.stack) return String(err.stack);
  } catch (stackErr) {
    // ignore
  }
  try {
    return String(err);
  } catch (stringErr) {
    return "<unprintable error>";
  }
}

function clampLogText(value) {
  const text = String(value || "");
  if (text.length <= MAX_LOG_CHARS) return text;
  return `${text.slice(0, MAX_LOG_CHARS)}... [truncated ${text.length - MAX_LOG_CHARS} chars]`;
}

function createLocalFile(path) {
  const file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
  file.initWithPath(path);
  return file;
}

function ensureDir(file) {
  if (file.exists()) return;
  const parent = file.parent;
  if (parent && !parent.exists()) {
    ensureDir(parent);
  }
  file.create(Ci.nsIFile.DIRECTORY_TYPE, 0o755);
}

function appendTextFile(path, text) {
  const file = createLocalFile(path);
  if (file.parent) {
    ensureDir(file.parent);
  }
  const stream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(
    Ci.nsIFileOutputStream
  );
  // write | create | append
  stream.init(file, 0x02 | 0x08 | 0x10, 0o644, 0);
  const converter = Cc["@mozilla.org/intl/converter-output-stream;1"].createInstance(
    Ci.nsIConverterOutputStream
  );
  converter.init(stream, "UTF-8");
  converter.writeString(text);
  converter.close();
}

function getBootstrapLogPath() {
  try {
    const profileDir = Services.dirsvc.get("ProfD", Ci.nsIFile).clone();
    for (const seg of BOOTSTRAP_LOG_REL_PATH) {
      profileDir.append(seg);
    }
    return profileDir.path;
  } catch (err) {
    return null;
  }
}

function bootstrapLog(message, err) {
  const safeMessage = clampLogText(message);
  const safeErr = err ? clampLogText(asErrorText(err)) : "";
  const suffix = safeErr ? ` | ${safeErr}` : "";
  const line = `${LOG_PREFIX} ${nowISO()} ${safeMessage}${suffix}`;
  try {
    Zotero.debug(line);
  } catch (debugErr) {
    // ignore
  }
  try {
    const path = getBootstrapLogPath();
    if (path) {
      appendTextFile(path, `${line}\n`);
    }
  } catch (fileErr) {
    // ignore file log failures
  }
}

function normalizeBaseURI(data) {
  const candidates = [
    data && data.rootURI,
    data && data.resourceURI
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (typeof candidate === "string") {
      return candidate.endsWith("/") ? candidate : `${candidate}/`;
    }
    try {
      if (typeof candidate.spec === "string" && candidate.spec) {
        return candidate.spec;
      }
    } catch (err) {
      // ignore
    }
  }

  return null;
}

function resolveModuleURI(data) {
  try {
    if (data && data.resourceURI && typeof data.resourceURI.resolve === "function") {
      return data.resourceURI.resolve(PAPER_VIEW_MODULE_REL_PATH);
    }
  } catch (err) {
    bootstrapLog("resourceURI.resolve failed, falling back to base URI", err);
  }

  const baseURI = normalizeBaseURI(data);
  if (!baseURI) return null;
  return `${baseURI}${PAPER_VIEW_MODULE_REL_PATH}`;
}

function describeStartupData(data, reason) {
  const id = data && data.id ? data.id : "<none>";
  const version = data && data.version ? data.version : "<none>";
  const rootURI = normalizeBaseURI({ rootURI: data && data.rootURI });
  const resourceURI = normalizeBaseURI({ resourceURI: data && data.resourceURI });
  return `reason=${reason} id=${id} version=${version} rootURI=${rootURI} resourceURI=${resourceURI}`;
}

function getExportedPluginFromScope(scope) {
  if (scope && scope.PaperViewPlugin && typeof scope.PaperViewPlugin.startup === "function") {
    return scope.PaperViewPlugin;
  }

  // Fallback for modules that export lifecycle functions directly.
  const fallback = {
    startup: scope && scope.startup,
    shutdown: scope && scope.shutdown,
    install: scope && scope.install,
    uninstall: scope && scope.uninstall,
    onMainWindowLoad: scope && scope.onMainWindowLoad
  };

  if (typeof fallback.startup === "function") {
    return fallback;
  }

  return null;
}

function loadPluginModule(data) {
  if (paperViewPlugin) {
    return paperViewPlugin;
  }

  const moduleURI = resolveModuleURI(data);
  if (!moduleURI) {
    throw new Error(`Cannot resolve module URI for ${PAPER_VIEW_MODULE_REL_PATH}`);
  }

  const scope = {
    Zotero,
    Cc,
    Ci,
    Services,
    ChromeUtils
  };
  const maybeConsole = getMaybeConsole();
  if (maybeConsole) {
    scope.console = maybeConsole;
  }

  bootstrapLog(`Loading module: ${moduleURI}`);

  if (Services && Services.scriptloader && typeof Services.scriptloader.loadSubScriptWithOptions === "function") {
    Services.scriptloader.loadSubScriptWithOptions(moduleURI, {
      target: scope,
      ignoreCache: true
    });
  } else if (Services && Services.scriptloader && typeof Services.scriptloader.loadSubScript === "function") {
    Services.scriptloader.loadSubScript(moduleURI, scope);
  } else {
    throw new Error("Services.scriptloader is unavailable");
  }

  const plugin = getExportedPluginFromScope(scope);
  if (!plugin) {
    throw new Error("PaperView module loaded but did not export valid lifecycle functions");
  }

  paperViewModuleURI = moduleURI;
  paperViewPluginScope = scope;
  paperViewPlugin = plugin;

  const keys = Object.keys(plugin).filter((k) => typeof plugin[k] === "function");
  bootstrapLog(`Module loaded successfully (exports: ${keys.join(", ")})`);
  return paperViewPlugin;
}

function clearPluginReference() {
  paperViewPlugin = null;
  paperViewPluginScope = null;
  paperViewModuleURI = null;
}

async function callPluginLifecycle(method, data, reason, options) {
  const opts = options || {};
  const loadIfMissing = !!opts.loadIfMissing;
  const swallowError = !!opts.swallowError;

  try {
    const plugin = paperViewPlugin || (loadIfMissing ? loadPluginModule(data) : null);
    if (!plugin || typeof plugin[method] !== "function") {
      bootstrapLog(`Lifecycle ${method} skipped (plugin/method unavailable)`);
      return;
    }

    bootstrapLog(`Calling ${method}`);
    const result = plugin[method](data, reason);
    if (result && typeof result.then === "function") {
      await result;
    }
    bootstrapLog(`${method} completed`);
  } catch (err) {
    bootstrapLog(`${method} failed`, err);
    if (!swallowError) {
      throw err;
    }
  }
}

async function startup(data, reason) {
  bootstrapLog(`startup invoked: ${describeStartupData(data, reason)}`);
  await callPluginLifecycle("startup", data, reason, { loadIfMissing: true, swallowError: false });
}

async function shutdown(data, reason) {
  bootstrapLog(`shutdown invoked: reason=${reason} moduleURI=${paperViewModuleURI}`);
  await callPluginLifecycle("shutdown", data, reason, { loadIfMissing: false, swallowError: true });
  clearPluginReference();
  bootstrapLog("shutdown cleanup finished");
}

async function install(data, reason) {
  bootstrapLog(`install invoked: ${describeStartupData(data, reason)}`);
  await callPluginLifecycle("install", data, reason, { loadIfMissing: true, swallowError: true });
}

async function uninstall(data, reason) {
  bootstrapLog(`uninstall invoked: ${describeStartupData(data, reason)}`);
  await callPluginLifecycle("uninstall", data, reason, { loadIfMissing: true, swallowError: true });
}

function onMainWindowLoad(data) {
  callPluginLifecycle("onMainWindowLoad", data, null, {
    loadIfMissing: false,
    swallowError: true
  });
}
