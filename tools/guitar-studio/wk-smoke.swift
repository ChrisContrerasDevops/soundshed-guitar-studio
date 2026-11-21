// Standalone WKWebView test host: product viewer modules, simulated bridge, no audio engine.
import AppKit
import WebKit

final class Resources: NSObject, WKURLSchemeHandler {
    let root: URL
    var requested = Set<String>()
    init(_ root: URL) { self.root = root }
    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        guard let url = task.request.url else { return }
        requested.insert(url.path)
        let file: URL
        if url.path == "/__smoke.html" || url.path == "/__smoke.js" {
            file = root.appendingPathComponent("tools/guitar-studio/wk-smoke." + (url.path.hasSuffix(".js") ? "mjs" : "html"))
        } else {
            let ui = root.appendingPathComponent("core/ui").standardizedFileURL
            file = ui.appendingPathComponent(String(url.path.dropFirst())).standardizedFileURL
            guard file.path.hasPrefix(ui.path + "/") else {
                task.didFailWithError(NSError(domain: "fixture", code: 403)); return
            }
        }
        do {
            let data = try Data(contentsOf: file)
            let mime = ["html": "text/html", "js": "text/javascript", "mjs": "text/javascript", "css": "text/css", "json": "application/json", "woff": "font/woff", "woff2": "font/woff2"][file.pathExtension] ?? "application/octet-stream"
            task.didReceive(HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: ["Content-Type": mime, "Access-Control-Allow-Origin": "*"])!)
            task.didReceive(data); task.didFinish()
        } catch { task.didFailWithError(error) }
    }
    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}
}

final class Smoke: NSObject, NSApplicationDelegate, WKScriptMessageHandler, WKNavigationDelegate {
    let root: URL
    let output: URL
    let resources: Resources
    var window: NSWindow!
    var web: WKWebView!
    var finished = false
    init(root: URL, output: URL) { self.root = root; self.output = output; resources = Resources(root) }
    func applicationDidFinishLaunching(_ notification: Notification) {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .nonPersistent()
        config.setURLSchemeHandler(resources, forURLScheme: "juce")
        config.userContentController.add(self, name: "smoke")
        let width = CommandLine.arguments.count > 3 ? Double(CommandLine.arguments[3]) ?? 1200 : 1200
        web = WKWebView(frame: NSRect(x: 0, y: 0, width: width, height: 850), configuration: config)
        web.navigationDelegate = self
        window = NSWindow(contentRect: web.frame, styleMask: [.titled, .closable, .resizable], backing: .buffered, defer: false)
        window.title = "Guitar Studio — WKWebView validation (no audio)"
        window.contentView = web; window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
        web.load(URLRequest(url: URL(string: "juce://juce.backend/__smoke.html")!))
        DispatchQueue.main.asyncAfter(deadline: .now() + 180) {
            self.complete(["success": false, "error": "WKWebView smoke timed out"])
        }
    }
    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any] else { return }
        if let progress = body["progress"] { print(progress); fflush(stdout) }
        if body["success"] != nil { complete(body) }
    }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        complete(["success": false, "error": error.localizedDescription])
    }
    func complete(_ result: [String: Any]) {
        if finished { return }; finished = true
        var report = result
        report["requestedResources"] = resources.requested.sorted()
        report["host"] = "isolated WKWebView; simulated native replies; no audio engine"
        try? FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
        if let data = try? JSONSerialization.data(withJSONObject: report, options: [.prettyPrinted, .sortedKeys]) {
            try? data.write(to: output.appendingPathComponent("wk-report.json"))
            print(String(data: data, encoding: .utf8)!)
        }
        web.takeSnapshot(with: nil) { image, error in
            if let tiff = image?.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff), let png = rep.representation(using: .png, properties: [:]) {
                try? png.write(to: self.output.appendingPathComponent("wk-score.png"))
            }
            if let error = error { print("Snapshot: \(error.localizedDescription)") }
            exit(result["success"] as? Bool == true ? 0 : 1)
        }
    }
}

guard (3...4).contains(CommandLine.arguments.count) else { fatalError("usage: wk-smoke REPOSITORY OUTPUT_DIRECTORY [WIDTH]") }
let runner = Smoke(root: URL(fileURLWithPath: CommandLine.arguments[1]), output: URL(fileURLWithPath: CommandLine.arguments[2]))
NSApplication.shared.setActivationPolicy(.regular)
NSApplication.shared.delegate = runner
NSApplication.shared.run()
