import ExpoModulesCore
import AVFoundation
import Foundation

public final class StudioDeviceModule: Module {
  private struct Session: Codable {
    let id: String
    let title: String
    let at: Double
  }

  private var recorder: AVAudioRecorder?
  private var active: Session?
  private let fm = FileManager.default

  private func fail(_ message: String) -> NSError {
    NSError(domain: "StudioDevice", code: 1, userInfo: [NSLocalizedDescriptionKey: message])
  }

  private func root() throws -> URL {
    var url = try fm.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
      .appendingPathComponent("OmarStudio", isDirectory: true)
    try fm.createDirectory(at: url, withIntermediateDirectories: true, attributes: [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication])
    var values = URLResourceValues()
    values.isExcludedFromBackup = true
    try url.setResourceValues(values)
    return url
  }

  private func file(_ id: String, _ ext: String) throws -> URL {
    guard UUID(uuidString: id) != nil else { throw fail("Invalid recording identifier") }
    return try root().appendingPathComponent(id).appendingPathExtension(ext)
  }

  private func recovered(_ session: Session) throws -> [String: Any]? {
    let url = try file(session.id, "m4a")
    guard let audio = try? AVAudioPlayer(contentsOf: url), audio.duration.isFinite, audio.duration > 0 else { return nil }
    return ["id": session.id, "title": session.title, "at": session.at,
            "durationMs": floor(audio.duration * 1000), "audioUri": url.absoluteString, "transcript": ""]
  }

  private func finish() {
    recorder?.stop()
    recorder = nil
    active = nil
    try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
  }

  public func definition() -> ModuleDefinition {
    Name("StudioDevice")

    AsyncFunction("permission") { (promise: Promise) in
      AVAudioSession.sharedInstance().requestRecordPermission { promise.resolve($0) }
    }.runOnQueue(.main)

    AsyncFunction("start") { (title: String) in
      guard self.active == nil else { throw self.fail("A recording already exists") }
      let session = Session(id: UUID().uuidString, title: title, at: Date().timeIntervalSince1970 * 1000)
      let url = try self.file(session.id, "m4a")
      let journal = try self.file(session.id, "pending")
      let audioSession = AVAudioSession.sharedInstance()
      do {
        try JSONEncoder().encode(session).write(to: journal, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
        try audioSession.setCategory(.record, mode: .default)
        try audioSession.setActive(true)
        let settings: [String: Any] = [AVFormatIDKey: kAudioFormatMPEG4AAC, AVSampleRateKey: 24000, AVNumberOfChannelsKey: 1, AVEncoderBitRateKey: 48000]
        let recorder = try AVAudioRecorder(url: url, settings: settings)
        guard recorder.prepareToRecord(), recorder.record() else { throw self.fail("Microphone could not start") }
        self.recorder = recorder
        self.active = session
      } catch {
        try? self.fm.removeItem(at: url)
        try? self.fm.removeItem(at: journal)
        try? audioSession.setActive(false)
        throw error
      }
    }.runOnQueue(.main)

    AsyncFunction("stop") { () -> [String: Any] in
      guard let session = self.active else { throw self.fail("No active recording") }
      self.finish()
      guard let meeting = try self.recovered(session) else { throw self.fail("Recording ended without playable audio") }
      return meeting
    }.runOnQueue(.main)

    AsyncFunction("recording") { () -> Bool in
      self.recorder?.isRecording ?? false
    }.runOnQueue(.main)

    AsyncFunction("recoverRecordings") { () -> [[String: Any]] in
      let urls = try self.fm.contentsOfDirectory(at: self.root(), includingPropertiesForKeys: nil)
      return try urls.filter { $0.pathExtension == "pending" }.compactMap { url in
        let session = try JSONDecoder().decode(Session.self, from: Data(contentsOf: url))
        guard session.id != self.active?.id else { return nil }
        return try self.recovered(session)
      }
    }.runOnQueue(.main)

    AsyncFunction("acknowledgeRecordings") { (ids: [String]) in
      for id in ids where UUID(uuidString: id) != nil {
        let journal = try self.file(id, "pending")
        if self.fm.fileExists(atPath: journal.path) { try self.fm.removeItem(at: journal) }
      }
    }.runOnQueue(.main)

    AsyncFunction("readWorkspace") { () -> String in
      let url = try self.root().appendingPathComponent("workspace.json")
      guard self.fm.fileExists(atPath: url.path) else { return "" }
      return try String(contentsOf: url, encoding: .utf8)
    }

    AsyncFunction("writeWorkspace") { (value: String) in
      let url = try self.root().appendingPathComponent("workspace.json")
      try Data(value.utf8).write(to: url, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
    }

    AsyncFunction("removeAudio") { (uri: String) in
      guard let url = URL(string: uri), url.isFileURL, url.pathExtension == "m4a",
            UUID(uuidString: url.deletingPathExtension().lastPathComponent) != nil,
            url.deletingLastPathComponent().standardizedFileURL == (try self.root()).standardizedFileURL else {
        throw self.fail("Invalid audio path")
      }
      let journal = try self.file(url.deletingPathExtension().lastPathComponent, "pending")
      if self.fm.fileExists(atPath: journal.path) { try self.fm.removeItem(at: journal) }
      if self.fm.fileExists(atPath: url.path) { try self.fm.removeItem(at: url) }
    }.runOnQueue(.main)
  }
}
