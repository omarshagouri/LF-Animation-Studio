Pod::Spec.new do |s|
  s.name = 'StudioDevice'
  s.version = '0.1.0'
  s.summary = 'Private local storage and audio recording for Omar Studio'
  s.description = s.summary
  s.license = { :type => 'MIT' }
  s.author = 'Omar Studio'
  s.homepage = 'https://github.com/omarshagouri/Omar_Studio'
  s.platforms = { :ios => '16.4' }
  s.source = { :git => 'https://github.com/omarshagouri/Omar_Studio.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks = 'AVFoundation'
  s.source_files = '**/*.swift'
  s.swift_version = '5.0'
end
