# -*- encoding: utf-8 -*-
$:.unshift File.dirname(__FILE__)

ENV['RACK_ENV'] ||= 'development'

require 'lib/neowaza'
require 'app'
require 'sidekiq/web'

Dir.mkdir "public/img" unless Dir.exist? "public/img"

=begin
Thread.new do
  app=App.new
  puts "Saving images"
  app.pre_save_images
end
=end

map '/' do
  run App
end

map '/sidekiq' do
  run Sidekiq::Web
end