import ExpoModulesCore
import AVFoundation
import Foundation

public final class StudioDeviceModule: Module {
  private var recorder: AVAudioRecorder?
  private var output: URL?
  private let fm = FileManager.default
  private func fail(_ message: String) -> NSError {
    NSError(domain: "StudioDevice", code: 1, userInfo: [NSLocalizedDescriptionKey: message])
  }
  private func root() throws -> URL {
    let url = try fm.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true).appendingPathComponent("OmarStudio", isDirectory: true)
    try fm.createDirectory(at: url, withIntermediateDirectories: true, attributes: [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication])
    var privateURL = url
    var values = URLResourceValues()
    values.isExcludedFromBackup = true
    try privateURL.setResourceValues(values)
    return url
  }
  public func definition() -> ModuleDefinition {
    Name("StudioDevice")
    AsyncFunction("permission") { (promise: Promise) in
      AVAudioSession.sharedInstance().requestRecordPermission { granted in promise.resolve(granted) }
    }.runOnQueue(.main)
    AsyncFunction("start") {
      guard self.recorder == nil else { throw self.fail("A recording already exists") }
      let session = AVAudioSession.sharedInstance()
      let url = try self.root().appendingPathComponent(UUID().uuidString + ".m4a")
      do {
        try session.setCategory(.record, mode: .default)
        try session.setActive(true)
        let settings: [String: Any] = [AVFormatIDKey: kAudioFormatMPEG4AAC, AVSampleRateKey: 24000, AVNumberOfChannelsKey: 1, AVEncoderBitRateKey: 48000]
        let recorder = try AVAudioRecorder(url: url, settings: settings)
        guard recorder.prepareToRecord(), recorder.record() else { throw self.fail("Microphone could not start") }
        self.recorder = recorder
        self.output = url
      } catch {
        try? self.fm.removeItem(at: url)
        try? session.setActive(false)
        throw error
      }
    }.runOnQueue(.main)
    AsyncFunction("stop") { () -> String in
      guard let recorder = self.recorder, let url = self.output else { throw self.fail("No active recording") }
      recorder.stop()
      self.recorder = nil
      self.output = nil
      try? AVAudioSession.sharedInstance().setActive(false)
      guard self.fm.fileExists(atPath: url.path) else { throw self.fail("Audio file was not created") }
      return url.absoluteString
    }.runOnQueue(.main)
    Function("recording") { () -> Bool in self.recorder?.isRecording ?? false }
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
            url.deletingLastPathComponent().standardizedFileURL == (try self.root()).standardizedFileURL else {
        throw self.fail("Invalid audio path")
      }
      if self.fm.fileExists(atPath: url.path) { try self.fm.removeItem(at: url) }
    }
  }
}
